// app/settings/page.tsx
import { getServerSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Settings, Warehouse } from "lucide-react";
import ProfileTab from "./_components/profile-tab";
import AccountTab from "./_components/account-tab";
import WarehouseTab from "./_components/warehouse-tab";
import PreferencesTab from "./_components/preference-tab";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and warehouse preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="warehouse" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            <span className="hidden sm:inline">Warehouse</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileTab session={session} />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <AccountTab session={session} />
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-6">
          <WarehouseTab session={session} />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesTab session={session} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
