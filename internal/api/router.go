package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"ai-brain-trainer/internal/games"
	"ai-brain-trainer/internal/store"
)

func SetupRoutes(r *gin.Engine, s *store.Store) {
	// Game endpoints
	r.POST("/api/game/:type", func(c *gin.Context) {
		gameType := c.Param("type")
		difficulty := 1
		
		// Parse difficulty from query or body
		if d := c.Query("difficulty"); d != "" {
			fmt.Sscanf(d, "%d", &difficulty)
		}
		
		engine := games.GetGameEngine(gameType)
		result, err := engine.RunRound(difficulty)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{
			"game_type":  result.GameType,
			"score":      result.Score,
			"accuracy":   result.Accuracy,
			"response_time": result.ResponseTime,
			"difficulty": result.Difficulty,
		})
	})
	
	// Save session
	r.POST("/api/session", func(c *gin.Context) {
		var req struct {
			UserID   string `json:"user_id"`
			GameType string `json:"game_type"`
			Score    int    `json:"score"`
			Accuracy float64 `json:"accuracy"`
			Difficulty int  `json:"difficulty"`
		}
		
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		sessionID := uuid.New().String()
		s.SaveSession(&store.SessionRecord{
			ID:         sessionID,
			UserID:     req.UserID,
			GameType:   req.GameType,
			Score:      req.Score,
			Accuracy:   req.Accuracy,
			Difficulty: req.Difficulty,
			CreatedAt:  time.Now(),
		})
		
		c.JSON(http.StatusOK, gin.H{"id": sessionID})
	})
	
	// Get recent sessions
	r.GET("/api/sessions/:user_id", func(c *gin.Context) {
		userID := c.Param("user_id")
		limit := 20
		if l := c.Query("limit"); l != "" {
			fmt.Sscanf(l, "%d", &limit)
		}
		
		sessions, err := s.GetRecentSessions(userID, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, sessions)
	})
	
	// Get daily stats
	r.GET("/api/stats/:user_id", func(c *gin.Context) {
		userID := c.Param("user_id")
		date := time.Now().Format("2006-01-02")
		if d := c.Query("date"); d != "" {
			date = d
		}
		
		stats, err := s.GetDailyStats(userID, date)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, stats)
	})
	
	// Get user stats
	r.GET("/api/user/stats/:user_id", func(c *gin.Context) {
		userID := c.Param("user_id")
		
		stats, err := s.GetUserStats(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, stats)
	})
	
	// Get games list
	r.GET("/api/games", func(c *gin.Context) {
		games := []map[string]string{
			{"type": "attention", "name": "Hawkeye", "description": "Visual search and attention training"},
			{"type": "memory", "name": "Target Tracker", "description": "Working memory and tracking"},
			{"type": "speed", "name": "Speed Reaction", "description": "Processing speed and reaction time"},
			{"type": "logic", "name": "Pattern Logic", "description": "Logical reasoning and pattern recognition"},
		}
		c.JSON(http.StatusOK, games)
	})
}
