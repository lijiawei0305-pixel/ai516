import { cn } from "@/lib/utils";

type PaperPageProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  withBinder?: boolean;
};

export function PaperPage({
  children,
  className,
  innerClassName,
  withBinder = true
}: PaperPageProps) {
  return (
    <section
      className={cn(
        "paper-texture paper-grain relative mx-auto min-h-dvh w-full overflow-hidden px-5 pb-7 pt-16 shadow-paper",
        className
      )}
    >
      {withBinder ? (
        <>
          <div className="absolute left-0 top-0 h-full w-8 bg-[linear-gradient(90deg,rgba(64,36,19,0.25),rgba(255,242,216,0.08),transparent)]" />
          <div className="absolute left-3 top-44 h-16 w-5 rounded-full border-2 border-coffee/35" />
          <div className="absolute left-2 top-[70%] h-14 w-5 rounded-full border-2 border-coffee/30 rotate-12" />
        </>
      ) : null}
      <div className="absolute -right-4 top-16 h-[86%] w-7 rounded-r-[14px] bg-parchment/70 shadow-[inset_10px_0_12px_rgba(83,49,26,0.12)]" />
      <div className={cn("relative z-10", innerClassName)}>{children}</div>
    </section>
  );
}
