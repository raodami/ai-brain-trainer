# AI Brain Trainer

## Cognitive Training SaaS

Full-featured brain training platform with 4 core game types:

1. **Attention (Hawkeye)** - Visual search and focus training
2. **Memory (Target Tracker)** - Working memory and tracking
3. **Speed (Speed Reaction)** - Processing speed and reaction time
4. **Logic (Pattern Logic)** - Logical reasoning and pattern recognition

## Features

- Adaptive difficulty based on performance
- Real-time progress tracking
- Daily challenges
- Performance analytics
- Professional reports

## Tech Stack

- Backend: Go + Gin + SQLite
- Frontend: Next.js 14 + Tailwind CSS
- Pricing: Free tier (3 sessions/day) → Pro $9.9/mo

## Usage

```bash
# Start backend
cd D:/ai-brain-trainer && go run cmd/server/main.go

# Start frontend
cd D:/ai-brain-trainer/web && npm run dev
```

## API Endpoints

- `POST /api/game/:type` - Play a game
- `POST /api/session` - Save session
- `GET /api/sessions/:user_id` - Get history
- `GET /api/stats/:user_id` - Daily stats
- `GET /api/user/stats/:user_id` - User overview
