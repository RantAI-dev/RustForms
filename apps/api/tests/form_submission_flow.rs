// File: apps/api/tests/form_submission_flow.rs

use api::router::create_api_router;
use api::state::AppState;
use axum_test::TestServer;
use http::StatusCode;
use lettre::{AsyncSmtpTransport, Tokio1Executor};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::sync::Arc;

/// Helper function to create a test server with a fresh, isolated database.
async fn setup_test_server(db_name: &str) -> (TestServer, PgPool) {
    // Use a different database for testing to keep it isolated from development data
    let test_db_url = format!("postgres://user:password@localhost:5432/{}", db_name);

    // Create a connection to the main 'postgres' database to manage our test DB
    let root_pool = PgPoolOptions::new()
        .connect("postgres://user:password@localhost:5432/postgres")
        .await
        .expect("Failed to connect to root postgres DB");

    // Drop the test DB if it exists from a previous failed run and create a fresh one
    sqlx::query(&format!("DROP DATABASE IF EXISTS {}", db_name))
        .execute(&root_pool)
        .await
        .expect("Failed to drop test database");
    sqlx::query(&format!("CREATE DATABASE {}", db_name))
        .execute(&root_pool)
        .await
        .expect("Failed to create test database");

    // Now, connect to the newly created, empty test database
    let pool = PgPoolOptions::new()
        .connect(&test_db_url)
        .await
        .expect("Failed to connect to test database");

    // Run migrations on the test database to create our tables
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations on test database");

    // Create a mock mailer for testing
    let mailer = Arc::new(
        AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous("localhost")
            .port(1)  // Use a dummy port that won't actually work
            .build()
    );

    // Create the application state required by our router
    let state = AppState {
        db_pool: pool.clone(),
        mailer, // Mock SMTP transport for testing
        jwt_secret: "a-very-secure-and-secret-test-key".to_string(),
    };

    // Create the router and wrap it in the TestServer
    let app = create_api_router(state);
    (TestServer::new(app).expect("Failed to create test server"), pool)
}

#[tokio::test]
async fn test_complete_form_submission_flow() {
    let (server, _pool) = setup_test_server("rustforms_submission_test").await;

    // --- Step 1: Sign up a user ---
    let signup_response = server
        .post("/api/auth/signup")
        .json(&serde_json::json!({
            "email": "formowner@example.com",
            "password": "strongPassword123"
        }))
        .await;

    signup_response.assert_status(StatusCode::CREATED);

    // --- Step 2: Log in to get the JWT token ---
    let login_response = server
        .post("/api/auth/login")
        .json(&serde_json::json!({
            "email": "formowner@example.com",
            "password": "strongPassword123"
        }))
        .await;

    login_response.assert_status(StatusCode::OK);
    let token_body: serde_json::Value = login_response.json();
    let auth_token = token_body["token"].as_str().expect("Token not found in response");

    // --- Step 3: Create a new form ---
    let create_form_response = server
        .post("/api/forms")
        .add_header(
            "Authorization".parse().unwrap(),
            format!("Bearer {}", auth_token).parse().unwrap(),
        )
        .json(&serde_json::json!({
            "name": "Contact Form"
        }))
        .await;

    create_form_response.assert_status(StatusCode::CREATED);
    let created_form: serde_json::Value = create_form_response.json();
    assert_eq!(created_form["name"], "Contact Form");
    
    let form_secret = created_form["secret"].as_str().expect("Form secret should be present");
    println!("Created form with secret: {}", form_secret);

    // --- Step 4: Submit to the form using its unique secret (public endpoint) ---
    let form_submission_response = server
        .post(&format!("/api/forms/{}", form_secret))
        .json(&serde_json::json!({
            "name": "John Doe",
            "email": "john@example.com",
            "message": "Hello, this is a test message!"
        }))
        .await;

    form_submission_response.assert_status(StatusCode::OK);
    form_submission_response.assert_text("Form submission received");

    // --- Step 5: Test submission to a non-existent form ---
    let invalid_submission_response = server
        .post("/api/forms/invalid-secret-123")
        .json(&serde_json::json!({
            "name": "Jane Doe",
            "email": "jane@example.com"
        }))
        .await;

    invalid_submission_response.assert_status(StatusCode::NOT_FOUND);
    invalid_submission_response.assert_text("Form not found");

    // --- Step 6: Verify we can still get the user's forms ---
    let get_forms_response = server
        .get("/api/forms")
        .add_header(
            "Authorization".parse().unwrap(),
            format!("Bearer {}", auth_token).parse().unwrap(),
        )
        .await;

    get_forms_response.assert_status(StatusCode::OK);
    let forms: serde_json::Value = get_forms_response.json();
    assert!(forms.is_array());
    let forms_array = forms.as_array().unwrap();
    assert_eq!(forms_array.len(), 1);
    assert_eq!(forms_array[0]["name"], "Contact Form");
}

