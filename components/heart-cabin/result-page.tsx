"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CircleEllipsis,
  Home,
  LockKeyhole,
  Send,
  Sprout,
  Star,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { HanddrawnIcons } from "@/components/handbook/handdrawn-assets";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { PaperButton } from "@/components/handbook/paper-button";
import { PolaroidCard } from "@/components/handbook/polaroid-card";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { Tape } from "@/components/handbook/tape";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { WaxSeal } from "@/components/handbook/wax-seal";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { MiniCabin } from "@/components/heart-cabin/decorations";
import type { OwnerResultViewData, PublicGuessResult } from "@/lib/contracts";
import { mockGuessResult, mockOwnerResultViewData } from "@/lib/mock-guess-result";
import { useGuessFlow } from "@/lib/use-guess-flow";

type ResultPageProps = {
  guessId: string;
};

export function ResultPage({ guessId }: ResultPageProps) {
  const router = useRouter();
  const result: PublicGuessResult = {
    ...mockGuessResult,
    guessId
  };
  const [requestOpen, setRequestOpen] = useState(false);
  const [diaryPanelOpen, setDiaryPanelOpen] = useState(false);
  const {
    diaryRequestMessage,
    diaryRequestSent,
    resultSavedToDiary,
    setDiaryRequestMessage,
    sendDiaryRequest,
    markSavedToDiary
  } = useGuessFlow();

  function handleDiaryRequest() {
    sendDiaryRequest();
    setRequestOpen(false);
  }

  return (
    <AppShell statusBarDark topChrome={<ResultTopBar title={result.title} />}>
      <PaperPage className="pt-24">
        <section className="relative">
          <Tape className="left-28 top-0 w-32 rotate-[14deg]" />
          <PolaroidCard className="left-1 top-5 z-20 w-40" caption="">
            <MiniCabin className="scale-[0.9]" />
          </PolaroidCard>
          <TornPaperCard className="ml-auto min-h-[350px] w-[72%] px-7 py-12" tape="corner">
            <div className="text-center">
              <p className="font-serif text-2xl">
                猜中 <span className="soft-title text-[58px] text-brick-red">{result.scorePercent}</span>%
              </p>
              <p className="mt-1 font-serif text-lg text-coffee/68">默契度 {result.tacitScore}</p>
              <StickerTag tone="sage" className="mt-3">
                称号
              </StickerTag>
              <h1 className="soft-title mt-4 text-[34px]">{result.badgeTitle}</h1>
              <StickerTag tone="sage" className="mt-5">
                点评
              </StickerTag>
              <p className="mt-4 text-left font-serif text-lg leading-8">{result.comment}</p>
            </div>
          </TornPaperCard>
          <WaxSeal className="absolute left-10 top-60 z-30" />
          <Star className="absolute right-12 top-12 h-6 w-6 text-warm-orange/65" strokeWidth={1.4} />
        </section>

        <TornPaperCard className="mt-4" tone="cream">
          <StickerTag tone="sage" className="-mt-7 mb-3">
            命中关键词
          </StickerTag>
          <div className="flex flex-wrap gap-3">
            {result.hitKeywords.map((keyword) => (
              <StickerTag key={keyword}>{keyword}</StickerTag>
            ))}
          </div>
        </TornPaperCard>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <TornPaperCard tone="parchment" className="font-serif text-lg leading-8">
            还差一点：
            <br />
            {result.missedNote}
            <HanddrawnIcons.Heart className="ml-1 inline h-5 w-5 text-warm-orange" />
          </TornPaperCard>
          <TornPaperCard tone="cream" className="font-serif text-lg leading-8">
            <StickerTag tone="sage" className="mb-2">
              原句半揭晓
            </StickerTag>
            {result.partialOriginalSentence}
          </TornPaperCard>
        </div>

        <TornPaperCard tone="parchment" className="mt-5 flex items-center gap-4 px-7 py-5 font-serif text-xl leading-8">
          <Home className="h-10 w-10 shrink-0" strokeWidth={1.4} />
          <span>{result.shareText}</span>
        </TornPaperCard>

        {result.canRequestDiary ? (
          <TornPaperCard tone="cream" className="mt-5 px-6 py-5 font-serif text-lg leading-8" tape="corner">
            <StickerTag tone="sage" className="mb-3">
              默契靠近
            </StickerTag>
            <p>你们的默契度已经足够靠近，可以申请阅读这次心事背后的日记片段。</p>
            <PaperButton
              variant="paper"
              className="mt-4 min-h-12 text-xl"
              icon={<LockKeyhole className="h-6 w-6" />}
              onClick={() => setRequestOpen(true)}
              disabled={diaryRequestSent}
            >
              {diaryRequestSent ? "申请已送出" : "申请打开 TA 的日记本"}
            </PaperButton>
          </TornPaperCard>
        ) : null}

        <TornPaperCard tone="parchment" className="mt-5 flex items-center justify-between px-5 py-4 font-serif text-lg">
          <span className="inline-flex items-center gap-2">
            <Sprout className="h-5 w-5 text-sage" />
            {resultSavedToDiary ? "存入我的心事日记" : "尚未存入日记"}
          </span>
          <button type="button" onClick={markSavedToDiary} className="text-sage underline underline-offset-4">
            保存
          </button>
        </TornPaperCard>

        <div className="mb-12 mt-7 space-y-4">
          <PaperButton
            withTape
            icon={<Send className="h-7 w-7" />}
            onClick={() => router.push(`/rooms/${result.roomId}/play`)}
          >
            发给朋友继续猜
          </PaperButton>
          <PaperButton variant="paper" onClick={() => router.push("/create")}>
            再藏一句
          </PaperButton>
          <PaperButton variant="parchment" className="min-h-12 text-xl" icon={<BookOpen className="h-6 w-6" />} onClick={() => setDiaryPanelOpen(true)}>
            查看我的日记
          </PaperButton>
        </div>

        <DiaryRequestSheet
          open={requestOpen}
          message={diaryRequestMessage}
          onMessageChange={setDiaryRequestMessage}
          onClose={() => setRequestOpen(false)}
          onSubmit={handleDiaryRequest}
        />
        <DiarySavedSheet open={diaryPanelOpen} onClose={() => setDiaryPanelOpen(false)} />
      </PaperPage>
    </AppShell>
  );
}

