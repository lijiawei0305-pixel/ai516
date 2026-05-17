import crypto from "node:crypto";

import {
  generateRoomFromSecretInputSchema,
  parseStructuredOutput,
  roomNarrativeJsonSchema,
  roomNarrativeOutputSchema,
  secretAnalysisJsonSchema,
  secretAnalysisOutputSchema,
  clueImagePromptJsonSchema,
  clueImagePromptOutputSchema,
  type ClueImagePromptOutput,
  type GenerateRoomFromSecretInput,
  type GenerateRoomFromSecretOutput,
  type RoomNarrativeOutput,
  type SecretAnalysisOutput,
  type StructuredLlmClient
} from "@/lib/ai/schemas";
import type { AiProviderConfig } from "@/lib/ai/adminConfig";
import { buildRoomJson } from "@/lib/room/buildRoomJson";
import type { LlmProvider } from "@/lib/llm/provider/types";
import {
  runObjectImageJobs,
  type ObjectImageJobResult,
  type ObjectImageJobSuccess
} from "@/lib/llm/imageJobs/runObjectImageJobs";
import type { ImageGenerationJob, RoomAssetPlan } from "@/lib/llm/pipeline/types";

const HEART_CABIN_STYLE = [
  "旧纸手账风",
  "信封与胶带",
  "撕边纸片",
  "暖光",
  "纸板微缩小屋",
  "手作纸板质感",
  "2.5D 微缩模型",
  "低饱和",
  "不要科技感",
  "不要赛博风",
  "不要玻璃拟态"
].join("，");

const CLUE_OBJECT_SPRITE_TEMPLATE = [
  "single isolated 2.5D miniature clue object sprite",
  "standalone prop for compositing into a room later",
  "isometric top-front view, around 45 degree camera angle",
  "whole object fully visible",
  "object occupies about 60 percent of the square canvas with generous margins",
  "transparent PNG background or uniform plain background for easy cutout",
  "subtle contact shadow directly under the object",
  "handmade cardboard and old paper texture",
  "warm cozy lighting from upper left",
  "readable at mobile size",
  "no room background, no walls, no furniture around it",
  "no multiple objects, no text, no neon, no cyberpunk"
].join(", ");

const ROOM_SHELL_BACKGROUND_TEMPLATE = [
  "2.5D top-down mobile game room shell background",
  "handmade cardboard miniature room",
  "old paper scrapbook style",
  "back wall, left wall, right wall, warm floor",
  "window, lamp, bookshelf, desk base, plants",
  "clear empty spaces for 5 interactive clue objects",
  "warm light from upper left",
  "soft corner shadows",
  "no main clue objects",
  "no characters",
  "no readable text"
].join(", ");

const ANALYSIS_SYSTEM_PROMPT = [
  "你是《心事小屋》的语义分析助手，只输出符合 JSON Schema 的对象。",
  "你的任务是分析用户心事的情绪、关系张力和可隐喻表达。",
  "不要编造用户没有表达过的重大事实，不做医疗、法律、金融诊断。",
  "输出必须结构化，不能包含自由散文。"
].join("\n");

const NARRATIVE_SYSTEM_PROMPT = [
  "你是《心事小屋》的房间叙事设计师，只输出符合 JSON Schema 的对象。",
  `视觉风格必须是：${HEART_CABIN_STYLE}。`,
  "你要把语义分析转化为 5 个可点击线索物件、4 个猜测选项、宠物和公开分享文本。",
  "public 字段不得直接复述用户原句。",
  "hiddenMeaning 可以总结真实含义，但不能加入用户没有表达过的重大事实。",
  "objects 必须刚好 5 个，choices 必须刚好 4 个，且 choices 中只能有 1 个 isCorrect=true。",
  "线索要温柔、隐喻但不能过难，玩家通过 5 个物件和 4 个选项应该能猜到大意。"
].join("\n");

const IMAGE_PROMPT_SYSTEM_PROMPT = [
  "你是《心事小屋》的线索物件图像提示词设计师，只输出符合 JSON Schema 的对象。",
  "每张图只画一个独立的线索物件 sprite（不是完整房间场景）。",
  `统一视觉风格：${HEART_CABIN_STYLE}。`,
  "重要：每个 prompt 必须简短，控制在 150-250 字符以内，只描述物件核心外观。",
  "重要：negativePrompt 控制在 80 字符以内，只写最关键的 3-5 个排除词。",
  "不要在 prompt 中重复模板内容，系统会自动拼接风格模板。",
  "禁止科技感、赛博风、霓虹、可读文字。"
].join("\n");

