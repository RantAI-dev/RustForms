// File: src/lib.rs

// --- Module Declarations ---
pub mod auth;
pub mod forms;
pub mod models;
// The openapi mod is removed, as its contents are now in this file.
pub mod router;
pub mod state;

// --- Imports ---
use crate::state::AppState;
use axum::Router; // Import Axum Router
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, Tokio1Executor};
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

// --- OpenAPI Imports and Definition (Moved from openapi.rs) ---
use utoipa::{
    openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme},
    Modify, OpenApi,
};
use utoipa_swagger_ui::SwaggerUi;

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::auth::handler::handle_signup,
        crate::auth::handler::handle_login,
        crate::forms::handler::create_form,
        crate::forms::handler::get_user_forms,
        crate::forms::handler::get_form_by_id,
        crate::forms::handler::delete_form,
        crate::forms::handler::handle_form_submission,
        crate::forms::handler::get_form_submissions,
        crate::forms::handler::delete_submission,
    ),
    components(
        schemas(
            crate::models::SignupPayload,
            crate::models::LoginPayload,
            crate::models::LoginResponse,
            crate::models::Form,
            crate::models::CreateFormPayload,
            crate::models::FormPayload,
            crate::models::Submission
        ),
    ),
    modifiers(&SecurityAddon),
    tags(
        (name = "Authentication", description = "User authentication endpoints"),
        (name = "Forms", description = "Form management endpoints (requires authentication)"),
        (name = "Form Submissions", description = "Public form submission endpoints")
    ),
    info(
        title = "RustForms API",
        version = "1.0.0",
        description = "A self-hostable form backend service built with Rust",
        contact(
            name = "RustForms",
            email = "contact@rustforms.dev"
        ),
        license(
            name = "MIT",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers(
        (url = "http://localhost:3001", description = "Local development server"),
        (url = "https://api.rustforms.dev", description = "Production server")
    )
)]
struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearer_auth",
                SecurityScheme::Http(
                    HttpBuilder::new()
                        .scheme(HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            )
        }
    }
}


// --- Main Application Logic ---
pub async fn run() {
    if std::path::Path::new(".env").exists() {
        dotenvy::dotenv().expect("Failed to read .env file");
        println!("Loaded local .env file");
    } else if dotenvy::from_filename("../../.env.docker").is_ok() {
        println!("Loaded .env.docker file");
    } else {
        panic!("Could not find .env or .env.docker file");
    }
    println!("Environment variables loaded.");

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to create database pool.");
    println!("Database pool created.");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run database migrations.");
    println!("Database migrations ran successfully.");

    let state = AppState {
        db_pool: pool,
        mailer: Arc::new(setup_mailer()),
        jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
    };

    // --- Final Router Assembly (Mirrors your working project) ---
    let app = Router::new()
        // 1. The Swagger UI router, pointing to the ApiDoc generated in this file.
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        // 2. Your API router, now nested under the "/api" prefix.
        .nest("/api", router::create_api_router(state))
        // 3. Add CORS layer to allow frontend requests
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any)
        );


    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    println!("API listening on {}", addr);
    println!("Docs available at http://{}/swagger-ui", addr); // Helpful link
    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(
        listener, 
        app.into_make_service_with_connect_info::<SocketAddr>()
    )
    .await
    .unwrap();
}

fn setup_mailer() -> AsyncSmtpTransport<Tokio1Executor> {
    let smtp_host = env::var("SMTP_HOST").expect("SMTP_HOST must be set");
    let smtp_user = env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set");
    let smtp_pass = env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD must be set");
    let creds = Credentials::new(smtp_user, smtp_pass);
    AsyncSmtpTransport::<Tokio1Executor>::relay(&smtp_host)
        .unwrap()
        .credentials(creds)
        .build()
}