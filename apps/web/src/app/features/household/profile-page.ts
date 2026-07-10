import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthStore } from '../../core/auth/auth-store';
import { HouseholdApi } from '../../core/household/household-api';
import { HouseholdStore } from '../../core/household/household-store';
import { PushApi } from '../../core/push/push-api';
import { TranslatePipe } from '../../shared/i18n/translate';
import type { HouseholdInvitation, HouseholdMembership } from '../../core/api/types';

/**
 * Profil et administration du foyer (spec §8.13) : membres, invitation
 * par code, emplacements de stockage, changement de foyer, déconnexion.
 */
@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <h1 class="text-2xl font-bold">{{ 'profile.title' | t }}</h1>

      <!-- Utilisateur -->
      <section class="card flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft font-bold text-primary"
        >
          {{ authStore.user()?.initials }}
        </div>
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ authStore.user()?.fullName }}</p>
          <p class="truncate text-sm text-muted">{{ authStore.user()?.email }}</p>
        </div>
      </section>

      @if (detail(); as membership) {
        <!-- Foyer -->
        <section class="card flex flex-col gap-3">
          <h2 class="text-lg font-semibold">{{ 'household.title' | t }}</h2>
          <p class="font-medium">
            {{ membership.household.name }}
            <span class="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
              {{ 'household.roles.' + membership.role | t }}
            </span>
          </p>

          @if (householdStore.memberships()!.length > 1) {
            <label class="flex flex-col gap-1">
              <span class="text-sm text-muted">{{ 'household.switch' | t }}</span>
              <select
                class="input"
                [ngModel]="membership.household.id"
                (ngModelChange)="switchHousehold($event)"
              >
                @for (m of householdStore.memberships()!; track m.household.id) {
                  <option [value]="m.household.id">{{ m.household.name }}</option>
                }
              </select>
            </label>
          }

          <!-- Membres -->
          <h3 class="mt-2 text-sm font-semibold text-muted">{{ 'household.members' | t }}</h3>
          <ul class="flex flex-col gap-2">
            @for (member of membership.household.members ?? []; track member.id) {
              <li class="flex items-center justify-between gap-2">
                <span class="truncate">{{ member.user?.fullName || member.user?.email }}</span>
                <span class="shrink-0 text-xs text-muted">
                  {{ 'household.roles.' + member.role | t }}
                </span>
              </li>
            }
          </ul>

          @if (membership.role === 'admin') {
            @if (invitation(); as inv) {
              <div class="rounded-xl bg-primary-soft p-3 text-center">
                <p class="text-sm text-muted">{{ 'household.invitationHint' | t }}</p>
                <p class="mt-1 select-all font-mono text-2xl font-bold tracking-widest text-primary">
                  {{ inv.code }}
                </p>
              </div>
            } @else {
              <button class="btn-secondary" type="button" (click)="createInvitation()">
                {{ 'household.createInvitation' | t }}
              </button>
            }
          }
        </section>

        <!-- Emplacements -->
        <section class="card flex flex-col gap-3">
          <h2 class="text-lg font-semibold">{{ 'household.storageLocations' | t }}</h2>
          <ul class="flex flex-col gap-2">
            @for (location of membership.household.storageLocations ?? []; track location.id) {
              <li class="flex items-center justify-between gap-2">
                <span>
                  {{ location.name }}
                  <span class="ml-1 text-xs text-muted">
                    ({{ 'household.locationTypes.' + location.type | t }})
                  </span>
                </span>
                @if (householdStore.canEdit()) {
                  <button
                    class="text-sm text-danger"
                    type="button"
                    (click)="deleteLocation(location.id)"
                  >
                    {{ 'app.delete' | t }}
                  </button>
                }
              </li>
            }
          </ul>

          @if (householdStore.canEdit()) {
            <form class="flex gap-2" (ngSubmit)="addLocation()">
              <input
                class="input flex-1"
                type="text"
                name="locationName"
                [placeholder]="'household.locationName' | t"
                [(ngModel)]="newLocationName"
              />
              <button class="btn-secondary shrink-0" type="submit" [disabled]="!newLocationName.trim()">
                {{ 'stock.add' | t }}
              </button>
            </form>
          }
        </section>
      } @else {
        <p class="text-center text-muted">{{ 'app.loading' | t }}</p>
      }

      <!-- Mode automatique (spec 5.20, admin) -->
      @if (detail()?.role === 'admin') {
        <section class="card flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="font-semibold">{{ 'profile.automaticMode' | t }}</h2>
            <p class="mt-1 text-xs text-muted">{{ 'profile.automaticModeHint' | t }}</p>
          </div>
          <input
            type="checkbox"
            class="mt-1 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
            [checked]="automaticMode()"
            (change)="toggleAutomaticMode($event)"
            [attr.aria-label]="'profile.automaticMode' | t"
          />
        </section>
      }

      <!-- Notifications push (spec §6.6) -->
      <section class="card flex flex-col gap-2">
        <h2 class="font-semibold">{{ 'profile.notifications' | t }}</h2>
        <p class="text-xs text-muted">{{ 'profile.notificationsHint' | t }}</p>
        @if (!pushSupported()) {
          <p class="text-sm text-muted">{{ 'profile.notificationsUnsupported' | t }}</p>
        } @else if (pushError()) {
          <p class="error-text">{{ pushError()! | t }}</p>
        } @else if (pushSubscribed()) {
          <button class="btn-secondary" type="button" (click)="disablePush()">
            {{ 'profile.disableNotifications' | t }}
          </button>
        } @else {
          <button class="btn-primary" type="button" (click)="enablePush()">
            {{ 'profile.enableNotifications' | t }}
          </button>
        }
      </section>

      <button class="btn-secondary text-danger" type="button" (click)="logout()">
        {{ 'auth.logout' | t }}
      </button>
    </div>
  `,
})
export class ProfilePage implements OnInit {
  protected readonly authStore = inject(AuthStore);
  protected readonly householdStore = inject(HouseholdStore);
  private readonly householdApi = inject(HouseholdApi);
  private readonly router = inject(Router);

  protected readonly detail = signal<HouseholdMembership | null>(null);
  protected readonly invitation = signal<HouseholdInvitation | null>(null);
  protected newLocationName = '';

  protected readonly automaticMode = signal(false);
  protected readonly pushSupported = signal(false);
  protected readonly pushSubscribed = signal(false);
  protected readonly pushError = signal<string | null>(null);

  private readonly pushApi = inject(PushApi);

  async ngOnInit(): Promise<void> {
    if (!this.authStore.user()) {
      await this.authStore.loadProfile();
    }
    await this.refresh();
    this.pushSupported.set(this.pushApi.isSupported);
    if (this.pushApi.isSupported) {
      this.pushSubscribed.set(await this.pushApi.isSubscribed());
    }
  }

  protected async toggleAutomaticMode(event: Event): Promise<void> {
    const householdId = this.householdStore.currentHousehold()?.id;
    if (!householdId) {
      return;
    }
    const enabled = (event.target as HTMLInputElement).checked;
    await this.householdApi.updateSettings(householdId, { automaticMode: enabled });
    this.automaticMode.set(enabled);
  }

  protected async enablePush(): Promise<void> {
    const householdId = this.householdStore.currentHousehold()?.id;
    if (!householdId) {
      return;
    }
    this.pushError.set(null);
    try {
      await this.pushApi.subscribe(householdId);
      this.pushSubscribed.set(true);
    } catch {
      this.pushError.set(
        Notification.permission === 'denied'
          ? 'profile.notificationsDenied'
          : 'profile.notificationsUnsupported',
      );
    }
  }

  protected async disablePush(): Promise<void> {
    const householdId = this.householdStore.currentHousehold()?.id;
    if (!householdId) {
      return;
    }
    await this.pushApi.unsubscribe(householdId);
    this.pushSubscribed.set(false);
  }

  protected async switchHousehold(householdId: string): Promise<void> {
    this.householdStore.select(householdId);
    this.invitation.set(null);
    await this.refresh();
  }

  protected async createInvitation(): Promise<void> {
    const householdId = this.householdStore.currentHousehold()?.id;
    if (!householdId) {
      return;
    }
    this.invitation.set(await this.householdApi.createInvitation(householdId));
  }

  protected async addLocation(): Promise<void> {
    const householdId = this.householdStore.currentHousehold()?.id;
    const name = this.newLocationName.trim();
    if (!householdId || !name) {
      return;
    }
    await this.householdApi.addStorageLocation(householdId, { name });
    this.newLocationName = '';
    await this.refresh();
  }

  protected async deleteLocation(locationId: string): Promise<void> {
    const householdId = this.householdStore.currentHousehold()?.id;
    if (!householdId) {
      return;
    }
    await this.householdApi.deleteStorageLocation(householdId, locationId);
    await this.refresh();
  }

  protected async logout(): Promise<void> {
    await this.authStore.logout();
    this.householdStore.clear();
    await this.router.navigateByUrl('/auth/login');
  }

  private async refresh(): Promise<void> {
    const householdId = this.householdStore.currentHousehold()?.id;
    if (householdId) {
      const detail = await this.householdApi.getDetail(householdId);
      this.detail.set(detail);
      this.automaticMode.set(detail.household.settings?.automaticMode === true);
    }
  }
}
