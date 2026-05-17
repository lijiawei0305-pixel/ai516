import { z } from "zod";

const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const pipelineIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(48)
  .regex(/^[a-z][a-z0-9_-]*$/);

export const secretPipelineInputSchema = z
  .object({
    originalSentence: shortText(500),
    emotionTags: z.array(shortText(24)).max(12).default([]),
    imageClueSafeDescription: optionalText(500),
    creatorStylePreference: optionalText(240)
  })
  .strict();

export const semanticAnalysisSchema = z
  .object({
    coreEmotion: shortText(40),
    emotionalTone: shortText(80),
    relationshipContext: shortText(120),
    hiddenMeaning: shortText(500),
    keySubtexts: z.array(shortText(120)).min(2).max(8),
    metaphorDirections: z.array(shortText(80)).min(3).max(8),
    difficultyLevel: z.enum(["easy", "medium", "hard"]),
    safetyAssessment: z
      .object({
        allowed: z.boolean(),
        reason: optionalText(240)
      })
      .strict()
  })
  .strict();

export const objectConceptSchema = z
  .object({
    id: pipelineIdSchema,
    name: shortText(32),
    metaphor: shortText(160),
    clue: shortText(160),
    keyword: shortText(32),
    sceneRole: shortText(100),
    preferredAssetType: z.enum([
      "envelope_letter",
      "clock",
      "moon",
      "chair",
      "chat_note",
      "book",
      "plant",
      "key",
      "paper_note",
      "other"
    ]),
    positionHint: shortText(120)
  })
  .strict();

export const choiceOptionSchema = z
  .object({
    id: pipelineIdSchema,
    text: shortText(100),
    explanation: shortText(160)
  })
  .strict();

export const petPersonaHintsSchema = z
  .object({
    type: z.enum(["cat", "dog", "rabbit", "bird", "paper_spirit"]),
    temperament: shortText(80),
    comfortBehavior: shortText(160),
    safetyBehavior: shortText(160)
  })
  .strict();

export const roomDesignSchema = z
  .object({
    roomTitle: shortText(48),
    publicTitle: shortText(40),
    emotionType: shortText(40),
    visualTheme: z.enum([
      "old_paper_dollhouse",
      "warm_notebook_cabin",
      "rainy_desk_miniature",
      "moonlit_paper_room",
      "pressed_flower_attic"
    ]),
    objectConcepts: z.array(objectConceptSchema).length(5),
    choiceOptions: z.array(choiceOptionSchema).length(4),
    correctChoiceIndex: z.number().int().min(0).max(3),
    petPersonaHints: petPersonaHintsSchema
  })
  .strict();

export const objectImagePromptLayerRoleSchema = z.enum(["back", "mid", "front"]);

export const objectImagePromptLayerSchema = z
  .object({
    role: objectImagePromptLayerRoleSchema,
    positivePrompt: shortText(1400),
    negativePrompt: optionalText(500),
    zOffset: z.number().min(-80).max(80).optional(),
    parallaxMultiplier: z.number().min(0.4).max(1.6).optional(),
    swayAmplitude: z.number().min(0).max(6).optional()
  })
  .strict();

export const objectImagePromptSchema = z
  .object({
    objectId: pipelineIdSchema,
    positivePrompt: shortText(1400),
    negativePrompt: optionalText(500),
    size: z.enum(["512x512", "768x768", "1024x1024"]),
    styleTags: z.array(shortText(40)).min(6).max(18),
    renderIntent: shortText(220),
    layers: z.array(objectImagePromptLayerSchema).max(4).optional()
  })
  .strict();

export const roomShellBackgroundPromptSchema = z
  .object({
    positivePrompt: shortText(1600),
    negativePrompt: optionalText(600),
    size: z.enum(["512x512", "768x768", "1024x1024"]),
    styleTags: z.array(shortText(40)).min(6).max(18),
    renderIntent: shortText(220)
  })
  .strict();

export const petSpritePromptSchema = z
  .object({
    petType: z.enum(["cat", "dog"]),
    positivePrompt: shortText(1400),
    negativePrompt: optionalText(600),
    size: z.enum(["512x512", "768x768", "1024x1024"]),
    styleTags: z.array(shortText(40)).min(6).max(18),
    renderIntent: shortText(220)
  })
  .strict();

export const foregroundOccluderPromptSchema = z
  .object({
    positivePrompt: shortText(1400),
    negativePrompt: optionalText(600),
    size: z.enum(["512x512", "768x768", "1024x1024"]),
    styleTags: z.array(shortText(40)).min(6).max(18),
    renderIntent: shortText(220)
  })
  .strict();

