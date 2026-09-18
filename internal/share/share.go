package share

import "fmt"

type ShareData struct {
	Score     int
	GameType  string
	Level     int
	Accuracy  float64
	RivalName string
}

func GenerateTwitterShareURL(data ShareData) string {
	text := fmt.Sprintf("I just scored %d points in %s on AI Brain Trainer! Level %d, %.1f%% accuracy. Can you beat me? 🧠💪", data.Score, data.GameType, data.Level, data.Accuracy)
	return fmt.Sprintf("https://twitter.com/intent/tweet?text=%s&url=https://braintrainer.app", text)
}

func GenerateFacebookShareURL(data ShareData) string {
	return "https://www.facebook.com/sharer/sharer.php?u=https://braINTRAINER.app&quote=" + fmt.Sprintf("Scored %d in %s!", data.Score, data.GameType)
}

func GenerateLinkedInShareURL(data ShareData) string {
	return "https://www.linkedin.com/shareArticle?mini=true&url=https://braINTRAINER.app&title=AI Brain Trainer Achievement&summary=I scored " + fmt.Sprintf("%d points in %s!", data.Score, data.GameType)
}
