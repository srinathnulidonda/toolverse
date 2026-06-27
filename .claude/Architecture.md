Architecture Rules

app/
→ Routing only

features/
→ Tool-specific logic

components/
→ Shared UI only

hooks/
→ Global reusable hooks

data/
→ Static project data

lib/
→ Utilities

types/
→ Shared types

Never mix feature logic into shared components.

Keep every tool isolated inside features/.