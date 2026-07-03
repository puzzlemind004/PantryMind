import { Injectable, Pipe, PipeTransform, inject } from '@angular/core';

import { fr, type Dictionary } from './fr';

/**
 * Service de traduction minimaliste (spec §10.9) : une seule langue
 * aujourd'hui, mais aucun libellé en dur dans les composants.
 */
@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly dictionary: Dictionary = fr;

  /**
   * Résout une clé pointée ("stock.title") avec interpolation
   * optionnelle : t('stock.expiresInDays', { days: 3 }).
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const value = key
      .split('.')
      .reduce<unknown>(
        (node, part) =>
          node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
        this.dictionary,
      );

    if (typeof value !== 'string') {
      // Clé manquante : on l'affiche telle quelle pour la repérer vite en dev.
      return key;
    }

    if (!params) {
      return value;
    }
    return value.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  }
}

@Pipe({ name: 't', pure: true })
export class TranslatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.translateService.translate(key, params);
  }
}
