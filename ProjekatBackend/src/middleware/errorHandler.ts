import { Request, Response, NextFunction } from "express";
import { ErrorCode } from "../types/ErrorCode";

type ApiErrorCommon = {
  failed: true;
  code: ErrorCode;
};

export function errorHandler(
  err: any,
  _req: Request,
  res: Response<ApiErrorCommon>,
  _next: NextFunction
) {
  const code: ErrorCode = err?.code ?? "INTERNAL_ERROR";
  res.status(400).json({ failed: true, code });
}