#[tokio::test]
async fn test_multiple_users_isolated_forms() {
    let (server, _pool) = setup_test_server("rustforms_isolation_test").await;

    // --- Create User A ---
    server
        .post("/api/auth/signup")
        .json(&serde_json::json!({
            "email": "usera@example.com",
            "password": "password123"
        }))
        .await
        .assert_status(StatusCode::CREATED);

    let login_a_response = server
        .post("/api/auth/login")
        .json(&serde_json::json!({
            "email": "usera@example.com",
            "password": "password123"
        }))
        .await;
    let token_a = login_a_response.json::<serde_json::Value>()["token"].as_str().unwrap().to_string();

    // --- Create User B ---
    server
        .post("/api/auth/signup")
        .json(&serde_json::json!({
            "email": "userb@example.com",
            "password": "password123"
        }))
        .await
        .assert_status(StatusCode::CREATED);

    let login_b_response = server
        .post("/api/auth/login")
        .json(&serde_json::json!({
            "email": "userb@example.com",
            "password": "password123"
        }))
        .await;
    let token_b = login_b_response.json::<serde_json::Value>()["token"].as_str().unwrap().to_string();

    // --- User A creates a form ---
    let form_a_response = server
        .post("/api/forms")
        .add_header("Authorization".parse().unwrap(), format!("Bearer {}", token_a).parse().unwrap())
        .json(&serde_json::json!({"name": "User A's Form"}))
        .await;
    let form_a = form_a_response.json::<serde_json::Value>();
    let secret_a = form_a["secret"].as_str().unwrap();

    // --- User B creates a form ---
    let form_b_response = server
        .post("/api/forms")
        .add_header("Authorization".parse().unwrap(), format!("Bearer {}", token_b).parse().unwrap())
        .json(&serde_json::json!({"name": "User B's Form"}))
        .await;
    let form_b = form_b_response.json::<serde_json::Value>();
    let secret_b = form_b["secret"].as_str().unwrap();

    // --- Submit to User A's form ---
    server
        .post(&format!("/api/forms/{}", secret_a))
        .json(&serde_json::json!({"message": "Submission to User A"}))
        .await
        .assert_status(StatusCode::OK);

    // --- Submit to User B's form ---
    server
        .post(&format!("/api/forms/{}", secret_b))
        .json(&serde_json::json!({"message": "Submission to User B"}))
        .await
        .assert_status(StatusCode::OK);

    // --- Verify User A only sees their own form ---
    let user_a_forms = server
        .get("/api/forms")
        .add_header("Authorization".parse().unwrap(), format!("Bearer {}", token_a).parse().unwrap())
        .await
        .json::<serde_json::Value>();
    
    assert_eq!(user_a_forms.as_array().unwrap().len(), 1);
    assert_eq!(user_a_forms[0]["name"], "User A's Form");

    // --- Verify User B only sees their own form ---
    let user_b_forms = server
        .get("/api/forms")
        .add_header("Authorization".parse().unwrap(), format!("Bearer {}", token_b).parse().unwrap())
        .await
        .json::<serde_json::Value>();
    
    assert_eq!(user_b_forms.as_array().unwrap().len(), 1);
    assert_eq!(user_b_forms[0]["name"], "User B's Form");
}
