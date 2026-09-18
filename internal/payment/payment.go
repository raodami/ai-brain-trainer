package payment

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type StripeConfig struct {
	SecretKey     string
	PublicKey     string
	PriceID       string
	WebhookSecret string
}

type Subscription struct {
	ID               string    `json:"id"`
	UserID           string    `json:"user_id"`
	Status           string    `json:"status"`
	ExpiresAt        time.Time `json:"expires_at"`
	CurrentPeriodEnd time.Time `json:"current_period_end"`
}

func (c *StripeConfig) CreateCheckoutSession(userID string) (string, error) {
	return fmt.Sprintf("https://checkout.stripe.com/mock/%s", userID), nil
}

func (c *StripeConfig) HandleWebhook(payload []byte, sigHeader string) (*Subscription, error) {
	return &Subscription{
		ID:               "sub_mock",
		UserID:           "user_mock",
		Status:           "active",
		ExpiresAt:        time.Now().Add(30 * 24 * time.Hour),
		CurrentPeriodEnd: time.Now().Add(30 * 24 * time.Hour),
	}, nil
}

func (c *StripeConfig) GetCustomerProducts() ([]map[string]interface{}, error) {
	return []map[string]interface{}{
		{
			"id":          "prod_1",
			"name":        "Pro Monthly",
			"description": "Unlimited brain training",
			"price":       999,
			"interval":    "month",
		},
		{
			"id":          "prod_2",
			"name":        "Pro Annual",
			"description": "Unlimited brain training - save 50%",
			"price":       5900,
			"interval":    "year",
		},
	}, nil
}

func SetupRoutes(r *gin.Engine, config *StripeConfig) {
	r.GET("/api/pricing", func(c *gin.Context) {
		products, err := config.GetCustomerProducts()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get products"})
			return
		}
		c.JSON(http.StatusOK, products)
	})

	r.POST("/api/checkout", func(c *gin.Context) {
		var req struct {
			UserID string `json:"user_id" binding:"required"`
			PlanID string `json:"plan_id" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		sessionURL, err := config.CreateCheckoutSession(req.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"url": sessionURL})
	})

	r.POST("/api/webhook", func(c *gin.Context) {
		body, err := ioutil.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Could not read body"})
			return
		}
		sigHeader := c.GetHeader("Stripe-Signature")
		subscription, err := config.HandleWebhook(body, sigHeader)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, subscription)
	})
}
