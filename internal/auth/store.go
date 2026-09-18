package auth

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
)

type AuthStore struct {
	db *sql.DB
}

func NewAuthStore(dbPath string) (*AuthStore, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	s := &AuthStore{db: db}
	if err := s.initSchema(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *AuthStore) initSchema() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			is_pro BOOLEAN DEFAULT 0,
			expires_at DATETIME,
			session_id TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	return err
}

func (s *AuthStore) CreateUser(username, email, password string) (*User, error) {
	id, _ := GenerateSessionID()
	user := &User{
		ID:       id,
		Username: username,
		Email:    email,
		Password: password,
		CreatedAt: time.Now(),
	}

	_, err := s.db.Exec(
		"INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)",
		user.ID, user.Username, user.Email, user.Password, user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthStore) GetByEmail(email string) (*User, error) {
	var u User
	err := s.db.QueryRow(
		"SELECT id, username, email, password, is_pro, expires_at, session_id, created_at FROM users WHERE email = ?",
		email,
	).Scan(&u.ID, &u.Username, &u.Email, &u.Password, &u.IsPro, &u.ExpiresAt, &u.SessionID, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *AuthStore) UpdateSession(userID, sessionID string) error {
	_, err := s.db.Exec("UPDATE users SET session_id = ? WHERE id = ?", sessionID, userID)
	return err
}

func (s *AuthStore) ActivatePro(userID string, expiresAt time.Time) error {
	_, err := s.db.Exec("UPDATE users SET is_pro = 1, expires_at = ? WHERE id = ?", expiresAt, userID)
	return err
}

func (s *AuthStore) Close() error {
	return s.db.Close()
}
