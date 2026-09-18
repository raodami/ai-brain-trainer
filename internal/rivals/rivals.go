package rivals

import (
	"math/rand"
)

type AIrival struct {
	ID           string
	Name         string
	Avatar       string
	Level        int
	LastScore    int
	Accuracy     float64
	ResponseTime int64
}

var AIRivals = []AIrival{
	{ID: "ai_1", Name: "Brain Bot", Avatar: "🤖", Level: 5, LastScore: 850, Accuracy: 88.5, ResponseTime: 450},
	{ID: "ai_2", Name: "Thinker", Avatar: "🧠", Level: 8, LastScore: 1200, Accuracy: 92.3, ResponseTime: 380},
	{ID: "ai_3", Name: "Speedy", Avatar: "⚡", Level: 6, LastScore: 950, Accuracy: 85.0, ResponseTime: 320},
	{ID: "ai_4", Name: "Logic Pro", Avatar: "🎓", Level: 7, LastScore: 1100, Accuracy: 90.1, ResponseTime: 520},
	{ID: "ai_5", Name: "Memory Master", Avatar: "🎯", Level: 9, LastScore: 1350, Accuracy: 94.2, ResponseTime: 410},
}

func GetAIRival() *AIrival {
	idx := rand.Intn(len(AIRivals))
	return &AIRivals[idx]
}

func GenerateAIRivalScore() int {
	base := 600 + rand.Intn(600)
	return base
}

func GenerateAIRivalAccuracy() float64 {
	return 70.0 + rand.Float64()*25.0
}

func GenerateAIRivalResponseTime() int64 {
	return 300 + int64(rand.Intn(400))
}
