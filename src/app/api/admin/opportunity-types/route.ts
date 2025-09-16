import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function handler(request: NextRequest) {
  if (request.method === "GET") {
    try {
      // Get all opportunity types
      const opportunityTypes = await prisma.opportunityType.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ opportunityTypes });
    } catch (error) {
      console.error("Error fetching opportunity types:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();
      const { name, description, color } = body;

      if (!name) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 }
        );
      }

      // Check if type already exists
      const existingType = await prisma.opportunityType.findUnique({
        where: { name },
      });

      if (existingType) {
        return NextResponse.json(
          { error: "Opportunity type already exists" },
          { status: 400 }
        );
      }

      // Create new opportunity type
      const opportunityType = await prisma.opportunityType.create({
        data: {
          name,
          description,
          color,
        },
      });

      return NextResponse.json({ opportunityType }, { status: 201 });
    } catch (error) {
      console.error("Error creating opportunity type:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  if (request.method === "PUT") {
    try {
      const body = await request.json();
      const { id, name, description, color } = body;

      if (!id || !name) {
        return NextResponse.json(
          { error: "ID and name are required" },
          { status: 400 }
        );
      }

      // Check if type exists
      const existingType = await prisma.opportunityType.findUnique({
        where: { id },
      });

      if (!existingType) {
        return NextResponse.json(
          { error: "Opportunity type not found" },
          { status: 404 }
        );
      }

      // Check if name is being changed and if it conflicts with another type
      if (name !== existingType.name) {
        const nameConflict = await prisma.opportunityType.findUnique({
          where: { name },
        });

        if (nameConflict) {
          return NextResponse.json(
            { error: "Opportunity type with this name already exists" },
            { status: 400 }
          );
        }
      }

      // Update opportunity type
      const updatedType = await prisma.opportunityType.update({
        where: { id },
        data: {
          name,
          description,
          color,
        },
      });

      return NextResponse.json({ opportunityType: updatedType });
    } catch (error) {
      console.error("Error updating opportunity type:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  if (request.method === "DELETE") {
    try {
      const body = await request.json();
      const { id } = body;

      if (!id) {
        return NextResponse.json(
          { error: "ID is required" },
          { status: 400 }
        );
      }

      // Check if type exists
      const existingType = await prisma.opportunityType.findUnique({
        where: { id },
      });

      if (!existingType) {
        return NextResponse.json(
          { error: "Opportunity type not found" },
          { status: 404 }
        );
      }

      // Check if there are any opportunities using this type
      const opportunitiesUsingType = await prisma.opportunity.count({
        where: { opportunityTypeId: existingType.id },
      });

      if (opportunitiesUsingType > 0) {
        return NextResponse.json(
          { 
            error: `Cannot delete opportunity type '${existingType.name}' because it is being used by ${opportunitiesUsingType} opportunity(ies). Please remove or change the type of these opportunities first.` 
          },
          { status: 400 }
        );
      }

      // Delete the opportunity type
      await prisma.opportunityType.delete({
        where: { id },
      });

      return NextResponse.json({ 
        message: "Opportunity type deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting opportunity type:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = withAdminAuth(handler);
export const POST = withAdminAuth(handler);
export const PUT = withAdminAuth(handler);
export const DELETE = withAdminAuth(handler);
