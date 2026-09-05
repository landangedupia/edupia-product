# Angular — Component Architecture Patterns

## Smart / Container Component Pattern

```typescript
// order-list.component.ts — Smart component: manages state, injects services
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../services/order.service';
import { OrderListItemComponent } from './order-list-item.component';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, OrderListItemComponent],
  template: `
    <div class="order-list">
      <app-order-list-item
        *ngFor="let order of orders"
        [order]="order"
        (cancel)="onCancelOrder($event)"
      />
    </div>
  `
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  orders: Order[] = [];

  ngOnInit(): void {
    this.orderService.getOrders().subscribe(orders => this.orders = orders);
  }

  onCancelOrder(orderId: number): void {
    this.orderService.cancelOrder(orderId).subscribe(() => {
      this.orders = this.orders.filter(o => o.id !== orderId);
    });
  }
}
```

## Dumb / Presentational Component Pattern

```typescript
// order-list-item.component.ts — Dumb component: pure I/O, OnPush, no service injection
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-order-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="order-item">
      <span>{{ order.id }}</span>
      <span>{{ order.status }}</span>
      <button (click)="cancel.emit(order.id)" [disabled]="order.status === 'CANCELLED'">
        Cancel
      </button>
    </div>
  `
})
export class OrderListItemComponent {
  @Input({ required: true }) order!: Order;
  @Output() cancel = new EventEmitter<number>();
}
```

## Service with HttpClient Pattern

```typescript
// order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest, OrderResponse } from '../models/order.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/v1/orders`;

  getOrders(customerId?: number): Observable<Order[]> {
    let params = new HttpParams();
    if (customerId) params = params.set('customerId', customerId.toString());
    return this.http.get<Order[]>(this.baseUrl, { params });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  createOrder(request: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.baseUrl, request);
  }

  cancelOrder(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
```

## Signal-Based State Pattern (Angular 17+)

```typescript
// order.store.ts — using Angular Signals for state management
import { Injectable, signal, computed } from '@angular/core';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private _orders = signal<Order[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public readable signals
  readonly orders = this._orders.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly pendingOrders = computed(() =>
    this._orders().filter(o => o.status === 'PENDING')
  );
  readonly orderCount = computed(() => this._orders().length);

  setOrders(orders: Order[]): void {
    this._orders.set(orders);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  removeOrder(id: number): void {
    this._orders.update(orders => orders.filter(o => o.id !== id));
  }
}
```

## Route Guard Pattern

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

## Standalone Component with Lazy Loading

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-detail.component').then(m => m.OrderDetailComponent)
  }
];
```
