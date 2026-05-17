"use client";

import {
  ArrowLeft,
  ChevronRight,
  CircleEllipsis,
  Flower2,
  Heart,
  House,
  KeyRound,
  Lock,
  Moon,
  Paperclip,
  Send,
  Sparkles,
  Star,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { ClueNote } from "@/components/handbook/clue-note";
import { EnvelopeCard } from "@/components/handbook/envelope-card";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { PaperButton } from "@/components/handbook/paper-button";
import { PolaroidCard } from "@/components/handbook/polaroid-card";
import { ProgressStickers } from "@/components/handbook/progress-stickers";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { Tape } from "@/components/handbook/tape";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { WaxSeal } from "@/components/handbook/wax-seal";
import { NotebookTextarea } from "@/components/ui/notebook-textarea";
import { demoRoom } from "@/lib/contracts";
import { type DemoStep, useDemoFlow } from "@/lib/use-demo-flow";
import { cn } from "@/lib/utils";

const steps: { id: DemoStep; label: string }[] = [
  { id: "home", label: "入口" },
  { id: "write", label: "写下" },
  { id: "generating", label: "生成" },
  { id: "play", label: "探索" },
  { id: "result", label: "结算" }
];

export function HeartCabinDemo() {
  const { step, setStep } = useDemoFlow();

  return (
    <AppShell
      statusBarDark={step === "play" || step === "result"}
      topChrome={step === "result" ? <ResultTopBar /> : null}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="min-h-dvh"
        >
          {step === "home" ? <HomeScreen /> : null}
          {step === "write" ? <WriteScreen /> : null}
          {step === "generating" ? <GeneratingScreen /> : null}
          {step === "play" ? <PlayScreen /> : null}
          {step === "result" ? <ResultScreen /> : null}
        </motion.div>
      </AnimatePresence>

      <nav className="absolute bottom-2 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full bg-coffee/42 px-2 py-1.5 shadow-paper backdrop-blur-sm">
        {steps.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStep(item.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] text-cream/74",
              step === item.id && "bg-cream text-coffee shadow-sticker"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </AppShell>
  );
}

function PageHeader({
  title,
  subtitle,
  backTo
}: {
  title: string;
  subtitle?: string;
  backTo?: DemoStep;
}) {
  const setStep = useDemoFlow((state) => state.setStep);

  return (
    <header className="relative mb-6 text-center">
      {backTo ? (
        <HanddrawnIconButton
          icon={<ArrowLeft className="h-7 w-7" />}
          label="返回"
          onClick={() => setStep(backTo)}
          className="absolute left-0 top-0"
        />
      ) : null}
      <h1 className="soft-title pt-3 text-[34px] leading-tight">{title}</h1>
      <div className="mx-auto mt-2 flex w-36 items-center justify-center gap-2 text-coffee/36">
        <span className="h-px flex-1 bg-coffee/22" />
        <Flower2 className="h-5 w-5" strokeWidth={1.4} />
        <span className="h-px flex-1 bg-coffee/22" />
      </div>
      {subtitle ? <p className="mt-4 font-serif text-lg text-coffee/72">{subtitle}</p> : null}
      <Stamp className="absolute right-2 top-0" />
    </header>
  );
}

function HomeScreen() {
  const setStep = useDemoFlow((state) => state.setStep);

  return (
    <PaperPage className="pt-20" innerClassName="flex min-h-[calc(100dvh-7rem)] flex-col">
      <Tape className="left-16 top-12" />
      <Stamp className="absolute right-8 top-16" />
      <section className="text-center">
        <p className="soft-title text-2xl">《心事小屋》</p>
        <div className="mx-auto mt-3 flex w-32 items-center gap-2 text-coffee/32">
          <span className="h-px flex-1 bg-coffee/24" />
          <Flower2 className="h-4 w-4" />
          <span className="h-px flex-1 bg-coffee/24" />
        </div>
        <h1 className="soft-title mt-10 text-[44px] leading-[1.18]">
          把一句话，
          <br />
          藏进一间小屋
          <Heart className="mb-1 ml-2 inline h-8 w-8 text-warm-orange" strokeWidth={1.8} />
        </h1>
        <p className="mx-auto mt-8 max-w-[290px] font-serif text-xl leading-9 text-coffee/78">
          写下一句不太好意思直接说的话，让 AI 把它变成一间可以被朋友破解的秘密小屋。
        </p>
      </section>

      <section className="relative mt-8 min-h-[330px] flex-1">
        <PolaroidCard className="absolute left-1 top-12 w-28" caption="Shhhh...">
          <MiniWindow />
        </PolaroidCard>
        <TornPaperCard className="absolute right-0 top-10 w-28 rotate-[8deg] p-3 font-serif text-base leading-7" tone="parchment" tape="corner">
          每一句心事，都值得被温柔地收藏。
        </TornPaperCard>
        <MiniCabin className="absolute bottom-7 left-1/2 -translate-x-1/2 scale-[1.18]" />
        <EnvelopeCard className="absolute bottom-0 left-4 w-48 -rotate-3" />
        <TornPaperCard className="absolute bottom-0 right-0 w-32 p-3 font-serif text-base leading-7" tape="top">
          <StickerTag tone="sage" className="mb-1 text-xs">小提示</StickerTag>
          真心话，往往藏在不显眼的地方。
        </TornPaperCard>
      </section>

      <div className="mb-12 mt-4 space-y-4">
        <PaperButton withTape icon={<Flower2 className="h-7 w-7" />} onClick={() => setStep("write")}>
          把心事藏起来
          <ChevronRight className="h-7 w-7" />
        </PaperButton>
        <PaperButton variant="paper" icon={<Paperclip className="h-8 w-8" />} onClick={() => setStep("play")}>
          看看别人怎么藏
          <ChevronRight className="h-7 w-7" />
        </PaperButton>
        <p className="flex items-center justify-center gap-3 text-center text-sm text-parchment">
          <Lock className="h-4 w-4" />
          朋友只能看到线索，猜对后才会靠近真相
        </p>
      </div>
    </PaperPage>
  );
}

function WriteScreen() {
  const setStep = useDemoFlow((state) => state.setStep);

  return (
    <PaperPage className="pt-16">
      <Tape className="left-16 top-11" />
      <PageHeader title="写下心事" backTo="home" />
      <div className="relative">
        <Paperclip className="absolute -left-1 -top-4 z-20 h-12 w-12 rotate-12 text-coffee/42" strokeWidth={1.5} />
        <Tape className="right-2 top-3 rotate-[13deg]" />
        <NotebookTextarea
          defaultValue=""
          placeholder="写下一句不太好意思直接说的话......"
          maxLength={40}
        />
      </div>

      <p className="mt-5 text-center font-serif text-lg text-coffee/70">小提示：8-40 字会更适合藏进小屋</p>

      <section className="mt-8">
        <StickerTag icon={<Flower2 className="h-5 w-5" />} className="mb-5 text-lg soft-title">
          选择心事风格（可多选）
        </StickerTag>
        <div className="grid grid-cols-3 gap-4">
          {[
            ["想念", "sage"],
            ["压力", "parchment"],
            ["吐槽", "parchment"],
            ["暗恋", "rose"],
            ["小确幸", "sage"]
          ].map(([label, tone]) => (
            <StickerTag
              key={label}
              tone={tone as "sage" | "parchment" | "rose"}
              className={cn("justify-center py-3 soft-title text-2xl", label === "暗恋" && "col-start-1 col-end-3 mx-8")}
            >
              {label}
            </StickerTag>
          ))}
        </div>
      </section>

      <TornPaperCard tone="parchment" className="mt-8 px-8 py-5 text-center font-serif text-xl leading-8" tape="corner">
        它不会被直接展示给朋友，AI 会把它变成房间里的线索。
      </TornPaperCard>

      <PaperButton
        className="mb-12 mt-8"
        withTape
        icon={<House className="h-8 w-8" />}
        onClick={() => setStep("generating")}
      >
        生成我的心事小屋
        <ChevronRight className="h-7 w-7" />
      </PaperButton>
    </PaperPage>
  );
}

function GeneratingScreen() {
  const setStep = useDemoFlow((state) => state.setStep);

  return (
    <PaperPage className="pt-16">
      <PageHeader title="正在把心事藏进小屋......" backTo="write" />
      <section className="relative mt-9 h-[360px]">
        <TornPaperCard className="absolute left-9 top-8 z-10 w-24 -rotate-[13deg] p-3 font-serif text-base leading-7" tone="parchment">
          我总是不敢拒绝别人
        </TornPaperCard>
        <TornPaperCard className="absolute left-28 top-24 z-20 w-24 rotate-[9deg] p-3 font-serif text-base leading-7" tone="parchment">
          怕让别人失望
        </TornPaperCard>
        <TornPaperCard className="absolute left-44 top-40 z-10 w-20 rotate-[15deg] p-3 font-serif text-base leading-7" tone="parchment">
          但我也好累...
        </TornPaperCard>
        <motion.div
          animate={{ opacity: [0.45, 1, 0.55], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute left-12 top-40 h-28 w-56 rounded-full bg-warm-orange/16 blur-xl"
        />
        <MiniDoor className="absolute bottom-8 left-1/2 -translate-x-1/2" />
      </section>

      <div className="mt-2 grid grid-cols-3 gap-3">
        {[
          ["1", "读懂这句话的情绪", <Heart key="h" className="h-10 w-10 text-brick-red" />],
          ["2", "变成 5 个线索物件", <KeyRound key="k" className="h-10 w-10 text-coffee/70" />],
          ["3", "搭好一间秘密小屋", <House key="r" className="h-10 w-10 text-sage" />]
        ].map(([index, label, icon]) => (
          <TornPaperCard key={String(index)} className="min-h-32 p-3 text-center" tape="top">
            <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sage text-sm text-cream">
              {index}
            </span>
            <div className="mx-auto mb-2 flex justify-center">{icon}</div>
            <p className="font-serif text-base leading-6">{label}</p>
          </TornPaperCard>
        ))}
      </div>

      <section className="mt-7">
        <p className="mb-4 font-serif text-xl">线索正在生成</p>
        <ProgressStickers total={5} current={3} />
      </section>

      <TornPaperCard tone="cream" className="mt-8 text-center font-serif text-xl" tape="corner">
        别急，秘密正在被轻轻收好。
      </TornPaperCard>

      <PaperButton className="mb-12 mt-8" withTape onClick={() => setStep("play")}>
        进入朋友视角
        <ChevronRight className="h-7 w-7" />
      </PaperButton>
    </PaperPage>
  );
}

function PlayScreen() {
  const setStep = useDemoFlow((state) => state.setStep);

  return (
    <PaperPage className="px-4 pt-16" withBinder={false}>
      <HanddrawnIconButton
        icon={<ArrowLeft className="h-7 w-7" />}
        label="返回"
        onClick={() => setStep("generating")}
        className="absolute left-5 top-16 z-20"
      />
      <header className="text-center">
        <h1 className="soft-title text-[38px] leading-tight">
          {demoRoom.publicTitle}
          <Heart className="mb-1 ml-1 inline h-6 w-6 text-warm-orange" />
        </h1>
        <TornPaperCard tone="parchment" className="mx-auto mt-7 w-[82%] py-3 font-serif text-lg" tape="top">
          这里藏着一句话，找到 <strong>5</strong> 个线索来猜猜看。
        </TornPaperCard>
      </header>

      <section className="relative mt-8 h-[455px]">
        <RoomStage />
        <ClueBubble number={2} className="left-[22%] top-[12%]" />
        <ClueBubble number={4} className="right-[22%] top-[19%]" />
        <ClueBubble number={3} className="left-[11%] top-[43%]" />
        <ClueBubble number={5} className="right-[7%] top-[42%]" />
        <ClueBubble number={1} className="bottom-[14%] left-1/2 -translate-x-1/2" />
        <ClueNote className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2">
          <button aria-label="关闭线索" className="absolute right-4 top-3 text-coffee/70" type="button">
            <X className="h-5 w-5" />
          </button>
          它知道地址，
          <br />
          却一直没有出发。
        </ClueNote>
      </section>

      <TornPaperCard className="mt-5 text-center" tone="cream">
        <div className="mb-4 flex items-center justify-center gap-4 font-serif text-xl">
          <span className="h-px w-20 bg-coffee/24" />
          线索进度 2/5
          <span className="h-px w-20 bg-coffee/24" />
        </div>
        <ProgressStickers total={5} current={2} />
      </TornPaperCard>

      <PaperButton className="mb-12 mt-7" withTape onClick={() => setStep("result")}>
        我好像猜到了
        <Heart className="h-7 w-7 text-warm-orange" />
      </PaperButton>
    </PaperPage>
  );
}

function ResultScreen() {
  const setStep = useDemoFlow((state) => state.setStep);

  return (
    <PaperPage className="pt-20">
      <section className="relative">
        <Tape className="left-32 top-0 w-32 rotate-[14deg]" />
        <PolaroidCard className="left-1 top-6 z-20 w-40" caption="">
          <MiniCabin className="scale-[0.9]" />
        </PolaroidCard>
        <TornPaperCard className="ml-auto min-h-[330px] w-[72%] px-7 py-12" tape="corner">
          <div className="text-center">
            <p className="font-serif text-2xl">猜中 <span className="soft-title text-[58px] text-brick-red">86</span>%</p>
            <StickerTag tone="sage" className="mt-3">称号</StickerTag>
            <h1 className="soft-title mt-4 text-[34px]">半糖侦探</h1>
            <StickerTag tone="sage" className="mt-5">点评</StickerTag>
            <p className="mt-4 text-left font-serif text-lg leading-8">
              你看懂了想念，也看懂了嘴硬，只差一点点勇气。
            </p>
          </div>
        </TornPaperCard>
        <WaxSeal className="absolute left-10 top-60 z-30" />
      </section>

      <TornPaperCard className="mt-4" tone="cream">
        <StickerTag tone="sage" className="-mt-7 mb-3">命中关键词</StickerTag>
        <div className="flex flex-wrap gap-3">
          {demoRoom.moodTags.map((tag) => (
            <StickerTag key={tag}>{tag}</StickerTag>
          ))}
        </div>
      </TornPaperCard>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <TornPaperCard tone="parchment" className="font-serif text-lg leading-8">
          还差一点：
          <br />
          害羞和自尊
          <Heart className="ml-1 inline h-5 w-5 text-warm-orange" />
        </TornPaperCard>
        <TornPaperCard tone="cream" className="font-serif text-lg leading-8">
          <StickerTag tone="sage" className="mb-2">原句半揭晓</StickerTag>
          我有点想你，□□□□□□
        </TornPaperCard>
      </div>

      <TornPaperCard tone="parchment" className="mt-5 flex items-center gap-4 px-7 py-5 font-serif text-xl leading-8">
        <House className="h-10 w-10 shrink-0" strokeWidth={1.4} />
        <span>我把一句心事藏进了一间小屋，你能猜出来吗？</span>
      </TornPaperCard>

      <div className="mb-12 mt-7 space-y-4">
        <PaperButton withTape icon={<Send className="h-7 w-7" />} onClick={() => setStep("play")}>
          发给朋友继续猜
        </PaperButton>
        <PaperButton variant="paper" onClick={() => setStep("write")}>
          再藏一句
        </PaperButton>
      </div>
    </PaperPage>
  );
}

function ResultTopBar() {
  return (
    <div className="absolute left-0 right-0 top-0 z-40 flex h-20 items-end justify-between bg-cream px-6 pb-4 text-coffee shadow-[0_2px_12px_rgba(86,53,29,0.12)]">
      <ArrowLeft className="h-7 w-7" />
      <h2 className="soft-title text-2xl">你靠近了这句话</h2>
      <div className="flex items-center gap-3 rounded-full border border-coffee/12 px-4 py-2">
        <CircleEllipsis className="h-5 w-5" />
        <span className="h-5 w-px bg-coffee/16" />
        <span className="h-5 w-5 rounded-full border-[5px] border-coffee" />
      </div>
    </div>
  );
}

function Stamp({ className }: { className?: string }) {
  return (
    <div className={cn("text-coffee/25", className)}>
      <div className="torn-edge paper-grain ml-auto flex h-16 w-12 items-center justify-center border border-coffee/12 bg-cream">
        <Flower2 className="h-8 w-8 text-sage/70" strokeWidth={1.4} />
      </div>
      <div className="-mt-3 h-12 w-20 rounded-full border-2 border-coffee/15" />
    </div>
  );
}

function MiniCabin({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-44 w-56", className)}>
      <div className="absolute bottom-0 left-6 h-28 w-44 rounded-[4px] bg-[#c9a079] shadow-paper">
        <div className="absolute -top-14 left-1/2 h-28 w-36 -translate-x-1/2 rotate-45 bg-[#8e4b2d] shadow-sticker" />
        <div className="absolute inset-2 border border-coffee/12" />
        <div className="absolute bottom-0 left-1/2 h-20 w-12 -translate-x-1/2 rounded-t-full bg-warm-orange shadow-[0_0_18px_rgba(255,188,84,0.85)]" />
        <div className="absolute bottom-10 left-5 h-10 w-9 bg-cream/70 shadow-insetPaper" />
        <div className="absolute bottom-10 right-5 h-10 w-9 bg-[#ffd477]/80 shadow-[0_0_14px_rgba(255,196,88,0.72)]" />
        <StickerTag className="absolute left-1/2 top-9 -translate-x-1/2 text-xs">心事小屋</StickerTag>
      </div>
      <div className="absolute bottom-1 left-0 h-14 w-8 rounded-t-full border-4 border-cream" />
      <div className="absolute bottom-1 right-0 h-14 w-8 rounded-t-full border-4 border-cream" />
      <div className="absolute bottom-8 right-7 h-9 w-8 rounded-t-full bg-brick-red" />
    </div>
  );
}

function MiniWindow() {
  return (
    <div className="flex h-full items-end justify-center bg-[linear-gradient(#b9c0ad,#f0c58b)] p-3">
      <div className="grid h-20 w-20 grid-cols-2 gap-1 border-4 border-[#8b5d37] bg-[#ffd88f]/60 p-1">
        <span className="bg-cream/55" />
        <span className="bg-cream/55" />
        <span className="bg-cream/55" />
        <span className="bg-cream/55" />
      </div>
    </div>
  );
}

function MiniDoor({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-72 w-56", className)}>
      <div className="absolute bottom-0 left-1/2 h-64 w-40 -translate-x-1/2 rounded-t-full bg-[#9b6a43] shadow-paper">
        <div className="absolute inset-3 rounded-t-full border border-coffee/25" />
        <div className="absolute inset-x-4 top-0 h-full bg-[repeating-linear-gradient(90deg,transparent_0_20px,rgba(55,32,16,0.18)_20px_22px)]" />
        <Heart className="absolute left-1/2 top-24 h-7 w-7 -translate-x-1/2 text-coffee/65" />
        <span className="absolute right-7 top-36 h-3 w-3 rounded-full bg-parchment shadow-sticker" />
      </div>
      <div className="absolute bottom-0 left-0 h-12 w-16 bg-cream/40" />
      <div className="absolute bottom-0 right-0 h-12 w-16 bg-cream/40" />
      <Sparkles className="absolute left-0 top-24 h-9 w-9 text-warm-orange" />
      <Sparkles className="absolute right-0 top-36 h-8 w-8 text-warm-orange" />
    </div>
  );
}

function RoomStage() {
  return (
    <div className="absolute inset-x-0 top-0 h-[390px]">
      <div className="absolute left-1/2 top-0 h-[360px] w-[94%] -translate-x-1/2 overflow-hidden bg-[#b58d67] shadow-paper [clip-path:polygon(4%_26%,50%_0,96%_26%,96%_100%,4%_100%)]">
        <div className="absolute left-0 top-0 h-full w-full bg-[repeating-linear-gradient(90deg,rgba(74,45,25,0.28)_0_2px,transparent_2px_46px),linear-gradient(180deg,#c49c72,#8e6344)]" />
        <div className="absolute left-8 top-24 h-28 w-20 border-4 border-[#6e4427] bg-[#f2c06c]/35" />
        <div className="absolute right-8 top-20 h-32 w-24 border-4 border-[#6e4427] bg-[#182233]">
          <Moon className="absolute left-8 top-4 h-9 w-9 text-[#ffd976]" />
          <Star className="absolute bottom-5 right-4 h-5 w-5 text-[#ffd976]" />
        </div>
        <div className="absolute left-28 top-36 h-24 w-40 bg-[#744a2e] shadow-sticker" />
        <div className="absolute bottom-24 left-1/2 h-24 w-36 -translate-x-1/2 rounded bg-[#805333] shadow-sticker" />
        <div className="absolute bottom-10 left-20 h-20 w-14 bg-[#805333]" />
        <div className="absolute bottom-10 right-20 h-20 w-14 bg-[#805333]" />
        <div className="absolute left-1/2 top-20 h-12 w-12 -translate-x-1/2 rounded-full bg-[#ffd470] shadow-[0_0_28px_rgba(255,205,96,0.95)]" />
      </div>
    </div>
  );
}

function ClueBubble({ number, className }: { number: number; className?: string }) {
  return (
    <span
      className={cn(
        "absolute z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 border-cream bg-warm-orange/42 text-2xl font-semibold text-cream shadow-[0_0_12px_rgba(255,215,123,0.9)]",
        className
      )}
    >
      {number}
    </span>
  );
}
