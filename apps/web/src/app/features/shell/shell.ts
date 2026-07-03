import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TranslatePipe } from '../../shared/i18n/translate';

interface NavTab {
  path: string;
  labelKey: string;
  icon: 'stock' | 'planning' | 'recipes' | 'shopping' | 'profile';
}

/**
 * Gabarit principal mobile-first : contenu plein écran + barre de
 * navigation inférieure à 5 sections (spec §8.2).
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-dvh flex-col">
      <main class="flex-1 overflow-y-auto pb-20">
        <router-outlet />
      </main>

      <nav
        class="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface-raised pb-[env(safe-area-inset-bottom)]"
      >
        <ul class="mx-auto flex max-w-lg justify-around">
          @for (tab of tabs; track tab.path) {
            <li class="flex-1">
              <a
                [routerLink]="tab.path"
                routerLinkActive="text-primary"
                class="flex flex-col items-center gap-0.5 py-2 text-muted transition-colors"
              >
                <svg
                  class="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  @switch (tab.icon) {
                    @case ('stock') {
                      <path d="M4 7h16v13H4z M4 7l2-4h12l2 4 M10 11h4" />
                    }
                    @case ('planning') {
                      <path d="M5 5h14v15H5z M5 9h14 M8 3v4 M16 3v4" />
                    }
                    @case ('recipes') {
                      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z M9 8h6 M9 12h6" />
                    }
                    @case ('shopping') {
                      <path
                        d="M4 5h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20.5 8H7 M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M17 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                      />
                    }
                    @case ('profile') {
                      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M5 20a7 7 0 0 1 14 0" />
                    }
                  }
                </svg>
                <span class="text-xs font-medium">{{ tab.labelKey | t }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>
    </div>
  `,
})
export class Shell {
  protected readonly tabs: NavTab[] = [
    { path: '/stock', labelKey: 'nav.stock', icon: 'stock' },
    { path: '/planning', labelKey: 'nav.planning', icon: 'planning' },
    { path: '/recipes', labelKey: 'nav.recipes', icon: 'recipes' },
    { path: '/shopping', labelKey: 'nav.shopping', icon: 'shopping' },
    { path: '/profile', labelKey: 'nav.profile', icon: 'profile' },
  ];
}
