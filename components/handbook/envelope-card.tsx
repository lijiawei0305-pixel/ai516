import { cn } from "@/lib/utils";
import { WaxSeal } from "@/components/handbook/wax-seal";

type EnvelopeCardProps = {
  className?: string;
  children?: React.ReactNode;
};

export function EnvelopeCard({ className, children }: EnvelopeCardProps) {
  return (
    <div
      className={cn(
        "relative h-28 overflow-visible rounded-[3px] bg-parchment shadow-paper",
        "before:absolute before:inset-x-0 before:top-0 before:h-16 before:origin-top before:skew-y-[-8deg] before:border-b before:border-coffee/16 before:bg-[rgba(255,245,223,0.38)] before:content-['']",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-16 after:bg-[linear-gradient(140deg,transparent_49%,rgba(90,59,31,0.15)_50%,transparent_51%),linear-gradient(220deg,transparent_49%,rgba(90,59,31,0.12)_50%,transparent_51%)] after:content-['']",
        className
      )}
    >
      <WaxSeal className="absolute bottom-3 left-1/2 z-10 h-12 w-12 -translate-x-1/2" />
      <div className="relative z-20 p-4">{children}</div>
    </div>
  );
}
