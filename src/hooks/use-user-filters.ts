import { useState } from "react";

export interface UserRole {
  value: string;
  label: string;
  description?: string;
}

export interface UserStatus {
  value: string;
  label: string;
  color: string;
}

export function useUserFilters() {
  const [roles, setRoles] = useState<UserRole[]>([
    {
      value: "MENTEE",
      label: "Mentee",
      description: "Student or early career professional",
    },
    {
      value: "MENTOR",
      label: "Mentor",
      description: "Experienced professional providing guidance",
    },
    { value: "ADMIN", label: "Admin", description: "System administrator" },
  ]);

  const [statuses, setStatuses] = useState<UserStatus[]>([
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    {
      value: "pending",
      label: "Pending",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "suspended",
      label: "Suspended",
      color: "bg-red-100 text-red-800",
    },
    { value: "deleted", label: "Deleted", color: "bg-gray-100 text-gray-800" },
  ]);

  const getRoleLabel = (role: string) => {
    const foundRole = roles.find((r) => r.value === role);
    return foundRole?.label || role;
  };

  const getStatusBadge = (status: string) => {
    const foundStatus = statuses.find((s) => s.value === status);
    return (
      foundStatus || {
        value: status,
        label: status,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const addRole = (role: UserRole) => {
    setRoles((prev) => [...prev, role]);
  };

  const addStatus = (status: UserStatus) => {
    setStatuses((prev) => [...prev, status]);
  };

  return {
    roles,
    statuses,
    getRoleLabel,
    getStatusBadge,
    addRole,
    addStatus,
  };
}
