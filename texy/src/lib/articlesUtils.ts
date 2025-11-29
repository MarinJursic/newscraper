import { Article, ArticlesData, DisplayArticle } from '@/types/articles';

/**
 * Fetches articles data from the public folder
 */
export async function fetchArticles(): Promise<ArticlesData> {
    try {
        const response = await fetch('/articles.json');
        if (!response.ok) {
            throw new Error('Failed to fetch articles');
        }
        const data: ArticlesData = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
    }
}

/**
 * Transforms an Article from the JSON to a DisplayArticle for UI rendering
 */
export function transformToDisplayArticle(article: Article): DisplayArticle {
    // Determine sentiment based on sentiment_score
    let sentiment: 'positive' | 'neutral' | 'critical' = 'neutral';
    if (article.scores.sentiment_score < -50) {
        sentiment = 'critical';
    } else if (article.scores.sentiment_score > 20) {
        sentiment = 'positive';
    }

    // Extract source from author or first source in metadata
    const source = article.author || article.metadata.sources[0]?.domain || 'Unknown';

    return {
        id: article.id,
        category: article.classification.category,
        source: source,
        time: article.published,
        title: article.title,
        summary: article.content.short_description,
        sentiment: sentiment,
        image: article.image_url,
        tags: article.classification.tags,
        trendScore: article.scores.trend_score,
    };
}

/**
 * Filters articles by category
 */
export function filterByCategory(articles: Article[], category: string): Article[] {
    if (category === 'All') return articles;
    return articles.filter(article => article.classification.category === category);
}

/**
 * Filters articles by search query
 */
export function filterBySearch(articles: Article[], query: string): Article[] {
    if (!query) return articles;
    const lowerQuery = query.toLowerCase();
    return articles.filter(article =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.content.short_description.toLowerCase().includes(lowerQuery) ||
        article.classification.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Sorts articles by trend score (descending)
 */
export function sortByTrending(articles: Article[]): Article[] {
    return [...articles].sort((a, b) => b.scores.trend_score - a.scores.trend_score);
}

/**
 * Filters articles that are trending
 */
export function getTrendingArticles(articles: Article[], limit: number = 10): Article[] {
    return sortByTrending(articles).slice(0, limit);
}

/**
 * Gets articles with high impact but low volume (Hidden Gems)
 */
export function getHiddenGems(articles: Article[], limit: number = 10): Article[] {
    return [...articles]
        .filter(article => article.scores.relevance_score > 80 && article.trends.virality.news_volume !== 'viral')
        .sort((a, b) => b.scores.relevance_score - a.scores.relevance_score)
        .slice(0, limit);
}

/**
 * Gets articles with fastest growing trends (Rising Stars)
 */
export function getRisingStars(articles: Article[], limit: number = 10): Article[] {
    return [...articles]
        .filter(article => article.trends.trend_direction === 'rising' || article.trends.change_percent > 50)
        .sort((a, b) => b.trends.change_percent - a.trends.change_percent)
        .slice(0, limit);
}

/**
 * Gets curated/actionable articles
 */
export function getCuratedArticles(articles: Article[], limit: number = 10): Article[] {
    return [...articles]
        .filter(article => article.classification.actionable)
        .sort((a, b) => b.scores.confidence_score - a.scores.confidence_score)
        .slice(0, limit);
}

/**
 * Extracts trending keywords from articles
 */
export function extractTrendingKeywords(articles: Article[], limit: number = 6): Array<{ tag: string; count: number }> {
    const keywordMap = new Map<string, number>();

    articles.forEach(article => {
        article.metadata.keywords.forEach(kw => {
            if (kw.score >= 50) { // Only high-score keywords
                const current = keywordMap.get(kw.keyword) || 0;
                keywordMap.set(kw.keyword, current + 1);
            }
        });
    });

    return Array.from(keywordMap.entries())
        .map(([tag, count]) => ({ tag: `#${tag.replace(/\s+/g, '')}`, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Gets unique categories from articles
 */
export function getCategories(articlesData: ArticlesData): string[] {
    return ['All', ...articlesData.categories_available];
}
