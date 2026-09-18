package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"ai-brain-trainer/internal/challenges"
	"ai-brain-trainer/internal/rivals"
	"ai-brain-trainer/internal/themes"
)

// Challenge routes
func SetupChallengeRoutes(r *gin.Engine) {
	r.GET("/api/challenges/daily", func(c *gin.Context) {
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			userID = "demo"
		}
		allTasks := challenges.AllDailyTasks
		userChallenges := challenges.GenerateDailyChallenges(userID)
		c.JSON(http.StatusOK, gin.H{
			"tasks":      allTasks,
			"challenges": userChallenges,
		})
	})

	r.POST("/api/challenges/complete", func(c *gin.Context) {
		var req struct {
			ChallengeID string `json:"challenge_id" binding:"required"`
			Score       int    `json:"score"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		reward := challenges.GetTaskReward(req.ChallengeID)
		c.JSON(http.StatusOK, gin.H{"reward": reward, "message": "Challenge completed!"})
	})
}

// Rival routes
func SetupRivalRoutes(r *gin.Engine) {
	r.GET("/api/rivals", func(c *gin.Context) {
		rival := rivals.GetAIRival()
		rivalScore := rivals.GenerateAIRivalScore()
		rivalAccuracy := rivals.GenerateAIRivalAccuracy()
		rivalTime := rivals.GenerateAIRivalResponseTime()

		c.JSON(http.StatusOK, gin.H{
			"rival":         rival,
			"rival_score":   rivalScore,
			"rival_accuracy": rivalAccuracy,
			"rival_time":    rivalTime,
		})
	})

	r.POST("/api/rivals/battle", func(c *gin.Context) {
		var req struct {
			UserScore int    `json:"user_score" binding:"required"`
			GameType  string `json:"game_type"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		rival := rivals.GetAIRival()
		rivalScore := rivals.GenerateAIRivalScore()
		won := req.UserScore > rivalScore

		c.JSON(http.StatusOK, gin.H{
			"rival":      rival,
			"rival_score": rivalScore,
			"user_score":  req.UserScore,
			"won":        won,
			"reward":     map[bool]int{true: 100, false: 20}[won],
		})
	})
}

// Theme routes
func SetupThemeRoutes(r *gin.Engine) {
	r.GET("/api/themes", func(c *gin.Context) {
		isPro := c.GetHeader("X-User-Pro") == "true"

		currentTheme := themes.GetTheme("default")
		if t := c.GetHeader("X-User-Theme"); t != "" {
			currentTheme = themes.GetTheme(t)
		}

		allThemes := themes.AllThemes
		for i := range allThemes {
			if allThemes[i].Price == 0 || isPro {
				allThemes[i].Unlocked = true
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"themes":  allThemes,
			"current": currentTheme,
		})
	})

	r.POST("/api/themes/select", func(c *gin.Context) {
		var req struct {
			ThemeID string `json:"theme_id" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		theme := themes.GetTheme(req.ThemeID)
		if theme == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Theme not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"selected": req.ThemeID, "message": "Theme applied!"})
	})
}
