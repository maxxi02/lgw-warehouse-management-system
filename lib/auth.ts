import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { twoFactor, admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, cashier, delivery, user } from "@/lib/permissions";
import { getResend } from "./resend";
import { db } from "./mongodb";
import { SENDER_EMAIL } from "./constants/env";

const resend = getResend();
export const auth = betterAuth({
  trustedOrigins: [
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_URL!
      : "http://localhost:3000",
  ],
  database: mongodbAdapter(db),
  schema: {
    user: {
      fields: {
        vehicle: {
          type: "string",
          required: false,
        },
        vehicleType: {
          type: "string", // "motorcycle" | "car" | "van" | "truck"
          required: false,
        },
        activeDeliveries: {
          type: "number",
          defaultValue: 0,
          required: false,
        },
        completedDeliveries: {
          type: "number",
          defaultValue: 0,
          required: false,
        },
        status: {
          type: "string", // "available" | "busy" | "offline" | "on_break"
          defaultValue: "offline",
          required: false,
        },
        lastActive: {
          type: "date",
          required: false,
        },
        currentLocation: {
          type: "object",
          required: false,
        },
      },
    },
  },
  emailAndPassword: {
    requireEmailVerification: true,
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: `LGW Warehouse <${SENDER_EMAIL}>`,
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: `LGW Warehouse <${SENDER_EMAIL}>`,
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url }) => {
        await resend.emails.send({
          from: `LGW Warehouse <${SENDER_EMAIL}>`,
          to: user.email, // verification email must be sent to the current user email to approve the change
          subject: "Approve email change",
          text: `Click the link to approve the change: ${url}`,
        });
      },
    },
  },
  appName: "LGW Hardware",
  plugins: [
    adminPlugin({
      ac,
      roles: { admin, cashier, delivery, user },
      adminRoles: ["admin"],
      defaultRole: "user",
    }),
    twoFactor({
      skipVerificationOnEnable: true,
      otpOptions: {
        async sendOTP({ user, otp }) {
          await resend.emails.send({
            from: `LGW Warehouse <${SENDER_EMAIL}>`,
            to: user.email, // verification email must be sent to the current user email to approve the change
            subject: "2FA Verification",
            text: `Verify your OTP: ${otp}`,
          });
        },
      },
    }),
    nextCookies(),
  ],
});
