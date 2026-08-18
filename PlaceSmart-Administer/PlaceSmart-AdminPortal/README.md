# PlaceSmart Administrator Portal

A standalone Placement Cell administration system. It contains only administrator authentication and operations—no student login, profile, dashboard, or application interface.

## Run

1. Copy `.env.example` to `server/.env` and set `MONGO_URI` and a strong `JWT_SECRET`.
2. Install dependencies:

   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. Seed realistic demo data:

   ```bash
   npm run seed
   ```

4. Start both applications:

   ```bash
   npm run dev
   ```

Backend: http://localhost:5050 · Frontend: http://localhost:5173

Demo administrator: `admin@placesmart.edu` / `Password123!`

All `/api/admin/*` routes require a valid JWT for an `ADMIN` user. Application status changes persist and create an individual student notification.
