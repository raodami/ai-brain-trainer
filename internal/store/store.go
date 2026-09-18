package store

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
)

type UserRecord struct {
	ID         string    `json:"id"`
	Username   string    `json:"username"`
	Email      string    `json:"email"`
	IsPro      bool      `json:"is_pro"`
	ExpiresAt  time.Time `json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
}

type SessionRecord struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	GameType    string    `json:"game_type"`
	Score       int       `json:"score"`
	Accuracy    float64   `json:"accuracy"`
	Difficulty  int       `json:"difficulty"`
	CreatedAt   time.Time `json:"created_at"`
}

type DailyStats struct {
	Date           string  `json:"date"`
	TotalSessions  int     `json:"total_sessions"`
	AvgScore       float64 `json:"avg_score"`
	AvgAccuracy    float64 `json:"avg_accuracy"`
	TimeSpentMin   float64 `json:"time_spent_min"`
}

type Store struct {
	db *sql.DB
}

func New(dbPath string) (*Store, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	s := &Store{db: db}
	if err := s.initSchema(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Store) initSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		username TEXT UNIQUE,
		email TEXT UNIQUE,
		is_pro BOOLEAN DEFAULT 0,
		expires_at DATETIME,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS sessions (
		id TEXT PRIMARY KEY,
		user_id TEXT,
		game_type TEXT,
		score INTEGER,
		accuracy REAL,
		difficulty INTEGER,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
	CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(game_type);
	`
	_, err := s.db.Exec(schema)
	return err
}

func (s *Store) CreateUser(u *UserRecord) error {
	_, err := s.db.Exec(
		"INSERT INTO users (id, username, email, is_pro, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		u.ID, u.Username, u.Email, u.IsPro, u.ExpiresAt, u.CreatedAt,
	)
	return err
}

func (s *Store) GetUser(id string) (*UserRecord, error) {
	var u UserRecord
	err := s.db.QueryRow(
		"SELECT id, username, email, is_pro, expires_at, created_at FROM users WHERE id = ?",
		id,
	).Scan(&u.ID, &u.Username, &u.Email, &u.IsPro, &u.ExpiresAt, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) SaveSession(session *SessionRecord) error {
	_, err := s.db.Exec(
		"INSERT INTO sessions (id, user_id, game_type, score, accuracy, difficulty, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		session.ID, session.UserID, session.GameType, session.Score, session.Accuracy, session.Difficulty, session.CreatedAt,
	)
	return err
}

func (s *Store) GetRecentSessions(userID string, limit int) ([]*SessionRecord, error) {
	rows, err := s.db.Query(
		"SELECT id, user_id, game_type, score, accuracy, difficulty, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
		userID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*SessionRecord
	for rows.Next() {
		var s SessionRecord
		if err := rows.Scan(&s.ID, &s.UserID, &s.GameType, &s.Score, &s.Accuracy, &s.Difficulty, &s.CreatedAt); err != nil {
			continue
		}
		sessions = append(sessions, &s)
	}
	return sessions, rows.Err()
}

func (s *Store) GetDailyStats(userID string, date string) (*DailyStats, error) {
	var stats DailyStats
	err := s.db.QueryRow(
		`SELECT 
			COUNT(*) as total_sessions,
			COALESCE(AVG(score), 0) as avg_score,
			COALESCE(AVG(accuracy), 0) as avg_accuracy,
			COALESCE(SUM(
				(SELECT strftime('%s', 'now') - strftime('%s', created_at)) / 60.0
				FROM sessions s2 WHERE s2.user_id = ? AND DATE(s2.created_at) = ?
			), 0) as time_spent_min
		FROM sessions 
		WHERE user_id = ? AND DATE(created_at) = ?`,
		userID, date, userID, date,
	).Scan(&stats.TotalSessions, &stats.AvgScore, &stats.AvgAccuracy, &stats.TimeSpentMin)
	
	if err != nil {
		return nil, err
	}
	stats.Date = date
	return &stats, nil
}

func (s *Store) GetUserStats(userID string) (map[string]interface{}, error) {
	var totalSessions, proUsers int
	var totalScore float64
	
	s.db.QueryRow("SELECT COUNT(*) FROM sessions WHERE user_id = ?", userID).Scan(&totalSessions)
	s.db.QueryRow("SELECT COALESCE(SUM(score), 0) FROM sessions WHERE user_id = ?", userID).Scan(&totalScore)
	s.db.QueryRow("SELECT COUNT(*) FROM users WHERE is_pro = 1").Scan(&proUsers)
	
	return map[string]interface{}{
		"total_sessions": totalSessions,
		"total_score":    totalScore,
		"avg_score":      totalScore / float64(max(totalSessions, 1)),
		"pro_users":      proUsers,
	}, nil
}

func (s *Store) Close() error {
	return s.db.Close()
}
