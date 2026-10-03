import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export type AppLanguage = 'en' | 'ar';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'app-language';

  init(): void {
    const savedLanguage = isPlatformBrowser(this.platformId)
      ? (localStorage.getItem(this.storageKey) as AppLanguage | null)
      : null;
    this.setLanguage(savedLanguage ?? 'en');
  }
  toggle(): void {
    const current = this.transloco.getActiveLang();
    this.setLanguage(current === 'ar' ? 'en' : 'ar');
  }

  getCurrentLanguage(): AppLanguage {
    return this.transloco.getActiveLang() as AppLanguage;
  }
  setLanguage(language: AppLanguage): void {
    this.transloco.setActiveLang(language);
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = language;
    this.document.documentElement.dir = direction;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, language);
    }
  }
}
