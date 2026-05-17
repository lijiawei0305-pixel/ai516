import type { LlmProvider } from "@/lib/llm/provider/types";
import {
  imagePromptPlanJsonSchema,
  imagePromptPlanSchema,
  roomAssetPlanSchema,
  roomDesignSchema,
  semanticAnalysisSchema,
  type ImagePromptPlan,
  type RoomAssetPlan,
  type RoomDesign,
  type SemanticAnalysis
} from "@/lib/llm/pipeline/types";

const SHARED_LIGHTING_PROMPT =
  "single key light at 60 degrees from upper left, soft fill 0.3 from right, rim light from back right, consistent across all assets in this room";

const CLUE_OBJECT_PROMPT_REQUIREMENTS = [
  "single isolated 2.5D game prop asset",
  "placed inside a cozy handmade cardboard miniature room",
  "slightly isometric top-front view, around 45 degree camera angle",
  "bottom-center anchor feeling",
  "standing on a floor",
  "soft contact shadow under the object",
  "diorama miniature photography",
  "shallow depth of field",
  "visible volume shading on the side of the object",
  "rim light from the window side",
  "painterly brushwork with subtle handmade texture",
  "handmade cardboard and old paper texture",
  SHARED_LIGHTING_PROMPT,
  "isolated on a cream paper backdrop, no full scene",
  "clean cutout silhouette",
  "readable at mobile size",
  "no full room background",
  "no flat sticker",
  "no flat 2D",
  "no decal",
  "no clip art",
  "no icon",
  "no front-facing illustration",
  "no centered isolated product photo",
  "no text",
  "no neon",
  "no cyberpunk",
  "no photorealistic product photo"
].join(", ");

const ROOM_SHELL_BACKGROUND_PROMPT_REQUIREMENTS = [
  "2.5D top-down mobile game room shell background",
  "handmade cardboard miniature room",
  "old paper scrapbook style",
  "back wall, left wall, right wall, warm floor",
  "window, lamp, bookshelf, desk base, plants",
  "clear empty spaces for 5 interactive clue objects",
  "diorama miniature photography",
  "visible volume shading on walls and floor edges",
  SHARED_LIGHTING_PROMPT,
  "soft corner shadows",
  "no main clue objects",
  "no characters",
  "no readable text"
].join(", ");

const PET_SPRITE_PROMPT_REQUIREMENTS = [
  "single isolated 2.5D game pet sprite",
  "small cozy cat or dog companion",
  "slightly isometric top-front view, around 45 degree camera angle",
  "bottom-center anchor feeling",
  "standing on a floor",
  "soft contact shadow under the pet",
  "diorama miniature photography",
  "visible volume shading on the side of the body",
  "rim light from the window side",
  "painterly brushwork with subtle handmade texture",
  "handmade cardboard and old paper texture",
  SHARED_LIGHTING_PROMPT,
  "isolated on a cream paper backdrop, no full scene",
  "clean cutout silhouette",
  "readable at mobile size",
  "no full room background",
  "no flat sticker",
  "no flat 2D",
  "no decal",
  "no clip art",
  "no icon",
  "no front-facing illustration",
  "no centered isolated product photo",
  "no text",
  "no neon",
  "no cyberpunk",
  "no photorealistic animal photo"
].join(", ");

const FOREGROUND_OCCLUDER_PROMPT_REQUIREMENTS = [
  "single foreground occluder layer for a 2.5D mobile game room",
  "handmade cardboard miniature room material",
  "old paper scrapbook style",
  "table edge, door frame, rug edge, or cardboard floor lip",
  "slightly isometric top-front view, around 45 degree camera angle",
  "diorama miniature photography",
  "visible volume shading on the edge thickness",
  "wide clean cutout silhouette",
  SHARED_LIGHTING_PROMPT,
  "designed to overlap sprites in front",
  "no clue object",
  "no characters",
  "no readable text",
  "no flat 2D",
  "no decal",
  "no clip art",
  "no neon",
  "no cyberpunk",
  "no photorealistic product photo"
].join(", ");

const SHARED_STYLE_PROMPT = [
  "Heart Cabin visual style",
  "old paper scrapbook style",
  "handmade cardboard and old paper texture",
  "warm cozy lighting from upper left",
  "cozy secret miniature cabin mood",
  "2.5D mobile game asset perspective",
  "not copying any existing game art assets"
].join(", ");

const DEFAULT_NEGATIVE_PROMPT = [
  "no flat sticker",
  "no flat 2D",
  "no decal",
  "no clip art",
  "no icon",
  "no front-facing illustration",
  "no centered isolated product photo",
  "no full room background for sprites",
  "no realistic product photography",
  "no photorealistic product photo",
  "no glossy plastic",
  "no cyberpunk",
  "no futuristic UI",
  "no glassmorphism",
  "no neon",
  "no harsh studio lighting",
  "no readable text"
].join(", ");

