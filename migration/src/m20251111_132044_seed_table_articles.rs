use chrono::{Duration, Utc};
use entity::article;
use sea_orm::entity::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();
        let now = Utc::now();

        let article = article::ActiveModel {
            title: Set("The Future of Remote Work: How Companies Are Adapting to the New Normal".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("TECHNOLOGY".to_owned()),
            description: Set("As the world continues to evolve, organizations are reimagining workplace culture and embracing hybrid models that combine the best of both worlds.".to_owned()),
            content: Set("As the world continues to evolve, organizations are reimagining workplace culture and embracing hybrid models that combine the best of both worlds.".to_owned()),
            original_url: Set("https://example.com/remote-work".to_owned()),
            tag: Set("TECHNOLOGY".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop".to_owned()),
            created_at: Set((now - Duration::minutes(15)).naive_utc()),
            published_at: Set(Some((now - Duration::minutes(20)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("AI-Driven Analytics Transform Decision Making".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("BUSINESS".to_owned()),
            description: Set("Companies leveraging artificial intelligence are seeing unprecedented insights into customer behavior.".to_owned()),
            content: Set("Companies leveraging artificial intelligence are seeing unprecedented insights into customer behavior.".to_owned()),
            original_url: Set("https://example.com/ai-analytics".to_owned()),
            tag: Set("BUSINESS".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop".to_owned()),
            created_at: Set((now - Duration::hours(2)).naive_utc()),
            published_at: Set(Some((now - Duration::hours(3)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("10 Hidden Gems for Your Next Adventure".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("TRAVEL".to_owned()),
            description: Set("Discover breathtaking destinations off the beaten path that offer authentic experiences.".to_owned()),
            content: Set("Discover breathtaking destinations off the beaten path that offer authentic experiences.".to_owned()),
            original_url: Set("https://example.com/travel-gems".to_owned()),
            tag: Set("TRAVEL".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=400&fit=crop".to_owned()),
            created_at: Set((now - Duration::hours(5)).naive_utc()),
            published_at: Set(Some((now - Duration::hours(6)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Modern Web Development Trends in 2024".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("DEVELOPMENT".to_owned()),
            description: Set("From server components to edge computing, explore what's shaping the web development landscape.".to_owned()),
            content: Set("From server components to edge computing, explore what's shaping the web development landscape.".to_owned()),
            original_url: Set("https://example.com/web-trends".to_owned()),
            tag: Set("DEVELOPMENT".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop".to_owned()),
            created_at: Set((now - Duration::hours(8)).naive_utc()),
            published_at: Set(Some((now - Duration::hours(9)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Plant-Based Cuisine Goes Mainstream".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("FOOD & DRINK".to_owned()),
            description: Set("Restaurants worldwide are embracing innovative plant-based menus that appeal to all palates.".to_owned()),
            content: Set("Restaurants worldwide are embracing innovative plant-based menus that appeal to all palates.".to_owned()),
            original_url: Set("https://example.com/plant-based".to_owned()),
            tag: Set("FOOD & DRINK".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop".to_owned()),
            created_at: Set((now - Duration::hours(10)).naive_utc()),
            published_at: Set(Some((now - Duration::hours(11)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Cryptocurrency Market Shows Signs of Recovery".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("FINANCE".to_owned()),
            description: Set("After a turbulent period, digital currencies are gaining momentum among institutional investors.".to_owned()),
            content: Set("After a turbulent period, digital currencies are gaining momentum among institutional investors.".to_owned()),
            original_url: Set("https://example.com/crypto-recovery".to_owned()),
            tag: Set("FINANCE".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop".to_owned()),
            created_at: Set((now - Duration::hours(28)).naive_utc()),
            published_at: Set(Some((now - Duration::hours(30)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("The Rise of the Four-Day Work Week".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("CAREERS".to_owned()),
            description: Set("More companies are experimenting with condensed schedules, reporting higher productivity and satisfaction.".to_owned()),
            content: Set("More companies are experimenting with condensed schedules, reporting higher productivity and satisfaction.".to_owned()),
            original_url: Set("https://example.com/four-day-week".to_owned()),
            tag: Set("CAREERS".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop".to_owned()),
            created_at: Set((now - Duration::hours(36)).naive_utc()),
            published_at: Set(Some((now - Duration::hours(40)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Sustainable Design Principles for 2024".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("DESIGN".to_owned()),
            description: Set("Designers are prioritizing eco-friendly materials and circular economy principles in their work.".to_owned()),
            content: Set("Designers are prioritizing eco-friendly materials and circular economy principles in their work.".to_owned()),
            original_url: Set("https://example.com/sustainable-design".to_owned()),
            tag: Set("DESIGN".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop".to_owned()),
            created_at: Set((now - Duration::hours(48)).naive_utc()),
            published_at: Set(Some((now - Duration::hours(50)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Micro-Workouts: Fitness in Small Doses".to_owned()),
            authors: Set("john doe".to_owned()),
            publishers: Set("HEALTH".to_owned()),
            description: Set("Short, intense exercise sessions are proving just as effective as longer gym visits.".to_owned()),
            content: Set("Short, intense exercise sessions are proving just as effective as longer gym visits.".to_owned()),
            original_url: Set("https://example.com/micro-workouts".to_owned()),
            tag: Set("HEALTH".to_owned()),
            image_url: Set("https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop".to_owned()),
            created_at: Set((now - Duration::hours(60)).naive_utc()),
            published_at: Set(Some((now - Duration::hours(62)).naive_utc())),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();
        article::Entity::delete_many().exec(db).await?;
        Ok(())
    }
}
