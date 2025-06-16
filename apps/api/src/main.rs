use axum::{
    extract::{Json, Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Router,
};
use lettre::{
    transport::smtp::authentication::Credentials, AsyncSmtpTransport, AsyncTransport, Message,
};
use serde::Deserialize;
use std::collections::HashMap;
use std::env;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;

// Use a flexible HashMap to accept any form fields.
#[derive(Deserialize, Debug)]
struct FormPayload(HashMap<String, String>);

// Application state to hold our configuration
#[derive(Clone)]
struct AppState {
    form_secret: String,
    recipient_email: String,
    mailer: Arc<AsyncSmtpTransport<lettre::Tokio1Executor>>,
}

#[tokio::main]
async fn main() {
    // Load environment variables from .env file
    dotenvy::dotenv().expect("Failed to read .env file");

    let state = AppState {
        form_secret: env::var("FORM_SECRET").expect("FORM_SECRET must be set"),
        recipient_email: env::var("RECIPIENT_EMAIL").expect("RECIPIENT_EMAIL must be set"),
        mailer: Arc::new(setup_mailer()),
    };

    // Build our application router
    let app = Router::new()
        .route("/api/forms/:secret", post(handle_form_submission))
        .with_state(state);

    // Run the server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3001)); // Run API on a different port
    println!("API listening on {}", addr);
    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

async fn handle_form_submission(
    State(state): State<AppState>,
    Path(secret): Path<String>,
    Json(payload): Json<FormPayload>,
) -> impl IntoResponse {
    // 1. Validate the secret
    if secret != state.form_secret {
        return (StatusCode::UNAUTHORIZED, "Invalid secret").into_response();
    }

    // 2. Construct the email body from the form payload
    let mut email_body = String::from("New form submission:\n\n");
    for (key, value) in payload.0.iter() {
        email_body.push_str(&format!("{}: {}\n", key, value));
    }

    // 3. Create the email message
    let email = Message::builder()
        .from("RustForms <noreply@rustforms.dev>".parse().unwrap())
        .to(state.recipient_email.parse().unwrap())
        .subject("New Form Submission!")
        .body(email_body)
        .unwrap();

    // 4. Send the email asynchronously
    // We clone the mailer Arc to move it into the spawned task
    let mailer = Arc::clone(&state.mailer);
    tokio::spawn(async move {
        match mailer.send(email).await {
            Ok(_) => println!("Email sent successfully!"),
            Err(e) => eprintln!("Failed to send email: {:?}", e),
        }
    });

    // 5. Return a quick success response to the client
    (StatusCode::OK, "Form received").into_response()
}

fn setup_mailer() -> AsyncSmtpTransport<lettre::Tokio1Executor> {
    let smtp_host = env::var("SMTP_HOST").expect("SMTP_HOST must be set");
    let smtp_user = env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set");
    let smtp_pass = env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD must be set");

    let creds = Credentials::new(smtp_user, smtp_pass);

    AsyncSmtpTransport::<lettre::Tokio1Executor>::relay(&smtp_host)
        .unwrap()
        .credentials(creds)
        .build()
}