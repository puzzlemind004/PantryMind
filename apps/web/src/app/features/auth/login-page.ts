import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthStore } from '../../core/auth/auth-store';
import { TranslatePipe } from '../../shared/i18n/translate';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <h1 class="text-center text-3xl font-bold text-primary">{{ 'app.name' | t }}</h1>

      <form class="card flex flex-col gap-4" (ngSubmit)="submit()">
        <h2 class="text-xl font-semibold">{{ 'auth.login.title' | t }}</h2>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">{{ 'auth.login.email' | t }}</span>
          <input
            class="input"
            type="email"
            name="email"
            autocomplete="email"
            required
            [(ngModel)]="email"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">{{ 'auth.login.password' | t }}</span>
          <input
            class="input"
            type="password"
            name="password"
            autocomplete="current-password"
            required
            [(ngModel)]="password"
          />
        </label>

        @if (error()) {
          <p class="error-text">{{ error()! | t }}</p>
        }

        <button class="btn-primary" type="submit" [disabled]="pending()">
          {{ 'auth.login.submit' | t }}
        </button>
      </form>

      <p class="text-center text-sm text-muted">
        {{ 'auth.login.noAccount' | t }}
        <a routerLink="/auth/signup" class="font-medium text-primary">
          {{ 'auth.login.signupLink' | t }}
        </a>
      </p>
    </div>
  `,
})
export class LoginPage {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (!this.email || !this.password) {
      return;
    }
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.authStore.login(this.email, this.password);
      await this.router.navigateByUrl('/');
    } catch {
      this.error.set('auth.login.invalidCredentials');
    } finally {
      this.pending.set(false);
    }
  }
}
