import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const legacyPipelineSource = readFileSync(
  new URL("../lib/ai/generateRoomPipeline.ts", import.meta.url),
  "utf8"
);
const promptPlanSource = readFileSync(
  new URL("../lib/llm/pipeline/generateObjectPrompts.ts", import.meta.url),
  "utf8"
);
const imageClientSource = readFileSync(
  new URL("../lib/ai/openAiCompatible.ts", import.meta.url),
  "utf8"
);

for (const fragment of [
  "standalone prop for compositing into a room later",
  "transparent PNG background if supported",
  "object occupies about 55 to 70 percent of the square canvas",
  "no wide horizontal crop",
  "no rectangular card composition"
]) {
  assert.match(
    legacyPipelineSource,
    new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );
  assert.match(
    promptPlanSource,
    new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );
}

assert.match(legacyPipelineSource, /single isolated 2\.5D miniature clue object sprite/);
assert.match(
  promptPlanSource,
  /single isolated realistic handmade miniature clue object sprite/
);

assert.match(imageClientSource, /background\?: "transparent" \| "opaque" \| "auto"/);
assert.match(imageClientSource, /request\.background/);

console.log("object prompt template guard tests passed");
