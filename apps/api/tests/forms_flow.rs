// File: apps/api/tests/forms_flow.rs

use api::router::create_api_router;
use api::state::AppState;
use axum_test::TestServer;
use http::StatusCode;
use lettre::{AsyncSmtpTransport, Tokio1Executor};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::sync::Arc;

/// Helper function to create a test server with a fresh, isolated database.
async fn setup_test_server() -> (TestServer, PgPool) {
    // Use a different database for testing to keep it isolated from development data
    let test_db_url = "postgres://user:password@localhost:5432/rustforms_test_db";

    // Create a connection to the main 'postgres' database to manage our test DB
    let root_pool = PgPoolOptions::new()
        .connect("postgres://user:password@localhost:5432/postgres")
        .await
        .expect("Failed to connect to root postgres DB");

    // Drop the test DB if it exists from a previous failed run and create a fresh one
    sqlx::query("DROP DATABASE IF EXISTS rustforms_test_db")
        .execute(&root_pool)
        .await
        .expect("Failed to drop test database");
    sqlx::query("CREATE DATABASE rustforms_test_db")
        .execute(&root_pool)
        .await
        .expect("Failed to create test database");

    // Now, connect to the newly created, empty test database
    let pool = PgPoolOptions::new()
        .connect(test_db_url)
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
async fn test_forms_crud_flow() {
    let (server, _pool) = setup_test_server().await;

    // --- Step 1: Sign up a user ---
    let signup_response = server
        .post("/api/auth/signup")
        .json(&serde_json::json!({
            "email": "formuser@example.com",
            "password": "strongPassword123"
        }))
        .await;

    signup_response.assert_status(StatusCode::CREATED);

    // --- Step 2: Log in to get the JWT token ---
    let login_response = server
        .post("/api/auth/login")
        .json(&serde_json::json!({
            "email": "formuser@example.com",
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
    assert!(created_form["id"].is_string());
    assert!(created_form["secret"].is_string());

    // --- Step 4: Get user's forms ---
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
