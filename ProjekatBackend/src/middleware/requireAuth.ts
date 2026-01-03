import { Request, Response, NextFunction } from "express";
import { ErrorCode } from "../types/ErrorCode";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Nema Authorization headera
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw { code: "NOT_AUTHENTICATED" as ErrorCode };
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    // JWT-like token: header.payload.signature
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      throw new Error("Invalid token format");
    }

    const decoded = JSON.parse(
      Buffer.from(payloadPart, "base64").toString("utf-8")
    );

    // Iz payload-a vadimo user_id
    const userId = decoded.user_id || decoded.sub;
    if (!userId) {
      throw new Error("Missing user id in token");
    }

    // Kačimo userId na request koji se salje dalje (backend ga koristi dalje)
    // middleware je 1 nivo pre pravog requesta koji ce se poslati
    (req as any).userId = userId;

    next();
  } catch {
    throw { code: "NOT_AUTHENTICATED" as ErrorCode };
  }
}
