import Image from "next/image";
import { cn } from "@/lib/utils";
import { prototypeBackgrounds } from "@/lib/prototype-backgrounds";

type PaperPageProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  withBinder?: boolean;
  backgroundSrc?: string;
};

export function PaperPage({
  children,
  className,
  innerClassName,
  withBinder = true,
  backgroundSrc = prototypeBackgrounds.create
}: PaperPageProps) {
  return (
    <section
      className={cn(
        "relative mx-auto min-h-dvh w-full overflow-hidden px-5 pb-7 pt-16 shadow-paper",
        className
      )}
    >
      <Image
        src={backgroundSrc}
        alt=""
        fill
        priority
        sizes="430px"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-cream/10" />
      {withBinder ? (
        <>
          <div className="absolute left-0 top-0 h-full w-3 bg-coffee/12" />
          <div className="absolute left-3 top-44 h-16 w-5 rounded-full border-2 border-coffee/35" />
          <div className="absolute left-2 top-[70%] h-14 w-5 rounded-full border-2 border-coffee/30 rotate-12" />
        </>
      ) : null}
      <div className={cn("relative z-10", innerClassName)}>{children}</div>
    </section>
  );
}
