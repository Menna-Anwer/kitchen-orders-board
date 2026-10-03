import { environment } from '../../../environments/environment';

export const COLLECTION = {
  orders: 'orders',
  menu: 'menu',
} as const;
const API_BASE_URL = environment.baseUrl;

export const API_URL = (endpoint: string): string =>
  `${API_BASE_URL}/${endpoint}`;