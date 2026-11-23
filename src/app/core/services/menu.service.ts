import { environment } from '../../../environments/environment';
import { DemoStore } from './demo.store';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { AbstractCrudService } from './abstract-crud.service';
import { MenuItem } from '../models/menu.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService extends AbstractCrudService<MenuItem> {
  private readonly demo = inject(DemoStore);
  constructor() {
    super('menu');
  }
  getMenu(): Observable<MenuItem[]> {
    return environment.demo ? defer(() => of(this.demo.menu())) : this.getAll();
  }
  getMenuItemById(id: string): Observable<MenuItem> {
    return this.getById(id);
  }
  }
