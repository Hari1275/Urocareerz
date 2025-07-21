import { prisma } from "./prisma";

export interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  /**
   * Log an audit event to the database
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          userId: data.userId,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error("Failed to log audit event:", error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  /**
   * Log user approval/rejection
   */
  static async logUserAction(
    action: "USER_APPROVED" | "USER_REJECTED" | "USER_ROLE_CHANGED",
    userId: string,
    targetUserId: string,
    adminId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action,
      entityType: "User",
      entityId: targetUserId,
      userId: adminId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log opportunity approval/rejection/deletion
   */
  static async logOpportunityAction(
    action: "OPPORTUNITY_APPROVED" | "OPPORTUNITY_REJECTED" | "OPPORTUNITY_DELETED",
    opportunityId: string,
    adminId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action,
      entityType: "Opportunity",
      entityId: opportunityId,
      userId: adminId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log mentee opportunity approval/rejection
   */
  static async logMenteeOpportunityAction(
    action: "MENTEE_OPPORTUNITY_APPROVED" | "MENTEE_OPPORTUNITY_REJECTED" | "MENTEE_OPPORTUNITY_DELETED",
    menteeOpportunityId: string,
    adminId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action,
      entityType: "MenteeOpportunity",
      entityId: menteeOpportunityId,
      userId: adminId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log discussion moderation actions
   */
  static async logDiscussionAction(
    action: "DISCUSSION_APPROVED" | "DISCUSSION_REJECTED" | "DISCUSSION_DELETED" | "DISCUSSION_STATUS_CHANGED",
    discussionId: string,
    adminId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action,
      entityType: "Discussion",
      entityId: discussionId,
      userId: adminId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log user registration
   */
  static async logUserRegistration(
    userId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: userId,
      userId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log user login
   */
  static async logUserLogin(
    userId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: "USER_LOGIN",
      entityType: "User",
      entityId: userId,
      userId,
      details,
      ipAddress,
      userAgent,
    });
  }
} 