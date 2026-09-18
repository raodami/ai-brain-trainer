package themes

type Theme struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	PrimaryColor   string `json:"primary_color"`
	SecondaryColor string `json:"secondary_color"`
	AccentColor    string `json:"accent_color"`
	Unlocked       bool   `json:"unlocked"`
	Price          int    `json:"price"` // 0 for free
	Icon           string `json:"icon"`
}

var AllThemes = []Theme{
	{ID: "default", Name: "Default", PrimaryColor: "#4F46E5", SecondaryColor: "#7C3AED", AccentColor: "#EC4899", Unlocked: true, Price: 0, Icon: "🎨"},
	{ID: "ocean", Name: "Ocean", PrimaryColor: "#0891B2", SecondaryColor: "#059669", AccentColor: "#0EA5E9", Unlocked: false, Price: 500, Icon: "🌊"},
	{ID: "sunset", Name: "Sunset", PrimaryColor: "#DC2626", SecondaryColor: "#EA580C", AccentColor: "#F59E0B", Unlocked: false, Price: 500, Icon: "🌅"},
	{ID: "forest", Name: "Forest", PrimaryColor: "#16A34A", SecondaryColor: "#15803D", AccentColor: "#22C55E", Unlocked: false, Price: 500, Icon: "🌲"},
	{ID: "galaxy", Name: "Galaxy", PrimaryColor: "#7C3AED", SecondaryColor: "#4F46E5", AccentColor: "#A855F7", Unlocked: false, Price: 800, Icon: "🌌"},
	{ID: "neon", Name: "Neon", PrimaryColor: "#22C55E", SecondaryColor: "#06B6D4", AccentColor: "#E879F9", Unlocked: false, Price: 800, Icon: "💜"},
}

func GetTheme(themeID string) *Theme {
	for i := range AllThemes {
		if AllThemes[i].ID == themeID {
			return &AllThemes[i]
		}
	}
	return &AllThemes[0]
}
