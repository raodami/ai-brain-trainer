package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"ai-brain-trainer/internal/auth"
)

func SetupRoutes(r *gin.Engine, store *auth.AuthStore) {
	r.POST("/api/auth/register", func(c *gin.Context) {
		var req struct {
			Username string `json:"username" binding:"required"`
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required,min=6"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		user, err := store.CreateUser(req.Username, req.Email, string(hashedPassword))
		if err != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
			return
		}

		sessionID, _ := auth.GenerateSessionID()
		store.UpdateSession(user.ID, sessionID)

		c.JSON(http.StatusOK, gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"is_pro":     user.IsPro,
			"session_id": sessionID,
			"created_at": user.CreatedAt,
		})
	})

	r.POST("/api/auth/login", func(c *gin.Context) {
		var req struct {
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := store.GetByEmail(req.Email)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		sessionID, _ := auth.GenerateSessionID()
		store.UpdateSession(user.ID, sessionID)

		c.JSON(http.StatusOK, gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"is_pro":     user.IsPro,
			"session_id": sessionID,
			"created_at": user.CreatedAt,
		})
	})

	r.GET("/api/auth/me", func(c *gin.Context) {
		sessionID := c.GetHeader("X-Session-ID")
		if sessionID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session required"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": "demo", "username": "Demo", "is_pro": false})
	})
}
