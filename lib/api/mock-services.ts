import type {
  CreateAssetUploadUrlRequest,
  CreateAssetUploadUrlResponse,
  CreateDiaryAccessRequestRequest,
  CreateDiaryAccessRequestResponse,
  CreateDiaryCommentRequest,
  CreateDiaryCommentResponse,
  GenerateRoomRequest,
  GenerateRoomResponse,
  GetDiaryResponse,
  GetGuessResultResponse,
  GetOwnerResultsResponse,
  GetRoomPlayResponse,
  PetChatRequest,
  PetChatResponse,
  RespondDiaryAccessRequestRequest,
  RespondDiaryAccessRequestResponse,
  SubmitGuessRequest,
  SubmitGuessResponse
} from "@/lib/contracts/api";
import {
  buildGuessedRoomDiaryMarkdown,
  buildMutualResultDiaryMarkdown
} from "@/lib/diary/createDiaryEntry";

const nowIso = () => new Date().toISOString();

const makeId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const capHintLevel = (level: PetChatRequest["hintLevelRequested"]) =>
  level > 1 ? 1 : level;

export async function generateRoomService(
  request: GenerateRoomRequest
): Promise<GenerateRoomResponse> {
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const roomId = makeId("room");
  const createdAt = nowIso();
  const mood = request.emotionTags[0] ?? "秘密";

  return {
    roomId,
    roomTitle: `${mood}心事小屋`,
    publicTitle: "一间等待被读懂的小屋",
    createdAt,
    redirectUrl: `/rooms/${roomId}/play`
  };
}

export async function getRoomPlayService(
  roomId: string
): Promise<GetRoomPlayResponse> {
  return {
    roomId,
    publicTitle: "朋友的心事小屋",
    visualTheme: "warm_notebook_cabin",
    renderTarget: "2.5d_miniature_cabin",
    stage: {
      backgroundStyle: "warm-notebook-paper-with-pencil-shadow",
      roomShellType: "open-front-paper-cabin",
      lighting: "honey-colored-window-glow",
      floorStyle: "lined-notebook-woodgrain-floor"
    },
    objects: [
      {
        id: "envelope",
        name: "未寄出的信",
        clue: "它知道地址，却一直没有出发。",
        keyword: "没说出口",
        title: "未寄出的信",
        description: "它知道地址，却一直没有出发。",
        discovered: false,
        position: { x: 50, y: 76, z: 8, layer: 42 },
        render: {
          assetUrl: "/assets/demo/clues/envelope.png",
          width: 148,
          height: 116,
          style: "foreground-paper-cutout-prop-long-shadow",
          interactive: true
        },
        interactionType: "tap_note"
      },
      {
        id: "clock",
        name: "停住的钟",
        clue: "时间在某个名字附近慢下来。",
        keyword: "等待",
        title: "停住的钟",
        description: "时间在某个名字附近慢下来。",
        discovered: false,
        position: { x: 26, y: 36, z: 28, layer: 18 },
        render: {
          assetUrl: "/assets/demo/clues/clock.png",
          width: 116,
          height: 116,
          style: "flat-wall-paper-sticker-with-tape-shadow",
          interactive: true
        },
        interactionType: "tap_reveal"
      },
      {
        id: "window",
        name: "月亮窗",
        clue: "窗边有一束很轻的光。",
        keyword: "偷偷关注",
        title: "月亮窗",
        description: "窗边有一束很轻的光。",
        discovered: false,
        position: { x: 74, y: 38, z: 28, layer: 22 },
        render: {
          assetUrl: "/assets/demo/clues/window.png",
          width: 118,
          height: 132,
          style: "paper-cutout-window-side-prop-soft-backlight",
          interactive: true
        },
        interactionType: "tap_note"
      },
      {
        id: "plant",
        name: "窗边植物",
        clue: "它被照顾得很好，却不敢搬到阳光正中。",
        keyword: "小心翼翼",
        title: "窗边植物",
        description: "它被照顾得很好，却不敢搬到阳光正中。",
        discovered: false,
        position: { x: 23, y: 60, z: 18, layer: 34 },
        render: {
          assetUrl: "/assets/demo/clues/plant.png",
          width: 112,
          height: 138,
          style: "paper-cutout-shelf-side-prop-ambient-shadow",
          interactive: true
        },
        interactionType: "tap"
      },
      {
        id: "chat_note",
        name: "墙上的便签",
        clue: "上面只有几个点，像一句没有发出去的话。",
        keyword: "犹豫",
        title: "墙上的便签",
        description: "上面只有几个点，像一句没有发出去的话。",
        discovered: false,
        position: { x: 83, y: 58, z: 18, layer: 36 },
        render: {
          assetUrl: "/assets/demo/clues/note.png",
          width: 124,
          height: 104,
          style: "flat-wall-paper-sticker-with-tape-shadow",
          interactive: true
        },
        interactionType: "tap_reveal"
      }
    ],
    imageClue: null,
    pet: {
      name: "纸团",
      avatarUrl: null,
      mood: "curious",
      maxHintLevel: 3,
      type: "cat",
      position: { x: 84, y: 80, z: 8, layer: 50 },
      chatEnabled: true
    },
    choices: [
      {
        index: 0,
        label: "这像是一句想念，却不敢先开口。"
      },
      {
        index: 1,
        label: "这像是对未来的普通担心。"
      },
      {
        index: 2,
        label: "这像是在庆祝一件小事。"
      },
      {
        index: 3,
        label: "这像是一次轻松的吐槽。"
      }
    ],
    progress: {
      discoveredObjectIds: [],
      currentStep: "explore",
      hintLevelUsed: 0
    },
  };
}

