// app/settings/components/WarehouseTab.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Save } from "lucide-react";

interface UserData {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  emailVerified?: boolean;
  createdAt?: Date;
}

interface WarehouseTabProps {
  session: {
    user: UserData;
  };
}

interface WarehouseSettings {
  defaultWarehouse: string;
  department: string;
  shift: string;
}

export default function WarehouseTab({ session }: WarehouseTabProps) {
  const [warehouseSettings, setWarehouseSettings] = useState<WarehouseSettings>({
    defaultWarehouse: "warehouse-1",
    department: "operations",
    shift: "day",
  });

  const handleSettingChange = (field: keyof WarehouseSettings, value: string) => {
    setWarehouseSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Implement save logic here
    console.log("Saving warehouse settings for user:", session.user?.id);
    console.log("Warehouse settings:", warehouseSettings);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Warehouse Settings
          </CardTitle>
          <CardDescription>
            Configure your warehouse-specific preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultWarehouse">Default Warehouse</Label>
            <Select 
              value={warehouseSettings.defaultWarehouse}
              onValueChange={(value) => handleSettingChange("defaultWarehouse", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warehouse-1">
                  Main Warehouse - NYC
                </SelectItem>
                <SelectItem value="warehouse-2">
                  Distribution Center - LA
                </SelectItem>
                <SelectItem value="warehouse-3">
                  Storage Facility - Chicago
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Warehouse Manager</Badge>
              <Badge variant="outline">Full Access</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select 
              value={warehouseSettings.department}
              onValueChange={(value) => handleSettingChange("department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="inventory">
                  Inventory Management
                </SelectItem>
                <SelectItem value="shipping">
                  Shipping & Receiving
                </SelectItem>
                <SelectItem value="quality">Quality Control</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Default Shift</Label>
            <Select 
              value={warehouseSettings.shift}
              onValueChange={(value) => handleSettingChange("shift", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day Shift (6 AM - 2 PM)</SelectItem>
                <SelectItem value="evening">
                  Evening Shift (2 PM - 10 PM)
                </SelectItem>
                <SelectItem value="night">
                  Night Shift (10 PM - 6 AM)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>User Information</Label>
            <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
              <p><strong>User ID:</strong> {session.user?.id}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Name:</strong> {session.user?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button className="flex items-center gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Warehouse Settings
        </Button>
        <Button variant="outline">Reset to Default</Button>
      </div>
    </>
  );
}