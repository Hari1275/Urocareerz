"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { useOpportunityTypes } from "@/hooks/use-opportunity-types";
import { Plus, Edit, Trash2, Palette } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "./TablePagination";

interface OpportunityTypeFormData {
  name: string;
  description: string;
  color: string;
}

export default function OpportunityTypeManagement() {
  const { toast } = useToast();
  const { opportunityTypes, fetchOpportunityTypes, createOpportunityType } =
    useOpportunityTypes();
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState<OpportunityTypeFormData>({
    name: "",
    description: "",
    color: "blue",
  });
  const [loading, setLoading] = useState(false);

  const pagination = usePagination({ initialPageSize: 10 });
  useEffect(() => {
    pagination.actions.setTotalItems(opportunityTypes.length);
  }, [opportunityTypes, pagination.actions]);
  const paginatedOpportunityTypes = pagination.paginateData(opportunityTypes);

  const colorOptions = [
    { value: "blue", label: "Blue", class: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-100 text-green-800", dot: "bg-green-500" },
    { value: "purple", label: "Purple", class: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
    { value: "yellow", label: "Yellow", class: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
    { value: "teal", label: "Teal", class: "bg-teal-100 text-teal-800", dot: "bg-teal-500" },
    { value: "orange", label: "Orange", class: "bg-orange-100 text-orange-800", dot: "bg-orange-500" },
    { value: "red", label: "Red", class: "bg-red-100 text-red-800", dot: "bg-red-500" },
    { value: "pink", label: "Pink", class: "bg-pink-100 text-pink-800", dot: "bg-pink-500" },
    { value: "indigo", label: "Indigo", class: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-500" },
    { value: "gray", label: "Gray", class: "bg-gray-100 text-gray-800", dot: "bg-gray-500" },
  ];

  const getColorDot = (color: string | undefined) => {
    if (!color) return "bg-gray-500";
    const colorOption = colorOptions.find(option => option.value === color);
    return colorOption ? colorOption.dot : "bg-gray-500";
  };

  const getColorClass = (color: string | undefined) => {
    if (!color) return "bg-gray-100 text-gray-800";
    const colorOption = colorOptions.find(option => option.value === color);
    return colorOption ? colorOption.class : "bg-gray-100 text-gray-800";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingType) {
        // Update existing opportunity type
        const response = await fetch("/api/admin/opportunity-types", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id: editingType.id,
            ...formData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update opportunity type");
        }

        toast({
          title: "Success",
          description: "Opportunity type updated successfully",
        });
      } else {
        // Create new opportunity type
        await createOpportunityType(formData);
        toast({
          title: "Success",
          description: "Opportunity type created successfully",
        });
      }

      setShowForm(false);
      resetForm();
      fetchOpportunityTypes();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "blue",
    });
    setEditingType(null);
  };

  const openEditForm = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
      color: type.color || "blue",
    });
    setShowForm(true);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl text-gray-900">Opportunity Types</h2>
              {/* <CardTitle className="text-xl font-semibold text-gray-900">
                Opportunity Types
              </CardTitle> */}
              <CardDescription>
                Manage different types of opportunities available in the system
              </CardDescription>
            </div>
            <Button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOpportunityTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No opportunity types found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOpportunityTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="text-gray-600">
                        {type.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full ${getColorDot(type.color)}`}
                          ></div>
                          <span className="capitalize">{type.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={type.isActive ? "default" : "secondary"}
                        >
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditForm(type)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          <div className="flex items-center justify-between space-x-6 py-4">
            <TablePagination 
              pagination={pagination}
              showPageSizeSelector={true}
              showPageInfo={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Type Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingType ? (
                <>
                  <Edit className="h-5 w-5" />
                  Edit Opportunity Type
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add New Opportunity Type
                </>
              )}
            </DialogTitle>
            {/* <DialogDescription>
              {editingType
                ? "Update opportunity type details."
                : "Create a new opportunity type for the system."}
            </DialogDescription> */}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Type Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., FELLOWSHIP, JOB, RESEARCH, INTERNSHIP"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this opportunity type"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) =>
                  setFormData({ ...formData, color: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full ${color.dot}`}
                        ></div>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 border rounded-lg">
                <Badge className={getColorClass(formData.color)}>
                  {formData.name || "Sample Type"}
                </Badge>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Saving..." : editingType ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
