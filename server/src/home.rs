use askama::Template;
use axum::{extract::State, response::IntoResponse};
use entity::article::Entity as ArticleEntity;
use sea_orm::{
    entity::prelude::DateTime,
    EntityTrait,
    ColumnTrait,
    QueryFilter,
    QueryOrder,
    QuerySelect,
};
use tower_cookies::Cookies;

use crate::{
    error::AppError,
    state::AppState,
};

#[derive(Template)]
#[template(path = "home.html")]
struct HomeTemplate {
    articles: Vec<ArticleDisplay>,
    username: String,
}

struct ArticleDisplay {
    title: String,
    authors: String,
    publishers: String,
    description: String,
    content: String,
    original_url: String,
    tag: String,
    image_url: String,
    time_ago: String,
}

const MINUTE_SECS: i64 = 60;
const HOUR_SECS: i64 = 3600;
const DAY_SECS: i64 = 86400;

fn format_time_ago(created_at: DateTime) -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let created_secs = created_at.and_utc().timestamp();
    let secs = now - created_secs;

    if secs < MINUTE_SECS {
        "just now".to_string()
    } else if secs < HOUR_SECS {
        let mins = secs / MINUTE_SECS;
        format!("{} minute{} ago", mins, if mins == 1 { "" } else { "s" })
    } else if secs < DAY_SECS {
        let hours = secs / HOUR_SECS;
        format!("{} hour{} ago", hours, if hours == 1 { "" } else { "s" })
    } else {
        let days = secs / DAY_SECS;
        format!("{} day{} ago", days, if days == 1 { "" } else { "s" })
    }
}

pub async fn home(
    State(state): State<AppState>,
    cookies: Cookies,
) -> Result<impl IntoResponse, AppError> {
    let username = cookies.get("username").map(|c| c.value().to_string());
    let distinct_tags: Vec<String> = ArticleEntity::find()
        .select_only()
        .column(entity::article::Column::Tag)
        .distinct()
        .limit(9)
        .into_tuple()
        .all(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Database error fetching tags: {}", e);
            AppError::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Database error",
            ))
        })?;

    // For each tag, get the most recent article
    let mut articles = Vec::new();
    for tag in distinct_tags {
        if let Ok(Some(article)) = ArticleEntity::find()
            .filter(entity::article::Column::Tag.eq(&tag))
            // .filter(
            //     entity::article::Column::OriginalUrl
            //         .not_like("https://example.com/%"),
            // )
            // .filter(entity::article::Column::Authors.ne("john doe"))
            .order_by_desc(entity::article::Column::PublishedAt)
            .one(&state.db)
            .await
        {
            articles.push(ArticleDisplay {
                title: article.title,
                authors: article.authors,
                publishers: article.publishers,
                description: article.description,
                content: article.content,
                original_url: article.original_url,
                tag: article.tag,
                image_url: article.image_url,
                time_ago: format_time_ago(article.published_at),
            });
        }
    }

    let tmpl = HomeTemplate {
        articles,
        username: username.unwrap_or_default(),
    };
    let rendered = tmpl.render().map_err(|e| {
        tracing::error!("Template rendering error: {}", e);
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template rendering error",
        ))
    })?;

    Ok(axum::response::Html(rendered))
}
