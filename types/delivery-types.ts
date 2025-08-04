export interface DeliveryStaffUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "delivery";
  vehicle?: string;
  vehicleType?: "motorcycle" | "car" | "van" | "truck";
  activeDeliveries: number;
  completedDeliveries: number;
  status: "available" | "busy" | "offline" | "on_break";
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  emailVerified: boolean;
  banned: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