export async function submitGuessService(
  request: SubmitGuessRequest
): Promise<SubmitGuessResponse> {
  const guessId = makeId("guess");
  const selectedCount = request.selectedObjectIds.length;
  const textBonus = request.freeTextGuess?.trim() ? 12 : 0;
  const score = Math.min(100, 48 + selectedCount * 8 + textBonus);
  const affinityScore = Math.min(100, Math.round(score + 6));
  const mockRoom = {
    id: request.roomId,
    creatorId: "mock_owner",
    roomTitle: "想念心事小屋",
    publicTitle: "朋友的心事小屋",
    originalSentence: "我其实很想你，但不敢先开口。",
    hiddenMeaning: "想念一个人但不敢先开口",
    emotionType: "想念"
  };
  const mockGuess = {
    id: guessId,
    roomId: request.roomId,
    playerId: "mock_player",
    selectedObjectKeywords: request.selectedObjectIds,
    selectedChoiceText:
      request.selectedChoiceIndex === null
        ? null
        : `选项 ${request.selectedChoiceIndex}`,
    freeTextGuess: request.freeTextGuess,
    score,
    affinityScore,
    comment: "这是 mock 评分结果，后续将由服务端评分逻辑替换。",
    partialOriginalSentence: "我其实有点..."
  };

  buildGuessedRoomDiaryMarkdown({
    room: mockRoom,
    guess: mockGuess
  });
  buildMutualResultDiaryMarkdown({
    room: mockRoom,
    guess: mockGuess,
    playerDisplayName: "匿名玩家"
  });

  return {
    guessId,
    score,
    affinityScore,
    title: affinityScore >= 70 ? "你靠得很近" : "你发现了一些痕迹",
    comment: "这是 mock 评分结果，后续将由服务端评分逻辑替换。",
    hitKeywords: selectedCount > 0 ? ["线索", "靠近"] : [],
    missedKeywords: affinityScore >= 70 ? [] : ["真实原因"],
    revealLevel: affinityScore >= 70 ? 2 : 1,
    partialOriginalSentence: "我其实有点...",
    resultUrl: `/guesses/${guessId}/result`
  };
}

