package store

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
)

type SessionRecord struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	GameType     string    `json:"game_type"`
	Score        int       `json:"score"`
	Accuracy     float64   `json:"accuracy"`
	ResponseTime int64     `json:"response_time"`
	Difficulty   int       `json:"difficulty"`
	AdaptiveLevel int      `json:"adaptive_level"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserStats struct {
	UserID        string    `json:"user_id"`
	TotalGames    int       `json:"total_games"`
	TotalSessions int       `json:"total_sessions"`
	AverageScore  float64   `json:"average_score"`
	AvgAccuracy   float64   `json:"avg_accuracy"`
	AvgResponseTime int64   `json:"avg_response_time"`
	CurrentStreak int       `json:"current_streak"`
	BestStreak    int       `json:"best_streak"`
	Level         int       `json:"level"`
	XP            int       `json:"xp"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Achievement struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	Description string  `json:"description"`
	UnlockedAt time.Time `json:"unlocked_at"`
}

type LeaderboardEntry struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
	Score    int    `json:"score"`
	Level    int    `json:"level"`
	Rank     int    `json:"rank"`
}

type TrainerStore struct {
	db *sql.DB
}

func New(dbPath string) (*TrainerStore, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	s := &TrainerStore{db: db}
	if err := s.initSchema(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *TrainerStore) initSchema() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			game_type TEXT NOT NULL,
			score INTEGER NOT NULL,
			accuracy REAL NOT NULL,
			response_time INTEGER NOT NULL,
			difficulty INTEGER DEFAULT 1,
			adaptive_level INTEGER DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			is_pro BOOLEAN DEFAULT 0,
			expires_at DATETIME,
			session_id TEXT,
			level INTEGER DEFAULT 1,
			xp INTEGER DEFAULT 0,
			streak INTEGER DEFAULT 0,
			best_streak INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS achievements (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			code TEXT NOT NULL,
			name TEXT NOT NULL,
			description TEXT NOT NULL,
			unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at)`,
		`CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id)`,
	}

	for _, q := range queries {
		if _, err := s.db.Exec(q); err != nil {
			return err
		}
	}
	return nil
}

func (s *TrainerStore) CreateSession(record *SessionRecord) error {
	_, err := s.db.Exec(
		"INSERT INTO sessions (id, user_id, game_type, score, accuracy, response_time, difficulty, adaptive_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		record.ID, record.UserID, record.GameType, record.Score, record.Accuracy,
		record.ResponseTime, record.Difficulty, record.AdaptiveLevel, record.CreatedAt,
	)
	return err
}

func (s *TrainerStore) GetUserSessions(userID string, limit int) ([]*SessionRecord, error) {
	rows, err := s.db.Query(
		"SELECT id, user_id, game_type, score, accuracy, response_time, difficulty, adaptive_level, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
		userID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []*SessionRecord
	for rows.Next() {
		var r SessionRecord
		if err := rows.Scan(&r.ID, &r.UserID, &r.GameType, &r.Score, &r.Accuracy, &r.ResponseTime, &r.Difficulty, &r.AdaptiveLevel, &r.CreatedAt); err != nil {
			return nil, err
		}
		records = append(records, &r)
	}
	return records, nil
}

func (s *TrainerStore) GetOrCreateUserStats(userID string) (*UserStats, error) {
	var stats UserStats
	err := s.db.QueryRow(
		`SELECT u.id, u.level, u.xp, u.streak, u.best_streak,
			COUNT(s.id), AVG(s.score), AVG(s.accuracy), AVG(s.response_time), u.updated_at
			FROM users u
			LEFT JOIN sessions s ON u.id = s.user_id
			WHERE u.id = ?
			GROUP BY u.id`,
		userID,
	).Scan(&stats.UserID, &stats.Level, &stats.XP, &stats.CurrentStreak, &stats.BestStreak,
		&stats.TotalSessions, &stats.AverageScore, &stats.AvgAccuracy, &stats.AvgResponseTime, &stats.UpdatedAt)

	if err == sql.ErrNoRows {
		stats.UserID = userID
		stats.Level = 1
		stats.XP = 0
		stats.TotalSessions = 0
		return &stats, nil
	}
	return &stats, err
}

func (s *TrainerStore) UpdateUserStats(userID string, score int, xpGain int) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var currentLevel, currentXP int
	err = tx.QueryRow("SELECT level, xp FROM users WHERE id = ?", userID).Scan(&currentLevel, &currentXP)
	if err != nil {
		return err
	}

	newXP := currentXP + xpGain
	newLevel := currentLevel
	for newXP >= newLevel*100 {
		newXP -= newLevel * 100
		newLevel++
	}

	_, err = tx.Exec(
		"UPDATE users SET xp = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		newXP, newLevel, userID,
	)
	return err
}

func (s *TrainerStore) GetUserAchievements(userID string) ([]*Achievement, error) {
	rows, err := s.db.Query(
		"SELECT id, user_id, code, name, description, unlocked_at FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC",
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var achievements []*Achievement
	for rows.Next() {
		var a Achievement
		if err := rows.Scan(&a.ID, &a.UserID, &a.Code, &a.Name, &a.Description, &a.UnlockedAt); err != nil {
			return nil, err
		}
		achievements = append(achievements, &a)
	}
	return achievements, nil
}

func (s *TrainerStore) UnlockAchievement(userID, code, name, description string) (*Achievement, error) {
	id := userID + "-" + code
	_, err := s.db.Exec(
		"INSERT OR IGNORE INTO achievements (id, user_id, code, name, description, unlocked_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
		id, userID, code, name, description,
	)
	if err != nil {
		return nil, err
	}

	var a Achievement
	a.ID = id
	a.UserID = userID
	a.Code = code
	a.Name = name
	a.Description = description
	a.UnlockedAt = time.Now()
	return &a, nil
}

func (s *TrainerStore) GetLeaderboard(limit int) ([]*LeaderboardEntry, error) {
	rows, err := s.db.Query(
		`SELECT u.id, u.username, COALESCE(u.avatar, '🎭'), COALESCE(SUM(s.score), 0), u.level
			FROM users u
			LEFT JOIN sessions s ON u.id = s.user_id
			GROUP BY u.id
			ORDER BY SUM(s.score) DESC
			LIMIT ?`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*LeaderboardEntry
	rank := 1
	for rows.Next() {
		var e LeaderboardEntry
		if err := rows.Scan(&e.UserID, &e.Username, &e.Avatar, &e.Score, &e.Level); err != nil {
			return nil, err
		}
		e.Rank = rank
		entries = append(entries, &e)
		rank++
	}
	return entries, nil
}

func (s *TrainerStore) Close() error {
	return s.db.Close()
}
