import { cn } from "@/lib/utils";

type NotebookTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function NotebookTextarea({ className, ...props }: NotebookTextareaProps) {
  return (
    <textarea
      className={cn(
        "lined-paper paper-grain min-h-64 w-full resize-none rounded-[3px] border-0 bg-cream/92 px-7 py-8 font-serif text-xl leading-[38px] text-coffee shadow-paper outline-none placeholder:text-coffee/42 focus:ring-2 focus:ring-warm-orange/35",
        className
      )}
      {...props}
    />
  );
}
