import "dotenv/config";
import { defineConfig } from "vitest/config";

// Testes de integração nunca devem rodar contra o banco de desenvolvimento/
// demo por engano: exigimos TEST_DATABASE_URL explicitamente e sobrescrevemos
// DATABASE_URL só dentro do processo de teste.
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL não definida no .env — configure um banco de teste separado antes de rodar os testes (ver .env.example)."
  );
}

export default defineConfig({
  test: {
    environment: "node",
    // Testes de integração tocam o Postgres real de teste — rodar em
    // série evita uma suíte pisando nos dados que a outra acabou de criar.
    fileParallelism: false,
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 15000,
    env: { DATABASE_URL: testDatabaseUrl },
  },
});
