package challenges

import (
	"math/rand"
	"time"
)

type Challenge struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	TargetScore int       `json:"target_score"`
	CurrentScore int      `json:"current_score"`
	Completed   bool      `json:"completed"`
	CompletedAt time.Time `json:"completed_at"`
	Reward      int       `json:"reward"`
	ExpiresAt   time.Time `json:"expires_at"`
}

type DailyTask struct {
	ID          string `json:"id"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Target      int    `json:"target"`
	Reward      int    `json:"reward"`
	Icon        string `json:"icon"`
}

var AllDailyTasks = []DailyTask{
	{ID: "task_1", Code: "first_game_today", Name: "First Step", Description: "Play your first game today", Target: 1, Reward: 50, Icon: "🎯"},
	{ID: "task_2", Code: "play_3_games", Name: "Dedicated Player", Description: "Play 3 games today", Target: 3, Reward: 150, Icon: "🎮"},
	{ID: "task_3", Code: "play_5_games", Name: "Gamer", Description: "Play 5 games today", Target: 5, Reward: 300, Icon: "🕹️"},
	{ID: "task_4", Code: "score_500", Name: "High Scorer", Description: "Score 500+ in a single game", Target: 500, Reward: 200, Icon: "⭐"},
	{ID: "task_5", Code: "score_1000", Name: "Century", Description: "Score 1000+ in a single game", Target: 1000, Reward: 500, Icon: "🏆"},
	{ID: "task_6", Code: "perfect_game", Name: "Perfectionist", Description: "Get 100% accuracy", Target: 100, Reward: 250, Icon: "💎"},
	{ID: "task_7", Code: "try_all_games", Name: "Explorer", Description: "Try all 4 game types", Target: 4, Reward: 300, Icon: "🗺️"},
	{ID: "task_8", Code: "streak_3", Name: "On Fire", Description: "Maintain a 3-day streak", Target: 3, Reward: 400, Icon: "🔥"},
}

func GenerateDailyChallenges(userID string) []*Challenge {
	now := time.Now()
	tomorrow := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
	
	challenges := make([]*Challenge, 0, 3)
	shuffled := shuffleDailyTasks()
	
	for _, task := range shuffled[:3] {
		challenge := &Challenge{
			ID:          userID + "-" + task.Code + "-" + now.Format("2006-01-02"),
			UserID:      userID,
			Type:        task.Code,
			Description: task.Description,
			TargetScore: task.Target,
			CurrentScore: 0,
			Reward:      task.Reward,
			ExpiresAt:   tomorrow,
		}
		challenges = append(challenges, challenge)
	}
	return challenges
}

func shuffleDailyTasks() []DailyTask {
	shuffled := make([]DailyTask, len(AllDailyTasks))
	copy(shuffled, AllDailyTasks)
	for i := range shuffled {
		j := rand.Intn(i + 1)
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	}
	return shuffled
}

func GetTaskReward(taskCode string) int {
	for _, task := range AllDailyTasks {
		if task.Code == taskCode {
			return task.Reward
		}
	}
	return 0
}
