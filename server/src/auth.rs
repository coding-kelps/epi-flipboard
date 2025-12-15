use crate::{error::AppError, state::AppState};
use askama::Template;
use axum::response::{Html, IntoResponse, Redirect};
use axum::{extract::State, Form};
use entity::user::ActiveModel;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::Deserialize;
use tower_cookies::{Cookie, Cookies};

#[derive(Template)]
#[template(path = "signup.html")]
struct SignupTemplate;

#[derive(Template)]
#[template(path = "login.html")]
struct LoginTemplate;

#[derive(Template)]
#[template(path = "header.html")]
struct HeaderTemplate {
    username: String,
}

enum ToastKind {
    Success,
    Error,
}

impl ToastKind {
    fn as_str(&self) -> &str {
        match self {
            ToastKind::Success => "success",
            ToastKind::Error => "error",
        }
    }

    fn icon(&self) -> &str {
        match self {
            ToastKind::Success => "✓",
            ToastKind::Error => "✕",
        }
    }
}

#[derive(Template)]
#[template(path = "toast.html")]
struct ToastTemplate {
    kind: String,
    icon: String,
    title: String,
    message: String,
}

#[derive(Deserialize)]
pub struct SignupForm {
    email: String,
    password: String,
    username: String,
}

#[derive(Deserialize)]
pub struct LoginForm {
    email: String,
    password: String,
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

pub async fn get_login() -> Result<Html<String>, AppError> {
    let template = LoginTemplate;
    let html = template.render().map_err(|_| {
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template error",
        ))
    })?;
    Ok(Html(html))
}

pub async fn logout(cookies: Cookies) -> Redirect {
    cookies.remove(Cookie::new("user_id", ""));
    cookies.remove(Cookie::new("username", ""));
    Redirect::to("/home")
}

pub async fn post_signup(
    State(state): State<AppState>, cookies: Cookies,
    Form(form): Form<SignupForm>,
) -> Result<impl IntoResponse, AppError> {
    let existing_email = entity::user::Entity::find()
        .filter(entity::user::Column::Email.eq(&form.email))
        .one(&state.db)
        .await?;

    if existing_email.is_some() {
        let kind = ToastKind::Error;
        let toast = ToastTemplate {
            kind: kind.as_str().to_string(),
            icon: kind.icon().to_string(),
            title: "Email exists".to_string(),
            message: "This email is already registered".to_string(),
        };
        return Ok(Html(toast.render().map_err(|_| {
            AppError::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Template error",
            ))
        })?));
    }

    let existing_username = entity::user::Entity::find()
        .filter(entity::user::Column::Username.eq(&form.username))
        .one(&state.db)
        .await?;

    if existing_username.is_some() {
        let kind = ToastKind::Error;
        let toast = ToastTemplate {
            kind: kind.as_str().to_string(),
            icon: kind.icon().to_string(),
            title: "Username exists".to_string(),
            message: "This username is already taken".to_string(),
        };
        return Ok(Html(toast.render().map_err(|_| {
            AppError::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Template error",
            ))
        })?));
    }

    let password_hash = bcrypt::hash(&form.password, bcrypt::DEFAULT_COST)
        .map_err(|_| AppError::HashError)?;

    let user = ActiveModel {
        email: Set(form.email.clone()),
        password_hash: Set(password_hash),
        username: Set(form.username.clone()),
        ..Default::default()
    }
    .insert(&state.db)
    .await?;

    cookies.add(Cookie::new("user_id", user.id.to_string()));
    cookies.add(Cookie::new("username", form.username.clone()));

    let header = HeaderTemplate { username: form.username.clone() };
    let header_html = header.render().map_err(|_| {
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template error",
        ))
    })?;

    let kind = ToastKind::Success;
    let toast = ToastTemplate {
        kind: kind.as_str().to_string(),
        icon: kind.icon().to_string(),
        title: "".to_string(),
        message: "Welcome to EpiFlipBoard!".to_string(),
    };
    let toast_html = toast.render().map_err(|_| {
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template error",
        ))
    })?;
    Ok(Html(format!(
        "<script>document.querySelector('.modal-overlay').remove();</script>{}{}",
        toast_html, header_html
    )))
}

pub async fn post_login(
    State(state): State<AppState>, cookies: Cookies,
    Form(form): Form<LoginForm>,
) -> Result<impl IntoResponse, AppError> {
    let user = entity::user::Entity::find()
        .filter(entity::user::Column::Email.eq(&form.email))
        .one(&state.db)
        .await?;

    let Some(user) = user else {
        let kind = ToastKind::Error;
        let toast = ToastTemplate {
            kind: kind.as_str().to_string(),
            icon: kind.icon().to_string(),
            title: "Login failed".to_string(),
            message: "Invalid email or password".to_string(),
        };
        return Ok(Html(toast.render().map_err(|_| {
            AppError::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Template error",
            ))
        })?));
    };

    let valid = bcrypt::verify(&form.password, &user.password_hash)
        .map_err(|_| AppError::HashError)?;

    if !valid {
        let kind = ToastKind::Error;
        let toast = ToastTemplate {
            kind: kind.as_str().to_string(),
            icon: kind.icon().to_string(),
            title: "Login failed".to_string(),
            message: "Invalid email or password".to_string(),
        };
        return Ok(Html(toast.render().map_err(|_| {
            AppError::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Template error",
            ))
        })?));
    }

    cookies.add(Cookie::new("user_id", user.id.to_string()));
    cookies.add(Cookie::new("username", user.username.clone()));

    let header = HeaderTemplate { username: user.username.clone() };
    let header_html = header.render().map_err(|_| {
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template error",
        ))
    })?;

    let kind = ToastKind::Success;
    let toast = ToastTemplate {
        kind: kind.as_str().to_string(),
        icon: kind.icon().to_string(),
        title: "".to_string(),
        message: format!("Welcome back, {}!", user.username),
    };
    let toast_html = toast.render().map_err(|_| {
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template error",
        ))
    })?;
    Ok(Html(format!(
        "<script>document.querySelector('.modal-overlay').remove();</script>{}{}",
        toast_html, header_html
    )))
}
