const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

class APIService {
  private async request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // ============ AUTH ENDPOINTS ============

  async signup(email: string, password: string, name: string) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // ============ POSTS ENDPOINTS ============

  async getPosts(page = 1, limit = 10, status = 'published', userId?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), status });
    if (userId) params.set('userId', userId);
    return this.request(`/api/posts?${params}`);
  }

  async getPostById(id: string) {
    return this.request(`/api/posts/${id}`);
  }

  async createPost(title: string, content: string, _userId: string, data?: Partial<any>) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, ...data }),
    });
  }

  async updatePost(id: string, updates: Partial<any>) {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePost(id: string) {
    return this.request(`/api/posts/${id}`, { method: 'DELETE' });
  }

  // ============ AI ENDPOINTS ============

  async generateBlogContent(prompt: string, userId: string, tone: string = 'professional') {
    return this.request('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, userId, tone }),
    });
  }

  // ============ ADMIN ENDPOINTS ============

  async getUsers() {
    return this.request('/api/admin/users');
  }

  async updateUserRole(userId: string, role: string) {
    return this.request('/api/admin/users', {
      method: 'PUT',
      body: JSON.stringify({ userId, role }),
    });
  }

  // ============ USER ENDPOINTS ============

  async getProfile() {
    return this.request('/api/user/profile');
  }

  async updateProfile(updates: Record<string, string>) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getStats() {
    return this.request('/api/user/stats');
  }

  // ============ NOTIFICATIONS ============

  async getNotifications() {
    return this.request('/api/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/api/notifications/${id}`, { method: 'PATCH' });
  }

  async deleteNotification(id: string) {
    return this.request(`/api/notifications/${id}`, { method: 'DELETE' });
  }
}

export const apiService = new APIService();
