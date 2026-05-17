"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { ArrowLeft, Settings2, Sparkles } from "lucide-react";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { LlmProviderForm } from "@/components/admin/LlmProviderForm";
import { LlmTestPanel } from "@/components/admin/LlmTestPanel";
import { fetchAdminLlmConfig } from "@/lib/api/admin-llm";
import {
  createDefaultAdminLlmConfigDraft,
  type AdminLlmConfigDraft
} from "@/lib/schemas/adminLlmConfig";

export default function Page() {
  const router = useRouter();
  const [initialConfig, setInitialConfig] = useState<AdminLlmConfigDraft>(
    createDefaultAdminLlmConfigDraft()
  );
  const [loadState, setLoadState] = useState<{
    status: "loading" | "ready" | "error";
    message: string | null;
  }>({
    status: "loading",
    message: "正在读取当前配置..."
  });

  useEffect(() => {
    document.title = "心事小屋 · LLM 设置";
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchAdminLlmConfig()
      .then((config) => {
        if (!mounted) return;
        setInitialConfig(config);
        setLoadState({ status: "ready", message: "已读取当前配置。" });
      })
      .catch((error) => {
        if (!mounted) return;
        setLoadState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "读取失败，将使用页面默认草稿。"
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell>
      <PaperPage className="pt-14" innerClassName="pb-10">
        <header className="relative mb-5 text-center">
          <HanddrawnIconButton
            icon={<ArrowLeft className="h-6 w-6" />}
            label="返回首页"
            className="absolute left-0 top-0"
            onClick={() => router.push("/")}
          />
          <div className="mb-2 flex items-center justify-center gap-2 text-coffee/55">
            <Settings2 className="h-5 w-5" />
            <span className="soft-title text-lg">管理员配置</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="soft-title text-[32px] leading-tight">LLM 设置页</h1>
          <p className="mx-auto mt-3 max-w-[300px] font-serif text-base leading-7 text-coffee/70">
            这里用于配置兼容 OpenAI 的模型服务、图像策略和测试连接，不进入普通用户流程。
          </p>
        </header>

        <TornPaperCard tone="parchment" className="mb-5" tape="corner">
          <p className="font-serif text-sm leading-7 text-coffee/74">
            说明：API Key 仅在前端表单中短暂停留，保存时通过服务端接口传递，不做本地明文持久化。
          </p>
          <p
            className={
              loadState.status === "error"
                ? "mt-2 font-serif text-sm text-brick-red"
                : "mt-2 font-serif text-sm text-coffee/62"
            }
          >
            {loadState.message}
          </p>
        </TornPaperCard>

        <LlmProviderForm initialConfig={initialConfig} />

        <div className="mt-5">
          {loadState.status === "ready" || loadState.status === "error" ? (
            <LlmTestPanel />
          ) : null}
        </div>
      </PaperPage>
    </AppShell>
  );
}
