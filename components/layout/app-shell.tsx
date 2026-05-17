import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
  statusBarDark?: boolean;
  topChrome?: React.ReactNode;
  allowOverflow?: boolean;
};

export function AppShell({
  children,
  className,
  statusBarDark: _statusBarDark = false,
  topChrome,
  allowOverflow = false
}: AppShellProps) {
  return (
    <main className={cn("wood-desk min-h-dvh w-full text-coffee", !allowOverflow && "overflow-hidden")}>
      <div className={cn("relative mx-auto min-h-dvh w-full max-w-[430px] shadow-[0_0_70px_rgba(20,10,4,0.52)]", !allowOverflow && "overflow-hidden")}>
        {topChrome}
        <div className={cn("relative min-h-dvh", className)}>{children}</div>
      </div>
    </main>
  );
}
