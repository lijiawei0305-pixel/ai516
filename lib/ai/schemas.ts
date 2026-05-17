import { z } from "zod";

export const DIARY_ACCESS_AFFINITY_THRESHOLD = 70;

const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalShortText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const llmIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(48)
  .regex(/^[a-z][a-z0-9_-]*$/);

export const revealLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3)
]);

export const generateRoomFromSecretInputSchema = z
  .object({
    sentence: shortText(500),
    emotionTags: z.array(shortText(24)).min(1).max(12),
    imageSafeDescription: optionalShortText(500),
    creatorStylePreference: optionalShortText(240)
  })
  .strict();

export const roomObjectSchema = z
  .object({
    id: llmIdSchema,
    name: shortText(24),
    visualDescription: shortText(160),
    clue: shortText(140),
    keyword: shortText(24),
    assetKey: llmIdSchema,
    positionHint: shortText(80),
    interactionType: z.enum(["tap", "open", "turn", "drag", "inspect"])
  })
  .strict();

export const roomChoiceSchema = z
  .object({
    id: llmIdSchema,
    text: shortText(90),
    isCorrect: z.boolean()
  })
  .strict();

export const petSchema = z
  .object({
    type: z.enum(["cat", "dog", "rabbit", "bird", "paper_spirit"]),
    name: shortText(16),
    personality: shortText(80),
    safetyBehavior: shortText(140)
  })
  .strict();

export const secretAnalysisOutputSchema = z
  .object({
    coreEmotion: shortText(24),
    emotionalIntensity: z.number().int().min(1).max(5),
    relationshipContext: shortText(80),
    implicitNeed: shortText(120),
    conflict: shortText(160),
    metaphorSeeds: z.array(shortText(40)).min(3).max(8),
    privacyRiskNotes: z.array(shortText(120)).max(5)
  })
  .strict();

export const roomNarrativeOutputSchema = z
  .object({
    roomTitle: shortText(40),
    publicTitle: shortText(32),
    emotionType: shortText(24),
    hiddenMeaning: shortText(500),
    visualTheme: z.enum([
      "old_paper_dollhouse",
      "warm_notebook_cabin",
      "rainy_desk_miniature",
      "moonlit_paper_room",
      "pressed_flower_attic"
    ]),
    objects: z.array(roomObjectSchema).length(5),
    choices: z.array(roomChoiceSchema).length(4),
    endingLine: shortText(120),
    shareText: shortText(120),
    pet: petSchema
  })
  .strict();

export const clueImagePromptObjectSchema = z
  .object({
    objectId: llmIdSchema,
    prompt: shortText(2000),
    negativePrompt: shortText(1500)
  })
  .strict();

export const clueImagePromptOutputSchema = z
  .object({
    objects: z.array(clueImagePromptObjectSchema).length(5)
  })
  .strict();

export const generateRoomFromSecretOutputSchema = z
  .object({
    roomTitle: shortText(40),
    publicTitle: shortText(32),
    emotionType: shortText(24),
    hiddenMeaning: shortText(500),
    visualTheme: z.enum([
      "old_paper_dollhouse",
      "warm_notebook_cabin",
      "rainy_desk_miniature",
      "moonlit_paper_room",
      "pressed_flower_attic"
    ]),
    objects: z.array(roomObjectSchema).length(5),
    choices: z.array(roomChoiceSchema).length(4),
    endingLine: shortText(120),
    shareText: shortText(120),
    pet: petSchema
  })
  .strict();

export const judgeGuessInputSchema = z
  .object({
    hiddenMeaning: shortText(500),
    selectedObjectKeywords: z.array(shortText(24)).max(12),
    selectedChoiceText: optionalShortText(160),
    freeTextGuess: optionalShortText(2000)
  })
  .strict();

export const judgeGuessOutputSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    affinityScore: z.number().int().min(0).max(100),
    hitKeywords: z.array(shortText(24)).max(12),
    missedKeywords: z.array(shortText(24)).max(12),
    title: shortText(40),
    comment: shortText(240),
    revealLevel: revealLevelSchema,
    partialOriginalSentence: z.string().trim().max(120),
    canRequestDiaryAccess: z.boolean()
  })
  .strict();

