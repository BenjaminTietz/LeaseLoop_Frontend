import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}

  message = signal<string | null>(null);
  type = signal<ToastType>('info');
  visible = signal(false);

  showToast(message: string, type: ToastType = 'info', duration = 3000) {
    this.message.set(message);
    this.type.set(type);
    this.visible.set(true);

    setTimeout(() => {
      this.visible.set(false);
    }, duration);
  }
}
