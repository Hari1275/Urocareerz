"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Edit3 } from "lucide-react";

/**
 * RESPONSIVE PROFILE STRENGTH REFACTOR - Key Changes:
 * 1. Progress ring maintains 1:1 aspect ratio and scales with font-size
 * 2. Responsive text sizing and spacing for 1200px+ viewports
 * 3. Improved layout for call-to-action section
 * 4. Better spacing and padding for larger screens
 * 5. Enhanced readability across all device sizes
 */

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface Profile {
  id?: string;
  bio?: string | null;
  location?: string | null;
  avatar?: string | null;
  resume?: string | null;
  education?: string | null;
  interests?: string[];
  purposeOfRegistration?: string | null;
  specialty?: string | null;
  subSpecialty?: string | null;
  workplace?: string | null;
  availabilityStatus?: string;
  yearsOfExperience?: number | null;
}

interface ProfileStrengthProps {
  user?: User | null;
  profile?: Profile | null;
  className?: string;
  onEdit?: () => void;
}

interface ProfileField {
  name: string;
  label: string;
  weight: number;
  isComplete: boolean;
  required?: boolean;
}

export default function ProfileStrength({ user, profile, className, onEdit }: ProfileStrengthProps) {
  const [profileFields, setProfileFields] = useState<ProfileField[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateProfileStrength = () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const baseFields: ProfileField[] = [
        {
          name: "basicInfo",
          label: "Basic Information",
          weight: 20,
          isComplete: !!(user.firstName && user.lastName && user.email),
          required: true
        },
        {
          name: "avatar",
          label: "Profile Photo",
          weight: 15,
          isComplete: !!(profile?.avatar && 
            profile.avatar !== "https://example.com" && 
            !profile.avatar.startsWith("local-")),
          required: false
        },
        {
          name: "bio", 
          label: "Biography",
          weight: 15,
          isComplete: !!(profile?.bio && profile.bio.trim().length > 10),
          required: false
        },
        {
          name: "location",
          label: "Location",
          weight: 10,
          isComplete: !!(profile?.location && profile.location.trim().length > 0),
          required: false
        }
      ];

      // Role-specific fields
      if (user.role === "MENTEE") {
        baseFields.push(
          {
            name: "education",
            label: "Education",
            weight: 15,
            isComplete: !!(profile?.education && profile.education.trim().length > 0),
            required: true
          },
          {
            name: "interests",
            label: "Interests",
            weight: 10,
            isComplete: !!(profile?.interests && profile.interests.length > 0),
            required: false
          },
          {
            name: "purpose",
            label: "Purpose of Registration", 
            weight: 10,
            isComplete: !!(profile?.purposeOfRegistration && profile.purposeOfRegistration.trim().length > 0),
            required: false
          },
          {
            name: "resume",
            label: "Resume Upload",
            weight: 15,
            isComplete: !!(profile?.resume && 
              profile.resume !== "https://example.com" && 
              !profile.resume.startsWith("local-")),
            required: true
          }
        );
      } else if (user.role === "MENTOR") {
        baseFields.push(
          {
            name: "specialty",
            label: "Specialty",
            weight: 20,
            isComplete: !!(profile?.specialty && profile.specialty.trim().length > 0),
            required: true
          },
          {
            name: "workplace",
            label: "Workplace",
            weight: 15,
            isComplete: !!(profile?.workplace && profile.workplace.trim().length > 0),
            required: true
          },
          {
            name: "experience",
            label: "Years of Experience",
            weight: 10,
            isComplete: !!(profile?.yearsOfExperience && profile.yearsOfExperience > 0),
            required: false
          },
          {
            name: "availability",
            label: "Availability Status",
            weight: 5,
            isComplete: !!(profile?.availabilityStatus),
            required: false
          }
        );
      }

      setProfileFields(baseFields);

      // Calculate weighted completion percentage
      const totalWeight = baseFields.reduce((sum, field) => sum + field.weight, 0);
      const completedWeight = baseFields
        .filter(field => field.isComplete)
        .reduce((sum, field) => sum + field.weight, 0);
      
      const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
      setCompletionPercentage(percentage);
      setLoading(false);
    };

    calculateProfileStrength();
  }, [user, profile]);

  const getStatusColor = (isComplete: boolean, required: boolean = false) => {
    if (isComplete) return "bg-green-500";
    if (required) return "bg-red-500";
    return "bg-amber-500";
  };

  const getStatusLabel = (isComplete: boolean, required: boolean = false) => {
    if (isComplete) return "Complete";
    if (required) return "Required";
    return "Optional";
  };

  if (loading) {
    return (
      <Card className={`bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 w-full ${className || ""}`}>
        <CardHeader className="pb-3 xl:pb-4">
          <CardTitle className="text-base xl:text-lg font-semibold text-slate-900 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="h-4 w-4 xl:h-5 xl:w-5 text-blue-500 flex-shrink-0" />
              <span className="truncate">Profile Strength</span>
            </div>
            {onEdit && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onEdit}
                className="text-xs bg-white/80 border-slate-200 hover:bg-white flex-shrink-0"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-4 bg-slate-200 rounded w-10"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <div className="h-4 bg-slate-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 w-full ${className || ""}`}>
      <CardHeader className="pb-3 xl:pb-4">
        <CardTitle className="text-base xl:text-lg font-semibold text-slate-900 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Target className="h-4 w-4 xl:h-5 xl:w-5 text-blue-500 flex-shrink-0" />
            <span className="truncate">Profile Strength</span>
          </div>
          {onEdit && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onEdit}
              className="text-xs bg-white/80 border-slate-200 hover:bg-white flex-shrink-0"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 xl:space-y-5">
          {/* Progress Section - Responsive sizing */}
          <div>
            <div className="flex justify-between items-center mb-2 xl:mb-3">
              <span className="text-sm xl:text-base font-medium text-slate-700">Completion</span>
              <span className="text-sm xl:text-base font-bold text-slate-900">{completionPercentage}%</span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-2 xl:h-2.5"
            />
          </div>
          
          {/* Profile Fields List - Responsive spacing */}
          <div className="space-y-2 xl:space-y-2.5">
            {profileFields.map((field) => (
              <div key={field.name} className="flex items-center gap-2 xl:gap-3 text-sm xl:text-base">
                <div 
                  className={`w-2 h-2 xl:w-2.5 xl:h-2.5 rounded-full ${getStatusColor(field.isComplete, field.required)}`}
                  title={getStatusLabel(field.isComplete, field.required)}
                ></div>
                <span className="text-slate-600 flex-1 truncate">{field.label}</span>
                {field.required && !field.isComplete && (
                  <span className="text-xs xl:text-sm text-red-500 font-medium flex-shrink-0">Required</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Call-to-Action Section - Responsive layout */}
          {completionPercentage < 100 && (
            <div className="mt-4 xl:mt-5 p-3 xl:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col gap-3">
                <div className="flex-1">
                  <p className="text-xs xl:text-sm text-blue-700 leading-relaxed">
                    Complete your profile to improve your visibility and get better opportunities!
                  </p>
                </div>
                {onEdit && (
                  <Button 
                    size="sm" 
                    onClick={onEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs xl:text-sm px-3 xl:px-4 py-1.5 xl:py-2 h-auto w-full sm:w-auto"
                  >
                    <span className="block sm:hidden">Complete Profile</span>
                    <span className="hidden sm:block">Complete Profile</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}