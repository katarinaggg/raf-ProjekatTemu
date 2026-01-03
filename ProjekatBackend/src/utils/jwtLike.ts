// helper fja za generisanje tokena
export function createJwtLikeToken(payload: object): string {
  const header = { alg: "HS256", typ: "JWT" };

  const base64Header = Buffer.from(JSON.stringify(header)).toString(
    "base64url"
  );
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  // dummy signature (frontend je ne proverava, samo split/atob payload)
  const signature = "dummy-signature";

  return `${base64Header}.${base64Payload}.${signature}`;
}