export const imagePromptPlanSchema = z
  .object({
    roomShellBackgroundPrompt: roomShellBackgroundPromptSchema,
    objectImagePrompts: z.array(objectImagePromptSchema).length(5),
    petSpritePrompt: petSpritePromptSchema,
    foregroundOccluderPrompt: foregroundOccluderPromptSchema,
    sharedStylePrompt: shortText(800)
  })
  .strict();

export const imageAssetRoleSchema = z.enum([
  "room_shell_background",
  "clue_object_sprite",
  "pet_sprite",
  "foreground_occluder"
]);

export const imageGenerationJobSchema = z
  .object({
    jobId: pipelineIdSchema,
    objectId: pipelineIdSchema,
    objectName: shortText(32),
    assetRole: imageAssetRoleSchema,
    layerRole: objectImagePromptLayerRoleSchema.optional(),
    prompt: shortText(3000),
    negativePrompt: optionalText(700),
    size: z.enum(["512x512", "768x768", "1024x1024"]),
    providerMode: z.enum(["images_api", "chat_completions_image_model"]),
    responseFormat: z.enum(["url", "b64_json", "auto"])
  })
  .strict();

export const roomAssetPlanSchema = z
  .object({
    semanticAnalysis: semanticAnalysisSchema,
    roomDesign: roomDesignSchema,
    imagePromptPlan: imagePromptPlanSchema,
    generationPlan: z
      .object({
        maxConcurrentImageJobs: z.number().int().min(1).max(12),
        jobs: z.array(imageGenerationJobSchema).min(8).max(20)
      })
      .strict()
  })
  .strict();

export type SecretPipelineInput = z.infer<typeof secretPipelineInputSchema>;
export type SemanticAnalysis = z.infer<typeof semanticAnalysisSchema>;
export type ObjectConcept = z.infer<typeof objectConceptSchema>;
export type RoomDesign = z.infer<typeof roomDesignSchema>;
export type ObjectImagePrompt = z.infer<typeof objectImagePromptSchema>;
export type RoomShellBackgroundPrompt = z.infer<
  typeof roomShellBackgroundPromptSchema
>;
export type PetSpritePrompt = z.infer<typeof petSpritePromptSchema>;
export type ForegroundOccluderPrompt = z.infer<
  typeof foregroundOccluderPromptSchema
>;
export type ImagePromptPlan = z.infer<typeof imagePromptPlanSchema>;
export type ImageAssetRole = z.infer<typeof imageAssetRoleSchema>;
export type ImageGenerationJob = z.infer<typeof imageGenerationJobSchema>;
export type RoomAssetPlan = z.infer<typeof roomAssetPlanSchema>;

export const semanticAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "coreEmotion",
    "emotionalTone",
    "relationshipContext",
    "hiddenMeaning",
    "keySubtexts",
    "metaphorDirections",
    "difficultyLevel",
    "safetyAssessment"
  ],
  properties: {
    coreEmotion: { type: "string", maxLength: 40 },
    emotionalTone: { type: "string", maxLength: 80 },
    relationshipContext: { type: "string", maxLength: 120 },
    hiddenMeaning: { type: "string", maxLength: 500 },
    keySubtexts: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: { type: "string", maxLength: 120 }
    },
    metaphorDirections: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: { type: "string", maxLength: 80 }
    },
    difficultyLevel: { type: "string", enum: ["easy", "medium", "hard"] },
    safetyAssessment: {
      type: "object",
      additionalProperties: false,
      required: ["allowed"],
      properties: {
        allowed: { type: "boolean" },
        reason: { type: ["string", "null"], maxLength: 240 }
      }
    }
  }
} as const;

export const roomDesignJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "roomTitle",
    "publicTitle",
    "emotionType",
    "visualTheme",
    "objectConcepts",
    "choiceOptions",
    "correctChoiceIndex",
    "petPersonaHints"
  ],
  properties: {
    roomTitle: { type: "string", maxLength: 48 },
    publicTitle: { type: "string", maxLength: 40 },
    emotionType: { type: "string", maxLength: 40 },
    visualTheme: {
      type: "string",
      enum: [
        "old_paper_dollhouse",
        "warm_notebook_cabin",
        "rainy_desk_miniature",
        "moonlit_paper_room",
        "pressed_flower_attic"
      ]
    },
    objectConcepts: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "name",
          "metaphor",
          "clue",
          "keyword",
          "sceneRole",
          "preferredAssetType",
          "positionHint"
        ],
        properties: {
          id: { type: "string", pattern: "^[a-z][a-z0-9_-]*$" },
          name: { type: "string", maxLength: 32 },
          metaphor: { type: "string", maxLength: 160 },
          clue: { type: "string", maxLength: 160 },
          keyword: { type: "string", maxLength: 32 },
          sceneRole: { type: "string", maxLength: 100 },
          preferredAssetType: {
            type: "string",
            enum: [
              "envelope_letter",
              "clock",
              "moon",
              "chair",
              "chat_note",
              "book",
              "plant",
              "key",
              "paper_note",
              "other"
            ]
          },
          positionHint: { type: "string", maxLength: 120 }
        }
      }
    },
    choiceOptions: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "text", "explanation"],
        properties: {
          id: { type: "string", pattern: "^[a-z][a-z0-9_-]*$" },
          text: { type: "string", maxLength: 100 },
          explanation: { type: "string", maxLength: 160 }
        }
      }
    },
    correctChoiceIndex: { type: "integer", minimum: 0, maximum: 3 },
    petPersonaHints: {
      type: "object",
      additionalProperties: false,
      required: ["type", "temperament", "comfortBehavior", "safetyBehavior"],
      properties: {
        type: {
          type: "string",
          enum: ["cat", "dog", "rabbit", "bird", "paper_spirit"]
        },
        temperament: { type: "string", maxLength: 80 },
        comfortBehavior: { type: "string", maxLength: 160 },
        safetyBehavior: { type: "string", maxLength: 160 }
      }
    }
  }
} as const;

