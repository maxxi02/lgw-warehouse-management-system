// lib/email-service.ts
interface User {
  email: string;
  name: string;
  role: string;
}

interface SendWelcomeEmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
  details?: string;
}

/**
 * Send welcome email with login credentials to a new user
 */
export async function sendWelcomeEmail(
  user: User,
  tempPassword: string
): Promise<SendWelcomeEmailResponse> {
  try {
    const response = await fetch("/api/auth/send-welcome-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
        tempPassword,
        isResend: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send welcome email");
    }

    return data;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      message: "Failed to send welcome email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Resend welcome email with credentials to an existing user
 */
export async function resendWelcomeEmail(
  user: User,
  newTempPassword: string
): Promise<SendWelcomeEmailResponse> {
  try {
    const response = await fetch("/api/send-welcome-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
        tempPassword: newTempPassword,
        isResend: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to resend welcome email");
    }

    return data;
  } catch (error) {
    console.error("Error resending welcome email:", error);
    return {
      success: false,
      message: "Failed to resend welcome email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate a secure temporary password
 */
export function generateSecurePassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one character from each category
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
