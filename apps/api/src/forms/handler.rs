use crate::auth::middleware::UserId;
use crate::models::{FormPayload, Form, CreateFormPayload, Submission};
use crate::state::AppState;
use axum::{extract::{Json, Path, State, ConnectInfo}, http::StatusCode, response::IntoResponse};
use lettre::{Message, AsyncTransport};
use std::sync::Arc;
use std::net::SocketAddr;
use uuid::Uuid;
use utoipa;
use ipnetwork::IpNetwork;

#[utoipa::path(
    post,
    path = "/api/forms",
    request_body = CreateFormPayload,
    responses(
        (status = 201, description = "Form created successfully", body = Form),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Forms"
)]
pub async fn create_form(
    State(state): State<AppState>,
    user_id: UserId, // Extracted from the JWT by our middleware
    Json(payload): Json<CreateFormPayload>,
) -> impl IntoResponse {
    let user_uuid = match Uuid::parse_str(&user_id.0) {
        Ok(id) => id,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid user ID format").into_response(),
    };

    match sqlx::query_as!(
        Form,
        "INSERT INTO forms (user_id, name) VALUES ($1, $2) RETURNING *",
        user_uuid,
        payload.name
    )
    .fetch_one(&state.db_pool)
    .await
    {
        Ok(new_form) => (StatusCode::CREATED, axum::Json(new_form)).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create form").into_response(),
    }
}

#[utoipa::path(
    get,
    path = "/api/forms",
    responses(
        (status = 200, description = "List of user's forms", body = [Form]),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Forms"
)]
pub async fn get_user_forms(
    State(state): State<AppState>,
    user_id: UserId, // Extracted from the JWT by our middleware
) -> impl IntoResponse {
    let user_uuid = match Uuid::parse_str(&user_id.0) {
        Ok(id) => id,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid user ID format").into_response(),
    };

    match sqlx::query_as!(
        Form,
        "SELECT * FROM forms WHERE user_id = $1 ORDER BY created_at DESC",
        user_uuid
    )
    .fetch_all(&state.db_pool)
    .await
    {
        Ok(forms) => (StatusCode::OK, axum::Json(forms)).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch forms").into_response(),
    }
}

#[utoipa::path(
    post,
    path = "/api/submit/{secret}",
    request_body = FormPayload,
    params(
        ("secret" = String, Path, description = "Form secret for submission")
    ),
    responses(
        (status = 200, description = "Form submission received successfully"),
        (status = 404, description = "Form not found"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Form Submissions"
)]
pub async fn handle_form_submission(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Path(secret): Path<String>,
    Json(payload): Json<FormPayload>,
) -> impl IntoResponse {
    // Look up the form by its secret and get the owner's email
    let form_info = match sqlx::query!(
        r#"
        SELECT f.id, f.name, u.email as owner_email 
        FROM forms f 
        JOIN users u ON f.user_id = u.id 
        WHERE f.secret = $1
        "#,
        secret
    )
    .fetch_optional(&state.db_pool)
    .await
    {
        Ok(Some(form)) => form,
        Ok(None) => return (StatusCode::NOT_FOUND, "Form not found").into_response(),
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response(),
    };

    // Store the submission in the database
    let submission_data = serde_json::to_value(&payload.0).unwrap_or_default();
    let ip_address = addr.ip();
    let ip_network = IpNetwork::from(ip_address);
    
    let _submission = match sqlx::query_as!(
        Submission,
        r#"
        INSERT INTO submissions (form_id, data, ip_address) 
        VALUES ($1, $2, $3) 
        RETURNING id, form_id, data, ip_address::text as "ip_address!", created_at
        "#,
        form_info.id,
        submission_data,
        ip_network
    )
    .fetch_one(&state.db_pool)
    .await
    {
        Ok(submission) => submission,
        Err(e) => {
            eprintln!("Failed to store submission: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to store submission").into_response();
        }
    };

    // Build the email body from the form submission
    let mut email_body = String::from("New form submission:\n\n");
    email_body.push_str(&format!("Form: {}\n", form_info.name));
    email_body.push_str(&format!("Form ID: {}\n", form_info.id));
    email_body.push_str(&format!("IP Address: {}\n\n", ip_address));
    
    for (key, value) in payload.0.iter() {
        email_body.push_str(&format!("{}: {}\n", key, value));
    }

    // Create the email message, sending to the form owner
    let email = Message::builder()
        .from("RustForms <noreply@rustforms.dev>".parse().unwrap())
        .to(form_info.owner_email.parse().unwrap())
        .subject(&format!("New submission for form: {}", form_info.name))
        .body(email_body)
        .unwrap();

    // Send the email asynchronously
    let mailer = Arc::clone(&state.mailer);
    tokio::spawn(async move {
        match mailer.send(email).await {
            Ok(_) => println!("Email sent successfully to form owner!"),
            Err(e) => eprintln!("Failed to send email: {:?}", e),
        }
    });

    (StatusCode::OK, "Form submission received").into_response()
}

