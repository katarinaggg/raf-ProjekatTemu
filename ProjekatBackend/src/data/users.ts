// generator id-jeva
import { randomUUID } from "crypto";

// Interni model korisnika
export type User = {
  id: string;
  username: string;
  password: string;
};

// In-memory baza korisnika
// ubacujemo jednog rucno
export const users: User[] = [
  {
    id: randomUUID(),
    username: "demo",
    password: "password123",
  },
];

export function generateUserId(): string {
  return randomUUID();
}
