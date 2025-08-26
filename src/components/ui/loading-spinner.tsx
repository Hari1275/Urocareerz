"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Loader2, RotateCw } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "dots" | "pulse" | "gradient" | "elegant" | "minimal";
  text?: string;
  showText?: boolean;
  color?: "blue" | "purple" | "indigo" | "emerald" | "slate";
}

const sizeConfigs = {
  sm: {
    spinner: "h-4 w-4",
    text: "text-xs",
    spacing: "mt-2",
    dots: "w-1.5 h-1.5",
    pulse: "w-6 h-6"
  },
  md: {
    spinner: "h-6 w-6",
    text: "text-sm",
    spacing: "mt-3",
    dots: "w-2 h-2",
    pulse: "w-8 h-8"
  },
  lg: {
    spinner: "h-8 w-8",
    text: "text-base",
    spacing: "mt-4",
    dots: "w-2.5 h-2.5",
    pulse: "w-10 h-10"
  },
  xl: {
    spinner: "h-12 w-12",
    text: "text-lg",
    spacing: "mt-5",
    dots: "w-3 h-3",
    pulse: "w-12 h-12"
  }
};

const colorSchemes = {
  blue: {
    primary: "from-blue-600 to-indigo-600",
    secondary: "from-blue-500 to-indigo-500",
    border: "border-blue-600",
    text: "text-blue-700",
    dots: "bg-blue-600",
    glow: "shadow-blue-500/25"
  },
  purple: {
    primary: "from-purple-600 to-pink-600",
    secondary: "from-purple-500 to-pink-500",
    border: "border-purple-600",
    text: "text-purple-700",
    dots: "bg-purple-600",
    glow: "shadow-purple-500/25"
  },
  indigo: {
    primary: "from-indigo-600 to-blue-600",
    secondary: "from-indigo-500 to-blue-500",
    border: "border-indigo-600",
    text: "text-indigo-700",
    dots: "bg-indigo-600",
    glow: "shadow-indigo-500/25"
  },
  emerald: {
    primary: "from-emerald-600 to-teal-600",
    secondary: "from-emerald-500 to-teal-500",
    border: "border-emerald-600",
    text: "text-emerald-700",
    dots: "bg-emerald-600",
    glow: "shadow-emerald-500/25"
  },
  slate: {
    primary: "from-slate-600 to-gray-600",
    secondary: "from-slate-500 to-gray-500",
    border: "border-slate-600",
    text: "text-slate-700",
    dots: "bg-slate-600",
    glow: "shadow-slate-500/25"
  }
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  variant = "default",
  text = "Loading...",
  showText = true,
  color = "blue"
}: LoadingSpinnerProps) {
  const sizeConfig = sizeConfigs[size];
  const colorScheme = colorSchemes[color];

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full animate-pulse",
                  sizeConfig.dots,
                  colorScheme.dots
                )}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "0.8s"
                }}
              />
            ))}
          </div>
        );
      
      case "pulse":
        return (
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-30",
              sizeConfig.pulse,
              `bg-gradient-to-r ${colorScheme.secondary}`
            )} />
            <div className={cn(
              "relative rounded-full",
              sizeConfig.pulse,
              `bg-gradient-to-r ${colorScheme.primary}`,
              "shadow-lg",
              colorScheme.glow
            )} />
          </div>
        );
      
      case "gradient":
        return (
          <div className="relative">
            <div className={cn(
              "animate-spin rounded-full border-4 border-transparent",
              sizeConfig.spinner,
              `bg-gradient-to-r ${colorScheme.primary}`,
              "shadow-lg",
              colorScheme.glow
            )}
            style={{
              background: `conic-gradient(from 90deg, transparent, rgb(59 130 246), transparent)`
            }}
            />
            <div className={cn(
              "absolute inset-1 rounded-full bg-white",
            )} />
          </div>
        );
      
      case "elegant":
        return (
          <div className="relative">
            <div className={cn(
              "animate-spin rounded-full border-2 border-transparent",
              sizeConfig.spinner,
              "bg-gradient-to-r from-transparent via-current to-transparent",
              colorScheme.text
            )}
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, currentColor 90deg, transparent 180deg)`
            }}
            />
            <Sparkles className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-5 w-5",
              colorScheme.text
            )} />
          </div>
        );
      
      case "minimal":
        return (
          <Loader2 className={cn(
            "animate-spin",
            sizeConfig.spinner,
            colorScheme.text
          )} />
        );
      
      default:
        return (
          <div className="relative">
            <div className={cn(
              "animate-spin rounded-full border-3",
              sizeConfig.spinner,
              "border-transparent border-t-current border-r-current",
              colorScheme.text,
              "drop-shadow-sm"
            )} />
            <div className={cn(
              "absolute inset-0 rounded-full border-2 border-slate-200/40 animate-pulse"
            )} />
          </div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {renderSpinner()}
      {showText && (
        <p className={cn(
          "font-medium tracking-wide",
          sizeConfig.text,
          sizeConfig.spacing,
          "text-slate-600 animate-pulse"
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
  variant?: "default" | "dots" | "pulse" | "gradient" | "elegant" | "minimal";
  color?: "blue" | "purple" | "indigo" | "emerald" | "slate";
}

export function LoadingPage({ 
  title = "Loading your dashboard...", 
  description = "Please wait while we prepare everything for you",
  size = "lg",
  variant = "elegant",
  color = "blue"
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Elegant Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                UroCareerz
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: "1s"
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500 font-medium">Loading</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto">
            {/* Premium Loading Container */}
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-900/5">
              <div className="mb-6">
                <LoadingSpinner 
                  size={size} 
                  variant={variant}
                  color={color}
                  text={title}
                  showText={false}
                />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                  {title}
                </h3>
                {description && (
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Subtle Progress Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "2s"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "gradient" | "elegant" | "minimal";
  color?: "blue" | "purple" | "indigo" | "emerald" | "slate";
}

export function LoadingCard({ 
  title = "Loading...", 
  description,
  className,
  size = "md",
  variant = "pulse",
  color = "blue"
}: LoadingCardProps) {
  return (
    <div className={cn(
      "bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-lg shadow-slate-900/5 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-xl",
      className
    )}>
      <div className="space-y-4">
        <LoadingSpinner 
          size={size} 
          variant={variant}
          color={color}
          text={title}
          showText={false}
        />
        
        <div className="space-y-2">
          <h4 className={cn(
            "font-semibold text-slate-900 tracking-tight",
            size === "sm" ? "text-sm" : size === "md" ? "text-base" : size === "lg" ? "text-lg" : "text-xl"
          )}>
            {title}
          </h4>
          {description && (
            <p className={cn(
              "text-slate-500 leading-relaxed",
              size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Premium Loading Button Component
interface LoadingButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal";
  color?: "blue" | "purple" | "indigo" | "emerald" | "slate";
  className?: string;
}

export function LoadingButton({ 
  size = "md", 
  variant = "default",
  color = "blue",
  className
}: LoadingButtonProps) {
  const colorScheme = colorSchemes[color];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
      `bg-gradient-to-r ${colorScheme.secondary}`,
      "text-white shadow-lg",
      colorScheme.glow,
      size === "sm" ? "text-xs px-3 py-1.5" : size === "lg" ? "text-lg px-6 py-3" : "text-sm px-4 py-2",
      "cursor-not-allowed opacity-90",
      className
    )}>
      <LoadingSpinner 
        size={size === "lg" ? "md" : "sm"}
        variant={variant === "minimal" ? "minimal" : "default"}
        color="slate"
        showText={false}
      />
      <span>Loading...</span>
    </div>
  );
}

// Inline Loading Component for Text
interface LoadingTextProps {
  text?: string;
  className?: string;
}

export function LoadingText({ 
  text = "Loading",
  className
}: LoadingTextProps) {
  return (
    <div className={cn("flex items-center gap-2 text-slate-600", className)}>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-slate-400 animate-pulse"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "1.2s"
            }}
          />
        ))}
      </div>
      <span className="text-sm font-medium animate-pulse">{text}</span>
    </div>
  );
}