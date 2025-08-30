"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Plus,
  Search,
  // MessageSquare,
  X,
  FileText,
  UserCheck,
} from "lucide-react";

type ActiveSection =
  | "main"
  | "opportunities"
  | "applications"
  | "post-opportunity"
  | "find-mentees"
  | "discussions";

interface MenuItem {
  id: ActiveSection;
  label: string;
  icon: any;
  description?: string;
}

interface SidebarStats {
  pendingApplications?: number;
  totalOpportunities?: number;
  totalApplications?: number;
}

interface MentorDashboardSidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  stats?: SidebarStats;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "main",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & quick actions",
  },
  {
    id: "opportunities",
    label: "My Opportunities",
    icon: Briefcase,
    description: "Manage your posted opportunities",
  },
  {
    id: "applications",
    label: "Applications",
    icon: FileText,
    description: "Review mentee applications",
  },
  {
    id: "find-mentees",
    label: "Find Mentees",
    icon: UserCheck,
    description: "Search for potential mentees",
  },
  // {
  //   id: 'discussions',
  //   label: 'Discussions',
  //   icon: MessageSquare,
  //   description: 'Community discussions'
  // },
];

const quickActions: MenuItem[] = [
  {
    id: "post-opportunity",
    label: "Post Opportunity",
    icon: Plus,
    description: "Share new opportunities",
  },
];

export default function MentorDashboardSidebar({
  activeSection,
  onSectionChange,
  stats = {},
  isOpen = false,
  onClose,
  className = "",
}: MentorDashboardSidebarProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSectionClick = (sectionId: ActiveSection) => {
    onSectionChange(sectionId);
    if (onClose) {
      onClose(); // Close mobile menu after selection
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white lg:bg-transparent">
      {/* Mobile Header with Branding */}
      {onClose && (
        <div className="flex items-center justify-between p-6 border-b border-slate-200/60 lg:hidden bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Mentor Dashboard
              </h2>
              <p className="text-xs text-slate-600">Navigation Menu</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 p-4 lg:p-0">
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 lg:m-4 lg:flex-1">
          <CardContent className="p-6">
            {/* Primary Navigation */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                Main Menu
              </h3>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group min-h-[48px]",
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-all duration-200 flex-shrink-0",
                          isActive
                            ? "text-white"
                            : "text-slate-500 group-hover:text-slate-700"
                        )}
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium leading-tight">
                          {item.label}
                        </div>
                        {item.description && !isActive && (
                          <div className="text-xs text-slate-500 mt-0.5 leading-tight">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.id === "applications" &&
                        stats.pendingApplications &&
                        stats.pendingApplications > 0 && (
                          <Badge
                            variant={isActive ? "secondary" : "outline"}
                            className={cn(
                              "ml-auto h-5 min-w-[20px] text-xs font-semibold",
                              isActive
                                ? "bg-white/20 text-white border-white/30"
                                : "bg-orange-50 text-orange-600 border-orange-200"
                            )}
                          >
                            {stats.pendingApplications}
                          </Badge>
                        )}
                      {item.id === "opportunities" &&
                        stats.totalOpportunities &&
                        stats.totalOpportunities > 0 && (
                          <Badge
                            variant={isActive ? "secondary" : "outline"}
                            className={cn(
                              "ml-auto h-5 min-w-[20px] text-xs font-semibold",
                              isActive
                                ? "bg-white/20 text-white border-white/30"
                                : "bg-green-50 text-green-600 border-green-200"
                            )}
                          >
                            {stats.totalOpportunities}
                          </Badge>
                        )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <Separator className="my-6" />

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                Quick Actions
              </h3>
              <div className="space-y-1">
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group min-h-[48px]",
                        isActive
                          ? item.id === "post-opportunity"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-all duration-200 flex-shrink-0",
                          isActive
                            ? "text-white"
                            : "text-slate-500 group-hover:text-slate-700"
                        )}
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium leading-tight">
                          {item.label}
                        </div>
                        {item.description && !isActive && (
                          <div className="text-xs text-slate-500 mt-0.5 leading-tight">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {onClose && isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose}>
          <div className="fixed inset-0 bg-slate-600/75 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar - Works for both mobile and desktop */}
      <aside
        className={cn(
          // Base classes for all screens
          "lg:col-span-3",
          // Mobile classes (when onClose is provided)
          onClose
            ? [
                "fixed lg:sticky lg:top-24 inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:h-[calc(100vh-6rem)]",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "lg:block lg:w-auto lg:shadow-none lg:transform-none",
              ]
            : [],
          className
        )}
      >
        <div
          className={cn(
            "sticky top-20 sm:top-24 space-y-4 sm:space-y-6",
            onClose ? "lg:block" : ""
          )}
        >
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
