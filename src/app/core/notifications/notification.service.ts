import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  kind: 'error' | 'success';
  messageKey: string;
  params?: Record<string, unknown>;
}

const TOAST_DURATION_MS = 5000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private nextId = 0;
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();
  error(messageKey: string, params?: Record<string, unknown>): void {
    this.push('error', messageKey, params);
  }
  success(messageKey: string, params?: Record<string, unknown>): void {
    this.push('success', messageKey, params);
  }
  dismiss(id: number): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
  push(kind: Toast['kind'], messageKey: string, params?: Record<string, unknown>): void {
    const id = this.nextId++;
    this._toasts.update((toasts) => [
      ...toasts,
      {
        id,
        kind,
        messageKey,
        params,
      },
    ]);

    setTimeout(() => this.dismiss(id), TOAST_DURATION_MS);
  }
}
