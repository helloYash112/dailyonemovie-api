import createApp from "./app.js";
import { env } from "./config/env.js";

const app = createApp({
  frontendOrigins: env.frontendOrigins,
});

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`DailyOneMovie API listening on port ${env.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);

  server.close((error) => {
    if (error) {
      console.error("Server shutdown failed:", error);
      process.exitCode = 1;
      return;
    }

    console.log("HTTP server closed.");
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
