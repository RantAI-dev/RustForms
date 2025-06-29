// File: apps/api/tests/auth_flow.rs

// We need to bring our app's code (the library) into the test scope
use api::router::create_api_router;
use api::state::AppState;

// Dependencies for running tests
use axum_test::TestServer;
use http::StatusCode;
// Use SMTP transport for testing
use lettre::{AsyncSmtpTransport, Tokio1Executor};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::sync::Arc;

/// Helper function to create a test server with a fresh, isolated database.
async fn setup_test_server() -> (TestServer, PgPool) {
    // Use a different database for testing to keep it isolated from development data
    let test_db_url = "postgres://user:password@localhost:5432/rustforms_test_db";

    // Create a connection to the main 'postgres' database to manage our test DB
    // This allows us to drop and create the test database for a clean slate every time.
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

    // Create a mock mailer for testing. We'll use a dummy SMTP transport
    // that doesn't actually connect anywhere. For testing, we just need
    // something that implements the right trait.
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
async fn test_full_auth_flow() {
    let (server, _pool) = setup_test_server().await;

    // --- Step 1: Test User Signup ---
    let signup_response = server
        .post("/api/auth/signup")
        .json(&serde_json::json!({
            "email": "testuser@example.com",
            "password": "strongPassword123"
        }))
        .await;

    signup_response.assert_status(StatusCode::CREATED);
    signup_response.assert_text("User created successfully");


    // --- Step 2: Test User Login ---
    let login_response = server
        .post("/api/auth/login")
        .json(&serde_json::json!({
            "email": "testuser@example.com",
            "password": "strongPassword123"
        }))
        .await;

    login_response.assert_status(StatusCode::OK);
    // Extract the token from the response body
    let token_body: serde_json::Value = login_response.json();
    let auth_token = token_body["token"].as_str().expect("Token not found in response");


    // --- Step 3: Test Protected Route Access ---
    let protected_response = server
        .get("/api/forms")
        .add_header(
            "Authorization".parse().unwrap(),
            format!("Bearer {}", auth_token).parse().unwrap(),
        )
        .await;

    protected_response.assert_status(StatusCode::OK);
    let protected_body: serde_json::Value = protected_response.json();
    // The response should be an array of forms (empty for a new user)
    assert!(protected_body.is_array(), "Expected array of forms but got: {:?}", protected_body);
}
