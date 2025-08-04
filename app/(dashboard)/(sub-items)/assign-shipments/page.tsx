"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Loader2, Users, Package, PackageCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserData, UserRole } from "@/types/user-type";
import { UsersTable } from "../users/_components/user-table";

// Extended interface for delivery staff
interface DeliveryStaffData extends UserData {
  vehicle?: string;
  vehicleType?: "motorcycle" | "car" | "van" | "truck";
  activeDeliveries?: number;
  completedDeliveries?: number;
  status?: "available" | "busy" | "offline" | "on_break";
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

// Form schemas - Fixed to make boolean fields required
const createDeliveryStaffSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    vehicle: z.string().min(2, "Vehicle name is required"),
    vehicleType: z.enum(["motorcycle", "car", "van", "truck"]),
    useGeneratedPassword: z.boolean(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    sendCredentials: z.boolean(),
    requireEmailVerification: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.useGeneratedPassword) {
        return data.password && data.password.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (!data.useGeneratedPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

type CreateDeliveryStaffFormValues = z.infer<typeof createDeliveryStaffSchema>;

const DeliveryStaffManagementPage = () => {
  const [users, setUsers] = useState<DeliveryStaffData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const form = useForm<CreateDeliveryStaffFormValues>({
    resolver: zodResolver(createDeliveryStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      vehicle: "",
      vehicleType: "motorcycle",
      useGeneratedPassword: true,
      password: "",
      confirmPassword: "",
      sendCredentials: true,
      requireEmailVerification: true,
    },
  });

  const {
    watch,
    formState: { isSubmitting },
  } = form;

  const useGeneratedPassword = watch("useGeneratedPassword");

  useEffect(() => {
    fetchDeliveryStaff();
  }, []);

  const fetchDeliveryStaff = async () => {
    try {
      setLoading(true);
      const response = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });

      if (response.data?.users) {
        // Filter only delivery role users
        const deliveryUsers = response.data.users.filter(
          (user) => user.role === "delivery"
        );

        const mappedUsers: DeliveryStaffData[] = deliveryUsers.map((user) => ({
          id: user.id,
          name: user.name || "",
          email: user.email,
          role: "delivery" as UserRole,
          emailVerified: user.emailVerified || false,
          banned: user.banned || false,
          image: user.image ?? undefined,
          createdAt: user.createdAt
            ? new Date(user.createdAt).toISOString()
            : new Date().toISOString(),
          // Default values for delivery-specific fields
          // vehicle: user.vehicle || "Not specified",
          // vehicleType: user.vehicleType || "motorcycle",
          // activeDeliveries: user.activeDeliveries || 0,
          // completedDeliveries: user.completedDeliveries || 0,
          // status: user.status || "offline",
          // currentLocation: user.currentLocation || undefined,
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Failed to fetch delivery staff:", error);
      toast.error("Failed to fetch delivery staff");
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypes = [
    {
      value: "motorcycle" as const,
      label: "Motorcycle",
      icon: "🏍️",
      description: "Fast urban delivery",
    },
    {
      value: "car" as const,
      label: "Car",
      icon: "🚗",
      description: "Standard delivery",
    },
    {
      value: "van" as const,
      label: "Van",
      icon: "🚐",
      description: "Medium capacity",
    },
    {
      value: "truck" as const,
      label: "Truck",
      icon: "🚛",
      description: "Large capacity",
    },
  ];

  const statusOptions = [
    {
      value: "available",
      label: "Available",
      color: "bg-green-100 text-green-800",
    },
    { value: "busy", label: "Busy", color: "bg-red-100 text-red-800" },
    {
      value: "on_break",
      label: "On Break",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "offline", label: "Offline", color: "bg-gray-100 text-gray-800" },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.vehicle &&
        user.vehicle.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesVehicleType =
      selectedVehicleType === "all" || user.vehicleType === selectedVehicleType;
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesVehicleType && matchesStatus;
  });

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const sendWelcomeEmail = async (
    user: DeliveryStaffData,
    password: string,
    isResend = false
  ) => {
    try {
      const response = await fetch("/api/auth/send-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user,
          password,
          isResend,
          requireEmailVerification: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send welcome email");
      }

      return true;
    } catch (error) {
      console.error("Email error:", error);
      return false;
    }
  };

  const onSubmit = async (values: CreateDeliveryStaffFormValues) => {
    try {
      const password = values.useGeneratedPassword
        ? generatePassword()
        : values.password!;

      // Create user with Better Auth - always set role as delivery
      const response = await authClient.admin.createUser({
        name: values.name,
        email: values.email,
        password,
        role: "delivery",
        data: {
          vehicle: values.vehicle,
          vehicleType: values.vehicleType,
          activeDeliveries: 0,
          completedDeliveries: 0,
          status: "offline",
        },
      });

      if ("error" in response && response.error) {
        throw new Error(
          response.error.message || "Failed to create delivery staff"
        );
      }

      const userData = "data" in response ? response.data?.user : response;

      if (!userData?.id) {
        throw new Error("Invalid user data received");
      }

      const newUser: DeliveryStaffData = {
        id: userData.id,
        name: userData.name || values.name,
        email: userData.email,
        role: "delivery",
        emailVerified: userData.emailVerified || false,
        banned: false,
        image: userData.image || "",
        createdAt: new Date().toISOString(),
        vehicle: values.vehicle,
        vehicleType: values.vehicleType,
        activeDeliveries: 0,
        completedDeliveries: 0,
        status: "offline",
      };

      // Send welcome email if requested
      if (values.sendCredentials) {
        const emailSent = await sendWelcomeEmail(newUser, password);
        if (!emailSent) {
          toast.warning(
            "Delivery staff created but welcome email failed to send"
          );
        }
      }

      // Send verification email if required
      if (values.requireEmailVerification) {
        try {
          await authClient.sendVerificationEmail({
            email: values.email,
            callbackURL: `${window.location.origin}/verify-email`,
          });
        } catch (error) {
          console.warn("Failed to send verification email:", error);
        }
      }

      // Update local state
      setUsers((prev) => [...prev, newUser]);
      setShowCreateModal(false);
      form.reset();

      // Show success message
      if (values.useGeneratedPassword && !values.sendCredentials) {
        toast.success(
          `Delivery staff created! Generated password: ${password}`,
          {
            duration: 10000,
          }
        );
      } else {
        toast.success(`Delivery staff ${values.name} created successfully!`);
      }
    } catch (error) {
      console.error("Error creating delivery staff:", error);
      toast.error(
        `Failed to create delivery staff: ${(error as Error).message}`
      );
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setActionLoading(userId);

    try {
      switch (action) {
        case "delete":
          if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            await authClient.admin.removeUser({ userId });
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            toast.success(`${user.name} has been deleted`);
          }
          break;

        case "resend-verification":
          await authClient.sendVerificationEmail({
            email: user.email,
            callbackURL: `${window.location.origin}/verify-email`,
          });
          toast.success(`Verification email sent to ${user.email}`);
          break;
      }
    } catch (error) {
      console.error("Action error:", error);
      toast.error(`Error: ${(error as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // Prevent changing role from delivery to other roles
    if (newRole !== "delivery") {
      toast.error("Cannot change delivery staff role. Remove user instead.");
      return;
    }

    setActionLoading(userId);
    try {
      await authClient.admin.setRole({
        userId,
        role: newRole,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Role change error:", error);
      toast.error(`Error updating role: ${(error as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate stats
  const availableStaff = users.filter((u) => u.status === "available").length;
  const totalActiveDeliveries = users.reduce(
    (sum, u) => sum + (u.activeDeliveries || 0),
    0
  );
  const totalCompletedDeliveries = users.reduce(
    (sum, u) => sum + (u.completedDeliveries || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Delivery Staff Management
          </h1>
          <p className="text-muted-foreground">
            Manage delivery personnel, vehicles, and assignments
          </p>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Delivery Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Delivery Staff</DialogTitle>
              <DialogDescription>
                Create a new delivery staff member with vehicle information
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicleTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <span>{type.icon}</span>
                                    <div>
                                      <div className="font-medium">
                                        {type.label}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {type.description}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Honda CBR 150R" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="useGeneratedPassword"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Generate Password
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Automatically generate a secure password
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!useGeneratedPassword && (
                    <>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="sendCredentials"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Send Welcome Email
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Email login credentials to the delivery staff
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requireEmailVerification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Email Verification
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Require user to verify their email address
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add Staff
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Available Staff</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{availableStaff}</div>
              <p className="text-xs text-muted-foreground">
                of {users.length} total staff
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Active Deliveries</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{totalActiveDeliveries}</div>
              <p className="text-xs text-muted-foreground">
                currently in progress
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Completed Deliveries</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {totalCompletedDeliveries}
              </div>
              <p className="text-xs text-muted-foreground">total completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter delivery staff by name, email, vehicle type, or status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Input
                placeholder="Search delivery staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedVehicleType}
              onValueChange={setSelectedVehicleType}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <div className="rounded-md border">
        <UsersTable
          users={filteredUsers}
          onRoleChange={handleRoleChange}
          onUserAction={handleUserAction}
          actionLoading={actionLoading}
          // isDeliveryStaff={true} // Pass flag to indicate this is delivery staff view
        />
      </div>
    </div>
  );
};

export default DeliveryStaffManagementPage;
