import { z } from "zod";

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.unknown().optional()
  })
});

export const idSchema = z.string().min(1);
export const nullableIdSchema = idSchema.nullable();
export const isoDateTimeSchema = z.string().datetime();

export const roomVisibilitySchema = z.enum(["private", "unlisted", "public"]);
export const revealLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3)
]);
export const diaryAccessRequestStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected"
]);
export const diaryEntryVisibilitySchema = z.enum([
  "private",
  "shared_by_request",
  "shared"
]);
export const diaryEntryTypeSchema = z.enum([
  "created_room",
  "guessed_room",
  "mutual_result",
  "pet_memory",
  "manual_note"
]);

export const roomObjectPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  layer: z.number().optional()
});

export const roomObjectAnchorSchema = z.enum([
  "bottom-center",
  "center",
  "top-left"
]);

export const roomObjectAnchorPointSchema = z.object({
  x: z.number(),
  y: z.number()
});

export const roomAnchorSchema = z.union([
  roomObjectAnchorSchema,
  roomObjectAnchorPointSchema
]);

export const roomObjectShadowSchema = z.object({
  enabled: z.boolean(),
  width: z.number(),
  height: z.number(),
  opacity: z.number(),
  blur: z.number(),
  offsetY: z.number()
});

export const roomStageAssetSchema = z.object({
  id: idSchema,
  kind: z.string(),
  assetUrl: z.string().optional(),
  alt: z.string().optional(),
  position: roomObjectPositionSchema,
  anchor: roomAnchorSchema.optional(),
  width: z.number(),
  height: z.number(),
  scale: z.number().optional(),
  opacity: z.number().optional(),
  layer: z.number().optional(),
  style: z.string().optional()
});

export const roomObjectLayerRoleSchema = z.enum(["back", "mid", "front"]);

export const roomObjectLayerSchema = z.object({
  role: roomObjectLayerRoleSchema,
  assetUrl: z.string(),
  zOffset: z.number().min(-80).max(80).default(0).optional(),
  parallaxMultiplier: z.number().min(0.4).max(1.6).default(1).optional(),
  swayAmplitude: z.number().min(0).max(6).default(0).optional()
});

export const roomObjectRenderSchema = z.object({
  assetUrl: z.string().min(0),
  width: z.number(),
  height: z.number(),
  style: z.string(),
  interactive: z.literal(true),
  anchor: roomAnchorSchema.optional(),
  scale: z.number().optional(),
  shadow: roomObjectShadowSchema.optional(),
  layers: z.array(roomObjectLayerSchema).max(4).optional()
});

export const publicRoomStageSchema = z.object({
  backgroundStyle: z.string(),
  roomShellType: z.string(),
  lighting: z.string(),
  floorStyle: z.string(),
  backgroundAsset: roomStageAssetSchema.nullable().optional(),
  foreground: z.array(roomStageAssetSchema).optional()
});

export const publicRoomObjectSchema = z.object({
  id: idSchema,
  name: z.string().optional(),
  clue: z.string().optional(),
  keyword: z.string().optional(),
  title: z.string(),
  description: z.string(),
  discovered: z.boolean(),
  imageUrl: z.string().nullable().optional(),
  assetUrl: z.string().nullable().optional(),
  position: roomObjectPositionSchema.optional(),
  anchor: roomAnchorSchema.optional(),
  scale: z.number().optional(),
  shadow: roomObjectShadowSchema.optional(),
  render: roomObjectRenderSchema.optional(),
  interactionType: z.enum(["tap", "tap_note", "tap_reveal"]).optional()
});

export const publicImageClueSchema = z.object({
  assetId: idSchema,
  url: z.string().nullable(),
  alt: z.string(),
  safeDescription: z.string().nullable()
});

export const publicPetSchema = z.object({
  name: z.string(),
  avatarUrl: z.string().nullable(),
  mood: z.string(),
  maxHintLevel: revealLevelSchema,
  type: z.enum(["cat", "dog"]).optional(),
  position: roomObjectPositionSchema.optional(),
  anchor: roomAnchorSchema.optional(),
  scale: z.number().optional(),
  assetUrl: z.string().nullable().optional(),
  shadow: roomObjectShadowSchema.optional(),
  chatEnabled: z.literal(true).optional()
});

export const publicChoiceSchema = z.object({
  index: z.number().int().min(0),
  label: z.string(),
  description: z.string().optional()
});

export const playProgressSchema = z.object({
  discoveredObjectIds: z.array(idSchema),
  currentStep: z.enum(["explore", "guess", "result"]),
  hintLevelUsed: revealLevelSchema
});

export const playerDisplaySchema = z.object({
  userId: nullableIdSchema,
  anonymousId: z.string().nullable(),
  displayName: z.string(),
  avatarUrl: z.string().url().nullable()
});

export const diaryAccessRequestSummarySchema = z.object({
  id: idSchema,
  status: diaryAccessRequestStatusSchema
});

