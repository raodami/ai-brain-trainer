package payment

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

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
