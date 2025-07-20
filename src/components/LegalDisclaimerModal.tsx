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
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] bg-white rounded-xl shadow-2xl border-0">
        <DialogHeader className="text-center sm:text-left bg-gradient-to-r from-primary-50 to-secondary-50 p-6 -mx-6 -mt-6 rounded-t-xl">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            Welcome to UroCareerz
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600 mt-2">
            We want to ensure you understand how we protect your data and what
            we expect from our community. Please take a moment to review our
            terms.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] sm:max-h-[60vh] pr-2 sm:pr-4">
          <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">
                Terms of Service
              </h3>
              <div className="space-y-3 text-gray-700 text-xs sm:text-sm">
                <p>
                  By using UroCareerz, you agree to these terms of service. This
                  platform is designed to connect mentors and mentees in the
                  field of urology.
                </p>
                <p>
                  <strong>User Responsibilities:</strong>
                </p>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
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
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
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
              <h3 className="font-semibold text-base sm:text-lg mb-2">
                Privacy Policy
              </h3>
              <div className="space-y-3 text-gray-700 text-xs sm:text-sm">
                <p>
                  We are committed to protecting your privacy and handling your
                  data responsibly.
                </p>
                <p>
                  <strong>Data Collection:</strong>
                </p>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
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
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
                  <li>To provide and maintain the platform services</li>
                  <li>To facilitate connections between mentors and mentees</li>
                  <li>To send important notifications and updates</li>
                  <li>To improve platform functionality and user experience</li>
                </ul>
                <p>
                  <strong>Data Protection:</strong>
                </p>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
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
              <h3 className="font-semibold text-base sm:text-lg mb-2">
                Disclaimer
              </h3>
              <div className="space-y-3 text-gray-700 text-xs sm:text-sm">
                <p>
                  UroCareerz is a platform for connecting professionals in
                  urology. We do not:
                </p>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 flex-shrink-0"
            />
            <Label
              htmlFor="accept-terms"
              className="text-xs sm:text-sm leading-relaxed cursor-pointer flex-1"
            >
              I agree to the{" "}
              <span className="font-semibold text-blue-600">Terms</span> and{" "}
              <span className="font-semibold text-blue-600">
                Privacy Policy
              </span>
            </Label>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onDecline}
            className="w-full sm:w-auto order-2 sm:order-1 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 text-sm"
          >
            I'll Read Later
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm font-medium"
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