function buildStructuredPrompt(task: string, payload: unknown) {
  return JSON.stringify(
    {
      task,
      language: "zh-CN",
      payload
    },
    null,
    2
  );
}

async function analyzeSecret(
  input: GenerateRoomFromSecretInput,
  client: StructuredLlmClient
): Promise<SecretAnalysisOutput> {
  const raw = await client({
    schemaName: "SecretAnalysisOutput",
    jsonSchema: secretAnalysisJsonSchema,
    system: ANALYSIS_SYSTEM_PROMPT,
    user: buildStructuredPrompt("analyzeSecretSemantics", input),
    temperature: 0.2
  });

  return parseStructuredOutput(
    secretAnalysisOutputSchema,
    raw,
    "SecretAnalysisOutput"
  );
}

async function generateNarrative(
  input: GenerateRoomFromSecretInput,
  analysis: SecretAnalysisOutput,
  client: StructuredLlmClient
): Promise<RoomNarrativeOutput> {
  const raw = await client({
    schemaName: "RoomNarrativeOutput",
    jsonSchema: roomNarrativeJsonSchema,
    system: NARRATIVE_SYSTEM_PROMPT,
    user: buildStructuredPrompt("generateRoomNarrative", {
      originalInput: input,
      analysis,
      constraints: {
        exactObjectCount: 5,
        exactChoiceCount: 4,
        exactCorrectChoiceCount: 1,
        noDirectOriginalSentenceLeak: true
      }
    }),
    temperature: 0.35
  });

  return parseStructuredOutput(
    roomNarrativeOutputSchema,
    raw,
    "RoomNarrativeOutput"
  );
}

async function generateImagePrompts(
  narrative: RoomNarrativeOutput,
  analysis: SecretAnalysisOutput,
  client: StructuredLlmClient
): Promise<ClueImagePromptOutput> {
  const raw = await client({
    schemaName: "ClueImagePromptOutput",
    jsonSchema: clueImagePromptJsonSchema,
    system: IMAGE_PROMPT_SYSTEM_PROMPT,
    user: buildStructuredPrompt("generateClueObjectImagePrompts", {
      analysis,
      room: {
        visualTheme: narrative.visualTheme,
        objects: narrative.objects.map((object) => ({
          id: object.id,
          name: object.name,
          visualDescription: object.visualDescription,
          keyword: object.keyword
        }))
      },
      requiredPromptTemplate: CLUE_OBJECT_SPRITE_TEMPLATE,
      assetCategories: [
        "clue_object_sprite",
        "room_shell_background",
        "pet_sprite",
        "foreground_occluder"
      ]
    }),
    temperature: 0.25
  });

  return parseStructuredOutput(
    clueImagePromptOutputSchema,
    raw,
    "ClueImagePromptOutput"
  );
}

function composeClueObjectPrompt(prompt: string) {
  const normalized = prompt.trim();

  if (!normalized) {
    return CLUE_OBJECT_SPRITE_TEMPLATE;
  }

  if (normalized.includes(CLUE_OBJECT_SPRITE_TEMPLATE)) {
    return normalized;
  }

  return `${CLUE_OBJECT_SPRITE_TEMPLATE}, ${normalized}`;
}

function assertNarrative(output: RoomNarrativeOutput, sentence: string) {
  const correctChoices = output.choices.filter((choice) => choice.isCorrect);

  if (correctChoices.length !== 1) {
    throw new Error("Generated room must contain exactly one correct choice");
  }

  const objectIds = new Set(output.objects.map((object) => object.id));
  const choiceIds = new Set(output.choices.map((choice) => choice.id));

  if (objectIds.size !== output.objects.length) {
    throw new Error("Generated room object ids must be unique");
  }

  if (choiceIds.size !== output.choices.length) {
    throw new Error("Generated room choice ids must be unique");
  }

  const normalizedSentence = sentence.replace(/\s+/g, "");
  const publicStrings = [
    output.roomTitle,
    output.publicTitle,
    output.emotionType,
    output.endingLine,
    output.shareText,
    output.pet.name,
    output.pet.personality,
    output.pet.safetyBehavior,
    ...output.objects.flatMap((object) => [
      object.name,
      object.visualDescription,
      object.clue,
      object.keyword,
      object.positionHint
    ]),
    ...output.choices.map((choice) => choice.text)
  ];
  const leaked = publicStrings.some((value) => {
    const normalizedValue = value.replace(/\s+/g, "");

    if (normalizedSentence.length < 10) {
      return normalizedValue.includes(normalizedSentence);
    }

    if (normalizedValue.includes(normalizedSentence)) {
      return true;
    }

    if (normalizedValue.length >= 10 && normalizedSentence.includes(normalizedValue)) {
      return true;
    }

    return false;
  });

  if (leaked) {
    throw new Error("Generated room leaked the original sentence in public fields");
  }
}

