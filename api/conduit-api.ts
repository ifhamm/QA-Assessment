import { APIRequestContext } from "@playwright/test";

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

export class ConduitAPI {
  constructor(private readonly request: APIRequestContext) {}

  private getApiBase(): string {
    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      throw new Error("API_BASE_URL must be set for ConduitAPI requests.");
    }
    return apiBase;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const res = await this.request.post(`${this.getApiBase()}/users/login`, {
      data: { user: { email, password } },
    });
    if (!res.ok()) {
      throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
    }
    const json = await res.json();
    return json.user;
  }

  async registerUser(username: string, email: string, password: string): Promise<AuthUser> {
    const res = await this.request.post(`${this.getApiBase()}/users`, {
      data: { user: { username, email, password } },
    });
    if (!res.ok()) {
      throw new Error(`Register user failed: ${res.status()} ${await res.text()}`);
    }
    const json = await res.json();
    return json.user;
  }

  /**
   * Attempts to delete the authenticated user.
   *
   * The RealWorld API used by this project does not expose user deletion.
   * A 405 is therefore reported as an unsupported cleanup operation.
   */
  async deleteUser(token: string): Promise<boolean> {
    const res = await this.request.delete(`${this.getApiBase()}/user`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (res.status() === 405) {
      console.warn(
        "Cleanup: user deletion is not supported by the configured API."
      );
      return false;
    }
    if (!res.ok()) {
      throw new Error(
        `Delete user failed: ${res.status()} ${await res.text()}`
      );
    }
    return true;
  }

  async createArticle(token: string, article: ArticleData): Promise<Article> {
    const res = await this.request.post(`${this.getApiBase()}/articles`, {
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

  async getArticle(slug: string, token?: string): Promise<Article> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const res = await this.request.get(`${this.getApiBase()}/articles/${slug}`, { headers });
    if (!res.ok()) {
      throw new Error(
        `Get article failed: ${res.status()} ${await res.text()}`
      );
    }
    const json = await res.json();
    return json.article;
  }

  async getArticleStatus(slug: string, token?: string): Promise<number> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Token ${token}`;
    const res = await this.request.get(
      `${this.getApiBase()}/articles/${slug}`,
      { headers }
    );
    return res.status();
  }

  async deleteArticle(token: string, slug: string): Promise<void> {
    const res = await this.request.delete(`${this.getApiBase()}/articles/${slug}`, {
      headers: { Authorization: `Token ${token}` },
    });
    // A 404 means the article is already gone. Cleanup is idempotent: a test
    // that deletes through the UI must not turn teardown into a warning.
    if (res.status() !== 404 && !res.ok()) {
      throw new Error(
        `Delete article ${slug} failed: ${res.status()} ${await res.text()}`
      );
    }
  }
}
