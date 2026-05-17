"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import type { ListPublicRoomsResponse } from "@/lib/contracts/api";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rooms: ListPublicRoomsResponse["rooms"] };

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function RoomsPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    fetch("/api/rooms")
      .then(async (res) => {
        if (!res.ok) throw new Error("加载失败");
        const data = (await res.json()) as ListPublicRoomsResponse;
        setState({ status: "ready", rooms: data.rooms });
      })
      .catch((err) => {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "加载失败"
        });
      });
  }, []);

  return (
    <AppShell>
      <PaperPage>
        <div className="flex items-center gap-3 px-4 pt-6 pb-2">
          <HanddrawnIconButton
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            }
            label="返回首页"
            onClick={() => router.push("/")}
          />
          <h1 className="font-serif text-xl text-coffee">小屋广场</h1>
        </div>

        <div className="space-y-4 px-4 pb-8 pt-4">
          {state.status === "loading" && (
            <p className="py-12 text-center font-serif text-coffee/60">
              正在加载…
            </p>
          )}

          {state.status === "error" && (
            <TornPaperCard tone="rose">
              <p className="px-4 py-6 text-center font-serif text-coffee">
                {state.message}
              </p>
            </TornPaperCard>
          )}

          {state.status === "ready" && state.rooms.length === 0 && (
            <TornPaperCard tone="cream">
              <p className="px-4 py-8 text-center font-serif text-coffee/70">
                还没有公开的小屋，去创建第一间吧
              </p>
            </TornPaperCard>
          )}

          {state.status === "ready" &&
            state.rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => router.push(`/rooms/${room.id}/play`)}
                className="w-full text-left transition active:scale-[0.98]"
              >
                <TornPaperCard tone="cream" tape="top">
                  <div className="space-y-2 px-4 py-4">
                    <p className="font-serif text-lg text-coffee">
                      {room.publicTitle}
                    </p>
                    <div className="flex items-center gap-2">
                      <StickerTag tone="sage">{room.visualTheme}</StickerTag>
                      <span className="text-xs text-coffee/50">
                        {formatDate(room.createdAt)}
                      </span>
                    </div>
                  </div>
                </TornPaperCard>
              </button>
            ))}
        </div>
      </PaperPage>
    </AppShell>
  );
}