export type GeneratedRoomPipelineResult = {
  room: GenerateRoomFromSecretOutput;
  roomJson: Record<string, unknown>;
  analysis: SecretAnalysisOutput;
  imagePrompts: ClueImagePromptOutput;
  objectAssets: ObjectImageJobResult[];
};

function buildImageJobs(
  narrative: RoomNarrativeOutput,
  imagePrompts: ClueImagePromptOutput
): ImageGenerationJob[] {
  const promptByObjectId = new Map(
    imagePrompts.objects.map((object) => [
      object.objectId,
      {
        ...object,
        prompt: composeClueObjectPrompt(object.prompt)
      }
    ])
  );

  return narrative.objects.map((object, index) => {
    const imagePrompt = promptByObjectId.get(object.id);
    const prompt = imagePrompt?.prompt ?? composeClueObjectPrompt(object.visualDescription);

    return {
      jobId: `clue_${object.id}_${index}`,
      objectId: object.id,
      objectName: object.name,
      assetRole: "clue_object_sprite" as const,
      prompt,
      negativePrompt: imagePrompt?.negativePrompt ?? null,
      size: "1024x1024" as const,
      providerMode: "images_api" as const,
      responseFormat: "auto" as const
    };
  });
}

export async function generateRoomWithImages(
  input: GenerateRoomFromSecretInput,
  client: StructuredLlmClient,
  config: AiProviderConfig,
  roomId = `room_${crypto.randomUUID()}`,
  provider?: LlmProvider | null
): Promise<GeneratedRoomPipelineResult> {
  const parsedInput = generateRoomFromSecretInputSchema.parse(input);
  const analysis = await analyzeSecret(parsedInput, client);
  const narrative = await generateNarrative(parsedInput, analysis, client);

  assertNarrative(narrative, parsedInput.sentence);

  const imagePrompts = await generateImagePrompts(narrative, analysis, client);
  const jobs = buildImageJobs(narrative, imagePrompts);

  let objectAssets: ObjectImageJobResult[];

  if (provider) {
    const minimalRoomAssetPlan: RoomAssetPlan = {
      semanticAnalysis: {
        coreEmotion: analysis.coreEmotion,
        emotionalTone: analysis.relationshipContext,
        relationshipContext: analysis.relationshipContext,
        hiddenMeaning: analysis.implicitNeed,
        keySubtexts: analysis.metaphorSeeds.slice(0, 3),
        metaphorDirections: analysis.metaphorSeeds,
        difficultyLevel: "medium",
        safetyAssessment: { allowed: true, reason: null }
      },
      roomDesign: {
        roomTitle: narrative.roomTitle,
        publicTitle: narrative.publicTitle,
        emotionType: narrative.emotionType,
        visualTheme: "old_paper_dollhouse",
        objectConcepts: narrative.objects.map((obj) => ({
          id: obj.id,
          name: obj.name,
          metaphor: obj.visualDescription,
          clue: obj.clue,
          keyword: obj.keyword,
          sceneRole: obj.positionHint,
          preferredAssetType: "other" as const,
          positionHint: obj.positionHint
        })),
        choiceOptions: narrative.choices.map((c) => ({
          id: c.id,
          text: c.text,
          explanation: c.text
        })),
        correctChoiceIndex: narrative.choices.findIndex((c) => c.isCorrect),
        petPersonaHints: {
          type: narrative.pet.type === "dog" ? "dog" as const : "cat" as const,
          temperament: narrative.pet.personality,
          comfortBehavior: narrative.pet.personality,
          safetyBehavior: narrative.pet.safetyBehavior
        }
      },
      imagePromptPlan: {
        roomShellBackgroundPrompt: {
          positivePrompt: ROOM_SHELL_BACKGROUND_TEMPLATE,
          negativePrompt: null,
          size: "1024x1024",
          styleTags: HEART_CABIN_STYLE.split("，").slice(0, 8),
          renderIntent: "room shell background"
        },
        objectImagePrompts: narrative.objects.map((obj) => {
          const ip = imagePrompts.objects.find((p) => p.objectId === obj.id);
          return {
            objectId: obj.id,
            positivePrompt: ip ? composeClueObjectPrompt(ip.prompt) : composeClueObjectPrompt(obj.visualDescription),
            negativePrompt: ip?.negativePrompt ?? null,
            size: "1024x1024" as const,
            styleTags: HEART_CABIN_STYLE.split("，").slice(0, 8),
            renderIntent: obj.visualDescription
          };
        }),
        petSpritePrompt: {
          petType: narrative.pet.type === "dog" ? "dog" as const : "cat" as const,
          positivePrompt: "cute paper craft pet sprite",
          negativePrompt: null,
          size: "1024x1024",
          styleTags: HEART_CABIN_STYLE.split("，").slice(0, 8),
          renderIntent: "pet sprite"
        },
        foregroundOccluderPrompt: {
          positivePrompt: "paper foreground occluder",
          negativePrompt: null,
          size: "1024x1024",
          styleTags: HEART_CABIN_STYLE.split("，").slice(0, 8),
          renderIntent: "foreground layer"
        },
        sharedStylePrompt: HEART_CABIN_STYLE
      },
      generationPlan: {
        maxConcurrentImageJobs: provider.config.maxConcurrentImageJobs,
        jobs
      }
    };

    const imageResult = await runObjectImageJobs({
      roomId,
      creatorId: "anonymous",
      provider,
      roomAssetPlan: minimalRoomAssetPlan
    });

    objectAssets = imageResult.roomAssetResults;
    console.log(
      `[generateRoomWithImages] image generation: ${imageResult.generationSummary.successCount} success, ${imageResult.generationSummary.failedCount} failed`
    );
  } else {
    objectAssets = jobs.map((job) => ({
      objectId: job.objectId,
      objectName: job.objectName,
      assetRole: "clue_object_sprite" as const,
      status: "failed" as const,
      error: "NO_IMAGE_PROVIDER",
      retryable: false,
      fallbackPlan: { kind: "placeholder" as const, reason: "no provider configured" }
    }));
  }

  const successAssets = objectAssets.filter(
    (a): a is ObjectImageJobSuccess => a.status === "success"
  );
  const assetUrlMap = new Map(
    successAssets.map((a) => [a.objectId, a.publicUrl ?? ""])
  );

  const promptByObjectId = new Map(
    imagePrompts.objects.map((object) => [
      object.objectId,
      { ...object, prompt: composeClueObjectPrompt(object.prompt) }
    ])
  );

  const objects = narrative.objects.map((object) => {
    const imagePrompt = promptByObjectId.get(object.id);
    const asset = successAssets.find((a) => a.objectId === object.id);

    return {
      ...object,
      imagePrompt: imagePrompt?.prompt ?? null,
      negativePrompt: imagePrompt?.negativePrompt ?? null,
      imageUrl: assetUrlMap.get(object.id) ?? null,
      imageStoragePath: asset?.storagePath ?? null,
      imageSourceType: asset?.sourceType ?? null
    };
  });

  const room: GenerateRoomFromSecretOutput = {
    ...narrative,
    hiddenMeaning: narrative.hiddenMeaning.trim(),
    objects
  };

  const roomJson = buildRoomJson({
    roomId,
    originalSentence: parsedInput.sentence,
    semanticAnalysis: {
      coreEmotion: analysis.coreEmotion,
      hiddenMeaning: room.hiddenMeaning,
      implicitNeed: analysis.implicitNeed
    },
    room,
    objectAssets,
    generation: {
      imageGenerationMode: provider?.config.imageMode ?? config.imageGenerationMode,
      chatModel: config.chatModel,
      imageModel: provider?.config.imageModel ?? config.imageModel
    }
  });

  return {
    room,
    roomJson: roomJson as unknown as Record<string, unknown>,
    analysis,
    imagePrompts,
    objectAssets
  };
}
