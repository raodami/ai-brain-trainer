package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"ai-brain-trainer/internal/api"
	authapi "ai-brain-trainer/internal/api/auth"
	"ai-brain-trainer/internal/auth"
	"ai-brain-trainer/internal/payment"
	"ai-brain-trainer/internal/store"
)

func main() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "data/trainer.db"
	}

	store, err := store.New(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer store.Close()

	authStore, err := auth.NewAuthStore(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize auth store: %v", err)
	}
	defer authStore.Close()

	stripeConfig := &payment.StripeConfig{
		SecretKey:   os.Getenv("STRIPE_SECRET_KEY"),
		PublicKey:   os.Getenv("STRIPE_PUBLIC_KEY"),
		PriceID:     os.Getenv("STRIPE_PRICE_ID"),
		WebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
	}

	r := gin.Default()
	r.Use(cors.Default())

	api.SetupRoutes(r, store)
	authapi.SetupRoutes(r, authStore)
	payment.SetupRoutes(r, stripeConfig)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
