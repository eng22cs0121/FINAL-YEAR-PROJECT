import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'h-8 w-8', text: 'text-lg', gap: 'gap-2' },
    md: { icon: 'h-10 w-10', text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 'h-12 w-12', text: 'text-2xl', gap: 'gap-3' },
  };

  const { icon, text, gap } = sizeClasses[size];

  return (
    <div className={cn("flex items-center group cursor-pointer", gap, className)}>
      {/* Modern Web3 Logo Icon */}
      <div className={cn(
        "relative flex items-center justify-center rounded-lg border border-primary/30",
        "bg-background/80",
        "shadow-[0_0_15px_hsla(var(--primary)/0.3)] group-hover:shadow-[0_0_20px_hsla(var(--accent)/0.5)] transition-all duration-500",
        icon
      )}>
        {/* Abstract Blockchain/Trust Node Symbol */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[65%] w-[65%] text-primary group-hover:text-accent transition-colors duration-500"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Shield Base */}
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
          />
          {/* Medical Cross */}
          <path 
            d="M9 12h6m-3-3v6" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            opacity="0.9" 
          />
        </svg>
        
        {/* Subtle glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      
      {!iconOnly && (
        <div className="flex flex-col">
          <span className={cn(
            "font-extrabold tracking-tight leading-none text-foreground",
            "group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all duration-300",
            text
          )}>
            MedAssure
          </span>
          <span className="text-[9px] font-mono text-primary/80 tracking-[0.15em] uppercase mt-0.5">
            Decentralized Trust
          </span>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile/small spaces
export function LogoCompact({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 group cursor-pointer", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 bg-background/80 shadow-[0_0_10px_hsla(var(--primary)/0.2)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-primary group-hover:text-accent transition-colors"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
          />
          <path d="M9 12h6m-3-3v6" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
        MedAssure
      </span>
    </div>
  );
}