const ASSET_PROMPT_STRATEGIES = {
  envelope_letter:
    "信封/书信用旧纸信封、没寄出的折痕、轻微胶带、手写痕迹来表达未说出口的话；避免可读隐私文本。",
  clock:
    "钟用倒着走、停在某个温柔时刻、纸板指针或轻微裂纹来表达时间卡住；保持玩具比例。",
  moon:
    "月亮用纸片月亮、剪贴阴影、窗边小挂饰或桌面月光来表达远处的陪伴；不要画成完整夜景。",
  chair:
    "椅子用空椅、歪斜靠背、旧纸坐垫或等待姿态来表达缺席与想靠近；要能独立摆放。",
  chat_note:
    "聊天框便签用关着灯的小对话框、未发送纸条、贴在墙上的便签气泡来表达没发出的消息；不要做科技屏幕。",
  book:
    "书用合上的旧书、夹着纸条、翻到空白页或压着花瓣来表达没讲完的故事；避免大段文字。",
  plant:
    "小植物用纸盆栽、低头嫩芽、卷边叶子或新芽来表达被照顾的希望；保持纸艺质感。",
  key:
    "小钥匙用纸板钥匙、旧铜色但不金属炫光、挂着标签来表达入口、答案或迟到的勇气。",
  paper_note:
    "小纸条用撕边纸片、胶带固定、折角和浅浅字迹来表达线索；文字只作不可读纹理。",
  other:
    "其他物件也必须是小屋中可摆放的纸艺小物，具备清楚轮廓、温柔隐喻和干净背景。"
} as const;

const IMAGE_PROMPT_SYSTEM_PROMPT = [
  "你是《心事小屋》的 2.5D 图像资产提示词设计师，只输出符合 JSON Schema 的对象。",
  "不要让图像模型直接生成完整可玩的房间；模型只负责生成统一视角的素材，真正的 2.5D 空间由前端通过房间壳背景、y-sort、接地阴影、前景遮挡和底部中心锚点实现。",
  "你要生成四类资产 prompt：room_shell_background、5 个 clue_object_sprite、pet_sprite、foreground_occluder。",
  `所有 positivePrompt 都必须包含或等价表达：${SHARED_STYLE_PROMPT}。`,
  `每个 clue_object_sprite positivePrompt 必须逐项包含或等价表达：${CLUE_OBJECT_PROMPT_REQUIREMENTS}。`,
  `room_shell_background positivePrompt 必须逐项包含或等价表达：${ROOM_SHELL_BACKGROUND_PROMPT_REQUIREMENTS}。`,
  "pet_sprite 必须是小猫或小狗宠物 sprite，视角和材质要与线索物件一致。",
  "foreground_occluder 必须是能在前端覆盖物件的前景遮挡素材，例如桌边、门框、地毯边缘或纸板地板前缘。",
  "目标不是复制《元气骑士》的美术素材，只借鉴 2.5D 空间组织方式；《心事小屋》必须保持旧纸、手账、纸板、暖光、秘密小屋风格。",
  "所有素材必须保持同一光源参数（左上 60 度主光、右侧 0.3 柔补光、后右描边光），且都带体积侧阴影与边缘光，避免平贴图。",
  "不再要求 transparent background，而是统一输出在 cream paper backdrop 上，后端会做色温与抠图后处理。",
  "对 plant、window、moon、bookshelf 类语义的线索物件，可以在 objectImagePrompts[i].layers 中额外输出 2-3 层（role 为 back / mid / front）以制造纸艺立体感：例如 plant 拆为 back=陶盆、mid=主茎与叶丛、front=最前方一两片大叶或花苞；window 拆为 back=远景月亮夜空、front=窗框与百叶。每层 positivePrompt 仅描述该层包含的视觉内容（明确写出 only / no others / isolated 等限制），共享主体的 positivePrompt 风格描述。其他物件保持单层（不要 layers 字段或留空）。",
  "不要生成科技风、赛博风、玻璃拟态、写实摄影棚商品图、可读文字或霓虹。",
  "输出必须结构化 JSON，不能包含自由散文。"
].join("\n");

function parseJsonPayload(content: string): unknown {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    if (fenced?.[1]) {
      return JSON.parse(fenced[1]);
    }

    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw new Error("LLM_IMAGE_PROMPT_PLAN_JSON_MISSING");
  }
}

