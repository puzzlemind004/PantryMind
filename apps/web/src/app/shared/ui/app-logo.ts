import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Lockup PantryMind : logo officiel + nom bicolore (« Pantry » marine,
 * « Mind » orange), fidèle au logo long fourni par le porteur.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center gap-3">
      <img
        src="logo.png"
        alt=""
        aria-hidden="true"
        [style.height.px]="size()"
        class="w-auto"
      />
      @if (withName()) {
        <span class="font-bold" [style.font-size.px]="size() * 0.62">
          <span class="text-brand-navy">Pantry</span><span class="text-primary">Mind</span>
        </span>
      }
    </div>
  `,
})
export class AppLogo {
  /** Hauteur du logo en pixels. */
  readonly size = input(48);
  readonly withName = input(true);
}