function ResultTopBar({ title }: { title: string }) {
  return (
    <div className="absolute left-0 right-0 top-0 z-40 flex h-20 items-end justify-between bg-cream px-6 pb-4 text-coffee shadow-[0_2px_12px_rgba(86,53,29,0.12)]">
      <ArrowLeft className="h-7 w-7" />
      <h2 className="soft-title text-2xl">{title}</h2>
      <div className="flex items-center gap-3 rounded-full border border-coffee/12 px-4 py-2">
        <CircleEllipsis className="h-5 w-5" />
        <span className="h-5 w-px bg-coffee/16" />
        <span className="h-5 w-5 rounded-full border-[5px] border-coffee" />
      </div>
    </div>
  );
}

function DiaryRequestSheet({
  open,
  message,
  onMessageChange,
  onClose,
  onSubmit
}: {
  open: boolean;
  message: string;
  onMessageChange: (message: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-end bg-coffee/28 px-5 pb-20 backdrop-blur-[1px]"
        >
          <motion.div
            initial={{ y: 80, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative w-full"
          >
            <TornPaperCard tone="cream" className="px-6 py-6" tape="corner">
              <HanddrawnIconButton
                icon={<X className="h-5 w-5" />}
                label="关闭申请面板"
                onClick={onClose}
                className="absolute right-4 top-4 h-9 w-9"
              />
              <StickerTag tone="sage" className="mb-4">
                申请打开日记本
              </StickerTag>
              <p className="font-serif text-lg leading-8 text-coffee/72">
                写一句温柔的留言，让 TA 决定是否把这次心事背后的日记片段递给你。
              </p>
              <textarea
                value={message}
                onChange={(event) => onMessageChange(event.target.value.slice(0, 80))}
                placeholder="我想听听这句话背后的那一小段故事。"
                className="lined-paper paper-grain mt-4 min-h-32 w-full resize-none rounded-[3px] border-0 bg-parchment/72 px-5 py-5 font-serif text-lg leading-[34px] text-coffee shadow-insetPaper outline-none placeholder:text-coffee/42 focus:ring-2 focus:ring-warm-orange/35"
              />
              <PaperButton className="mt-5 min-h-12 text-xl" withTape icon={<Send className="h-6 w-6" />} onClick={onSubmit}>
                发送申请
              </PaperButton>
            </TornPaperCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DiarySavedSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-end bg-coffee/24 px-5 pb-20 backdrop-blur-[1px]"
        >
          <motion.div initial={{ y: 70 }} animate={{ y: 0 }} exit={{ y: 70 }} className="w-full">
            <TornPaperCard tone="cream" className="px-6 py-6 text-center" tape="corner">
              <HanddrawnIconButton
                icon={<X className="h-5 w-5" />}
                label="关闭日记"
                onClick={onClose}
                className="absolute right-4 top-4 h-9 w-9"
              />
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-sage" strokeWidth={1.4} />
              <h3 className="soft-title text-2xl">已存入我的心事日记</h3>
              <p className="mt-3 font-serif text-lg leading-8 text-coffee/70">
                这次靠近，会作为你和这间小屋的记录留在这里。
              </p>
            </TornPaperCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function OwnerResultView({ data = mockOwnerResultViewData }: { data?: OwnerResultViewData }) {
  return (
    <TornPaperCard tone="cream" className="space-y-3 px-5 py-5 font-serif text-lg leading-8">
      <StickerTag tone="sage">创建者视角预留</StickerTag>
      <p>{data.guesserName} 选择了：{data.selectedOptionLabel}</p>
      <p>发现线索：{data.discoveredClues.join("、")}</p>
      <p>最终猜测：{data.finalGuess}</p>
      <p>猜中分数：{data.scorePercent}%</p>
      <p>默契度：{data.tacitScore}</p>
      <p>是否申请打开日记本：{data.diaryRequested ? "是" : "否"}</p>
      <p>留言：{data.diaryRequestMessage ?? "暂无"}</p>
    </TornPaperCard>
  );
}
