"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to registration if no userId is provided
    if (!userId) {
      router.push("/register");
    }
  }, [userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // If verification is successful, redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userId) return;

    setError(null);
    setResending(true);

    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification code");
      }

      // In development mode, show the OTP
      if (data.otp) {
        setDevOtp(data.otp);
      }

      // Show success message
      setError("A new verification code has been sent to your email");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="auth-layout">
      <div className="w-full max-w-md fade-in">
        <Card className="glass-card">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Verify Your Email
            </CardTitle>
            <div className="text-sm text-muted-foreground text-center">
              Enter the 6-digit code sent to your email
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center text-xl tracking-widest input-primary"
                />
                {devOtp && process.env.NODE_ENV === "development" && (
                  <p className="text-xs text-gray-500 mt-2">
                    Development mode: OTP is {devOtp}
                  </p>
                )}
              </div>
              {error && (
                <div
                  className={`p-3 text-sm border rounded-md ${
                    error.includes("sent")
                      ? "text-green-500 bg-green-50 border-green-200"
                      : "text-red-500 bg-red-50 border-red-200"
                  }`}
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t pt-4">
            <p className="text-sm text-gray-500">Didn&apos;t receive a code?</p>
            <Button
              variant="link"
              className="p-0 h-auto text-primary-600"
              onClick={handleResendOTP}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend Code"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
