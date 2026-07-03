import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { HouseholdStore } from './household-store';

async function ensureLoaded(store: HouseholdStore): Promise<boolean> {
  if (store.memberships() !== null) {
    return true;
  }
  try {
    await store.load();
    return true;
  } catch {
    return false;
  }
}

/** L'application exige un foyer : sans foyer, direction l'onboarding. */
export const householdGuard: CanActivateFn = async () => {
  const store = inject(HouseholdStore);
  const router = inject(Router);

  if (!(await ensureLoaded(store))) {
    return router.createUrlTree(['/auth/login']);
  }
  return (store.memberships()?.length ?? 0) > 0 ? true : router.createUrlTree(['/onboarding']);
};

/** L'onboarding n'a de sens que sans foyer existant. */
export const onboardingGuard: CanActivateFn = async () => {
  const store = inject(HouseholdStore);
  const router = inject(Router);

  if (!(await ensureLoaded(store))) {
    return router.createUrlTree(['/auth/login']);
  }
  return (store.memberships()?.length ?? 0) === 0 ? true : router.createUrlTree(['/']);
};