function buildUserPrompt(
  semanticAnalysis: SemanticAnalysis,
  roomDesign: RoomDesign,
  configuredStylePrompt: string,
  configuredObjectStylePrompt: string,
  configuredNegativePrompt: string | null
) {
  return JSON.stringify(
    {
      task: "generate_object_image_prompts",
      language: "zh-CN",
      semanticAnalysis,
      roomDesign: {
        roomTitle: roomDesign.roomTitle,
        emotionType: roomDesign.emotionType,
        visualTheme: roomDesign.visualTheme,
        objectConcepts: roomDesign.objectConcepts
      },
      sharedStylePrompt: [
        SHARED_STYLE_PROMPT,
        configuredStylePrompt,
        configuredObjectStylePrompt
      ]
        .filter(Boolean)
        .join(", "),
      defaultNegativePrompt:
        configuredNegativePrompt || DEFAULT_NEGATIVE_PROMPT,
      assetCategories: [
        "room_shell_background",
        "clue_object_sprite",
        "pet_sprite",
        "foreground_occluder"
      ],
      requiredPromptTemplates: {
        clueObjectSprite: CLUE_OBJECT_PROMPT_REQUIREMENTS,
        roomShellBackground: ROOM_SHELL_BACKGROUND_PROMPT_REQUIREMENTS,
        petSprite: PET_SPRITE_PROMPT_REQUIREMENTS,
        foregroundOccluder: FOREGROUND_OCCLUDER_PROMPT_REQUIREMENTS
      },
      pet: {
        type:
          roomDesign.petPersonaHints.type === "dog"
            ? "dog"
            : "cat",
        temperament: roomDesign.petPersonaHints.temperament
      },
      assetPromptStrategies: ASSET_PROMPT_STRATEGIES,
      constraints: {
        exactPromptCount: 5,
        includeRoomShellBackgroundPrompt: true,
        includePetSpritePrompt: true,
        includeForegroundOccluderPrompt: true,
        size: "use provider default size unless a square size is needed",
        objectAssetOnlyForClues: true,
        transparentOrCleanBackgroundPreference: true,
        noReadablePrivateText: true
      }
    },
    null,
    2
  );
}

function assertImagePromptPlan(plan: ImagePromptPlan, roomDesign: RoomDesign) {
  const objectIds = new Set(roomDesign.objectConcepts.map((object) => object.id));
  const promptIds = new Set(
    plan.objectImagePrompts.map((prompt) => prompt.objectId)
  );

  if (promptIds.size !== plan.objectImagePrompts.length) {
    throw new Error("IMAGE_PROMPT_OBJECT_IDS_MUST_BE_UNIQUE");
  }

  for (const objectId of objectIds) {
    if (!promptIds.has(objectId)) {
      throw new Error(`IMAGE_PROMPT_MISSING_OBJECT_${objectId}`);
    }
  }

  const requiredPromptFragments = [
    "single isolated 2.5D game prop asset",
    "bottom-center anchor feeling",
    "standing on a floor",
    "soft contact shadow under the object",
    "diorama miniature photography",
    "visible volume shading on the side of the object",
    "rim light from the window side",
    "isolated on a cream paper backdrop",
    "no flat sticker",
    "no flat 2D",
    "no decal"
  ];

  for (const prompt of plan.objectImagePrompts) {
    for (const fragment of requiredPromptFragments) {
      if (!prompt.positivePrompt.includes(fragment)) {
        throw new Error(
          `IMAGE_PROMPT_MISSING_REQUIRED_FRAGMENT_${prompt.objectId}_${fragment}`
        );
      }
    }
  }
}

export async function generateObjectPrompts(
  semanticAnalysis: SemanticAnalysis,
  roomDesign: RoomDesign,
  provider: LlmProvider
): Promise<ImagePromptPlan> {
  const parsedAnalysis = semanticAnalysisSchema.parse(semanticAnalysis);
  const parsedDesign = roomDesignSchema.parse(roomDesign);
  const result = await provider.chatCompletion({
    model: provider.config.chatModel,
    messages: [
      {
        role: "system",
        content: IMAGE_PROMPT_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: buildUserPrompt(
          parsedAnalysis,
          parsedDesign,
          provider.config.globalVisualStylePrompt,
          provider.config.objectStylePrompt,
          provider.config.negativePrompt
        )
      }
    ],
    temperature: 0.25,
    maxTokens: 4600,
    responseFormat: provider.config.enableSchemaValidation
      ? {
          type: "json_schema",
          name: "ImagePromptPlan",
          schema: imagePromptPlanJsonSchema
        }
      : {
          type: "json_object"
        }
  });
  const plan = imagePromptPlanSchema.parse(parseJsonPayload(result.content));

  assertImagePromptPlan(plan, parsedDesign);
  return plan;
}

