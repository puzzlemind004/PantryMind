import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../api/api-client';

/**
 * Abonnement Web Push de l'appareil (spec §6.6). Nécessite le service
 * worker Angular (build de production) et l'accord de l'utilisateur.
 */
@Injectable({ providedIn: 'root' })
export class PushApi {
  private readonly api = inject(ApiClient);
  private readonly swPush = inject(SwPush);

  get isSupported(): boolean {
    return this.swPush.isEnabled;
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.swPush.isEnabled) {
      return false;
    }
    const subscription = await firstValueFrom(this.swPush.subscription);
    return subscription !== null;
  }

  async subscribe(householdId: string): Promise<void> {
    const { publicKey } = await firstValueFrom(
      this.api.get<{ publicKey: string }>(`/households/${householdId}/push/public-key`),
    );
    const subscription = await this.swPush.requestSubscription({ serverPublicKey: publicKey });
    const json = subscription.toJSON();
    await firstValueFrom(
      this.api.post(`/households/${householdId}/push/subscriptions`, {
        endpoint: subscription.endpoint,
        keys: { p256dh: json.keys?.['p256dh'], auth: json.keys?.['auth'] },
      }),
    );
  }

  async unsubscribe(householdId: string): Promise<void> {
    const subscription = await firstValueFrom(this.swPush.subscription);
    if (!subscription) {
      return;
    }
    await firstValueFrom(
      this.api.post(`/households/${householdId}/push/unsubscribe`, {
        endpoint: subscription.endpoint,
      }),
    );
    await subscription.unsubscribe();
  }
}
