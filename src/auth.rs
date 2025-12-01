use crate::{error::AppError, state::AppState};
use askama::Template;
use axum::response::Html;
use axum::{extract::State, response::IntoResponse, Form};
use entity::user::ActiveModel;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::Deserialize;

#[derive(Template)]
#[template(path = "signup.html")]
struct SignupTemplate;

#[derive(Deserialize)]
pub struct SignupForm {
    email: String,
    password: String,
    username: String,
}

pub async fn get_signup() -> Result<Html<String>, AppError> {
    let template = SignupTemplate;
    let html = template.render().map_err(|_| {
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template error",
        ))
    })?;
    Ok(Html(html))
}

pub async fn post_signup(
    State(state): State<AppState>, Form(form): Form<SignupForm>,
) -> Result<impl IntoResponse, AppError> {
    let existing_email = entity::user::Entity::find()
        .filter(entity::user::Column::Email.eq(&form.email))
        .one(&state.db)
        .await?;

    if existing_email.is_some() {
        return Ok(Html(
            r#"<script>Toast.error('This email is already registered', 'Email exists');</script>"#.to_string()
        ));
    }

    let existing_username = entity::user::Entity::find()
        .filter(entity::user::Column::Username.eq(&form.username))
        .one(&state.db)
        .await?;

    if existing_username.is_some() {
        return Ok(Html(
            r#"<script>Toast.error('This username is already taken', 'Username exists');</script>"#.to_string()
        ));
    }

    let password_hash = bcrypt::hash(&form.password, bcrypt::DEFAULT_COST)
        .map_err(|_| AppError::HashError)?;

    let user = ActiveModel {
        email: Set(form.email.clone()),
        password_hash: Set(password_hash),
        username: Set(form.username),
        ..Default::default()
    };

    user.insert(&state.db).await?;

    Ok(Html(format!(
        r#"<script>
            Toast.success('Welcome to EpiFlipBoard!', 'Account created');
            setTimeout(() => window.location.href='/home', 1500);
        </script>"#
    )))
}
