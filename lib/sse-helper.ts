// Create a new file: lib/sse-helpers.ts
import { authClient } from "@/lib/auth-client";
import { sendEventToUser } from "./sse";

export async function broadcastToAdmins(eventData: Record<string, unknown>) {
  try {
    const response = await authClient.admin.listUsers({
      query: {
        limit: 100,
      },
    });

    if (response.data?.users) {
      const adminUsers = response.data.users.filter(
        (user) =>
          user.role?.toLowerCase() === "admin" ||
          user.role?.toLowerCase() === "cashier"
      );

      let notificationsSent = 0;
      for (const admin of adminUsers) {
        const sent = sendEventToUser(admin.email, eventData);
        if (sent) notificationsSent++;
      }

      console.log(
        `SSE notifications sent to ${notificationsSent} admin & cashier users`
      );
      return notificationsSent;
    }
  } catch (error) {
    console.error("Error broadcasting to admins & cashier:", error);
    return 0;
  }
}