export function buildRoomAssetPlan(
  semanticAnalysis: SemanticAnalysis,
  roomDesign: RoomDesign,
  imagePromptPlan: ImagePromptPlan,
  provider: LlmProvider
): RoomAssetPlan {
  const objectById = new Map(
    roomDesign.objectConcepts.map((object) => [object.id, object])
  );
  const clueJobs = imagePromptPlan.objectImagePrompts.flatMap((prompt) => {
    const object = objectById.get(prompt.objectId);

    if (!object) {
      throw new Error(`GENERATION_PLAN_UNKNOWN_OBJECT_${prompt.objectId}`);
    }

    const baseNegative =
      prompt.negativePrompt ||
      provider.config.negativePrompt ||
      DEFAULT_NEGATIVE_PROMPT;
    const baseSize = prompt.size || provider.config.defaultImageSize;

    if (prompt.layers && prompt.layers.length > 0) {
      return prompt.layers.map((layer) => ({
        jobId: `job_${prompt.objectId}_${layer.role}`,
        objectId: prompt.objectId,
        objectName: object.name,
        assetRole: "clue_object_sprite" as const,
        layerRole: layer.role,
        prompt: [
          imagePromptPlan.sharedStylePrompt,
          prompt.positivePrompt,
          layer.positivePrompt
        ]
          .filter(Boolean)
          .join(", "),
        negativePrompt: layer.negativePrompt || baseNegative,
        size: baseSize,
        providerMode: provider.config.imageMode,
        responseFormat: provider.config.imageResponseFormat
      }));
    }

    return [
      {
        jobId: `job_${prompt.objectId}`,
        objectId: prompt.objectId,
        objectName: object.name,
        assetRole: "clue_object_sprite" as const,
        prompt: [imagePromptPlan.sharedStylePrompt, prompt.positivePrompt]
          .filter(Boolean)
          .join(", "),
        negativePrompt: baseNegative,
        size: baseSize,
        providerMode: provider.config.imageMode,
        responseFormat: provider.config.imageResponseFormat
      }
    ];
  });
  const backgroundPrompt = imagePromptPlan.roomShellBackgroundPrompt;
  const petPrompt = imagePromptPlan.petSpritePrompt;
  const foregroundPrompt = imagePromptPlan.foregroundOccluderPrompt;
  const jobs = [
    {
      jobId: "job_room_shell_background",
      objectId: "room_shell_background",
      objectName: "房间壳背景",
      assetRole: "room_shell_background",
      prompt: [imagePromptPlan.sharedStylePrompt, backgroundPrompt.positivePrompt]
        .filter(Boolean)
        .join(", "),
      negativePrompt:
        backgroundPrompt.negativePrompt ||
        provider.config.negativePrompt ||
        DEFAULT_NEGATIVE_PROMPT,
      size: backgroundPrompt.size || provider.config.defaultImageSize,
      providerMode: provider.config.imageMode,
      responseFormat: provider.config.imageResponseFormat
    },
    ...clueJobs,
    {
      jobId: "job_pet_sprite",
      objectId: "pet_sprite",
      objectName: petPrompt.petType === "dog" ? "小狗宠物" : "小猫宠物",
      assetRole: "pet_sprite",
      prompt: [imagePromptPlan.sharedStylePrompt, petPrompt.positivePrompt]
        .filter(Boolean)
        .join(", "),
      negativePrompt:
        petPrompt.negativePrompt ||
        provider.config.negativePrompt ||
        DEFAULT_NEGATIVE_PROMPT,
      size: petPrompt.size || provider.config.defaultImageSize,
      providerMode: provider.config.imageMode,
      responseFormat: provider.config.imageResponseFormat
    },
    {
      jobId: "job_foreground_occluder",
      objectId: "foreground_occluder",
      objectName: "前景遮挡",
      assetRole: "foreground_occluder",
      prompt: [imagePromptPlan.sharedStylePrompt, foregroundPrompt.positivePrompt]
        .filter(Boolean)
        .join(", "),
      negativePrompt:
        foregroundPrompt.negativePrompt ||
        provider.config.negativePrompt ||
        DEFAULT_NEGATIVE_PROMPT,
      size: foregroundPrompt.size || provider.config.defaultImageSize,
      providerMode: provider.config.imageMode,
      responseFormat: provider.config.imageResponseFormat
    }
  ];

  return roomAssetPlanSchema.parse({
    semanticAnalysis,
    roomDesign,
    imagePromptPlan,
    generationPlan: {
      maxConcurrentImageJobs: provider.config.maxConcurrentImageJobs,
      jobs
    }
  });
}

export async function generateRoomAssetPlan(
  semanticAnalysis: SemanticAnalysis,
  roomDesign: RoomDesign,
  provider: LlmProvider
): Promise<RoomAssetPlan> {
  const imagePromptPlan = await generateObjectPrompts(
    semanticAnalysis,
    roomDesign,
    provider
  );

  return buildRoomAssetPlan(
    semanticAnalysis,
    roomDesign,
    imagePromptPlan,
    provider
  );
}
