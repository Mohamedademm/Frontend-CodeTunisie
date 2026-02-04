import api from './api';

export interface ArticleDefinition {
  term: string;
  definition: string;
  term_length: number;
  definition_length: number;
}

export interface ArticleContent {
  full_text: string;
  length: number;
  word_count: number;
  paragraphs: string[];
  paragraph_count: number;
  numbered_items: string[];
}

export interface ArticleLearningMetadata {
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_study_time_minutes: number;
  content_type: string;
  requires_visual_aids: boolean;
  suitable_for_video: boolean;
}

export interface ArticleStructure {
  has_structured_data: boolean;
  has_amendments: boolean;
  has_references: boolean;
  referenced_articles: number[];
}

export interface ArticleMetadata {
  url: string;
  scraped_at: string;
  language: string;
  source: string;
}

export interface Article {
  article_number: number;
  title: string;
  document_name: string;
  page_title: string;
  description: string;
  keywords: string | null;
  content: ArticleContent;
  definitions: ArticleDefinition[] | null;
  definition_count: number;
  structure: ArticleStructure;
  educational_content: unknown;
  learning_metadata: ArticleLearningMetadata;
  metadata: ArticleMetadata;
}

export interface ArticleSummary {
  article_number: number;
  title: string;
  description: string;
  page_title: string;
  definition_count: number;
  difficulty_level: string;
  estimated_study_time_minutes: number;
}

export interface AssistantResponse {
  answer: string;
  context: {
    currentArticle: number;
    articlesUsed: Array<{
      number: number;
      title: string;
    }>;
  };
}

export const articleService = {
  // Get all articles (summaries)
  getArticles: async (): Promise<ArticleSummary[]> => {
    const response = await api.get('/articles');
    return response.data.data;
  },

  // Get single article by number
  getArticle: async (articleNumber: number): Promise<Article> => {
    const response = await api.get(`/articles/${articleNumber}`);
    return response.data.data;
  },

  // Get multiple articles for context
  getArticlesContext: async (articleNumbers: number[]): Promise<Article[]> => {
    const response = await api.post('/articles/context', { articleNumbers });
    return response.data.data;
  },

  // Ask AI assistant a question
  askAssistant: async (
    question: string,
    currentArticleNumber?: number,
    includeNearbyArticles: boolean = true
  ): Promise<AssistantResponse> => {
    const response = await api.post('/assistant/chat', {
      question,
      currentArticleNumber,
      includeNearbyArticles,
    });
    return response.data.data;
  },
};

export default articleService;
