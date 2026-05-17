import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
  statusBarDark?: boolean;
  topChrome?: React.ReactNode;
};

export function AppShell({
  children,
  className,
  statusBarDark: _statusBarDark = false,
  topChrome
}: AppShellProps) {
  return (
    <main className="wood-desk min-h-dvh w-full overflow-hidden text-coffee">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-hidden shadow-[0_0_70px_rgba(20,10,4,0.52)]">
        {topChrome}
        <div className={cn("relative min-h-dvh", className)}>{children}</div>
      </div>
    </main>
  );
}
