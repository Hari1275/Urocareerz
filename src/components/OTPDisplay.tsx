'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OTPDisplayProps {
  email: string;
  onOTPSubmit: (otp: string) => void;
  onResendOTP: () => void;
  isLoading?: boolean;
  isResending?: boolean;
  showDevOTP?: boolean; // New prop to control dev OTP display
}

export function OTPDisplay({ 
  email, 
  onOTPSubmit, 
  onResendOTP, 
  isLoading = false, 
  isResending = false,
  showDevOTP = false // Default to false to hide dev OTP
}: OTPDisplayProps) {
  const [otp, setOtp] = useState('');
  const [devOTP, setDevOTP] = useState<string | null>(null);
  const [showDevOTPDisplay, setShowDevOTPDisplay] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onOTPSubmit(otp);
    }
  };

  const handleResendClick = () => {
    // Clear the OTP input when resend is clicked
    setOtp('');
    onResendOTP();
  };

  const handleSendOTP = async () => {
    try {
      const response = await fetch('/api/login/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // In development, show OTP on screen
        if (data.otp) {
          setDevOTP(data.otp);
          setShowDevOTPDisplay(true);
        }
      } else {
        console.error('Failed to send OTP:', data.error);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-bold text-center">Enter OTP</CardTitle>
        <p className="text-sm text-gray-600 text-center px-2">
          We&apos;ve sent a 6-digit code to <strong className="break-all">{email}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-lg tracking-widest input-primary h-12"
              disabled={isLoading}
            />
          </div>

          {/* Development OTP Display - Only show if showDevOTP prop is true */}
          {showDevOTP && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendOTP}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Send OTP (Dev)'}
              </Button>
              
              {showDevOTPDisplay && devOTP && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 font-medium">Development Mode</p>
                  <p className="text-lg font-mono text-yellow-900 text-center">
                    OTP: {devOTP}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This OTP is displayed for development purposes only
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full btn-primary h-12"
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResendClick}
              disabled={isResending}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {isResending ? 'Resending...' : "Didn't receive code? Resend"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 