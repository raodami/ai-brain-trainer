package payment

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

type StripeConfig struct {
	SecretKey   string
	PublicKey   string
	PriceID     string
	WebhookSecret string
}

type Subscription struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Status      string    `json:"status"`
	ExpiresAt   time.Time `json:"expires_at"`
	CurrentPeriodEnd time.Time `json:"current_period_end"`
}

func (c *StripeConfig) CreateCheckoutSession(userID string) (string, error) {
	// In production, use Stripe Go SDK
	// For now, return a mock URL
	return fmt.Sprintf("https://checkout.stripe.com/mock/%s", userID), nil
}

func (c *StripeConfig) HandleWebhook(payload []byte, sigHeader string) (*Subscription, error) {
	// Verify webhook signature
	// Process event
	return &Subscription{
		ID:          "sub_mock",
		UserID:      "user_mock",
		Status:      "active",
		ExpiresAt:   time.Now().Add(30 * 24 * time.Hour),
		CurrentPeriodEnd: time.Now().Add(30 * 24 * time.Hour),
	}, nil
}

func (c *StripeConfig) GetCustomerProducts() ([]map[string]interface{}, error) {
	// Fetch products from Stripe
	return []map[string]interface{}{
		{
			"id": "prod_1",
			"name": "Pro Monthly",
			"description": "Unlimited brain training",
			"price": 999, // $9.99
			"interval": "month",
		},
		{
			"id": "prod_2",
			"name": "Pro Annual",
			"description": "Unlimited brain training - save 50%",
			"price": 5900, // $59.00/year ($4.92/month)
			"interval": "year",
		},
	}, nil
}
