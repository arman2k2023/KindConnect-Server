
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { getMongoClient } from "./db.js";

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET must be at least 32 characters long"
  );
}

const baseURL = process.env.BETTER_AUTH_URL;

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL is missing");
}

const clientURL =
  process.env.CLIENT_URL || "http://localhost:3000";

const client = getMongoClient();
const db = client.db(process.env.DB_NAME || "kindconnect");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  secret,

  baseURL,

  trustedOrigins: [clientURL],

  advanced: {
    defaultCookieAttributes: {
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const password = ctx.body?.password;

      if (typeof password !== "string") return;

      if (!/[A-Z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must contain at least one uppercase letter",
        });
      }

      if (!/[a-z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must contain at least one lowercase letter",
        });
      }
    }),
  },

  plugins: [jwt()],
});
