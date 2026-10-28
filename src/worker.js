import { httpServerHandler } from "cloudflare:node";
import { env } from "cloudflare:workers";
import pg from "pg";
import createApp from "./app.js";

const { Client } = pg;

const frontendOrigins = (
  env.FRONTEND_ORIGIN ||
  "https://dailyonemovie.netlify.app,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

async function queryDatabase(sql, params = []) {
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  await client.connect();

  try {
    return await client.query(sql, params);
  } finally {
    await client.end();
  }
}

const app = createApp({
  frontendOrigins,
  query: queryDatabase,
});

app.listen(3000);

export default httpServerHandler({ port: 3000 });