export async function getGuessResultService(
  guessId: string
): Promise<GetGuessResultResponse> {
  return {
    score: 76,
    affinityScore: 82,
    title: "你靠得很近",
    comment: `猜测 ${guessId} 的 mock 结果。`,
    hitKeywords: ["想念", "没说出口"],
    missedKeywords: ["具体时间"],
    partialOriginalSentence: "我其实有点...",
    shareText: "我刚刚读懂了一间心事小屋。",
    canRequestDiaryAccess: true,
    diaryAccessThreshold: 70
  };
}

export async function getOwnerResultsService(
  roomId: string
): Promise<GetOwnerResultsResponse> {
  return {
    guesses: [
      {
        guessId: makeId("guess"),
        player: {
          userId: null,
          anonymousId: "anon_demo",
          displayName: "匿名玩家",
          avatarUrl: null
        },
        selectedObjectIds: ["envelope", "clock"],
        selectedChoiceIndex: 1,
        freeTextGuess: "你可能是在想一个没有说出口的人。",
        score: 78,
        affinityScore: 84,
        comment: `房间 ${roomId} 的 mock 猜测结果。`,
        diaryAccessRequest: {
          id: makeId("dar"),
          status: "pending"
        },
        createdAt: nowIso()
      }
    ]
  };
}

export async function petChatService(
  request: PetChatRequest
): Promise<PetChatResponse> {
  const blocked = /答案|原句|hidden|original|系统提示词|prompt/i.test(
    request.message
  );

  if (blocked) {
    return {
      reply: "我不能直接把答案说出来，但可以陪你看看已经发现的线索。",
      hintLevel: capHintLevel(request.hintLevelRequested),
      safetyBlocked: true,
      suggestedObjectId: request.discoveredObjectIds[0] ?? null,
      safetyReason: "direct_answer_request",
      memoryNote: "用户请求直接答案，宠物温柔拒绝并引导回线索。"
    };
  }

  return {
    reply: "也许先看看那些没有被寄出的东西，它们常常藏着没说出口的话。",
    hintLevel: request.hintLevelRequested,
    safetyBlocked: false,
    suggestedObjectId: "envelope",
    safetyReason: null,
    memoryNote: "用户在宠物提示下继续围绕线索探索。"
  };
}

export async function createDiaryAccessRequestService(
  _request: CreateDiaryAccessRequestRequest
): Promise<CreateDiaryAccessRequestResponse> {
  return {
    requestId: makeId("dar"),
    status: "pending"
  };
}

export async function respondDiaryAccessRequestService(
  id: string,
  request: RespondDiaryAccessRequestRequest
): Promise<RespondDiaryAccessRequestResponse> {
  return {
    requestId: id,
    status: request.status,
    respondedAt: nowIso()
  };
}

export async function getDiaryService(): Promise<GetDiaryResponse> {
  return {
    entries: [
      {
        id: makeId("diary"),
        entryType: "created_room",
        title: "一间刚搭好的小屋",
        markdownPreview: "今天把一句心事藏进了小屋。",
        visibility: "private",
        roomId: null,
        guessAttemptId: null,
        createdAt: nowIso(),
        updatedAt: nowIso()
      }
    ]
  };
}

export async function createDiaryCommentService(
  request: CreateDiaryCommentRequest
): Promise<CreateDiaryCommentResponse> {
  return {
    comment: {
      id: makeId("comment"),
      diaryEntryId: request.diaryEntryId,
      authorId: "mock_user",
      ownerId: "mock_owner",
      content: request.content,
      createdAt: nowIso()
    }
  };
}

export async function createAssetUploadUrlService(
  request: CreateAssetUploadUrlRequest
): Promise<CreateAssetUploadUrlResponse> {
  const assetId = makeId("asset");
  const storagePath = `mock-user/${request.roomId ?? "draft"}/${assetId}-${request.fileName}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  return {
    assetId,
    uploadUrl: `https://example.supabase.co/storage/v1/object/sign/room-assets/${encodeURIComponent(
      storagePath
    )}`,
    storagePath,
    previewUrl: `https://example.supabase.co/storage/v1/object/sign/room-assets/${encodeURIComponent(
      storagePath
    )}?preview=1`,
    publicUrl: null,
    expiresAt
  };
}
