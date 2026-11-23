import { environment } from '../environments/environment';
import { TranslocoPipe } from '@jsverse/transloco';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/i18n/language.service';
import { Navbar } from './layouts/navbar/navbar';
import { Toasts } from './shared/components/toasts/toasts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Toasts, TranslocoPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly isDemo = environment.demo;
  private readonly languageService = inject(LanguageService);

  constructor() {
    this.languageService.init();
  }
}
