import { APIRequestContext } from "@playwright/test";

const API_BASE = process.env.API_BASE_URL;

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  author: { username: string };
}

export interface AuthUser {
  email: string;
  token: string;
  username: string;
}

/** API client for Conduit backend. */
export class ConduitAPI {
  constructor(private readonly request: APIRequestContext) {}

  /** Authenticates a user. */
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await this.request.post(`${API_BASE}/users/login`, {
      data: { user: { email, password } },
    });
    if (!res.ok()) {
      throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
    }
    const json = await res.json();
    return json.user;
  }

  /** Registers a new user. */
  async registerUser(username: string, email: string, password: string): Promise<AuthUser> {
    const res = await this.request.post(`${API_BASE}/users`, {
      data: { user: { username, email, password } },
    });
    if (!res.ok()) {
      throw new Error(`Register user failed: ${res.status()} ${await res.text()}`);
    }
    const json = await res.json();
    return json.user;
  }

  /** Creates an article. */
  async createArticle(token: string, article: ArticleData): Promise<Article> {
    const res = await this.request.post(`${API_BASE}/articles`, {
      headers: { Authorization: `Token ${token}` },
      data: { article },
    });
    if (!res.ok()) {
      throw new Error(
        `Create article failed: ${res.status()} ${await res.text()}`
      );
    }
    const json = await res.json();
    return json.article;
  }

  /** Fetches an article by slug. */
  async getArticle(slug: string, token?: string): Promise<Article> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const res = await this.request.get(`${API_BASE}/articles/${slug}`, { headers });
    if (!res.ok()) {
      throw new Error(
        `Get article failed: ${res.status()} ${await res.text()}`
      );
    }
    const json = await res.json();
    return json.article;
  }

  /** Deletes an article by slug. */
  async deleteArticle(token: string, slug: string): Promise<void> {
    const res = await this.request.delete(`${API_BASE}/articles/${slug}`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok()) {
      console.warn(`Cleanup: delete article ${slug} returned ${res.status()}`);
    }
  }

  /** Updates an article by slug. */
  async updateArticle(
    token: string,
    slug: string,
    updates: Partial<ArticleData>
  ): Promise<Article> {
    const res = await this.request.put(`${API_BASE}/articles/${slug}`, {
      headers: { Authorization: `Token ${token}` },
      data: { article: updates },
    });
    if (!res.ok()) {
      throw new Error(
        `Update article failed: ${res.status()} ${await res.text()}`
      );
    }
    const json = await res.json();
    return json.article;
  }
}
