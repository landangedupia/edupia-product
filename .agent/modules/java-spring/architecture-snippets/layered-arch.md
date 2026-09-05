# Java Spring Boot — Layered Architecture Code Patterns

## Controller Pattern

```java
@RestController
@RequestMapping("/v1/orders")
@RequiredArgsConstructor
// @trace.implements=ORDER-UC1-SC1
// @trace.source=specs/order/order-management/bdd/ORDER-UC1-create-order.feature
public class OrderController {

    private final OrderFacade orderFacade;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse result = orderFacade.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    // @trace.implements=ORDER-UC1-SC2
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long id) {
        OrderResponse result = orderFacade.getOrder(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
```

## Service Interface Pattern

```java
public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request);
    OrderResponse getOrderById(Long id);
    void cancelOrder(Long id);
}
```

## Service Implementation Pattern

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = orderMapper.toEntity(request);
        order.setStatus(OrderStatus.PENDING);
        Order saved = orderRepository.save(order);
        return orderMapper.toResponse(saved);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(OrderStatus.CANCELLED);
    }
}
```

## Repository Interface Pattern

```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status);

    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    Page<Order> findByCreatedAtBetween(
            LocalDateTime from, LocalDateTime to, Pageable pageable);
}
```

## DTO Pattern

```java
// Request DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @NotNull(message = "customerId is required")
    private Long customerId;

    @NotEmpty(message = "items must not be empty")
    private List<OrderItemRequest> items;

    @NotBlank(message = "shippingAddress is required")
    private String shippingAddress;
}

// Response DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long customerId;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
}
```

## MapStruct Mapper Pattern

```java
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Order toEntity(CreateOrderRequest request);

    OrderResponse toResponse(Order order);

    List<OrderResponse> toResponseList(List<Order> orders);
}
```

## ApiResponse Wrapper Pattern

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private String errorCode;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
```

## Facade Pattern (optional orchestration layer)

```java
@Service
@RequiredArgsConstructor
public class OrderFacade {

    private final OrderService orderService;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    public OrderResponse createOrder(CreateOrderRequest request) {
        // 1. Validate inventory
        inventoryService.validateAvailability(request.getItems());
        // 2. Create order
        OrderResponse order = orderService.createOrder(request);
        // 3. Reserve inventory
        inventoryService.reserveItems(order.getId(), request.getItems());
        // 4. Send confirmation
        notificationService.sendOrderConfirmation(order);
        return order;
    }
}
```
