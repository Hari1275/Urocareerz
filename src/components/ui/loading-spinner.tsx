"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "blue" | "purple" | "indigo" | "white";
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const colorClasses = {
  blue: "border-blue-600",
  purple: "border-purple-600", 
  indigo: "border-indigo-600",
  white: "border-white"
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base", 
  xl: "text-lg"
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  color = "blue",
  text = "Loading...",
  showText = true 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        colorClasses[color]
      )} />
      {showText && (
        <p className={cn(
          "mt-3 text-slate-600 font-medium",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingPage({ 
  title = "Loading...", 
  description,
  size = "lg" 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                UroCareerz
              </span>
            </div>
            <div className="text-sm text-slate-500 animate-pulse">Loading...</div>
          </div>
        </div>
      </header>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LoadingSpinner size={size} text={title} />
            {description && (
              <p className="text-slate-500 text-sm mt-2">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingCard({ 
  title = "Loading...", 
  className,
  size = "md"
}: LoadingCardProps) {
  return (
    <div className={cn(
      "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-lg shadow-slate-900/5 rounded-xl p-8 text-center",
      className
    )}>
      <LoadingSpinner size={size} text={title} />
    </div>
  );
}