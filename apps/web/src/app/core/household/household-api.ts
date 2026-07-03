import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../api/api-client';
import type {
  Household,
  HouseholdInvitation,
  HouseholdMembership,
  HouseholdRole,
  StorageLocation,
  StorageLocationType,
} from '../api/types';

/** Opérations foyer au-delà du store (détail, invitations, emplacements). */
@Injectable({ providedIn: 'root' })
export class HouseholdApi {
  private readonly api = inject(ApiClient);

  getDetail(householdId: string): Promise<HouseholdMembership> {
    return firstValueFrom(this.api.get<HouseholdMembership>(`/households/${householdId}`));
  }

  updateName(householdId: string, name: string): Promise<Household> {
    return firstValueFrom(this.api.patch<Household>(`/households/${householdId}`, { name }));
  }

  createInvitation(householdId: string, role?: HouseholdRole): Promise<HouseholdInvitation> {
    return firstValueFrom(
      this.api.post<HouseholdInvitation>(`/households/${householdId}/invitations`, { role }),
    );
  }

  removeMember(householdId: string, memberId: string): Promise<void> {
    return firstValueFrom(this.api.delete(`/households/${householdId}/members/${memberId}`));
  }

  addStorageLocation(
    householdId: string,
    payload: { name: string; type?: StorageLocationType },
  ): Promise<StorageLocation> {
    return firstValueFrom(
      this.api.post<StorageLocation>(`/households/${householdId}/storage-locations`, payload),
    );
  }

  deleteStorageLocation(householdId: string, locationId: string): Promise<void> {
    return firstValueFrom(
      this.api.delete(`/households/${householdId}/storage-locations/${locationId}`),
    );
  }
}
