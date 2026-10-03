import { Observable } from "rxjs";
import { API_URL } from "../constants/api-end-points.constant";
import { RequestOption } from "../models/abstract-crud.model";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export abstract class AbstractCrudService<T> {
  protected readonly http = inject(HttpClient);
  protected readonly constructedUrl: string;

  protected constructor(endpoint: string) {
    this.constructedUrl = API_URL(endpoint);
  }
  getAll(options?: RequestOption): Observable<T[]> {
    return this.http.get<T[]>(this.constructedUrl, {
      params: options?.requestParams,
    });
  }
  getById(id: string): Observable<T> {
    return this.http.get<T>(
      `${this.constructedUrl}/${id}`,
    );
  }
  create<P>(item: P): Observable<T> {
    return this.http.post<T>(
      this.constructedUrl,
      item,
    );
  }
  update<P>(id: string, item: P): Observable<T> {
    return this.http.put<T>(
      `${this.constructedUrl}/${id}`,
      item,
    );
  }
  patch<P>(id: string, item: P): Observable<T> {
    return this.http.patch<T>(
      `${this.constructedUrl}/${id}`,
      item,
    );
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.constructedUrl}/${id}`,
    );
  }
}