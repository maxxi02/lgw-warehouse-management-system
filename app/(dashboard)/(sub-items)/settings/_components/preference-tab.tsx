// app/settings/components/PreferencesTab.tsx
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
import { Palette, Globe, Clock, Save } from "lucide-react";

interface UserData {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  emailVerified?: boolean;
  createdAt?: Date;
}

interface PreferencesTabProps {
  session: {
    user: UserData;
  };
}

interface DisplayPreferences {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
}

export default function PreferencesTab({ session }: PreferencesTabProps) {
  const [preferences, setPreferences] = useState<DisplayPreferences>({
    theme: "system",
    language: "en",
    timezone: "est",
    dateFormat: "mm-dd-yyyy",
  });

  const handlePreferenceChange = (
    field: keyof DisplayPreferences,
    value: string
  ) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Implement save logic here
    console.log("Saving preferences for user:", session.user?.id);
    console.log("Display preferences:", preferences);
  };

  const handleReset = () => {
    setPreferences({
      theme: "system",
      language: "en",
      timezone: "est",
      dateFormat: "mm-dd-yyyy",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize your interface and regional settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => handlePreferenceChange("theme", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </Label>
            <Select
              value={preferences.language}
              onValueChange={(value) =>
                handlePreferenceChange("language", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timezone
            </Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) =>
                handlePreferenceChange("timezone", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="est">Eastern Time (EST)</SelectItem>
                <SelectItem value="cst">Central Time (CST)</SelectItem>
                <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                <SelectItem value="pst">Pacific Time (PST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(value) =>
                handlePreferenceChange("dateFormat", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
              <p>
                <strong>Theme:</strong> {preferences.theme}
              </p>
              <p>
                <strong>Language:</strong> {preferences.language.toUpperCase()}
              </p>
              <p>
                <strong>Timezone:</strong> {preferences.timezone.toUpperCase()}
              </p>
              <p>
                <strong>Date Format:</strong> {preferences.dateFormat}
              </p>
              <p>
                <strong>Sample Date:</strong>{" "}
                {preferences.dateFormat === "mm-dd-yyyy"
                  ? "06/07/2025"
                  : preferences.dateFormat === "dd-mm-yyyy"
                    ? "07/06/2025"
                    : "2025-06-07"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button className="flex items-center gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Preferences
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
      </div>
    </>
  );
}
