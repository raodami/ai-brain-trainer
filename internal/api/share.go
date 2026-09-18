package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"ai-brain-trainer/internal/share"
)

func SetupShareRoutes(r *gin.Engine) {
	r.POST("/api/share/generate", func(c *gin.Context) {
		var req struct {
			Score     int    `json:"score" binding:"required"`
			GameType  string `json:"game_type" binding:"required"`
			Level     int    `json:"level"`
			Accuracy  float64 `json:"accuracy"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Level == 0 {
			req.Level = 1
		}
		if req.Accuracy == 0 {
			req.Accuracy = 75.0
		}
		data := share.ShareData{
			Score:    req.Score,
			GameType: req.GameType,
			Level:    req.Level,
			Accuracy: req.Accuracy,
		}
		c.JSON(http.StatusOK, gin.H{
			"twitter": share.GenerateTwitterShareURL(data),
			"facebook": share.GenerateFacebookShareURL(data),
			"linkedin": share.GenerateLinkedInShareURL(data),
		})
	})
}
