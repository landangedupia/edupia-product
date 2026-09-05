# PHP Laravel — Service-Repository Architecture Patterns

## Form Request (Validation Layer)

```php
<?php
// app/Http/Requests/Order/CreateOrderRequest.php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // auth handled by middleware
    }

    public function rules(): array
    {
        return [
            'customer_id'     => ['required', 'integer', 'exists:customers,id'],
            'items'           => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'At least one order item is required.',
        ];
    }
}
```

## Repository Interface + Eloquent Implementation

```php
<?php
// app/Repositories/OrderRepositoryInterface.php

namespace App\Repositories;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function findById(int $id): ?Order;
    public function findByCustomer(int $customerId, int $perPage = 15): LengthAwarePaginator;
    public function create(array $data): Order;
    public function updateStatus(int $id, string $status): bool;
}
```

```php
<?php
// app/Repositories/Eloquent/OrderRepository.php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository implements OrderRepositoryInterface
{
    public function findById(int $id): ?Order
    {
        return Order::with(['items.product', 'customer'])->find($id);
    }

    public function findByCustomer(int $customerId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::where('customer_id', $customerId)
            ->with('items')
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): Order
    {
        return Order::create($data);
    }

    public function updateStatus(int $id, string $status): bool
    {
        return Order::where('id', $id)->update(['status' => $status]) > 0;
    }
}
```

## Service Layer

```php
<?php
// app/Services/Order/OrderService.php

namespace App\Services\Order;

use App\Exceptions\BusinessException;
use App\Models\Order;
use App\Repositories\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;

class OrderService
{
    // @trace.implements=ORD-UC1-SC1
    // @trace.source=specs/order/order-management/bdd/ORD-UC1.feature
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {}

    public function createOrder(int $customerId, array $items): Order
    {
        return DB::transaction(function () use ($customerId, $items) {
            $order = $this->orderRepository->create([
                'customer_id' => $customerId,
                'status'      => 'pending',
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                ]);
            }

            return $order->load('items.product');
        });
    }

    public function cancelOrder(int $orderId): void
    {
        $order = $this->orderRepository->findById($orderId);

        if (!$order) {
            throw new BusinessException("Order #{$orderId} not found.", 404);
        }

        if ($order->status !== 'pending') {
            throw new BusinessException("Only pending orders can be cancelled.", 422);
        }

        $this->orderRepository->updateStatus($orderId, 'cancelled');
    }
}
```

## Resource Controller

```php
<?php
// app/Http/Controllers/Order/OrderController.php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CreateOrderRequest;
use App\Http\Resources\Order\OrderResource;
use App\Services\Order\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    // @trace.implements=ORD-UC1-SC1
    // @trace.source=specs/order/order-management/bdd/ORD-UC1.feature
    public function store(CreateOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->createOrder(
            customerId: $request->validated('customer_id'),
            items: $request->validated('items')
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Order created successfully.',
            'data'    => new OrderResource($order),
        ], 201);
    }

    // @trace.implements=ORD-UC2-SC1
    // @trace.source=specs/order/order-management/bdd/ORD-UC2.feature
    public function destroy(int $id): JsonResponse
    {
        $this->orderService->cancelOrder($id);

        return response()->json([
            'status'  => 'success',
            'message' => 'Order cancelled.',
        ]);
    }
}
```

## API Resource (Response Transformer)

```php
<?php
// app/Http/Resources/Order/OrderResource.php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'status'      => $this->status,
            'customer_id' => $this->customer_id,
            'items'       => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at'  => $this->created_at->toISOString(),
        ];
    }
}
```

## Feature Test (HTTP Layer)

```php
<?php
// tests/Feature/Order/CreateOrderTest.php

namespace Tests\Feature\Order;

use App\Models\Customer;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// @trace.verifies=ORD-UC1
// @trace.test_type=feature
class CreateOrderTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_order_successfully(): void
    {
        $customer = Customer::factory()->create();
        $product  = Product::factory()->create(['stock' => 10]);

        $response = $this->actingAs($customer)
            ->postJson('/api/v1/orders', [
                'customer_id' => $customer->id,
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 2],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['status', 'data' => ['id', 'status', 'items']]);

        $this->assertDatabaseHas('orders', ['customer_id' => $customer->id, 'status' => 'pending']);
    }

    /** @test */
    public function it_returns_422_when_items_are_empty(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->actingAs($customer)
            ->postJson('/api/v1/orders', ['customer_id' => $customer->id, 'items' => []]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items']);
    }
}
```

## Service Provider Binding

```php
<?php
// app/Providers/RepositoryServiceProvider.php

namespace App\Providers;

use App\Repositories\Eloquent\OrderRepository;
use App\Repositories\OrderRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
    }
}
```
