"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  MoreHorizontal,
  Mail,
  Shield,
  Trash2,
  Ban,
  UserCheck,
  Loader2,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import { UserData, UserRole } from "@/types/user-type";
import { roles } from "@/lib/constants/userRole";

interface UsersTableProps {
  users: UserData[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onUserAction: (action: string, userId: string) => void;
  actionLoading: string | null;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onRoleChange,
  onUserAction,
  actionLoading,
}) => {
  const getRoleIcon = (role: UserRole) => {
    const roleConfig = roles.find((r) => r.value === role);
    const Icon = roleConfig?.icon || Users;
    return <Icon className="h-4 w-4" />;
  };

  const getRoleVariant = (role: UserRole) => {
    return roles.find((r) => r.value === role)?.variant || "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole: UserRole) =>
                          onRoleChange(user.id, newRole)
                        }
                        disabled={actionLoading === user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge variant={getRoleVariant(user.role)}>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(user.role)}
                                {user.role}
                              </div>
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center gap-2">
                                <role.icon className="h-4 w-4" />
                                {role.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.banned ? (
                          <Badge variant="destructive">
                            <Ban className="mr-1 h-3 w-3" />
                            Banned
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        )}
                        {user.emailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() =>
                              onUserAction("resend-credentials", user.id)
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Credentials
                          </DropdownMenuItem>

                          {!user.emailVerified && (
                            <DropdownMenuItem
                              onClick={() =>
                                onUserAction("resend-verification", user.id)
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Send Verification
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          {user.banned ? (
                            <DropdownMenuItem
                              onClick={() => onUserAction("unban", user.id)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => onUserAction("ban", user.id)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => onUserAction("delete", user.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
