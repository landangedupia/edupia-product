# Go — Domain-Driven Layout Code Patterns

## Domain Model

```go
// internal/domain/order.go
package domain

import (
    "errors"
    "time"
)

// OrderStatus represents the lifecycle state of an order.
type OrderStatus string

const (
    OrderStatusPending   OrderStatus = "PENDING"
    OrderStatusConfirmed OrderStatus = "CONFIRMED"
    OrderStatusShipped   OrderStatus = "SHIPPED"
    OrderStatusCancelled OrderStatus = "CANCELLED"
)

// Order is the aggregate root for the order domain.
type Order struct {
    ID              int64
    CustomerID      int64
    Status          OrderStatus
    Items           []OrderItem
    ShippingAddress string
    CreatedAt       time.Time
    UpdatedAt       time.Time
}

// OrderItem represents a single line item within an order.
type OrderItem struct {
    ProductID  int64
    Quantity   int
    UnitPrice  float64
}

// TotalAmount calculates the total order value.
func (o *Order) TotalAmount() float64 {
    var total float64
    for _, item := range o.Items {
        total += float64(item.Quantity) * item.UnitPrice
    }
    return total
}

// Cancel transitions the order to CANCELLED status.
func (o *Order) Cancel() error {
    if o.Status == OrderStatusShipped {
        return errors.New("cannot cancel an order that has already been shipped")
    }
    o.Status = OrderStatusCancelled
    return nil
}
```

## Repository Interface (defined in domain)

```go
// internal/domain/order_repository.go
package domain

import "context"

// OrderRepository defines persistence operations for orders.
// Implementations live in internal/repo/.
type OrderRepository interface {
    GetByID(ctx context.Context, id int64) (*Order, error)
    GetByCustomerID(ctx context.Context, customerID int64) ([]*Order, error)
    Create(ctx context.Context, order *Order) error
    Update(ctx context.Context, order *Order) error
}
```

## Use Case (business logic)

```go
// internal/usecase/order_usecase.go
// @trace.implements=ORDER-UC1
package usecase

import (
    "context"
    "fmt"
    "myapp/internal/domain"
    "time"
)

// OrderUseCase handles all order-related business operations.
type OrderUseCase struct {
    repo domain.OrderRepository
}

// NewOrderUseCase creates a new OrderUseCase with required dependencies.
func NewOrderUseCase(repo domain.OrderRepository) *OrderUseCase {
    return &OrderUseCase{repo: repo}
}

// CreateOrderRequest holds input data for creating an order.
type CreateOrderRequest struct {
    CustomerID      int64
    Items           []domain.OrderItem
    ShippingAddress string
}

// CreateOrder creates a new order for a customer.
// @trace.implements=ORDER-UC1-SC1
func (uc *OrderUseCase) CreateOrder(ctx context.Context, req CreateOrderRequest) (*domain.Order, error) {
    if len(req.Items) == 0 {
        return nil, fmt.Errorf("order must contain at least one item")
    }

    order := &domain.Order{
        CustomerID:      req.CustomerID,
        Status:          domain.OrderStatusPending,
        Items:           req.Items,
        ShippingAddress: req.ShippingAddress,
        CreatedAt:       time.Now(),
    }

    if err := uc.repo.Create(ctx, order); err != nil {
        return nil, fmt.Errorf("create order: %w", err)
    }
    return order, nil
}

// GetOrder retrieves an order by ID.
// @trace.implements=ORDER-UC1-SC2
func (uc *OrderUseCase) GetOrder(ctx context.Context, id int64) (*domain.Order, error) {
    order, err := uc.repo.GetByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("get order %d: %w", id, err)
    }
    if order == nil {
        return nil, domain.ErrNotFound
    }
    return order, nil
}
```

## HTTP Handler (Gin)

```go
// internal/handler/order_handler.go
// @trace.implements=ORDER-UC1
package handler

import (
    "errors"
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "myapp/internal/domain"
    "myapp/internal/usecase"
)

// OrderHandler handles HTTP requests for order operations.
type OrderHandler struct {
    uc *usecase.OrderUseCase
}

// NewOrderHandler creates a new OrderHandler.
func NewOrderHandler(uc *usecase.OrderUseCase) *OrderHandler {
    return &OrderHandler{uc: uc}
}

// RegisterRoutes registers all order endpoints on the given router group.
func (h *OrderHandler) RegisterRoutes(r *gin.RouterGroup) {
    r.POST("/orders", h.CreateOrder)        // @trace.implements=ORDER-UC1-SC1
    r.GET("/orders/:id", h.GetOrder)        // @trace.implements=ORDER-UC1-SC2
}

// CreateOrder handles POST /v1/orders.
func (h *OrderHandler) CreateOrder(c *gin.Context) {
    var req usecase.CreateOrderRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    order, err := h.uc.CreateOrder(c.Request.Context(), req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusCreated, order)
}

// GetOrder handles GET /v1/orders/:id.
func (h *OrderHandler) GetOrder(c *gin.Context) {
    id, err := strconv.ParseInt(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
        return
    }
    order, err := h.uc.GetOrder(c.Request.Context(), id)
    if errors.Is(err, domain.ErrNotFound) {
        c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
        return
    }
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, order)
}
```

## Table-Driven Test Pattern

```go
// internal/usecase/order_usecase_test.go
// @trace.verifies=ORDER-UC1
// @trace.test_type=unit
package usecase_test

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "myapp/internal/domain"
    "myapp/internal/usecase"
)

func TestOrderUseCase_CreateOrder(t *testing.T) {
    tests := []struct {
        name        string
        request     usecase.CreateOrderRequest
        setupMock   func(*MockOrderRepository)
        expectError bool
        expectOrder bool
    }{
        {
            name: "valid order with items should create successfully",
            request: usecase.CreateOrderRequest{
                CustomerID:      1,
                Items:           []domain.OrderItem{{ProductID: 10, Quantity: 2, UnitPrice: 99.9}},
                ShippingAddress: "123 Main St",
            },
            setupMock: func(m *MockOrderRepository) {
                m.On("Create", mock.Anything, mock.AnythingOfType("*domain.Order")).Return(nil)
            },
            expectError: false,
            expectOrder: true,
        },
        {
            name: "empty items should return validation error",
            request: usecase.CreateOrderRequest{
                CustomerID: 1,
                Items:      []domain.OrderItem{},
            },
            setupMock:   func(m *MockOrderRepository) {},
            expectError: true,
            expectOrder: false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mockRepo := new(MockOrderRepository)
            tt.setupMock(mockRepo)
            uc := usecase.NewOrderUseCase(mockRepo)

            order, err := uc.CreateOrder(context.Background(), tt.request)

            if tt.expectError {
                assert.Error(t, err)
                assert.Nil(t, order)
            } else {
                assert.NoError(t, err)
                assert.NotNil(t, order)
            }
            mockRepo.AssertExpectations(t)
        })
    }
}
```
