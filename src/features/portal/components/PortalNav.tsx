"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Swords, CalendarDays, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalNavProps {
  slug: string;
}

export function PortalNav({ slug }: PortalNavProps) {
  const pathname = usePathname();
  const basePath = `/e/${slug}`;

  const navItems = [
    { name: "Ranking", href: basePath, icon: Trophy, exact: true },
    { name: "Actividades", href: `${basePath}/actividades`, icon: Swords, exact: false },
    { name: "Horarios", href: `${basePath}/horarios`, icon: CalendarDays, exact: false },
    { name: "Reglamento", href: `${basePath}/bases`, icon: BookOpen, exact: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t-2 border-border/50 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] md:hidden">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-11 rounded-xl transition-all",
                isActive 
                  ? "text-primary font-bold scale-110" 
                  : "text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              <item.icon className={cn("size-5 transition-all", isActive ? "stroke-[2.5px] drop-shadow-md" : "stroke-2")} />
              <span className="text-[10px] tracking-tight leading-none">{item.name}</span>
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Para Desktop (Sidebar simple o Top nav)
export function PortalNavDesktop({ slug }: PortalNavProps) {
  const pathname = usePathname();
  const basePath = `/e/${slug}`;

  const navItems = [
    { name: "Ranking en vivo", href: basePath, icon: Trophy, exact: true },
    { name: "Actividades", href: `${basePath}/actividades`, icon: Swords, exact: false },
    { name: "Horarios", href: `${basePath}/horarios`, icon: CalendarDays, exact: false },
    { name: "Reglamento", href: `${basePath}/bases`, icon: BookOpen, exact: false },
  ];

  return (
    <nav className="hidden md:flex gap-2 p-2 bg-muted/30 rounded-2xl border-2 border-border/50 w-full mb-8">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all flex-1 justify-center",
              isActive 
                ? "bg-background text-primary font-bold shadow-sm border-2 border-border/50" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted font-medium border-2 border-transparent"
            )}
          >
            <item.icon className={cn("size-4", isActive ? "stroke-[2.5px]" : "stroke-2")} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
