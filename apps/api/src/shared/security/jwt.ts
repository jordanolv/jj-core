import { sign, verify } from "hono/jwt";
import { authEnv } from "../env";

const ISSUER = "jj-core-api";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  exp?: number;
}

export function signAuthToken(payload: AuthTokenPayload) {
  return sign(
    {
      ...payload,
      iss: ISSUER,
      iat: Math.floor(Date.now() / 1000),
    },
    authEnv.secret()
  );
}

export function verifyAuthToken(token: string) {
  return verify(token, authEnv.secret());
}

