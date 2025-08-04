import type { BetterAuthPlugin } from "better-auth";

export const myPlugin = () => {
  return {
    id: "my-plugin",
  } satisfies BetterAuthPlugin;
};
