import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../api/api-client';
import type { Household, HouseholdMembership, HouseholdRole } from '../api/types';

const HOUSEHOLD_STORAGE_KEY = 'cooking.householdId';

/**
 * Foyers de l'utilisateur et foyer actif. Le foyer actif est mémorisé
 * en local pour retrouver son contexte à chaque ouverture.
 */
@Injectable({ providedIn: 'root' })
export class HouseholdStore {
  private readonly api = inject(ApiClient);

  private readonly membershipsSignal = signal<HouseholdMembership[] | null>(null);
  private readonly currentIdSignal = signal<string | null>(
    localStorage.getItem(HOUSEHOLD_STORAGE_KEY),
  );

  /** null = pas encore chargé ; [] = aucun foyer (onboarding requis). */
  readonly memberships = this.membershipsSignal.asReadonly();

  readonly current = computed<HouseholdMembership | null>(() => {
    const memberships = this.membershipsSignal();
    if (!memberships || memberships.length === 0) {
      return null;
    }
    const currentId = this.currentIdSignal();
    return memberships.find((m) => m.household.id === currentId) ?? memberships[0];
  });

  readonly currentHousehold = computed<Household | null>(
    () => this.current()?.household ?? null,
  );
  readonly currentRole = computed<HouseholdRole | null>(() => this.current()?.role ?? null);
  readonly canEdit = computed(() => this.currentRole() === 'admin' || this.currentRole() === 'member');

  async load(): Promise<void> {
    const memberships = await firstValueFrom(this.api.get<HouseholdMembership[]>('/households'));
    this.membershipsSignal.set(memberships);
  }

  select(householdId: string): void {
    localStorage.setItem(HOUSEHOLD_STORAGE_KEY, householdId);
    this.currentIdSignal.set(householdId);
  }

  async create(name: string): Promise<Household> {
    const household = await firstValueFrom(this.api.post<Household>('/households', { name }));
    await this.load();
    this.select(household.id);
    return household;
  }

  async joinByCode(code: string): Promise<void> {
    const result = await firstValueFrom(
      this.api.post<{ household: Household; role: HouseholdRole; alreadyMember: boolean }>(
        '/invitations/join',
        { code },
      ),
    );
    await this.load();
    this.select(result.household.id);
  }

  clear(): void {
    this.membershipsSignal.set(null);
    this.currentIdSignal.set(null);
    localStorage.removeItem(HOUSEHOLD_STORAGE_KEY);
  }
}
