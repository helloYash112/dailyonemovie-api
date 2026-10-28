import "dotenv/config";

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

export const env = Object.freeze({
  port,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigins: (
    process.env.FRONTEND_ORIGIN ||
    "https://dailyonemovie.netlify.app,http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
});
