"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RotateCcw, Save } from "lucide-react";
import { PaperButton } from "@/components/handbook/paper-button";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { NotebookTextarea } from "@/components/ui/notebook-textarea";
import { ImageModeSelector } from "@/components/admin/ImageModeSelector";
import { useAdminLlmStore } from "@/lib/admin-llm-store";
import { saveAdminLlmConfig, resetAdminLlmConfig } from "@/lib/api/admin-llm";
import {
  adminLlmConfigDraftSchema,
  type AdminLlmConfigDraft
} from "@/lib/schemas/adminLlmConfig";
import { cn } from "@/lib/utils";

type LlmProviderFormProps = {
  initialConfig: AdminLlmConfigDraft;
  onLoaded?: (config: AdminLlmConfigDraft) => void;
};

export function LlmProviderForm({ initialConfig, onLoaded }: LlmProviderFormProps) {
  const { setConfig } = useAdminLlmStore();
  const [form, setForm] = useState<AdminLlmConfigDraft>(initialConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [submitState, setSubmitState] = useState<{
    status: "idle" | "saving" | "saved" | "error";
    message: string | null;
  }>({
    status: "idle",
    message: null
  });

  const validation = useMemo(() => adminLlmConfigDraftSchema.safeParse(form), [form]);

  useEffect(() => {
    setConfig(form);
  }, [form, setConfig]);

  useEffect(() => {
    setForm(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    onLoaded?.(form);
  }, [form, onLoaded]);

  function updateSection<K extends "provider" | "chat" | "image" | "style">(
    section: K,
    key: keyof AdminLlmConfigDraft[K],
    value: AdminLlmConfigDraft[K][keyof AdminLlmConfigDraft[K]]
  ) {
    setForm((state) => ({
      ...state,
      [section]: {
        ...state[section],
        [key]: value
      }
    }));
    setSubmitState({ status: "idle", message: null });
  }

  async function handleSave() {
    const parsed = adminLlmConfigDraftSchema.safeParse(form);
    if (!parsed.success) {
      setSubmitState({
        status: "error",
        message: "表单校验未通过，请先检查红色提示项。"
      });
      return;
    }

    setSubmitState({ status: "saving", message: "正在保存..." });
    try {
      const saved = await saveAdminLlmConfig(parsed.data);
      setForm(saved);
      setConfig(saved);
      setSubmitState({ status: "saved", message: "已保存配置。" });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "保存失败。"
      });
    }
  }

  async function handleReset() {
    setSubmitState({ status: "saving", message: "正在重置..." });
    try {
      const reset = await resetAdminLlmConfig();
      setForm(reset);
      setConfig(reset);
      setSubmitState({ status: "saved", message: "已恢复默认值。" });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "重置失败。"
      });
    }
  }

  return (
    <div className="space-y-5">
      <TornPaperCard tone="cream" tape="top" className="space-y-4">
        <div className="flex items-center gap-2">
          <StickerTag tone="sage">服务配置</StickerTag>
          <p className="font-serif text-sm text-coffee/66">服务商与基础连接信息</p>
        </div>
        <div className="grid gap-4">
          <Field
            label="Provider Name"
            value={form.provider.providerName}
            onChange={(value) => updateSection("provider", "providerName", value)}
          />
          <Field
            label="Base URL"
            value={form.provider.baseUrl}
            onChange={(value) => updateSection("provider", "baseUrl", value)}
          />
          <div className="space-y-2">
            <label className="font-serif text-sm text-coffee/72">API Key</label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? "text" : "password"}
                value={form.provider.apiKey}
                onChange={(event) =>
                  updateSection("provider", "apiKey", event.target.value)
                }
                className="lined-paper paper-grain min-h-14 w-full rounded-[3px] border-0 bg-cream/92 px-4 font-serif text-base text-coffee shadow-paper outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowApiKey((value) => !value)}
                className="torn-edge paper-grain inline-flex h-14 w-14 items-center justify-center bg-parchment text-coffee shadow-sticker"
                aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
              >
                {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Field
            label="Chat Model"
            value={form.provider.chatModel}
            onChange={(value) => updateSection("provider", "chatModel", value)}
          />
          <Field
            label="Image Model"
            value={form.provider.imageModel}
            onChange={(value) => updateSection("provider", "imageModel", value)}
          />
          <NumberField
            label="Default Timeout(ms)"
            value={form.provider.defaultTimeoutMs}
            onChange={(value) => updateSection("provider", "defaultTimeoutMs", value)}
          />
          <NumberField
            label="Max Concurrent Image Jobs"
            value={form.provider.maxConcurrentImageJobs}
            onChange={(value) =>
              updateSection("provider", "maxConcurrentImageJobs", value)
            }
          />
          <ToggleField
            label="是否启用语义分析"
            value={form.provider.enableSemanticAnalysis}
            onChange={(value) =>
              updateSection("provider", "enableSemanticAnalysis", value)
            }
          />
          <ToggleField
            label="是否启用并发生成图像"
            value={form.provider.enableConcurrentImageGeneration}
            onChange={(value) =>
              updateSection("provider", "enableConcurrentImageGeneration", value)
            }
          />
        </div>
      </TornPaperCard>

      <TornPaperCard tone="parchment" tape="top" className="space-y-4">
        <StickerTag tone="parchment">聊天接口配置</StickerTag>
        <Field
          label="Chat Endpoint Path"
          value={form.chat.chatEndpointPath}
          onChange={(value) => updateSection("chat", "chatEndpointPath", value)}
        />
        <ToggleField
          label="是否启用结构化 schema 校验"
          value={form.chat.enableStructuredSchemaValidation}
          onChange={(value) =>
            updateSection("chat", "enableStructuredSchemaValidation", value)
          }
        />
      </TornPaperCard>

      <TornPaperCard tone="cream" tape="top" className="space-y-4">
        <StickerTag tone="sage">图像接口配置</StickerTag>
        <ImageModeSelector
          value={form.image.imageMode}
          onChange={(value) => updateSection("image", "imageMode", value)}
        />
        <Field
          label="Images Endpoint Path"
          value={form.image.imagesEndpointPath}
          onChange={(value) => updateSection("image", "imagesEndpointPath", value)}
        />
        <label className="space-y-2">
          <span className="font-serif text-sm text-coffee/72">Response Format</span>
          <select
            value={form.image.imageResponseFormat}
            onChange={(event) =>
              updateSection(
                "image",
                "imageResponseFormat",
                event.target.value as AdminLlmConfigDraft["image"]["imageResponseFormat"]
              )
            }
            className="lined-paper paper-grain min-h-14 w-full rounded-[3px] border-0 bg-cream/92 px-4 font-serif text-base text-coffee shadow-paper outline-none"
          >
            <option value="url">url</option>
            <option value="b64_json">b64_json</option>
            <option value="auto">auto</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="font-serif text-sm text-coffee/72">Image Size</span>
          <select
            value={form.image.imageSize}
            onChange={(event) =>
              updateSection(
                "image",
                "imageSize",
                event.target.value as AdminLlmConfigDraft["image"]["imageSize"]
              )
            }
            className="lined-paper paper-grain min-h-14 w-full rounded-[3px] border-0 bg-cream/92 px-4 font-serif text-base text-coffee shadow-paper outline-none"
          >
            <option value="512x512">512x512</option>
            <option value="768x768">768x768</option>
            <option value="1024x1024">1024x1024</option>
          </select>
        </label>
      </TornPaperCard>

      <TornPaperCard tone="parchment" tape="top" className="space-y-4">
        <StickerTag tone="blue">风格策略</StickerTag>
        <TextAreaField
          label="Global Visual Style Prompt"
          value={form.style.globalVisualStylePrompt}
          onChange={(value) =>
            updateSection("style", "globalVisualStylePrompt", value)
          }
        />
        <TextAreaField
          label="2.5D Style Prompt"
          value={form.style.style2dPrompt}
          onChange={(value) => updateSection("style", "style2dPrompt", value)}
        />
        <TextAreaField
          label="Miniature House Style Prompt"
          value={form.style.miniatureHouseStylePrompt}
          onChange={(value) =>
            updateSection("style", "miniatureHouseStylePrompt", value)
          }
        />
        <TextAreaField
          label="Negative Prompt"
          value={form.style.negativePrompt ?? ""}
          onChange={(value) =>
            updateSection("style", "negativePrompt", value.trim() ? value : null)
          }
          placeholder="可选"
        />
      </TornPaperCard>

      <div className="space-y-3">
        <PaperButton
          withTape
          icon={<Save className="h-6 w-6" />}
          onClick={handleSave}
          disabled={!validation.success || submitState.status === "saving"}
          className="text-[20px]"
        >
          保存配置
        </PaperButton>
        <PaperButton
          variant="paper"
          icon={<RotateCcw className="h-6 w-6" />}
          onClick={handleReset}
          className="text-[20px]"
        >
          重置默认值
        </PaperButton>
        <p
          className={cn(
            "rounded-[3px] px-4 py-3 font-serif text-sm leading-6",
            submitState.status === "error" && "bg-[#f0d1cb] text-brick-red",
            submitState.status === "saved" && "bg-[#dfe6d6] text-coffee",
            submitState.status === "saving" && "bg-cream/70 text-coffee/78",
            submitState.status === "idle" && "bg-cream/60 text-coffee/60"
          )}
        >
          {submitState.message ?? "保存后仅会发送到后端，不会写入前端本地存储。"}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="font-serif text-sm text-coffee/72">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="lined-paper paper-grain min-h-14 w-full rounded-[3px] border-0 bg-cream/92 px-4 font-serif text-base text-coffee shadow-paper outline-none"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="font-serif text-sm text-coffee/72">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="lined-paper paper-grain min-h-14 w-full rounded-[3px] border-0 bg-cream/92 px-4 font-serif text-base text-coffee shadow-paper outline-none"
      />
    </label>
  );
}

function ToggleField({
  label,
  value,
  onChange
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "torn-edge paper-grain flex min-h-14 items-center justify-between gap-3 px-4 py-3 text-left shadow-sticker",
        value ? "bg-sage text-cream" : "bg-cream text-coffee"
      )}
      aria-pressed={value}
    >
      <span className="font-serif text-base">{label}</span>
      <span className="text-sm opacity-80">{value ? "已开启" : "已关闭"}</span>
    </button>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="font-serif text-sm text-coffee/72">{label}</span>
      <NotebookTextarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-32 text-base leading-8"
      />
    </label>
  );
}
