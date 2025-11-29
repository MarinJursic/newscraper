import axios from 'axios';

// Backend API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Article {
  id: string;
  title: string;
  url: string;
  published: string;
  author?: string;
  image_url?: string;
  content?: {
    short_description?: string;
    long_description?: string;
    full_text?: string;
    reading_time?: number;
  };
  scores?: {
    confidence_score?: number;
    relevance_score?: number;
    sentiment_score?: number;
    trend_score?: number;
  };
  classification?: {
    category?: string;
    tags?: string[];
    actionable?: boolean;
  };
  metadata?: {
    keywords?: string[];
    sources?: string[];
  };
  ai_summary?: string;
  ai_analysis?: any;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface ArticleStats {
  total_articles: number;
  categories: Array<{ category: string; count: number }>;
  average_scores: {
    confidence: number;
    relevance: number;
    sentiment: number;
    trend: number;
  };
  actionable_count: number;
  recent_24h: number;
}

export interface UserPreferences {
  email: string;
  role: string;
  tech_stack: string[];
}

export interface SubscribeResponse {
  message: string;
  email: string;
  role: string;
  tech_stack: string[];
}

// API Functions

/**
 * Subscribe user to newsletter with preferences
 */
export async function subscribeUser(data: UserPreferences): Promise<SubscribeResponse> {
  const params = new URLSearchParams();
  params.append('email', data.email);
  params.append('role', data.role);
  data.tech_stack.forEach(tech => params.append('tech_stack', tech));

  const response = await apiClient.post<SubscribeResponse>('/subscribe', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

/**
 * Get articles with filtering and pagination
 */
export async function getArticles(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
  actionable?: boolean;
  min_confidence?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}): Promise<ArticlesResponse> {
  const response = await apiClient.get<ArticlesResponse>('/articles', { params });
  return response.data;
}

/**
 * Get single article by ID
 */
export async function getArticle(id: string): Promise<Article> {
  const response = await apiClient.get<Article>(`/articles/${id}`);
  return response.data;
}

/**
 * Get article statistics
 */
export async function getArticleStats(): Promise<ArticleStats> {
  const response = await apiClient.get<ArticleStats>('/articles/stats');
  return response.data;
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Array<{ name: string; count: number }>> {
  const response = await apiClient.get<{ categories: Array<{ name: string; count: number }> }>('/categories');
  return response.data.categories;
}

/**
 * Get trend data for keywords
 */
export async function getTrends(keywords: string[]): Promise<any> {
  const response = await apiClient.get('/trends', {
    params: { keywords: keywords.join(',') },
  });
  return response.data;
}

/**
 * Trigger article analysis
 */
export async function analyzeArticle(articleId: string, force = false): Promise<{ message: string }> {
  const response = await apiClient.post(`/analyze/${articleId}`, null, {
    params: { force },
  });
  return response.data;
}

export default apiClient;
