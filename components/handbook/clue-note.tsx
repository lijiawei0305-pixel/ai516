import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ClueNoteProps = {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

export function ClueNote({ children, className, onClose }: ClueNoteProps) {
  return (
    <div
      className={cn(
        "torn-edge paper-grain relative mx-auto w-[82%] bg-cream px-7 py-5 text-center font-serif text-xl leading-9 shadow-paper",
        "before:absolute before:bottom-4 before:left-3 before:h-3/4 before:border-l-2 before:border-dotted before:border-coffee/20 before:content-['']",
        className
      )}
    >
      {onClose ? (
        <button
          aria-label="关闭线索"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full text-coffee/70"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
      {children}
    </div>
  );
}
