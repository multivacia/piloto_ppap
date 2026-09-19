import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`API PPAP rodando na porta ${env.port} (${env.nodeEnv})`);
});
