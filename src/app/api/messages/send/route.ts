import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { sendMentorMessageEmail, isValidEmail, EmailMentorMessageData } from "../../../../lib/email";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const payload = await verifyEdgeToken(token, process.env.JWT_SECRET!);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 401 }
      );
    }

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Verify user is a mentor
    if (user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can send messages to mentees." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { menteeEmail, menteeName, subject, message } = body;

    // Validate required fields
    if (!menteeEmail || !menteeName || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields. Please provide menteeEmail, menteeName, subject, and message." },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(menteeEmail)) {
      return NextResponse.json(
        { error: "Invalid mentee email format." },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject line is too long. Maximum 200 characters allowed." },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long. Maximum 5000 characters allowed." },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData: EmailMentorMessageData = {
      mentorEmail: user.email,
      mentorName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      menteeEmail,
      menteeName,
      subject: subject.trim(),
      message: message.trim(),
    };

    // Send email using Brevo service
    const result = await sendMentorMessageEmail(emailData);

    if (!result.success) {
      console.error("Failed to send mentor message:", result.error);
      return NextResponse.json(
        { 
          error: "Failed to send message. Please try again later.",
          details: result.error 
        },
        { status: 500 }
      );
    }

    // Log successful message sending for analytics
    console.log(`Message sent from ${emailData.mentorEmail} to ${emailData.menteeEmail}`);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully!",
      messageId: result.messageId,
    }, { status: 200 });

  } catch (error) {
    console.error("Error in send message API:", error);
    return NextResponse.json(
      { 
        error: "Internal server error. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to send messages." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to send messages." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to send messages." },
    { status: 405 }
  );
}