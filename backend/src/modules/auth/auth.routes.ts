import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { loginHandler, meHandler } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(loginHandler));
authRouter.get("/me", requireAuth, asyncHandler(meHandler));
