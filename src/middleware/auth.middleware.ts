
import type { RequestHandler } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

const authBaseURL = (
    process.env.BETTER_AUTH_URL || "http://localhost:5000"
).replace(/\/$/, "");

const JWKS = createRemoteJWKSet(
    new URL(`${authBaseURL}/api/auth/jwks`)
);

export const authMiddleware: RequestHandler = async (
    req,
    res,
    next
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: Token is missing",
            });
            return;
        }

        const token = authHeader.slice(7).trim();

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token",
            });
            return;
        }

        const { payload } = await jwtVerify(token, JWKS, {
            issuer: authBaseURL,
            audience: authBaseURL,
        });

        if (!payload.sub) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid user",
            });
            return;
        }

        res.locals.user = {
            id: payload.sub,
            email: payload.email,
        };

        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);

        res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token",
        });
    }
};
