"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Heart,
  User,
  Send,
  MessageSquare,
  Plus,
  X
} from "lucide-react";

/**
 * RESPONSIVE SIDEBAR REFACTOR - Key Changes:
 * 1. Fluid width between 280px-340px for viewports ≥1200px
 * 2. Auto-adjusting content to prevent wrapping/overflow
 * 3. Improved text truncation and responsive labels
 * 4. Better spacing and padding for larger screens
 * 5. Enhanced mobile/tablet experience
 */

type ActiveSection = 
  | 'dashboard'
  | 'opportunities'
  | 'applications'
  | 'submissions'
  | 'saved'
  | 'submit-opportunity'
  | 'discussions'
  | 'new-discussion';

interface MenuItem {
  id: ActiveSection;
  label: string;
  icon: any;
}

interface SidebarStats {
  pendingApplications: number;
}

interface DashboardSidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  stats?: SidebarStats;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'opportunities', label: 'Find Opportunities', icon: FileText },
  { id: 'applications', label: 'My Applications', icon: Send },
  { id: 'saved', label: 'Saved List', icon: Heart },
  { id: 'submissions', label: 'My Posted Opportunities', icon: User },
];

export default function DashboardSidebar({
  activeSection,
  onSectionChange,
  stats = { pendingApplications: 0 },
  isOpen = false,
  onClose,
  className = ""
}: DashboardSidebarProps) {
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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200/60 lg:hidden bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Navigation</h2>
              <p className="text-xs text-slate-600">UroCareerz Dashboard</p>
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

      {/* Navigation Menu - Scrollable with responsive padding */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-0">
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 lg:m-2 xl:m-3 2xl:m-4">
          <CardContent className="p-3 sm:p-4 lg:p-4 xl:p-5 2xl:p-6">
            {/* Primary Navigation */}
            <div className="mb-5 xl:mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Main Menu</h3>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      title={item.label}
                      aria-label={item.label}
                      className={cn(
                        "w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 xl:py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                      )}
                    >
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <Icon className={cn(
                          "w-4 h-4 transition-all duration-200", 
                          isActive 
                            ? "text-white" 
                            : "text-slate-500 group-hover:text-slate-700"
                        )} />
                      </div>
                      <span className="font-medium text-left flex-1 min-w-0 leading-5">
                        {item.id === 'submissions' ? (
                          <>
                            <span className="block sm:hidden">My Posts</span>
                            <span className="hidden sm:block lg:hidden">My Posted</span>
                            <span className="hidden lg:block xl:hidden">My Posted Opps</span>
                            <span className="hidden xl:block">My Posted Opportunities</span>
                          </>
                        ) : item.id === 'opportunities' ? (
                          <>
                            <span className="block lg:hidden">Find Opportunities</span>
                            <span className="hidden lg:block xl:hidden">Find Opps</span>
                            <span className="hidden xl:block">Find Opportunities</span>
                          </>
                        ) : (
                          <span className="block">{item.label}</span>
                        )}
                      </span>
                      {item.id === 'applications' && stats.pendingApplications > 0 && (
                        <Badge 
                          variant={isActive ? "secondary" : "outline"} 
                          className={cn(
                            "flex-shrink-0 h-5 min-w-[20px] text-xs font-semibold",
                            isActive 
                              ? "bg-white/20 text-white border-white/30" 
                              : "bg-blue-50 text-blue-600 border-blue-200"
                          )}
                        >
                          {stats.pendingApplications}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <Separator className="my-5 xl:my-6" />
            
            {/* Secondary Actions */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Quick Actions</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleSectionClick('submit-opportunity')}
                  className={cn(
                    "w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 xl:py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                    activeSection === 'submit-opportunity'
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                  )}
                >
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <Plus className={cn(
                      "w-4 h-4 transition-all duration-200", 
                      activeSection === 'submit-opportunity' 
                        ? "text-white" 
                        : "text-slate-500 group-hover:text-slate-700"
                    )} />
                  </div>
                  <span className="font-medium text-left flex-1 leading-5 truncate">Submit Opportunity</span>
                </button>
                
                <button
                  onClick={() => handleSectionClick('discussions')}
                  className={cn(
                    "w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 xl:py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                    activeSection === 'discussions'
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                  )}
                >
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <MessageSquare className={cn(
                      "w-4 h-4 transition-all duration-200", 
                      activeSection === 'discussions' 
                        ? "text-white" 
                        : "text-slate-500 group-hover:text-slate-700"
                    )} />
                  </div>
                  <span className="font-medium text-left flex-1 leading-5 truncate">Discussions</span>
                </button>
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
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-slate-600/75 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar - Responsive width with fluid sizing for 1200px+ */}
      <aside
        className={cn(
          // Base classes for all screens
          "w-full",
          // Mobile classes (when onClose is provided)
          onClose ? [
            "fixed lg:sticky lg:top-24 inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:h-[calc(100vh-6rem)]",
            isOpen ? "translate-x-0" : "-translate-x-full",
            "lg:block lg:w-auto lg:shadow-none lg:transform-none"
          ] : [],
          // Responsive width classes for all viewports
          "lg:min-w-[260px] lg:max-w-[300px] xl:min-w-[280px] xl:max-w-[340px] 2xl:min-w-[320px] 2xl:max-w-[380px]",
          className
        )}
      >
        <div className={cn(
          "h-full lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)]",
          onClose ? "lg:block" : ""
        )}>
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}