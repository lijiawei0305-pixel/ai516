"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { PaperButton } from "@/components/handbook/paper-button";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { LayeredMiniRoom } from "@/components/room/LayeredMiniRoom";
import type { GetRoomPlayResponse } from "@/lib/contracts/api";
import { adaptRoomPublicData } from "@/lib/adapters/roomPublicDataAdapter";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; room: GetRoomPlayResponse }
  | { status: "error"; message: string };

export default function RoomPlayPage() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      try {
        const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/play`, {
          cache: "no-store"
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error?.message ?? "小屋暂时打不开。");
        }

        const room = (await response.json()) as GetRoomPlayResponse;

        if (!cancelled) {
          setState({ status: "ready", room });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "小屋暂时打不开。"
          });
        }
      }
    }

    loadRoom();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const adaptedRoom = useMemo(
    () => (state.status === "ready" ? adaptRoomPublicData(state.room) : null),
    [state]
  );

  return (
    <AppShell>
      <PaperPage className="px-4 pt-16" withBinder={false}>
        <HanddrawnIconButton
          icon={<ArrowLeft className="h-7 w-7" />}
          label="返回"
          onClick={() => router.push("/")}
          className="absolute left-5 top-16 z-20"
        />

        <header className="text-center">
          <h1 className="soft-title mx-auto max-w-[320px] text-[36px] leading-tight">
            {adaptedRoom?.publicTitle ?? "朋友的心事小屋"}
            <Heart className="mb-1 ml-1 inline h-6 w-6 text-warm-orange" />
          </h1>
          <TornPaperCard tone="parchment" className="mx-auto mt-7 w-[82%] py-3 font-serif text-lg" tape="top">
            这里藏着一句话，找到 <strong>{adaptedRoom?.objects.length ?? 5}</strong> 个线索来猜猜看。
          </TornPaperCard>
        </header>

        {state.status === "loading" ? (
          <TornPaperCard className="mt-10 min-h-[420px] p-8 text-center font-serif text-xl leading-9" tone="cream" tape="corner">
            正在翻开这间小屋的纸门……
          </TornPaperCard>
        ) : null}

        {state.status === "error" ? (
          <TornPaperCard className="mt-10 p-8 text-center font-serif text-xl leading-9" tone="cream" tape="corner">
            {state.message}
            <PaperButton className="mt-7" variant="paper" onClick={() => router.push("/create")}>
              回到信纸
            </PaperButton>
          </TornPaperCard>
        ) : null}

        {adaptedRoom ? (
          <>
            <LayeredMiniRoom room={adaptedRoom} />
            <PaperButton
              className="mb-12 mt-7"
              withTape
              onClick={() => router.push(`/guess/${roomId}`)}
            >
              我好像猜到了
              <Heart className="h-7 w-7 text-warm-orange" />
            </PaperButton>
          </>
        ) : null}
      </PaperPage>
    </AppShell>
  );
}
