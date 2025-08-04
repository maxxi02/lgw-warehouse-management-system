import { createAuthClient } from "better-auth/react";
import { BASE_URL } from "./constants/env";
import { twoFactorClient } from "better-auth/plugins";
import { adminClient } from "better-auth/client/plugins";
import { ac, admin, cashier, delivery, user } from "@/lib/permissions";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [
    twoFactorClient(),
    adminClient({
      ac,
      roles: {
        admin,
        user,
        cashier,
        delivery,
      },
    }),
  ],
});

export const { useSession } = authClient;
