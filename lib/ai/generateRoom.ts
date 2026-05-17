import {
  generateRoomFromSecretInputSchema,
  generateRoomFromSecretOutputSchema,
  generateRoomJsonSchema,
  parseStructuredOutput,
  type GenerateRoomFromSecretInput,
  type GenerateRoomFromSecretOutput,
  type StructuredLlmClient
} from "@/lib/ai/schemas";

const ROOM_SYSTEM_PROMPT = [
  "你是《心事小屋》的房间设计师，只输出符合 JSON Schema 的对象。",
  "你要把用户的一句心事转化为旧纸手账风、微缩小屋中的可点击线索。",
  "禁止在 publicTitle、objects、choices、endingLine、shareText 或 pet 中直接复述用户原句。",
  "hiddenMeaning 可以总结真实含义，但不能加入用户没有表达过的重大事实。",
  "objects 必须刚好 5 个，choices 必须刚好 4 个，且 choices 中只能有 1 个 isCorrect=true。",
  "每个 object 必须可视化、可点击、适合旧纸/胶带/手账/微缩小屋材质，并能作为隐喻线索。",
  "线索要温柔、隐喻但不能过难，玩家通过 5 个物件和 4 个选项应该能猜到大意。",
  "如果有图片安全描述，只能把它作为辅助气氛或旁路线索，不能让图片本身成为答案。",
  "避免医疗、法律、金融诊断；避免诱导用户披露更多隐私。"
].join("\n");

function buildRoomUserPrompt(input: GenerateRoomFromSecretInput) {
  return JSON.stringify(
    {
      task: "generateRoomFromSecret",
      language: "zh-CN",
      constraints: {
        style: "旧纸手账风、微缩小屋、温暖、低饱和、可点击线索",
        noDirectOriginalSentenceLeak: true,
        imageIsAuxiliaryOnly: true,
        exactObjectCount: 5,
        exactChoiceCount: 4,
        exactCorrectChoiceCount: 1
      },
      input
    },
    null,
    2
  );
}

function includesSensitivePhrase(value: string, sentence: string) {
  const normalizedValue = value.replace(/\s+/g, "");
  const normalizedSentence = sentence.replace(/\s+/g, "");

  if (normalizedSentence.length < 8) {
    return normalizedValue.includes(normalizedSentence);
  }

  if (normalizedValue.includes(normalizedSentence)) {
    return true;
  }

  // Only flag if the value reproduces a significant portion of the sentence
  if (normalizedValue.length >= 6 && normalizedSentence.includes(normalizedValue)) {
    return true;
  }

  return false;
}

function assertNoOriginalSentenceLeak(
  output: GenerateRoomFromSecretOutput,
  sentence: string
) {
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

  const leaked = publicStrings.some((value) =>
    includesSensitivePhrase(value, sentence)
  );

  if (leaked) {
    throw new Error("Generated room leaked the original sentence in public fields");
  }
}

function normalizeRoomOutput(
  output: GenerateRoomFromSecretOutput,
  input: GenerateRoomFromSecretInput
): GenerateRoomFromSecretOutput {
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

  assertNoOriginalSentenceLeak(output, input.sentence);

  return {
    ...output,
    hiddenMeaning: output.hiddenMeaning.trim()
  };
}

export function buildGenerateRoomRequest(input: GenerateRoomFromSecretInput) {
  const parsedInput = generateRoomFromSecretInputSchema.parse(input);

  return {
    schemaName: "GenerateRoomFromSecretOutput",
    jsonSchema: generateRoomJsonSchema,
    system: ROOM_SYSTEM_PROMPT,
    user: buildRoomUserPrompt(parsedInput),
    temperature: 0.35
  };
}

export async function generateRoomFromSecret(
  input: GenerateRoomFromSecretInput,
  client: StructuredLlmClient
): Promise<GenerateRoomFromSecretOutput> {
  const request = buildGenerateRoomRequest(input);
  const rawOutput = await client(request);
  const parsedOutput = parseStructuredOutput(
    generateRoomFromSecretOutputSchema,
    rawOutput,
    request.schemaName
  );

  return normalizeRoomOutput(
    parsedOutput,
    generateRoomFromSecretInputSchema.parse(input)
  );
}

export { ROOM_SYSTEM_PROMPT };
