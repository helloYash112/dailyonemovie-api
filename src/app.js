import express from "express";
import cors from "cors";
import helmet from "helmet";

const MOVIE_SELECT = `
  SELECT
    m.id,
    m.title,
    m.genre,
    m.duration,
    m.rating,
    m.poster_key AS "posterKey",
    m.poster_url AS "posterUrl",
    h.playlist_key AS "playlistKey",
    h.playlist_url AS "playlistUrl"
  FROM public.movies AS m
  LEFT JOIN public.hls_metadata AS h
    ON h.movie_id = m.id
`;

export function createApp({
  frontendOrigins = [
    "https://dailyonemovie.netlify.app",
    "http://localhost:5173",
  ],
  query,
} = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || frontendOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS"));
      },
      methods: ["GET", "HEAD", "OPTIONS"],
    })
  );

  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "dailyonemovie-api",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/movies", async (_req, res, next) => {
    if (!query) {
      return res.status(503).json({
        error: "Database is not configured",
      });
    }

    try {
      const result = await query(
        `${MOVIE_SELECT} ORDER BY m.id DESC`
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/movies/:id", async (req, res, next) => {
    if (!query) {
      return res.status(503).json({
        error: "Database is not configured",
      });
    }

    if (!/^[1-9]\d*$/.test(req.params.id)) {
      return res.status(400).json({
        error: "Movie ID must be a positive integer",
      });
    }

    try {
      const result = await query(
        `${MOVIE_SELECT} WHERE m.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Movie not found",
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    if (error.message === "Origin not allowed by CORS") {
      return res.status(403).json({ error: "Origin not allowed" });
    }

    console.error("API request failed:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

export default createApp;
