import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractCrudService } from './abstract-crud.service';
import { MenuItem } from '../models/menu.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService extends AbstractCrudService<MenuItem> {
  constructor() {
    super('menu');
  }
  getMenu(): Observable<MenuItem[]> {
    return this.getAll();
  }
  getMenuItemById(id: string): Observable<MenuItem> {
    return this.getById(id);
  }
}