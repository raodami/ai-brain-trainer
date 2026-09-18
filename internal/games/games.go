package games

import (
	"errors"
	"math"
	"math/rand"
	"time"
)

// GameResult represents the result of a single game session
type GameResult struct {
	GameType       string  `json:"game_type"`
	Score          int     `json:"score"`
	Accuracy       float64 `json:"accuracy"`
	ResponseTime   int64   `json:"response_time"`
	Difficulty     int     `json:"difficulty"`
	AdaptiveLevel  int     `json:"adaptive_level"`
}

// Game defines the interface for all games
type Game interface {
	RunRound(difficulty int) (*GameResult, error)
}

// AttentionGame - Hawkeye: Find the different colored cell
type AttentionGame struct{}

func (g *AttentionGame) RunRound(difficulty int) (*GameResult, error) {
	gridSize := 3 + difficulty

	// Simulate thinking time based on difficulty
	thinkingTime := 1000 + difficulty*500
	time.Sleep(time.Duration(thinkingTime) * time.Millisecond)

	responseTime := int64(thinkingTime/2) + int64(rand.Intn(500))
	score := int(float64(gridSize*gridSize)*100 * (1 - float64(responseTime)/float64(thinkingTime*2)))
	if score < 0 {
		score = 0
	}
	accuracy := math.Max(0, 100-float64(difficulty)*5)

	return &GameResult{
		GameType:      "attention",
		Score:         score,
		Accuracy:      accuracy,
		ResponseTime:  responseTime,
		Difficulty:    difficulty,
		AdaptiveLevel: difficulty,
	}, nil
}

// MemoryGame - Target Tracker: Remember and repeat sequence
type MemoryGame struct{}

func (g *MemoryGame) RunRound(difficulty int) (*GameResult, error) {
	seqLength := 2 + difficulty

	// Simulate sequence presentation time
	time.Sleep(time.Duration(seqLength*300) * time.Millisecond)

	// Simulate user recall accuracy (higher difficulty = lower accuracy)
	accuracy := math.Max(0.3, 1.0-float64(difficulty)*0.15)
	responseTime := int64(seqLength*150) + int64(rand.Intn(500))

	score := int(float64(seqLength*seqLength*100) * accuracy * (1.0 - float64(responseTime)/(float64(seqLength*500))))
	if score < 0 {
		score = 0
	}

	return &GameResult{
		GameType:      "memory",
		Score:         score,
		Accuracy:      accuracy * 100,
		ResponseTime:  responseTime,
		Difficulty:    difficulty,
		AdaptiveLevel: difficulty,
	}, nil
}

// SpeedGame - Quick reaction test
type SpeedGame struct{}

func (g *SpeedGame) RunRound(difficulty int) (*GameResult, error) {
	totalReaction := 0
	numTrials := 5
	for i := 0; i < numTrials; i++ {
		delay := 200 + difficulty*50 + rand.Intn(100)
		totalReaction += delay
		_ = delay
	}

	avgReaction := totalReaction / numTrials
	accuracy := 100.0 * (map[int]int{0: 90, 1: 85, 2: 80, 3: 75, 4: 70}[difficulty%5]) / 100.0

	score := int(float64(numTrials) * 200 * (1 - float64(avgReaction)/2000) * accuracy)
	if score < 0 {
		score = 0
	}

	return &GameResult{
		GameType:      "speed",
		Score:         score,
		Accuracy:      accuracy,
		ResponseTime:  int64(avgReaction),
		Difficulty:    difficulty,
		AdaptiveLevel: difficulty,
	}, nil
}

// LogicGame - Pattern completion
type LogicGame struct{}

func (g *LogicGame) RunRound(difficulty int) (*GameResult, error) {
	sequenceLength := 4 + difficulty
	step := rand.Intn(3) + 1
	startNum := rand.Intn(10) + 1
	_ = startNum

	responseTime := int64(sequenceLength*200) + int64(rand.Intn(800))
	accuracy := math.Max(0, 100-float64(difficulty)*8)

	score := int(float64(sequenceLength) * 150 * (1 - float64(responseTime)/3000) * (accuracy / 100))
	if score < 0 {
		score = 0
	}

	return &GameResult{
		GameType:      "logic",
		Score:         score,
		Accuracy:      accuracy,
		ResponseTime:  responseTime,
		Difficulty:    difficulty,
		AdaptiveLevel: difficulty,
	}, nil
}

// PlayGame runs a session and returns the result
func PlayGame(gameType string, difficulty int) (*GameResult, error) {
	var game Game
	switch gameType {
	case "attention":
		game = &AttentionGame{}
	case "memory":
		game = &MemoryGame{}
	case "speed":
		game = &SpeedGame{}
	case "logic":
		game = &LogicGame{}
	default:
		return nil, errors.New("invalid game type")
	}

	return game.RunRound(difficulty)
}

// AdaptiveDifficulty adjusts difficulty based on recent performance
func AdaptiveDifficulty(avgScore int, lastDiff int) int {
	if avgScore > 800 && lastDiff < 4 {
		return lastDiff + 1
	}
	if avgScore < 400 && lastDiff > 0 {
		return lastDiff - 1
	}
	return lastDiff
}
