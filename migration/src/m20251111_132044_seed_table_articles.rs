use entity::article;
use sea_orm::entity::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();

        let article = article::ActiveModel {
            title: Set("The Future of Remote Work: How Companies Are Adapting to the New Normal".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("TECHNOLOGY".to_owned()),
            description: Set("As the world continues to evolve, organizations are reimagining workplace culture and embracing hybrid models that combine the best of both worlds.".to_owned()),
            content: Set("As the world continues to evolve, organizations are reimagining workplace culture and embracing hybrid models that combine the best of both worlds.".to_owned()),
            original_url: Set("https://example.com/remote-work".to_owned()),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("AI-Driven Analytics Transform Decision Making".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("BUSINESS".to_owned()),
            description: Set("Companies leveraging artificial intelligence are seeing unprecedented insights into customer behavior.".to_owned()),
            content: Set("Companies leveraging artificial intelligence are seeing unprecedented insights into customer behavior.".to_owned()),
            original_url: Set("https://example.com/ai-analytics".to_owned()),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("10 Hidden Gems for Your Next Adventure".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("TRAVEL".to_owned()),
            description: Set("Discover breathtaking destinations off the beaten path that offer authentic experiences.".to_owned()),
            content: Set("Discover breathtaking destinations off the beaten path that offer authentic experiences.".to_owned()),
            original_url: Set("https://example.com/travel-gems".to_owned()),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Modern Web Development Trends in 2024".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("DEVELOPMENT".to_owned()),
            description: Set("From server components to edge computing, explore what's shaping the web development landscape.".to_owned()),
            content: Set("From server components to edge computing, explore what's shaping the web development landscape.".to_owned()),
            original_url: Set("https://example.com/web-trends".to_owned()),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Plant-Based Cuisine Goes Mainstream".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("FOOD & DRINK".to_owned()),
            description: Set("Restaurants worldwide are embracing innovative plant-based menus that appeal to all palates.".to_owned()),
            content: Set("Restaurants worldwide are embracing innovative plant-based menus that appeal to all palates.".to_owned()),
            original_url: Set("https://example.com/plant-based".to_owned()),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Cryptocurrency Market Shows Signs of Recovery".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("FINANCE".to_owned()),
            description: Set("After a turbulent period, digital currencies are gaining momentum among institutional investors.".to_owned()),
            content: Set("After a turbulent period, digital currencies are gaining momentum among institutional investors.".to_owned()),
            original_url: Set("https://example.com/crypto-recovery".to_owned()),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("The Rise of the Four-Day Work Week".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("CAREERS".to_owned()),
            description: Set("More companies are experimenting with condensed schedules, reporting higher productivity and satisfaction.".to_owned()),
            content: Set("More companies are experimenting with condensed schedules, reporting higher productivity and satisfaction.".to_owned()),
            original_url: Set("https://example.com/four-day-week".to_owned()),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Sustainable Design Principles for 2024".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("DESIGN".to_owned()),
            description: Set("Designers are prioritizing eco-friendly materials and circular economy principles in their work.".to_owned()),
            content: Set("Designers are prioritizing eco-friendly materials and circular economy principles in their work.".to_owned()),
            original_url: Set("https://example.com/sustainable-design".to_owned()),
            ..Default::default()
        };
        article::Entity::insert(article).exec(db).await?;

        let article = article::ActiveModel {
            title: Set("Micro-Workouts: Fitness in Small Doses".to_owned()),
            authors: Set("Unknown".to_owned()),
            publishers: Set("HEALTH".to_owned()),
            description: Set("Short, intense exercise sessions are proving just as effective as longer gym visits.".to_owned()),
            content: Set("Short, intense exercise sessions are proving just as effective as longer gym visits.".to_owned()),
            original_url: Set("https://example.com/micro-workouts".to_owned()),
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