export const diaryOwnerSchema = z
  .object({
    userId: z.string().trim().min(1).max(80),
    displayName: shortText(40),
    perspective: z.enum(["creator", "player"])
  })
  .strict();

export const diaryRoomContextSchema = z
  .object({
    roomId: z.string().trim().min(1).max(80),
    roomTitle: shortText(60),
    publicTitle: shortText(60),
    emotionType: shortText(40),
    originalSentence: optionalShortText(500),
    hiddenMeaning: optionalShortText(500)
  })
  .strict();

export const diaryGuessContextSchema = z
  .object({
    guessId: z.string().trim().min(1).max(80),
    playerDisplayName: optionalShortText(40),
    selectedObjectKeywords: z.array(shortText(24)).max(12),
    freeTextGuess: optionalShortText(2000),
    selectedChoiceText: optionalShortText(160),
    score: z.number().int().min(0).max(100),
    affinityScore: z.number().int().min(0).max(100),
    comment: optionalShortText(240)
  })
  .strict();

export const generateDiaryEntryMarkdownInputSchema = z
  .object({
    owner: diaryOwnerSchema,
    room: diaryRoomContextSchema,
    guess: diaryGuessContextSchema.nullable(),
    eventType: z.enum([
      "created_room",
      "guessed_room",
      "mutual_result",
      "pet_memory",
      "manual_note"
    ])
  })
  .strict();

export const generateDiaryEntryMarkdownOutputSchema = z
  .object({
    title: shortText(60),
    markdownContent: shortText(4000),
    summary: shortText(400)
  })
  .strict();

export const summarizeMemoryDocumentInputSchema = z
  .object({
    existingMarkdown: z.string().max(12000),
    newEventMarkdown: shortText(4000),
    scope: z
      .object({
        ownerId: z.string().trim().min(1).max(80),
        scopeType: z.enum(["user", "room", "relationship", "pet"]),
        scopeId: z.string().trim().min(1).max(80).nullable()
      })
      .strict()
  })
  .strict();

export const summarizeMemoryDocumentOutputSchema = z
  .object({
    updatedMarkdown: shortText(16000),
    summary: shortText(600)
  })
  .strict();

export type GenerateRoomFromSecretInput = z.infer<
  typeof generateRoomFromSecretInputSchema
>;
export type GenerateRoomFromSecretOutput = z.infer<
  typeof generateRoomFromSecretOutputSchema
>;
export type SecretAnalysisOutput = z.infer<typeof secretAnalysisOutputSchema>;
export type RoomNarrativeOutput = z.infer<typeof roomNarrativeOutputSchema>;
export type ClueImagePromptOutput = z.infer<
  typeof clueImagePromptOutputSchema
>;
export type JudgeGuessInput = z.infer<typeof judgeGuessInputSchema>;
export type JudgeGuessOutput = z.infer<typeof judgeGuessOutputSchema>;
export type GenerateDiaryEntryMarkdownInput = z.infer<
  typeof generateDiaryEntryMarkdownInputSchema
>;
export type GenerateDiaryEntryMarkdownOutput = z.infer<
  typeof generateDiaryEntryMarkdownOutputSchema
>;
export type SummarizeMemoryDocumentInput = z.infer<
  typeof summarizeMemoryDocumentInputSchema
>;
export type SummarizeMemoryDocumentOutput = z.infer<
  typeof summarizeMemoryDocumentOutputSchema
>;

export type StructuredLlmRequest = {
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  system: string;
  user: string;
  temperature?: number;
};

export type StructuredLlmClient = (
  request: StructuredLlmRequest
) => Promise<unknown>;

export class LlmValidationError extends Error {
  constructor(
    message: string,
    readonly issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = "LlmValidationError";
  }
}

export function parseStructuredOutput<T>(
  schema: z.ZodType<T>,
  value: unknown,
  schemaName: string
): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new LlmValidationError(
      `LLM response failed ${schemaName} validation`,
      parsed.error.issues
    );
  }

  return parsed.data;
}