export const imagePromptPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "roomShellBackgroundPrompt",
    "objectImagePrompts",
    "petSpritePrompt",
    "foregroundOccluderPrompt",
    "sharedStylePrompt"
  ],
  properties: {
    roomShellBackgroundPrompt: {
      type: "object",
      additionalProperties: false,
      required: [
        "positivePrompt",
        "size",
        "styleTags",
        "renderIntent"
      ],
      properties: {
        positivePrompt: { type: "string", maxLength: 1600 },
        negativePrompt: { type: ["string", "null"], maxLength: 600 },
        size: {
          type: "string",
          enum: ["512x512", "768x768", "1024x1024"]
        },
        styleTags: {
          type: "array",
          minItems: 6,
          maxItems: 18,
          items: { type: "string", maxLength: 40 }
        },
        renderIntent: { type: "string", maxLength: 220 }
      }
    },
    objectImagePrompts: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "objectId",
          "positivePrompt",
          "size",
          "styleTags",
          "renderIntent"
        ],
        properties: {
          objectId: { type: "string", pattern: "^[a-z][a-z0-9_-]*$" },
          positivePrompt: { type: "string", maxLength: 1400 },
          negativePrompt: { type: ["string", "null"], maxLength: 500 },
          size: {
            type: "string",
            enum: ["512x512", "768x768", "1024x1024"]
          },
          styleTags: {
            type: "array",
            minItems: 6,
            maxItems: 18,
            items: { type: "string", maxLength: 40 }
          },
          renderIntent: { type: "string", maxLength: 220 },
          layers: {
            type: "array",
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["role", "positivePrompt"],
              properties: {
                role: { type: "string", enum: ["back", "mid", "front"] },
                positivePrompt: { type: "string", maxLength: 1400 },
                negativePrompt: { type: ["string", "null"], maxLength: 500 },
                zOffset: { type: "number", minimum: -80, maximum: 80 },
                parallaxMultiplier: { type: "number", minimum: 0.4, maximum: 1.6 },
                swayAmplitude: { type: "number", minimum: 0, maximum: 6 }
              }
            }
          }
        }
      }
    },
    petSpritePrompt: {
      type: "object",
      additionalProperties: false,
      required: [
        "petType",
        "positivePrompt",
        "size",
        "styleTags",
        "renderIntent"
      ],
      properties: {
        petType: { type: "string", enum: ["cat", "dog"] },
        positivePrompt: { type: "string", maxLength: 1400 },
        negativePrompt: { type: ["string", "null"], maxLength: 600 },
        size: {
          type: "string",
          enum: ["512x512", "768x768", "1024x1024"]
        },
        styleTags: {
          type: "array",
          minItems: 6,
          maxItems: 18,
          items: { type: "string", maxLength: 40 }
        },
        renderIntent: { type: "string", maxLength: 220 }
      }
    },
    foregroundOccluderPrompt: {
      type: "object",
      additionalProperties: false,
      required: [
        "positivePrompt",
        "size",
        "styleTags",
        "renderIntent"
      ],
      properties: {
        positivePrompt: { type: "string", maxLength: 1400 },
        negativePrompt: { type: ["string", "null"], maxLength: 600 },
        size: {
          type: "string",
          enum: ["512x512", "768x768", "1024x1024"]
        },
        styleTags: {
          type: "array",
          minItems: 6,
          maxItems: 18,
          items: { type: "string", maxLength: 40 }
        },
        renderIntent: { type: "string", maxLength: 220 }
      }
    },
    sharedStylePrompt: { type: "string", maxLength: 800 }
  }
} as const;
