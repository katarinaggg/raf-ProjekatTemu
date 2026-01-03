import { Request, Response } from "express";
import { users, generateUserId } from "../data/users";
import {
  UserCreationReq,
  UserCreationRes,
  LoginReq,
  LoginRes,
} from "../types/Auth";
import { ErrorCode } from "../types/ErrorCode";
import { createJwtLikeToken } from "../utils/jwtLike";

// helper: da li je “autentikovan zahtev” (ima Bearer token)
function hasAuthHeader(req: Request): boolean {
  const h = req.headers.authorization;
  return typeof h === "string" && h.startsWith("Bearer ");
}

// POST /auth/register
export function register(
  req: Request<{}, UserCreationRes, UserCreationReq>,
  res: Response<UserCreationRes>
) {
  const { username, password } = req.body;

  // Ako je korisnik već ulogovan → LOGGED_IN
  if (hasAuthHeader(req)) {
    throw { code: "LOGGED_IN" as ErrorCode };
  }

  // Validacija usernamea
  if (
    typeof username !== "string" ||
    username.length < 2 ||
    username.length > 32
  ) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  // Validacija passworda
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  // Provera da li username već postoji
  const existingUser = users.find((u) => u.username === username);

  if (existingUser) {
    throw { code: "DUPLICATE_USERNAME" as ErrorCode };
  }

  // BITNO: confirm_password proverava se u frontendu

  // Kreiranje novog korisnika
  const userId = generateUserId();

  users.push({
    id: userId,
    username,
    password,
  });

  console.log(users);

  // Uspešan odgovor
  res.json({
    failed: false,
    user_id: userId,
  });
}

// POST /auth/login
export function login(
  req: Request<{}, LoginRes, LoginReq>,
  res: Response<LoginRes>
) {
  const { username, password } = req.body;

  // ako je vec ulogovan
  if (hasAuthHeader(req)) {
    throw { code: "LOGGED_IN" as ErrorCode };
  }

  // nevalidni unosi
  if (
    typeof username !== "string" ||
    username.length < 2 ||
    username.length > 32
  ) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  // provera kredencijala
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    throw { code: "INCORRECT_CREDENTIALS" as ErrorCode };
  }

  // JWT-like token: payload mora da ima user_id (tvoj frontend to čita)
  const token = createJwtLikeToken({
    user_id: user.id,
    username: user.username,
  });

  res.json({ failed: false, token });
}
