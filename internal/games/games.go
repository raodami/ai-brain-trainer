package games

import (
	"math"
	"math/rand"
	"time"
)

// GameResult represents the result of a single game session
type GameResult struct {
	GameType    string  `json:"game_type"`
	Score       int     `json:"score"`
	Accuracy    float64 `json:"accuracy"`
	ResponseTime float64 `json:"response_time_ms"`
	Difficulty  int     `json:"difficulty"`
	Timestamp   time.Time `json:"timestamp"`
}

// GameEngine interface for all games
type GameEngine interface {
	Name() string
	Type() string
	RunRound(difficulty int) (*GameResult, error)
}

// AttentionGame - Visual Search / Hawkeye
type AttentionGame struct{}

func (g *AttentionGame) Name() string {
	return "Hawkeye"
}

func (g *AttentionGame) Type() string {
	return "attention"
}

func (g *AttentionGame) RunRound(difficulty int) (*GameResult, error) {
	startTime := time.Now()
	
	// Simulate visual search task
	targetFound := false
	attempts := 3 + difficulty*2
	for i := 0; i < attempts; i++ {
		if rand.Float64() < 0.3+float64(difficulty)*0.1 {
			targetFound = true
			break
		}
	}
	
	elapsed := time.Since(startTime).Milliseconds()
	accuracy := 100.0 * float64(map[int]int{0: 60, 1: 70, 2: 80, 3: 90, 4: 95}[difficulty%5]) / 100.0
	
	if !targetFound {
		accuracy *= 0.7
	}
	
	score := int(accuracy * (1000.0 / float64(max(elapsed, 100))))
	
	return &GameResult{
		GameType:     "attention",
		Score:        score,
		Accuracy:     accuracy,
		ResponseTime: float64(elapsed),
		Difficulty:   difficulty,
		Timestamp:    time.Now(),
	}, nil
}

// MemoryGame - Target Tracker
type MemoryGame struct{}

func (g *MemoryGame) Name() string {
	return "Target Tracker"
}

func (g *MemoryGame) Type() string {
	return "memory"
}

func (g *MemoryGame) RunRound(difficulty int) (*GameResult, error) {
	startTime := time.Now()
	
	// Simulate tracking task
	distractors := 3 + difficulty
	trackedCorrectly := rand.Intn(2) == 0 // simplified
	
	elapsed := time.Since(startTime).Milliseconds()
	accuracy := 100.0 * float64(trackedCorrectly)
	
	score := int(accuracy * float64(difficulty+1) * 10)
	
	return &GameResult{
		GameType:     "memory",
		Score:        score,
		Accuracy:     accuracy,
		ResponseTime: float64(elapsed),
		Difficulty:   difficulty,
		Timestamp:    time.Now(),
	}, nil
}

// SpeedGame - Rapid Response Test
type SpeedGame struct{}

func (g *SpeedGame) Name() string {
	return "Speed Reaction"
}

func (g *SpeedGame) Type() string {
	return "speed"
}

func (g *SpeedGame) RunRound(difficulty int) (*GameResult, error) {
	startTime := time.Now()
	
	// Simulate reaction time task
	var totalReaction int
	numTrials := 5
	for i := 0; i < numTrials; i++ {
		// Simulated reaction time: base 200ms + difficulty factor
		delay := 200 + difficulty*50 + rand.Intn(100)
		totalReaction += delay
		time.Sleep(time.Duration(delay) * time.Millisecond)
	}
	
	elapsed := time.Since(startTime).Milliseconds()
	avgReaction := float64(totalReaction) / float64(numTrials)
	
	// Score based on speed (faster = higher score)
	score := int(math.Max(0, 1000-float64(avgReaction)))
	
	return &GameResult{
		GameType:     "speed",
		Score:        score,
		Accuracy:     100.0,
		ResponseTime: avgReaction,
		Difficulty:   difficulty,
		Timestamp:    time.Now(),
	}, nil
}

// LogicGame - Pattern Recognition
type LogicGame struct{}

func (g *LogicGame) Name() string {
	return "Pattern Logic"
}

func (g *LogicGame) Type() string {
	return "logic"
}

func (g *LogicGame) RunRound(difficulty int) (*GameResult, error) {
	startTime := time.Now()
	
	// Simulate pattern recognition
	correctAnswers := 0
	totalQuestions := 3 + difficulty
	
	for i := 0; i < totalQuestions; i++ {
		if rand.Float64() < 0.5+float64(difficulty)*0.1 {
			correctAnswers++
		}
	}
	
	elapsed := time.Since(startTime).Milliseconds()
	accuracy := 100.0 * float64(correctAnswers) / float64(totalQuestions)
	
	score := int(accuracy * float64(difficulty+1) * 5)
	
	return &GameResult{
		GameType:     "logic",
		Score:        score,
		Accuracy:     accuracy,
		ResponseTime: float64(elapsed),
		Difficulty:   difficulty,
		Timestamp:    time.Now(),
	}, nil
}

// GetGameEngine returns the appropriate game engine
func GetGameEngine(gameType string) GameEngine {
	switch gameType {
	case "attention":
		return &AttentionGame{}
	case "memory":
		return &MemoryGame{}
	case "speed":
		return &SpeedGame{}
	case "logic":
		return &LogicGame{}
	default:
		return &AttentionGame{}
	}
}
