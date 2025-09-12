"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Edit } from "lucide-react";

interface User {
  id?: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "MENTEE" | "MENTOR" | "ADMIN";
}

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
}

export default function UserForm({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormProps) {
  const [formData, setFormData] = useState<User>({
    email: "",
    firstName: "",
    lastName: "",
    role: "MENTEE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!user?.id;

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } else {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        role: "MENTEE",
      });
    }
    setError(null);
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/users/${user!.id}`
        : "/api/admin/users";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save user");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5" />
                Edit User
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Add New User
              </>
            )}
          </DialogTitle>
          {/* <DialogDescription>
            {isEditing
              ? "Update user information and role."
              : "Create a new user account with specified role."}
          </DialogDescription> */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName || ""}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              required
              disabled={isEditing} // Don't allow email changes for existing users
            />
            {/* {isEditing && (
              <p className="text-xs text-gray-500">
                Email cannot be changed for existing users
              </p>
            )} */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "MENTEE" | "MENTOR" | "ADMIN") =>
                handleInputChange("role", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MENTEE">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-800">
                      Mentee
                    </Badge>
                    {/* <span>Student seeking mentorship</span> */}
                  </div>
                </SelectItem>
                <SelectItem value="MENTOR">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Mentor</Badge>
                    {/* <span>Professional offering guidance</span> */}
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Admin</Badge>
                    {/* <span>System administrator</span> */}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
