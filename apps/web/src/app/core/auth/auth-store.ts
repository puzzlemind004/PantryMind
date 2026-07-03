import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../api/api-client';
import type { User } from '../api/types';

const TOKEN_STORAGE_KEY = 'cooking.token';

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(ApiClient);

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  private readonly userSignal = signal<User | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.api.post<AuthResponse>('/auth/login', { email, password }),
    );
    this.setSession(response);
  }

  async signup(payload: {
    fullName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<void> {
    const response = await firstValueFrom(this.api.post<AuthResponse>('/auth/signup', payload));
    this.setSession(response);
  }

  /** Recharge le profil au démarrage quand un token existe déjà. */
  async loadProfile(): Promise<void> {
    if (!this.tokenSignal()) {
      return;
    }
    try {
      const user = await firstValueFrom(this.api.get<User>('/account/profile'));
      this.userSignal.set(user);
    } catch {
      this.clearSession();
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.post('/account/logout'));
    } finally {
      this.clearSession();
    }
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    this.tokenSignal.set(response.token);
    this.userSignal.set(response.user);
  }
}
