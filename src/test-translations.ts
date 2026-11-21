import { TranslocoTestingModule } from '@jsverse/transloco';
const en = { app: { name: 'Kitchen Orders' }, common: { view: 'View', saving: 'Saving...', arabic: 'العربية' }, nav: { orders: 'Orders', newOrder: 'New Order' }, orders: { new: 'New', dineIn: 'Dine-in', moveForward: 'Move Forward' } };
const ar = en;

export function testTranslations() {
  return TranslocoTestingModule.forRoot({
    langs: { en, ar },
    translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' },
    preloadLangs: true,
  });
}
