use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use utoipa::ToSchema;

#[derive(Deserialize, Debug, ToSchema)]
#[schema(example = json!({"field1": "value1", "field2": "value2"}))]
pub struct FormPayload(pub HashMap<String, String>);

#[derive(Deserialize, ToSchema)]
#[schema(example = json!({"email": "user@example.com", "password": "password123"}))]
pub struct SignupPayload {
    #[schema(example = "user@example.com")]
    pub email: String,
    #[schema(example = "password123")]
    pub password: String,
}

/// Payload for logging in a user.
#[derive(Deserialize, ToSchema)]
#[schema(example = json!({"email": "user@example.com", "password": "password123"}))]
pub struct LoginPayload {
    #[schema(example = "user@example.com")]
    pub email: String,
    #[schema(example = "password123")]
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Claims {
    /// Subject (user id)
    pub sub: String,
    /// Expiration time
    pub exp: usize,
}

/// Response for successful login
#[derive(Serialize, ToSchema)]
#[schema(example = json!({"token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."}))]
pub struct LoginResponse {
    pub token: String,
}

/// Model for the forms table
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Form {
    /// Unique form identifier
    pub id: Uuid,
    /// ID of the user who owns this form
    pub user_id: Uuid,
    /// Display name for the form
    #[schema(example = "Contact Form")]
    pub name: String,
    /// Unique secret used for form submissions
    pub secret: String,
    /// When the form was created
    pub created_at: DateTime<Utc>,
    /// When the form was last updated
    pub updated_at: DateTime<Utc>,
}

/// Payload for creating a new form
#[derive(Deserialize, ToSchema)]
#[schema(example = json!({"name": "Contact Form"}))]
pub struct CreateFormPayload {
    /// Display name for the form
    #[schema(example = "Contact Form")]
    pub name: String,
}

/// Model for form submissions
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Submission {
    /// Unique submission identifier
    pub id: Uuid,
    /// ID of the form this submission belongs to
    pub form_id: Uuid,
    /// The actual form data submitted
    pub data: serde_json::Value,
    /// IP address of the submitter
    pub ip_address: String,
    /// When the submission was created
    pub created_at: DateTime<Utc>,
}