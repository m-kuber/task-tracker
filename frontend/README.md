# Task Tracker Frontend

## Quick start

1. `cd frontend`
2. `npm install`
3. Create a `.env` or set a variable for your backend API base (default used in `src/api/axios.js` is `http://localhost:4000/api`)
4. Start dev server:

npm run dev

5. Visit `http://localhost:5173` (Vite default) and use the app.

## Notes
- JWT is stored in `localStorage` under `tt_token`.
- Axios has an interceptor to attach the Authorization header.
- For production, build and serve the `dist` folder (we recommend deploying to S3 + CloudFront for static assets).