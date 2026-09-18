package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"ai-brain-trainer/internal/games"
	"ai-brain-trainer/internal/store"
)

func SetupRoutes(r *gin.Engine, trainerStore *store.TrainerStore) {
	// Public routes
	r.GET("/api/stats/overview", func(c *gin.Context) {
		stats, err := trainerStore.GetOrCreateUserStats("demo")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, stats)
	})

	r.GET("/api/sessions", func(c *gin.Context) {
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			userID = "demo"
		}
		sessions, err := trainerStore.GetUserSessions(userID, 20)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, sessions)
	})

	r.GET("/api/leaderboard", func(c *gin.Context) {
		limit := 10
		if l := c.Query("limit"); l != "" {
			// parse limit
			_ = l
		}
		entries, err := trainerStore.GetLeaderboard(limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, entries)
	})

	r.GET("/api/achievements", func(c *gin.Context) {
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			userID = "demo"
		}
		achievements, err := trainerStore.GetUserAchievements(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, achievements)
	})

	// Game routes
	r.POST("/api/game/play", func(c *gin.Context) {
		var req struct {
			GameType   string `json:"game_type" binding:"required"`
			Difficulty int  `json:"difficulty"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if req.Difficulty < 0 {
			req.Difficulty = 0
		}
		if req.Difficulty > 4 {
			req.Difficulty = 4
		}

		result, err := games.PlayGame(req.GameType, req.Difficulty)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Save session
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			userID = "demo"
		}
		session := &store.SessionRecord{
			ID:           uuid.New().String(),
			UserID:       userID,
			GameType:     result.GameType,
			Score:        result.Score,
			Accuracy:     result.Accuracy,
			ResponseTime: result.ResponseTime,
			Difficulty:   req.Difficulty,
			AdaptiveLevel: result.AdaptiveLevel,
		}
		if err := trainerStore.CreateSession(session); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
			return
		}

		// Update XP and level
		trainerStore.UpdateUserStats(userID, result.Score, result.Score/10)

		// Check achievements
		checkAchievements(trainerStore, userID, result)

		c.JSON(http.StatusOK, result)
	})

	r.GET("/api/achievements/list", func(c *gin.Context) {
		achievements := []map[string]string{
			{"code": "first_game", "name": "First Step", "description": "Play your first game"},
			{"code": "five_games", "name": "Getting Serious", "description": "Play 5 games"},
			{"code": "hundred_score", "name": "Centurion", "description": "Score 100+ in a game"},
			{"code": "perfect_score", "name": "Perfect!", "description": "Score 100% accuracy"},
			{"code": "pro_user", "name": "Pro Member", "description": "Subscribe to Pro"},
		}
		c.JSON(http.StatusOK, achievements)
	})
}

func checkAchievements(trainerStore *store.TrainerStore, userID string, result *games.GameResult) {
	// Check "First Game" achievement
	allAchievements, _ := trainerStore.GetUserAchievements(userID)
	hasFirstGame := false
	for _, a := range allAchievements {
		if a.Code == "first_game" {
			hasFirstGame = true
			break
		}
	}
	if !hasFirstGame {
		trainerStore.UnlockAchievement(userID, "first_game", "First Step", "Play your first game")
	}

	// Check "Centurion" achievement
	if result.Score >= 100 {
		all, _ := trainerStore.GetUserAchievements(userID)
		hasCentury := false
		for _, a := range all {
			if a.Code == "hundred_score" {
				hasCentury = true
				break
			}
		}
		if !hasCentury {
			trainerStore.UnlockAchievement(userID, "hundred_score", "Centurion", "Score 100+ in a game")
		}
	}

	// Check "Perfect" achievement
	if result.Accuracy >= 99.0 {
		all, _ := trainerStore.GetUserAchievements(userID)
		hasPerfect := false
		for _, a := range all {
			if a.Code == "perfect_score" {
				hasPerfect = true
				break
			}
		}
		if !hasPerfect {
			trainerStore.UnlockAchievement(userID, "perfect_score", "Perfect!", "Score 100% accuracy")
		}
	}
}
