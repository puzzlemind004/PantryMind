import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe } from '../../shared/i18n/translate';

/** Premier lancement : créer son foyer ou en rejoindre un par code. */
@Component({
  selector: 'app-onboarding-page',
  imports: [FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <header class="text-center">
        <h1 class="text-2xl font-bold">{{ 'onboarding.title' | t }}</h1>
        <p class="mt-1 text-muted">{{ 'onboarding.subtitle' | t }}</p>
      </header>

      <form class="card flex flex-col gap-4" (ngSubmit)="create()">
        <h2 class="text-lg font-semibold">{{ 'onboarding.createTitle' | t }}</h2>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">{{ 'onboarding.householdName' | t }}</span>
          <input
            class="input"
            type="text"
            name="name"
            required
            [placeholder]="'onboarding.householdNamePlaceholder' | t"
            [(ngModel)]="name"
          />
        </label>
        <button class="btn-primary" type="submit" [disabled]="pending() || !name.trim()">
          {{ 'onboarding.create' | t }}
        </button>
      </form>

      <form class="card flex flex-col gap-4" (ngSubmit)="join()">
        <h2 class="text-lg font-semibold">{{ 'onboarding.joinTitle' | t }}</h2>
        <p class="text-sm text-muted">{{ 'onboarding.joinSubtitle' | t }}</p>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium">{{ 'onboarding.invitationCode' | t }}</span>
          <input
            class="input uppercase tracking-widest"
            type="text"
            name="code"
            autocapitalize="characters"
            [(ngModel)]="code"
          />
        </label>
        @if (joinError()) {
          <p class="error-text">{{ 'onboarding.invalidCode' | t }}</p>
        }
        <button class="btn-primary" type="submit" [disabled]="pending() || !code.trim()">
          {{ 'onboarding.join' | t }}
        </button>
      </form>
    </div>
  `,
})
export class OnboardingPage {
  private readonly householdStore = inject(HouseholdStore);
  private readonly router = inject(Router);

  protected name = '';
  protected code = '';
  protected readonly pending = signal(false);
  protected readonly joinError = signal(false);

  protected async create(): Promise<void> {
    if (!this.name.trim()) {
      return;
    }
    this.pending.set(true);
    try {
      await this.householdStore.create(this.name.trim());
      await this.router.navigateByUrl('/');
    } finally {
      this.pending.set(false);
    }
  }

  protected async join(): Promise<void> {
    if (!this.code.trim()) {
      return;
    }
    this.pending.set(true);
    this.joinError.set(false);
    try {
      await this.householdStore.joinByCode(this.code.trim().toUpperCase());
      await this.router.navigateByUrl('/');
    } catch {
      this.joinError.set(true);
    } finally {
      this.pending.set(false);
    }
  }
}