export const generateRoomJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "roomTitle",
    "publicTitle",
    "emotionType",
    "hiddenMeaning",
    "visualTheme",
    "objects",
    "choices",
    "endingLine",
    "shareText",
    "pet"
  ],
  properties: {
    roomTitle: { type: "string", maxLength: 40 },
    publicTitle: { type: "string", maxLength: 32 },
    emotionType: { type: "string", maxLength: 24 },
    hiddenMeaning: { type: "string", maxLength: 500 },
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
    objects: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "name",
          "visualDescription",
          "clue",
          "keyword",
          "assetKey",
          "positionHint",
          "interactionType"
        ],
        properties: {
          id: { type: "string", pattern: "^[a-z][a-z0-9_-]*$" },
          name: { type: "string", maxLength: 24 },
          visualDescription: { type: "string", maxLength: 160 },
          clue: { type: "string", maxLength: 140 },
          keyword: { type: "string", maxLength: 24 },
          assetKey: { type: "string", pattern: "^[a-z][a-z0-9_-]*$" },
          positionHint: { type: "string", maxLength: 80 },
          interactionType: {
            type: "string",
            enum: ["tap", "open", "turn", "drag", "inspect"]
          }
        }
      }
    },
    choices: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "text", "isCorrect"],
        properties: {
          id: { type: "string", pattern: "^[a-z][a-z0-9_-]*$" },
          text: { type: "string", maxLength: 90 },
          isCorrect: { type: "boolean" }
        }
      }
    },
    endingLine: { type: "string", maxLength: 120 },
    shareText: { type: "string", maxLength: 120 },
    pet: {
      type: "object",
      additionalProperties: false,
      required: ["type", "name", "personality", "safetyBehavior"],
      properties: {
        type: {
          type: "string",
          enum: ["cat", "dog", "rabbit", "bird", "paper_spirit"]
        },
        name: { type: "string", maxLength: 16 },
        personality: { type: "string", maxLength: 80 },
        safetyBehavior: { type: "string", maxLength: 140 }
      }
    }
  }
} as const;

export const secretAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "coreEmotion",
    "emotionalIntensity",
    "relationshipContext",
    "implicitNeed",
    "conflict",
    "metaphorSeeds",
    "privacyRiskNotes"
  ],
  properties: {
    coreEmotion: { type: "string", maxLength: 24 },
    emotionalIntensity: { type: "integer", minimum: 1, maximum: 5 },
    relationshipContext: { type: "string", maxLength: 80 },
    implicitNeed: { type: "string", maxLength: 120 },
    conflict: { type: "string", maxLength: 160 },
    metaphorSeeds: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: { type: "string", maxLength: 40 }
    },
    privacyRiskNotes: {
      type: "array",
      maxItems: 5,
      items: { type: "string", maxLength: 120 }
    }
  }
} as const;

export const roomNarrativeJsonSchema = generateRoomJsonSchema;

export const clueImagePromptJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["objects"],
  properties: {
    objects: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["objectId", "prompt", "negativePrompt"],
        properties: {
          objectId: { type: "string", pattern: "^[a-z][a-z0-9_-]*$" },
          prompt: { type: "string", maxLength: 2000 },
          negativePrompt: { type: "string", maxLength: 1500 }
        }
      }
    }
  }
} as const;

export const judgeGuessJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "score",
    "affinityScore",
    "hitKeywords",
    "missedKeywords",
    "title",
    "comment",
    "revealLevel",
    "partialOriginalSentence",
    "canRequestDiaryAccess"
  ],
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    affinityScore: { type: "integer", minimum: 0, maximum: 100 },
    hitKeywords: {
      type: "array",
      maxItems: 12,
      items: { type: "string", maxLength: 24 }
    },
    missedKeywords: {
      type: "array",
      maxItems: 12,
      items: { type: "string", maxLength: 24 }
    },
    title: { type: "string", maxLength: 40 },
    comment: { type: "string", maxLength: 240 },
    revealLevel: { type: "integer", enum: [0, 1, 2, 3] },
    partialOriginalSentence: { type: "string", maxLength: 120 },
    canRequestDiaryAccess: { type: "boolean" }
  }
} as const;

export const diaryEntryJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "markdownContent", "summary"],
  properties: {
    title: { type: "string", maxLength: 60 },
    markdownContent: { type: "string", maxLength: 4000 },
    summary: { type: "string", maxLength: 400 }
  }
} as const;

export const memoryDocumentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["updatedMarkdown", "summary"],
  properties: {
    updatedMarkdown: { type: "string", maxLength: 16000 },
    summary: { type: "string", maxLength: 600 }
  }
} as const;
