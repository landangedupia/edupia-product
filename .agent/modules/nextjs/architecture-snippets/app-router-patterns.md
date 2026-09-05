# Next.js App Router — Server Components, Server Actions & DAL Patterns

## Data Access Layer (server-only)

```typescript
// lib/dal/orders.dal.ts
// @trace.source=specs/order/order-management/bdd/ORD-UC1.feature
import 'server-only'; // prevents accidental import on client
import { db } from '@/lib/db';
import type { Order } from '@/types/order';

export async function getOrderById(id: number): Promise<Order | null> {
  return db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, customer: true },
  });
}

export async function listOrdersByCustomer(customerId: number): Promise<Order[]> {
  return db.order.findMany({
    where: { customerId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

## Server Component (Data Fetching + Layout)

```tsx
// app/(dashboard)/orders/page.tsx
// @trace.implements=ORD-UC1-SC1
// @trace.source=specs/order/order-management/bdd/ORD-UC1.feature
import { listOrdersByCustomer } from '@/lib/dal/orders.dal';
import { getCurrentUser } from '@/lib/auth';
import { OrderCard } from './_components/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const orders = await listOrdersByCustomer(user.id);

  return (
    <section>
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState message="No orders yet." />
      ) : (
        <ul>
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </section>
  );
}
```

## Zod Schema (shared server + client)

```typescript
// lib/validations/order.schema.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.number().positive(),
  items: z.array(z.object({
    productId: z.number().positive(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
```

## Server Action (Mutation)

```typescript
// lib/actions/order.actions.ts
'use server';
// @trace.implements=ORD-UC2-SC1
// @trace.source=specs/order/order-management/bdd/ORD-UC2.feature

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOrderSchema } from '@/lib/validations/order.schema';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Returns { error } on failure, redirects on success
export async function createOrder(formData: FormData) {
  const user = await getCurrentUser();

  const parsed = createOrderSchema.safeParse({
    customerId: user.id,
    items: JSON.parse(formData.get('items') as string),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.order.create({
      data: {
        customerId: parsed.data.customerId,
        status: 'pending',
        items: {
          create: parsed.data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });
  } catch {
    return { error: { _form: ['Failed to create order. Please try again.'] } };
  }

  revalidatePath('/orders');
  redirect('/orders');
}

export async function cancelOrder(orderId: number) {
  const user = await getCurrentUser();

  const order = await db.order.findFirst({
    where: { id: orderId, customerId: user.id },
  });

  if (!order) return { error: 'Order not found.' };
  if (order.status !== 'pending') return { error: 'Only pending orders can be cancelled.' };

  await db.order.update({ where: { id: orderId }, data: { status: 'cancelled' } });

  revalidatePath('/orders');
  return { success: true };
}
```

## Client Component (Interactive UI)

```tsx
// app/(dashboard)/orders/_components/CancelOrderButton.tsx
'use client';
// @trace.implements=ORD-UC3-SC1
// @trace.source=specs/order/order-management/bdd/ORD-UC3.feature
import { useTransition } from 'react';
import { cancelOrder } from '@/lib/actions/order.actions';

interface Props {
  orderId: number;
  disabled?: boolean;
}

export function CancelOrderButton({ orderId, disabled }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result?.error) {
        alert(result.error); // replace with toast in real app
      }
    });
  };

  return (
    <button
      onClick={handleCancel}
      disabled={disabled || isPending}
      className="btn-danger"
    >
      {isPending ? 'Cancelling...' : 'Cancel Order'}
    </button>
  );
}
```

## API Route (for webhooks / external consumers)

```typescript
// app/api/orders/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/webhook';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!verifyWebhookSignature(request, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (body.event === 'payment.completed') {
    await db.order.update({
      where: { id: body.orderId },
      data: { status: 'paid', paidAt: new Date() },
    });
  }

  return NextResponse.json({ received: true });
}
```

## Loading + Error Boundaries

```tsx
// app/(dashboard)/orders/loading.tsx
export default function OrdersLoading() {
  return (
    <div className="order-skeleton">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-card animate-pulse" />
      ))}
    </div>
  );
}
```

```tsx
// app/(dashboard)/orders/error.tsx
'use client';
export default function OrdersError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-state">
      <p>Failed to load orders: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Playwright E2E Test

```typescript
// e2e/orders/create-order.spec.ts
// @trace.verifies=ORD-UC2
// @trace.test_type=e2e
import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

test.describe('Create Order', () => {
  test.use({ storageState: 'e2e/.auth/customer.json' }); // reuse auth state

  test('customer creates an order successfully', async ({ page }) => {
    await page.goto('/orders/new');

    await page.getByLabel('Product').selectOption({ label: 'Wireless Headphones' });
    await page.getByLabel('Quantity').fill('2');
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page).toHaveURL(/\/orders\/\d+/);
    await expect(page.getByText('Order placed successfully')).toBeVisible();
  });

  test('shows validation error when cart is empty', async ({ page }) => {
    await page.goto('/orders/new');
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page.getByText('At least one item is required')).toBeVisible();
  });
});
```
