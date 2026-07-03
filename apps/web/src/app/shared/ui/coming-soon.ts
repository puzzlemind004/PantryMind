import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '../i18n/translate';

/** Écran provisoire pour les modules des lots suivants. */
@Component({
  selector: 'app-coming-soon',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 class="text-2xl font-bold">{{ titleKey() | t }}</h1>
      <p class="text-muted">{{ messageKey() | t }}</p>
    </div>
  `,
})
export class ComingSoon {
  readonly titleKey = input.required<string>();
  readonly messageKey = input.required<string>();
}
