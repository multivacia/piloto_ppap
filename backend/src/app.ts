import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { fornecedoresRouter } from "./modules/fornecedores/fornecedores.routes.js";
import { pacotesRouter } from "./modules/pacotes/pacotes.routes.js";
import { itemDefsRouter } from "./modules/itens/itens.routes.public.js";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/fornecedores", fornecedoresRouter);
app.use("/api/pacotes", pacotesRouter);
app.use("/api/itens", itemDefsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
