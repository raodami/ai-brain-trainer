package auth

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // not serialized
	IsPro     bool      `json:"is_pro"`
	ExpiresAt time.Time `json:"expires_at"`
	SessionID string    `json:"session_id"`
	CreatedAt time.Time `json:"created_at"`
}

func GenerateSessionID() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
