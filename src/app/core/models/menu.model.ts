export type MenuCategory =
  | 'Mains'
  | 'Salads'
  | 'Desserts'
  | 'Drinks';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
}