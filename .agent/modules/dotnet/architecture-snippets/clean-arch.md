# .NET Clean Architecture — Code Patterns

## Command and Query with MediatR

```csharp
// Application/Orders/Commands/CreateOrder/CreateOrderCommand.cs
// @trace.implements=ORDER-UC1-SC1
public record CreateOrderCommand(
    long CustomerId,
    List<OrderItemDto> Items,
    string ShippingAddress
) : IRequest<CreateOrderResult>;

// Application/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs
public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderResult>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderCommandHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateOrderResult> Handle(CreateOrderCommand command, CancellationToken ct)
    {
        var order = Order.Create(command.CustomerId, command.Items, command.ShippingAddress);
        await _orderRepository.AddAsync(order, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return new CreateOrderResult(order.Id, order.Status.ToString());
    }
}

// Application/Orders/Queries/GetOrder/GetOrderQuery.cs
// @trace.implements=ORDER-UC1-SC2
public record GetOrderQuery(long OrderId) : IRequest<OrderDto>;
```

## FluentValidation for Commands

```csharp
// Application/Orders/Commands/CreateOrder/CreateOrderCommandValidator.cs
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.CustomerId).GreaterThan(0);
        RuleFor(x => x.Items).NotEmpty().WithMessage("Order must have at least one item.");
        RuleFor(x => x.ShippingAddress).NotEmpty().MaximumLength(500);
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).GreaterThan(0);
            item.RuleFor(i => i.Quantity).InclusiveBetween(1, 999);
        });
    }
}
```

## Domain Entity Pattern

```csharp
// Domain/Entities/Order.cs
public class Order : BaseEntity
{
    private readonly List<OrderItem> _items = new();

    public long CustomerId { get; private set; }
    public OrderStatus Status { get; private set; }
    public string ShippingAddress { get; private set; } = string.Empty;
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public decimal TotalAmount => _items.Sum(i => i.Subtotal);

    private Order() { }  // EF Core constructor

    public static Order Create(long customerId, IEnumerable<OrderItemDto> items, string shippingAddress)
    {
        var order = new Order
        {
            CustomerId = customerId,
            ShippingAddress = shippingAddress,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in items)
            order._items.Add(OrderItem.Create(item.ProductId, item.Quantity, item.UnitPrice));

        order.AddDomainEvent(new OrderCreatedEvent(order.Id, order.CustomerId));
        return order;
    }

    public void Cancel()
    {
        if (Status == OrderStatus.Shipped)
            throw new DomainException("Cannot cancel an order that has already been shipped.");
        Status = OrderStatus.Cancelled;
    }
}
```

## Repository Implementation with EF Core

```csharp
// Infrastructure/Persistence/Repositories/OrderRepository.cs
public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context) => _context = context;

    public async Task<Order?> GetByIdAsync(long id, CancellationToken ct = default)
        => await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task AddAsync(Order order, CancellationToken ct = default)
        => await _context.Orders.AddAsync(order, ct);

    public async Task<IReadOnlyList<Order>> GetByCustomerAsync(long customerId, CancellationToken ct = default)
        => await _context.Orders
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
}
```

## Minimal API Controller Pattern

```csharp
// Presentation/Endpoints/OrderEndpoints.cs
// @trace.implements=ORDER-UC1
public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/v1/orders").RequireAuthorization();

        // @trace.implements=ORDER-UC1-SC1
        group.MapPost("/", async (CreateOrderCommand command, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(command, ct);
            return Results.Created($"/v1/orders/{result.Id}", result);
        })
        .WithName("CreateOrder")
        .Produces<CreateOrderResult>(StatusCodes.Status201Created)
        .ProducesValidationProblem();

        // @trace.implements=ORDER-UC1-SC2
        group.MapGet("/{id:long}", async (long id, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetOrderQuery(id), ct);
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("GetOrder")
        .Produces<OrderDto>()
        .Produces(StatusCodes.Status404NotFound);
    }
}
```
