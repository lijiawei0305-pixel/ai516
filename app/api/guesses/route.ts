import crypto from "node:crypto";

import { apiError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import { getAiProviderConfigFromEnv } from "@/lib/ai/adminConfig";
import { judgeGuess } from "@/lib/ai/judgeGuess";
import { createOpenAiCompatibleStructuredClient } from "@/lib/ai/openAiCompatible";
import { submitGuessService } from "@/lib/api/mock-services";
import { createDiaryEntriesForCompletedGuess } from "@/lib/diary/createDiaryEntry";
import { createDiaryRepository } from "@/lib/diary/repository";
import {
  submitGuessRequestSchema,
  submitGuessResponseSchema
} from "@/lib/schemas/api";
import {
  getRequestUserId,
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, submitGuessRequestSchema);

  if ("response" in parsed) {
    return parsed.response;
  }

  const aiConfig = getAiProviderConfigFromEnv();
  const supabaseConfig = getSupabaseServerConfig();

  if (!aiConfig || !supabaseConfig) {
    const mockResult = await submitGuessService(parsed.data);
    return jsonResponse(submitGuessResponseSchema, mockResult, 201);
  }

  const { roomId, shareToken, selectedObjectIds, selectedChoiceIndex, freeTextGuess } =
    parsed.data;

  let shareId: string | null = null;

  if (shareToken) {
    const shares = await supabaseRest<
      Array<{ id: string; expires_at: string | null }>
    >(
      `room_shares?room_id=eq.${encodeURIComponent(
        roomId
      )}&share_token=eq.${encodeURIComponent(
        shareToken
      )}&select=id,expires_at&limit=1`,
      { method: "GET" },
      supabaseConfig
    );
    const share = shares[0];

    if (!share) {
      return apiError("invalid_share", "Share token not found or expired", 404);
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return apiError("share_expired", "This share link has expired", 410);
    }

    shareId = share.id;
  }

  const rooms = await supabaseRest<
    Array<{
      id: string;
      creator_id: string;
      hidden_meaning: string;
      room_title: string;
      public_title: string;
      emotion_type: string;
      original_sentence: string;
      room_json: Record<string, unknown>;
    }>
  >(
    `rooms?id=eq.${encodeURIComponent(
      roomId
    )}&select=id,creator_id,hidden_meaning,room_title,public_title,emotion_type,original_sentence,room_json&limit=1`,
    { method: "GET" },
    supabaseConfig
  );
  const room = rooms[0];

  if (!room) {
    return apiError("not_found", "Room not found", 404);
  }

  const roomJson = room.room_json as {
    objects?: Array<{ id: string; keywords?: string[] }>;
    choices?: Array<{ text: string }>;
  };
  const selectedObjectKeywords = (roomJson.objects ?? [])
    .filter((obj) => selectedObjectIds.includes(obj.id))
    .flatMap((obj) => obj.keywords ?? []);
  const selectedChoiceText =
    selectedChoiceIndex !== null
      ? (roomJson.choices?.[selectedChoiceIndex]?.text ?? null)
      : null;

  const llmClient = createOpenAiCompatibleStructuredClient(aiConfig);
  const judgeResult = await judgeGuess(
    {
      hiddenMeaning: room.hidden_meaning,
      selectedObjectKeywords,
      selectedChoiceText,
      freeTextGuess
    },
    llmClient
  );

  const playerId = getRequestUserId(request) ?? `anon_${crypto.randomUUID()}`;
  const guessId = crypto.randomUUID();

  await supabaseRest(
    "guess_attempts",
    {
      method: "POST",
      body: JSON.stringify({
        id: guessId,
        room_id: roomId,
        share_id: shareId ?? roomId,
        player_id: playerId,
        selected_object_ids: selectedObjectIds,
        selected_choice_index: selectedChoiceIndex,
        free_text_guess: freeTextGuess,
        score: judgeResult.score,
        affinity_score: judgeResult.affinityScore,
        hit_keywords: judgeResult.hitKeywords,
        missed_keywords: judgeResult.missedKeywords,
        title: judgeResult.title,
        comment: judgeResult.comment,
        reveal_level: judgeResult.revealLevel,
        owner_visibility_acknowledged_at: new Date().toISOString()
      })
    },
    supabaseConfig
  );

  try {
    const diaryRepo = createDiaryRepository(supabaseConfig);

    await createDiaryEntriesForCompletedGuess({
      repository: diaryRepo,
      room: {
        id: room.id,
        creatorId: room.creator_id,
        roomTitle: room.room_title,
        publicTitle: room.public_title,
        originalSentence: room.original_sentence,
        hiddenMeaning: room.hidden_meaning,
        emotionType: room.emotion_type
      },
      guess: {
        id: guessId,
        roomId: room.id,
        playerId,
        selectedObjectKeywords,
        selectedChoiceText,
        freeTextGuess,
        score: judgeResult.score,
        affinityScore: judgeResult.affinityScore,
        comment: judgeResult.comment,
        partialOriginalSentence: judgeResult.partialOriginalSentence
      }
    });
  } catch {
    // diary creation is non-critical
  }

  return jsonResponse(
    submitGuessResponseSchema,
    {
      guessId,
      score: judgeResult.score,
      affinityScore: judgeResult.affinityScore,
      title: judgeResult.title,
      comment: judgeResult.comment,
      hitKeywords: judgeResult.hitKeywords,
      missedKeywords: judgeResult.missedKeywords,
      revealLevel: judgeResult.revealLevel,
      partialOriginalSentence: judgeResult.partialOriginalSentence,
      resultUrl: `/result/${guessId}`
    },
    201
  );
}
