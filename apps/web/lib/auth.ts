import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@repo/db";
import { sendEmail } from "./email";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your Face-AI password",
        text: `Click the link below to reset your password:\n\n${url}\n\nIf you did not request this, please ignore this email.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your Face-AI email",
        text: `Welcome to Face-AI!\n\nClick the link below to verify your email:\n\n${url}`,
      });
    },
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  ],
});
