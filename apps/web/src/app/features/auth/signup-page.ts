import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthStore } from '../../core/auth/auth-store';
import { TranslatePipe } from '../../shared/i18n/translate';

@Component({
  selector: 'app-signup-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <h1 class="text-center text-3xl font-bold text-primary">{{ 'app.name' | t }}</h1>

      <form class="card flex flex-col gap-4" (ngSubmit)="submit()">
        <h2 class="text-xl font-semibold">{{ 'auth.signup.title' | t }}</h2>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">{{ 'auth.signup.fullName' | t }}</span>
          <input class="input" type="text" name="fullName" autocomplete="name" [(ngModel)]="fullName" />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">{{ 'auth.signup.email' | t }}</span>
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
          <span class="text-sm font-medium">{{ 'auth.signup.password' | t }}</span>
          <input
            class="input"
            type="password"
            name="password"
            autocomplete="new-password"
            required
            minlength="8"
            [(ngModel)]="password"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">{{ 'auth.signup.passwordConfirmation' | t }}</span>
          <input
            class="input"
            type="password"
            name="passwordConfirmation"
            autocomplete="new-password"
            required
            [(ngModel)]="passwordConfirmation"
          />
        </label>

        @if (error()) {
          <p class="error-text">{{ error()! | t }}</p>
        }

        <button class="btn-primary" type="submit" [disabled]="pending()">
          {{ 'auth.signup.submit' | t }}
        </button>
      </form>

      <p class="text-center text-sm text-muted">
        {{ 'auth.signup.hasAccount' | t }}
        <a routerLink="/auth/login" class="font-medium text-primary">
          {{ 'auth.signup.loginLink' | t }}
        </a>
      </p>
    </div>
  `,
})
export class SignupPage {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected fullName = '';
  protected email = '';
  protected password = '';
  protected passwordConfirmation = '';
  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (!this.email || this.password.length < 8) {
      return;
    }
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.authStore.signup({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        passwordConfirmation: this.passwordConfirmation,
      });
      await this.router.navigateByUrl('/');
    } catch (error) {
      this.error.set(
        error instanceof HttpErrorResponse && error.status === 422
          ? 'auth.signup.emailTaken'
          : 'app.error',
      );
    } finally {
      this.pending.set(false);
    }
  }
}
