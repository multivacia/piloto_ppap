import type { NextFunction, Request, Response } from "express";

// Envolve controllers async para que qualquer rejeição de Promise caia
// automaticamente no errorHandler, sem precisar de try/catch repetido
// em cada controller.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
