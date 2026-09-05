# React — Hooks, React Query & Zustand Patterns

## React Query — Query Hook

```typescript
// features/order/queries/order.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/api/order.api';
import type { CreateOrderPayload, Order } from '../types';

// Query key factory — single source of truth for cache invalidation
export const orderKeys = {
  all: ['ORDERS'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (customerId: number) => [...orderKeys.lists(), { customerId }] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
};

// @trace.implements=ORD-UC1-SC1
// @trace.source=specs/order/order-management/bdd/ORD-UC1.feature
export function useOrderList(customerId: number) {
  return useQuery({
    queryKey: orderKeys.list(customerId),
    queryFn: () => orderApi.getByCustomer(customerId),
    staleTime: 30_000,
  });
}

// @trace.implements=ORD-UC2-SC1
// @trace.source=specs/order/order-management/bdd/ORD-UC2.feature
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderApi.create(payload),
    onSuccess: (_, variables) => {
      // Invalidate order list for this customer
      queryClient.invalidateQueries({ queryKey: orderKeys.list(variables.customerId) });
    },
  });
}
```

## API Client (Axios)

```typescript
// api/order.api.ts
import { apiClient } from '@/api/client';
import type { CreateOrderPayload, Order, PaginatedResponse } from '@/features/order/types';

export const orderApi = {
  getByCustomer: (customerId: number) =>
    apiClient.get<PaginatedResponse<Order>>('/v1/orders', { params: { customerId } })
      .then(res => res.data),

  getById: (id: number) =>
    apiClient.get<Order>(`/v1/orders/${id}`).then(res => res.data),

  create: (payload: CreateOrderPayload) =>
    apiClient.post<Order>('/v1/orders', payload).then(res => res.data),

  cancel: (id: number) =>
    apiClient.patch<void>(`/v1/orders/${id}/cancel`).then(res => res.data),
};
```

```typescript
// api/client.ts — Axios instance with auth interceptor
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      // redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Zustand Store (Client State)

```typescript
// features/cart/store/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set(state => {
          const existing = state.items.find(i => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set(state => ({ items: state.items.filter(i => i.productId !== productId) })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
```

## Feature Component (Container)

```tsx
// features/order/components/OrderListPage.tsx
// @trace.implements=ORD-UC1-SC1
// @trace.source=specs/order/order-management/bdd/ORD-UC1.feature
import { useAuth } from '@/hooks/useAuth';
import { useOrderList } from '../queries/order.queries';
import { OrderCard } from './OrderCard';

export function OrderListPage() {
  const { user } = useAuth();
  const { data: orders, isLoading, isError } = useOrderList(user.id);

  if (isLoading) return <div>Loading...</div>;
  if (isError)   return <div>Failed to load orders.</div>;

  return (
    <div className="order-list">
      {orders?.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
      {orders?.length === 0 && <p>No orders yet.</p>}
    </div>
  );
}
```

## React Hook Form + Zod

```tsx
// features/order/components/CreateOrderForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrder } from '../queries/order.queries';

const createOrderSchema = z.object({
  customerId: z.number().positive(),
  items: z.array(z.object({
    productId: z.number().positive(),
    quantity: z.number().int().min(1),
  })).min(1, 'At least one item required'),
});

type CreateOrderForm = z.infer<typeof createOrderSchema>;

export function CreateOrderForm({ customerId }: { customerId: number }) {
  const { mutate: createOrder, isPending } = useCreateOrder();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateOrderForm>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { customerId, items: [] },
  });

  const onSubmit = (data: CreateOrderForm) => createOrder(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      {errors.items && <p className="error">{errors.items.message}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Order'}
      </button>
    </form>
  );
}
```

## Test with React Testing Library + MSW

```tsx
// features/order/__tests__/OrderListPage.test.tsx
// @trace.verifies=ORD-UC1
// @trace.test_type=integration
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { renderWithProviders } from '@/test/utils';
import { OrderListPage } from '../components/OrderListPage';

describe('OrderListPage', () => {
  it('displays orders after successful fetch', async () => {
    server.use(
      http.get('/v1/orders', () =>
        HttpResponse.json([
          { id: 1, status: 'pending', customerId: 42, items: [] },
        ])
      )
    );

    renderWithProviders(<OrderListPage />, { user: { id: 42 } });

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    );

    expect(screen.getByText('Order #1')).toBeInTheDocument();
  });

  it('shows empty state when no orders exist', async () => {
    server.use(http.get('/v1/orders', () => HttpResponse.json([])));

    renderWithProviders(<OrderListPage />, { user: { id: 42 } });

    await waitFor(() =>
      expect(screen.getByText('No orders yet.')).toBeInTheDocument()
    );
  });
});
```
