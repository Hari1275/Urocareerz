"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalDisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function LegalDisclaimerModal({
  open,
  onAccept,
  onDecline,
}: LegalDisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Welcome to UroCareerz - Terms of Service & Privacy Policy
          </DialogTitle>
          <DialogDescription>
            Please read and accept our terms of service and privacy policy to
            continue.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-semibold text-lg mb-2">Terms of Service</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  By using UroCareerz, you agree to these terms of service. This
                  platform is designed to connect mentors and mentees in the
                  field of urology.
                </p>
                <p>
                  <strong>User Responsibilities:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Provide accurate and truthful information in your profile
                  </li>
                  <li>Maintain professional conduct in all interactions</li>
                  <li>
                    Respect the privacy and confidentiality of other users
                  </li>
                  <li>
                    Not use the platform for any illegal or unauthorized purpose
                  </li>
                  <li>
                    Not share personal information of other users without
                    consent
                  </li>
                </ul>
                <p>
                  <strong>Platform Usage:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Mentees can browse opportunities, apply for positions, and
                    connect with mentors
                  </li>
                  <li>
                    Mentors can post opportunities, review applications, and
                    provide guidance
                  </li>
                  <li>
                    All content must be professional and relevant to urology
                  </li>
                  <li>
                    Users are responsible for their own professional development
                    and decisions
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Privacy Policy</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  We are committed to protecting your privacy and handling your
                  data responsibly.
                </p>
                <p>
                  <strong>Data Collection:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email address for authentication and communication</li>
                  <li>
                    Profile information (name, location, education, experience)
                  </li>
                  <li>Application materials (CV, cover letters)</li>
                  <li>Platform usage data for service improvement</li>
                </ul>
                <p>
                  <strong>Data Usage:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>To provide and maintain the platform services</li>
                  <li>To facilitate connections between mentors and mentees</li>
                  <li>To send important notifications and updates</li>
                  <li>To improve platform functionality and user experience</li>
                </ul>
                <p>
                  <strong>Data Protection:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All data is encrypted and stored securely</li>
                  <li>
                    We do not sell or share your personal data with third
                    parties
                  </li>
                  <li>
                    You can request deletion of your account and data at any
                    time
                  </li>
                  <li>We comply with applicable data protection regulations</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Disclaimer</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  UroCareerz is a platform for connecting professionals in
                  urology. We do not:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Guarantee employment or mentorship outcomes</li>
                  <li>Verify the credentials or qualifications of users</li>
                  <li>Provide medical advice or professional services</li>
                  <li>Endorse any specific opportunities or users</li>
                </ul>
                <p>
                  Users are responsible for conducting their own due diligence
                  and making informed decisions about their professional
                  development.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 pt-4 border-t">
          <Checkbox
            id="accept-terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
          />
          <Label htmlFor="accept-terms" className="text-sm">
            I have read and agree to the Terms of Service and Privacy Policy
          </Label>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={!accepted}>
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
