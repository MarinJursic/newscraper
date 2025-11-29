// TypeScript types for articles.json data structure

export interface ArticleKeyword {
    keyword: string;
    score: number;
}

export interface ArticleSource {
    name: string;
    url: string;
    domain: string;
    favicon: string;
}

export interface ArticleContent {
    short_description: string;
    long_description: string;
    full_text: string;
    reading_time: number;
}

export interface ArticleScores {
    confidence_score: number;
    relevance_score: number;
    sentiment_score: number;
    trend_score: number;
}

export interface LegacyCategory {
    id: string;
    name: string;
}

export interface ArticleClassification {
    category: string;
    legacy_category: LegacyCategory;
    tags: string[];
    actionable: boolean;
}

export interface ArticleMetadata {
    keywords: ArticleKeyword[];
    sources: ArticleSource[];
    analyzed_at: string;
    is_new: boolean;
}

export interface GoogleTrendsData {
    score: number;
    direction: string;
    change_percent: number;
    graph_data: Array<{ date: string; value: number }>;
    related_queries: Array<{ query: string; type: string; growth?: string; score?: number }>;
}

export interface SocialSignals {
    reddit_score: number;
    reddit_posts_24h: number;
    reddit_sentiment: string;
    hackernews_score: number;
    hackernews_posts_24h: number;
    twitter_estimated: number;
}

export interface Virality {
    is_trending: boolean;
    trending_regions: Array<{ country: string; interest: number }>;
    breakout_detected: boolean;
    news_volume: string;
}

export interface ArticleTrends {
    keyword: string;
    trend_score: number;
    trend_direction: string;
    change_percent: number;
    peak_value: number;
    peak_date: string | null;
    google_trends: GoogleTrendsData;
    social_signals: SocialSignals;
    virality: Virality;
    related_topics: any[];
    recommended: Array<{ topic: string; type: string; growth: string }>;
}

export interface AIAnalysis {
    content: {
        title: string;
        short_description: string;
        long_description: string;
        category: string;
    };
    scores: ArticleScores;
    metadata: {
        keywords: string[];
        actionable: boolean;
        generated_by: string;
    };
}

export interface AISummary {
    summary: string;
    key_points: string[];
    generated_by: string;
}

export interface Article {
    id: string;
    title: string;
    url: string;
    published: string;
    author: string;
    image_url: string;
    media_type: string;
    content: ArticleContent;
    scores: ArticleScores;
    classification: ArticleClassification;
    metadata: ArticleMetadata;
    trends: ArticleTrends;
    ai_analysis: AIAnalysis;
    ai_summary: AISummary;
}

export interface ArticlesData {
    generated_at: string;
    statistics: {
        total_articles: number;
        avg_confidence: number;
        avg_relevance: number;
        avg_sentiment: number;
        avg_trend: number;
        actionable_count: number;
        categories: Record<string, number>;
    };
    categories_available: string[];
    legacy_categories: Record<string, string>;
    articles: Article[];
}

// Simplified article type for display in cards
export interface DisplayArticle {
    id: string;
    category: string;
    source: string;
    time: string;
    title: string;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'critical';
    image?: string;
    tags?: string[];
    trendScore?: number;
}
