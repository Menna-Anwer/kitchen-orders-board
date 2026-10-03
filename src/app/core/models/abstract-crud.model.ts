import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AbstractCrud<T> {
  getAll(options?: RequestOption): Observable<T[]>;
  getById(id: string): Observable<T>;
  create<P>(item: P): Observable<T>;
  update<P>(id: string, item: P): Observable<T>;
  patch<P>(id: string, item: P): Observable<T>;
  delete(id: string): Observable<void>;
}
export interface RequestOption {
  requestParams?: HttpParams;
}