'use client';

import { useState, useEffect } from 'react';
import { ArticlesData, Article, DisplayArticle } from '@/types/articles';
import {
    fetchArticles,
    transformToDisplayArticle,
    filterByCategory,
    filterBySearch,
    getTrendingArticles,
    getHiddenGems,
    getRisingStars,
    getCuratedArticles,
    extractTrendingKeywords,
    getCategories,
} from '@/lib/articlesUtils';

export function useArticles() {
    const [articlesData, setArticlesData] = useState<ArticlesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadArticles() {
            try {
                setLoading(true);
                const data = await fetchArticles();
                setArticlesData(data);
                setError(null);
            } catch (err) {
                setError('Failed to load articles');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadArticles();
    }, []);

    return { articlesData, loading, error };
}

export function useFilteredArticles(
    category: string = 'All',
    searchQuery: string = '',
    discoveryFilter?: 'Trending' | 'Hidden Gems' | 'Rising Stars' | 'Curated Collections'
) {
    const { articlesData, loading, error } = useArticles();
    const [filteredArticles, setFilteredArticles] = useState<DisplayArticle[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [trendingKeywords, setTrendingKeywords] = useState<Array<{ tag: string; count: number }>>([]);

    useEffect(() => {
        if (!articlesData) return;

        let articles = articlesData.articles;

        // Apply discovery filter first (for Explore page)
        if (discoveryFilter) {
            switch (discoveryFilter) {
                case 'Trending':
                    articles = getTrendingArticles(articles, 20);
                    break;
                case 'Hidden Gems':
                    articles = getHiddenGems(articles, 20);
                    break;
                case 'Rising Stars':
                    articles = getRisingStars(articles, 20);
                    break;
                case 'Curated Collections':
                    articles = getCuratedArticles(articles, 20);
                    break;
            }
        }

        // Apply category filter
        articles = filterByCategory(articles, category);

        // Apply search filter
        articles = filterBySearch(articles, searchQuery);

        // Transform to display articles
        const displayArticles = articles.map(transformToDisplayArticle);
        setFilteredArticles(displayArticles);

        // Extract categories and trending keywords
        setCategories(getCategories(articlesData));
        setTrendingKeywords(extractTrendingKeywords(articlesData.articles));
    }, [articlesData, category, searchQuery, discoveryFilter]);

    return {
        articles: filteredArticles,
        categories,
        trendingKeywords,
        loading,
        error,
        statistics: articlesData?.statistics,
    };
}
