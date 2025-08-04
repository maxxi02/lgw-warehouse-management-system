import { AppSidebar } from "@/components/_components/app-sidebar";
import { SiteHeader } from "@/components/_components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/actions";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();

  // Debug logging - remove after fixing
  // console.log("Server session:", session);
  // console.log("Session user:", session?.user);
  // console.log("User role from session:", session?.user?.role);

  const userData = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role || "",
      }
    : null;

  // More debug logging
  console.log("Final userData:", userData);
  console.log("Final userData role:", userData?.role);

  return (
    <main>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" user={userData} />
        <SidebarInset>
          <SiteHeader />
          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 m-4">
              <h4 className="font-bold">Debug Info:</h4>
              <pre className="text-xs mt-2">
                {JSON.stringify({ userData, hasSession: !!session }, null, 2)}
              </pre>
            </div>
          )}
          {children}
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
};

export default layout;