#[utoipa::path(
    get,
    path = "/api/forms/{id}",
    params(
        ("id" = String, Path, description = "Form ID")
    ),
    responses(
        (status = 200, description = "Form details", body = Form),
        (status = 404, description = "Form not found"),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Forms"
)]
pub async fn get_form_by_id(
    State(state): State<AppState>,
    user_id: UserId,
    Path(form_id): Path<String>,
) -> impl IntoResponse {
    let user_uuid = match Uuid::parse_str(&user_id.0) {
        Ok(id) => id,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid user ID format").into_response(),
    };

    let form_uuid = match Uuid::parse_str(&form_id) {
        Ok(id) => id,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid form ID format").into_response(),
    };

    match sqlx::query_as!(
        Form,
        "SELECT * FROM forms WHERE id = $1 AND user_id = $2",
        form_uuid,
        user_uuid
    )
    .fetch_optional(&state.db_pool)
    .await
    {
        Ok(Some(form)) => (StatusCode::OK, axum::Json(form)).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "Form not found").into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch form").into_response(),
    }
}

#[utoipa::path(
    get,
    path = "/api/forms/{id}/submissions",
    params(
        ("id" = String, Path, description = "Form ID")
    ),
    responses(
        (status = 200, description = "List of form submissions", body = [Submission]),
        (status = 404, description = "Form not found"),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Form Submissions"
)]
pub async fn get_form_submissions(
    State(state): State<AppState>,
    user_id: UserId,
    Path(form_id): Path<String>,
) -> impl IntoResponse {
    let user_uuid = match Uuid::parse_str(&user_id.0) {
        Ok(id) => id,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid user ID format").into_response(),
    };

    let form_uuid = match Uuid::parse_str(&form_id) {
        Ok(id) => id,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid form ID format").into_response(),
    };

    // First verify the form belongs to the user
    let form_exists = match sqlx::query!(
        "SELECT id FROM forms WHERE id = $1 AND user_id = $2",
        form_uuid,
        user_uuid
    )
    .fetch_optional(&state.db_pool)
    .await
    {
        Ok(Some(_)) => true,
        Ok(None) => return (StatusCode::NOT_FOUND, "Form not found").into_response(),
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response(),
    };

    if !form_exists {
        return (StatusCode::NOT_FOUND, "Form not found").into_response();
    }

    // Get submissions for the form
    match sqlx::query_as!(
        Submission,
        r#"
        SELECT id, form_id, data, ip_address::text as "ip_address!", created_at 
        FROM submissions 
        WHERE form_id = $1 
        ORDER BY created_at DESC
        "#,
        form_uuid
    )
    .fetch_all(&state.db_pool)
    .await
    {
        Ok(submissions) => (StatusCode::OK, axum::Json(submissions)).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch submissions").into_response(),
    }
}

#[utoipa::path(
    delete,
    path = "/api/forms/{id}",
    params(
        ("id" = String, Path, description = "Form ID")
    ),
    responses(
        (status = 200, description = "Form deleted successfully"),
        (status = 404, description = "Form not found"),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Forms"
)]
pub async fn delete_form(
    State(state): State<AppState>,
    user_id: UserId,
    Path(form_id): Path<String>,
) -> impl IntoResponse {
    let user_uuid = match Uuid::parse_str(&user_id.0) {
        Ok(id) => id,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid user ID format").into_response(),
    };

    let form_uuid = match Uuid::parse_str(&form_id) {
        Ok(id) => id,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid form ID format").into_response(),
    };

    match sqlx::query!(
        "DELETE FROM forms WHERE id = $1 AND user_id = $2",
        form_uuid,
        user_uuid
    )
    .execute(&state.db_pool)
    .await
    {
        Ok(result) if result.rows_affected() > 0 => {
            (StatusCode::OK, "Form deleted successfully").into_response()
        }
        Ok(_) => (StatusCode::NOT_FOUND, "Form not found").into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to delete form").into_response(),
    }
}

#[utoipa::path(
    delete,
    path = "/api/submissions/{id}",
    params(
        ("id" = String, Path, description = "Submission ID")
    ),
    responses(
        (status = 200, description = "Submission deleted successfully"),
        (status = 404, description = "Submission not found"),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Form Submissions"
)]
pub async fn delete_submission(
    State(state): State<AppState>,
    user_id: UserId,
    Path(submission_id): Path<String>,
) -> impl IntoResponse {
    let user_uuid = match Uuid::parse_str(&user_id.0) {
        Ok(id) => id,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid user ID format").into_response(),
    };

    let submission_uuid = match Uuid::parse_str(&submission_id) {
        Ok(id) => id,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid submission ID format").into_response(),
    };

    // Delete submission only if it belongs to a form owned by the user
    match sqlx::query!(
        r#"
        DELETE FROM submissions 
        WHERE id = $1 AND form_id IN (
            SELECT id FROM forms WHERE user_id = $2
        )
        "#,
        submission_uuid,
        user_uuid
    )
    .execute(&state.db_pool)
    .await
    {
        Ok(result) if result.rows_affected() > 0 => {
            (StatusCode::OK, "Submission deleted successfully").into_response()
        }
        Ok(_) => (StatusCode::NOT_FOUND, "Submission not found").into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to delete submission").into_response(),
    }
}