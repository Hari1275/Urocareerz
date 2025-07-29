"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserForm from "./UserForm";
import ConfirmationDialog from "./ConfirmationDialog";
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
import { useToast } from "@/hooks/use-toast";
import { useUserFilters } from "@/hooks/use-user-filters";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "./TablePagination";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  UserX,
  UserCheck2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "MENTEE" | "MENTOR" | "ADMIN";
  status: string;
  createdAt: string;
}

export default function UserManagementTable() {
  const { toast } = useToast();
  const { roles, statuses, getRoleLabel, getStatusBadge } = useUserFilters();
  const pagination = usePagination({ initialPageSize: 10 });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Remove the display delay - it was causing input lag
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDisplaySearchQuery(searchQuery);
  //   }, 50); // 50ms delay for smooth typing feel

  //   return () => clearTimeout(timer);
  // }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter, debouncedSearchQuery]);

  // Update pagination when users change
  useEffect(() => {
    pagination.actions.setTotalItems(users.length);
  }, [users, pagination.actions]);

  const fetchUsers = async () => {
    try {
      // Show search loading only if it's a search request
      if (debouncedSearchQuery) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      setActionLoading(userId);

      // Optimistic update
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: "active" } : user
        )
      );

      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to approve user");
      }

      // Refresh data to ensure consistency
      await fetchUsers();
      toast({
        title: "Success",
        description: "User approved successfully",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error approving user:", err);
      toast({
        title: "Error",
        description: "Failed to approve user: " + err.message,
        variant: "destructive",
      });
      // Revert optimistic update on error
      await fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setActionLoading(userId);

      // Optimistic update - remove user from list
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to reject user");
      }

      // Refresh data to ensure consistency
      await fetchUsers();
      toast({
        title: "Success",
        description: "User rejected and deleted successfully",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error rejecting user:", err);
      toast({
        title: "Error",
        description: "Failed to reject user: " + err.message,
        variant: "destructive",
      });
      // Revert optimistic update on error
      await fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setActionLoading(userId);

      // Optimistic update - remove user from list
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Refresh data to ensure consistency
      await fetchUsers();
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast({
        title: "Error",
        description: "Failed to delete user: " + err.message,
        variant: "destructive",
      });
      // Revert optimistic update on error
      await fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      setActionLoading(userId);

      // Optimistic update
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      // Refresh data to ensure consistency
      await fetchUsers();
      toast({
        title: "Success",
        description: `User status updated to ${newStatus} successfully`,
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error updating user status:", err);
      toast({
        title: "Error",
        description: "Failed to update user status: " + err.message,
        variant: "destructive",
      });
      // Revert optimistic update on error
      await fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const openRejectDialog = (user: User) => {
    setUserToDelete(user);
    setShowRejectDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "MENTEE" | "MENTOR" | "ADMIN"
  ) => {
    try {
      setActionLoading(userId);

      // Optimistic update
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Refresh data to ensure consistency
      await fetchUsers();
      toast({
        title: "Success",
        description: `User role updated to ${newRole} successfully`,
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error updating user role:", err);
      toast({
        title: "Error",
        description: "Failed to update user role: " + err.message,
        variant: "destructive",
      });
      // Revert optimistic update on error
      await fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleInfo = roles.find((r) => r.value === role);
    if (roleInfo) {
      const colorMap = {
        ADMIN: "bg-red-100 text-red-800",
        MENTOR: "bg-blue-100 text-blue-800",
        MENTEE: "bg-green-100 text-green-800",
      };
      return (
        <Badge
          className={
            colorMap[role as keyof typeof colorMap] ||
            "bg-gray-100 text-gray-800"
          }
        >
          {roleInfo.label}
        </Badge>
      );
    }
    return <Badge variant="secondary">{role}</Badge>;
  };

  const filteredUsers = users; // Server-side filtering now
  const paginatedUsers = pagination.paginateData(filteredUsers);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <div className="text-sm text-muted-foreground">Loading users...</div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <div className="text-sm text-muted-foreground">
            Error loading users
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchUsers} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <div className="text-sm text-muted-foreground">
                Manage user accounts, roles, and approvals. Total users:{" "}
                {users.length}
              </div>
            </div>
            <Button onClick={handleAddUser} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex items-center space-x-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all duration-150 ease-in-out"
                  disabled={searchLoading}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Role:</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : "No name provided"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {(() => {
                          const statusInfo = getStatusBadge(user.status);
                          return (
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell suppressHydrationWarning>
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {user.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveUser(user.id)}
                                disabled={actionLoading === user.id}
                                className="h-8 px-2"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectDialog(user)}
                                disabled={actionLoading === user.id}
                                className="h-8 px-2 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                                disabled={actionLoading === user.id}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user.id, "MENTEE")
                                }
                                disabled={
                                  actionLoading === user.id ||
                                  user.role === "MENTEE"
                                }
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Set as Mentee
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user.id, "MENTOR")
                                }
                                disabled={
                                  actionLoading === user.id ||
                                  user.role === "MENTOR"
                                }
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Set as Mentor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user.id, "ADMIN")
                                }
                                disabled={
                                  actionLoading === user.id ||
                                  user.role === "ADMIN"
                                }
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Set as Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    user.id,
                                    user.status === "active"
                                      ? "inactive"
                                      : "active"
                                  )
                                }
                                disabled={actionLoading === user.id}
                              >
                                {user.status === "active" ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck2 className="h-4 w-4 mr-2" />
                                    Activate User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(user)}
                                disabled={actionLoading === user.id}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {paginatedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : "No name provided"}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        {getRoleBadge(user.role)}
                        {(() => {
                          const statusInfo = getStatusBadge(user.status);
                          return (
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500" suppressHydrationWarning>
                      Created: {formatDate(user.createdAt)}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {user.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRejectDialog(user)}
                            disabled={actionLoading === user.id}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <MoreHorizontal className="h-4 w-4 mr-1" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                            disabled={actionLoading === user.id}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "MENTEE")}
                            disabled={
                              actionLoading === user.id ||
                              user.role === "MENTEE"
                            }
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Set as Mentee
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "MENTOR")}
                            disabled={
                              actionLoading === user.id ||
                              user.role === "MENTOR"
                            }
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Set as Mentor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "ADMIN")}
                            disabled={
                              actionLoading === user.id || user.role === "ADMIN"
                            }
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Set as Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(
                                user.id,
                                user.status === "active" ? "inactive" : "active"
                              )
                            }
                            disabled={actionLoading === user.id}
                          >
                            {user.status === "active" ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate User
                              </>
                            ) : (
                              <>
                                <UserCheck2 className="h-4 w-4 mr-2" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(user)}
                            disabled={actionLoading === user.id}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          <TablePagination 
            pagination={pagination}
            showPageSizeSelector={true}
            showPageInfo={true}
          />
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <UserForm
        open={showUserForm}
        onOpenChange={setShowUserForm}
        user={editingUser}
        onSuccess={fetchUsers}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete User"
        description={`Are you sure you want to delete ${
          userToDelete?.firstName || userToDelete?.email
        }? This action cannot be undone.`}
        confirmText="Delete User"
        variant="destructive"
        onConfirm={() => {
          if (userToDelete) {
            handleDeleteUser(userToDelete.id);
            setShowDeleteDialog(false);
          }
        }}
        loading={actionLoading === userToDelete?.id}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmationDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        title="Reject User"
        description={`Are you sure you want to reject and delete ${
          userToDelete?.firstName || userToDelete?.email
        }? This action cannot be undone.`}
        confirmText="Reject User"
        variant="destructive"
        onConfirm={() => {
          if (userToDelete) {
            handleRejectUser(userToDelete.id);
            setShowRejectDialog(false);
          }
        }}
        loading={actionLoading === userToDelete?.id}
      />
    </>
  );
}
