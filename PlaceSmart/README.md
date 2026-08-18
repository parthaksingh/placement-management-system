# PlaceSmart

A college-connected placement-management platform with student and placement-cell experiences, eligibility enforcement, applications, rounds, status updates, notifications, and demo data.

## Run locally

1. Start MongoDB with `docker compose up mongo -d` (or set `MONGODB_URI` in `server/.env`).
2. Run `npm install`, then `npm install --prefix server` and `npm install --prefix client`.
3. Seed the demo: `npm run seed`.
4. Start both apps: `npm run dev`, then open the Vite URL (normally `http://localhost:5173`).

Demo accounts (password: `Password123!`):

- Student: `parthak@college.edu`
- Placement admin: `admin@placesmart.edu`

The REST API runs on port 5000. Routes are protected with JWT role checks; the student application endpoint recalculates eligibility and prevents duplicates/deadline bypasses server-side.