export const diaryEntrySummarySchema = z.object({
  id: idSchema,
  entryType: diaryEntryTypeSchema,
  title: z.string(),
  markdownPreview: z.string(),
  visibility: diaryEntryVisibilitySchema,
  roomId: nullableIdSchema,
  guessAttemptId: nullableIdSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export const diaryCommentSchema = z.object({
  id: idSchema,
  diaryEntryId: idSchema,
  authorId: idSchema,
  ownerId: idSchema,
  content: z.string(),
  createdAt: isoDateTimeSchema
});

export const generateRoomRequestSchema = z.object({
  sentence: z.string().min(1).max(500),
  emotionTags: z.array(z.string().min(1)).max(12),
  imageAssetId: nullableIdSchema,
  visibility: roomVisibilitySchema
});

export const generateRoomResponseSchema = z.object({
  roomId: idSchema,
  roomTitle: z.string(),
  publicTitle: z.string(),
  createdAt: isoDateTimeSchema,
  redirectUrl: z.string()
});

export const getRoomPlayParamsSchema = z.object({
  roomId: idSchema
});

export const getRoomPlayResponseSchema = z.object({
  roomId: idSchema,
  publicTitle: z.string(),
  visualTheme: z.string(),
  renderTarget: z.literal("2.5d_miniature_cabin").optional(),
  camera: z.literal("top_down_2_5d").optional(),
  stage: publicRoomStageSchema.optional(),
  objects: z.array(publicRoomObjectSchema),
  imageClue: publicImageClueSchema.nullable(),
  pet: publicPetSchema,
  choices: z.array(publicChoiceSchema).optional(),
  progress: playProgressSchema
});

export const submitGuessRequestSchema = z
  .object({
    roomId: idSchema,
    shareToken: z.string().min(1).nullable(),
    selectedObjectIds: z.array(idSchema),
    selectedChoiceIndex: z.number().int().min(0).nullable(),
    freeTextGuess: z.string().max(2000).nullable(),
    petConversationSummary: z.string().max(4000).nullable()
  })
  .refine(
    (value) =>
      value.selectedChoiceIndex !== null ||
      (value.freeTextGuess !== null && value.freeTextGuess.trim().length > 0),
    {
      message: "Either selectedChoiceIndex or freeTextGuess is required",
      path: ["freeTextGuess"]
    }
  );

export const submitGuessResponseSchema = z.object({
  guessId: idSchema,
  score: z.number().min(0).max(100),
  affinityScore: z.number().int().min(0).max(100),
  title: z.string(),
  comment: z.string(),
  hitKeywords: z.array(z.string()),
  missedKeywords: z.array(z.string()),
  revealLevel: revealLevelSchema,
  partialOriginalSentence: z.string(),
  resultUrl: z.string()
});

export const getGuessResultParamsSchema = z.object({
  guessId: idSchema
});

export const getGuessResultResponseSchema = z.object({
  score: z.number().min(0).max(100),
  affinityScore: z.number().int().min(0).max(100),
  title: z.string(),
  comment: z.string(),
  hitKeywords: z.array(z.string()),
  missedKeywords: z.array(z.string()),
  partialOriginalSentence: z.string(),
  shareText: z.string(),
  canRequestDiaryAccess: z.boolean(),
  diaryAccessThreshold: z.number().int().min(0).max(100)
});

export const getOwnerResultsParamsSchema = z.object({
  roomId: idSchema
});

export const ownerRoomGuessSchema = z.object({
  guessId: idSchema,
  player: playerDisplaySchema,
  selectedObjectIds: z.array(idSchema),
  selectedChoiceIndex: z.number().int().min(0).nullable(),
  freeTextGuess: z.string().nullable(),
  score: z.number().min(0).max(100),
  affinityScore: z.number().int().min(0).max(100),
  comment: z.string(),
  diaryAccessRequest: diaryAccessRequestSummarySchema.nullable(),
  createdAt: isoDateTimeSchema
});

export const getOwnerResultsResponseSchema = z.object({
  guesses: z.array(ownerRoomGuessSchema)
});

export const petChatRequestSchema = z.object({
  roomId: idSchema,
  guessAttemptId: nullableIdSchema,
  message: z.string().min(1).max(2000),
  discoveredObjectIds: z.array(idSchema),
  hintLevelRequested: revealLevelSchema
});

export const petChatResponseSchema = z.object({
  reply: z.string(),
  hintLevel: revealLevelSchema,
  safetyBlocked: z.boolean(),
  suggestedObjectId: nullableIdSchema,
  safetyReason: z.string().nullable(),
  memoryNote: z.string().nullable()
});

export const createDiaryAccessRequestRequestSchema = z.object({
  roomId: idSchema,
  guessId: idSchema,
  diaryEntryId: idSchema.optional(),
  message: z.string().max(1000)
});

export const createDiaryAccessRequestResponseSchema = z.object({
  requestId: idSchema,
  status: diaryAccessRequestStatusSchema,
  threshold: z.number().int().min(0).max(100).optional()
});

export const respondDiaryAccessRequestParamsSchema = z.object({
  id: idSchema
});

export const respondDiaryAccessRequestRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  responseMessage: z.string().max(1000).nullable().optional()
});

export const respondDiaryAccessRequestResponseSchema = z.object({
  requestId: idSchema,
  status: z.enum(["approved", "rejected"]),
  respondedAt: isoDateTimeSchema
});

export const getDiaryResponseSchema = z.object({
  entries: z.array(diaryEntrySummarySchema)
});

export const createDiaryCommentRequestSchema = z.object({
  diaryEntryId: idSchema,
  content: z.string().min(1).max(2000)
});

export const createDiaryCommentResponseSchema = z.object({
  comment: diaryCommentSchema
});

export const createAssetUploadUrlRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().regex(/^image\/(png|jpeg|jpg|webp)$/),
  fileSize: z.number().int().positive().max(5 * 1024 * 1024),
  roomId: idSchema,
  role: z.enum(["clue_image"])
});

export const createAssetUploadUrlResponseSchema = z.object({
  assetId: idSchema,
  uploadUrl: z.string().url(),
  storagePath: z.string(),
  previewUrl: z.string().url(),
  publicUrl: z.string().url().nullable().optional(),
  expiresAt: isoDateTimeSchema
});
