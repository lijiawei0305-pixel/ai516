import { publicRoomPlaySchema, type PublicRoomPlayData } from "@/lib/contracts";

const mockPhotoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
  <rect width="360" height="360" fill="#d8c09b"/>
  <rect x="42" y="54" width="276" height="214" rx="8" fill="#8ea096"/>
  <rect x="62" y="72" width="236" height="176" rx="6" fill="#263041"/>
  <path d="M0 252 C88 210 136 230 197 198 C250 170 296 172 360 135 L360 360 L0 360 Z" fill="#705032"/>
  <circle cx="246" cy="105" r="34" fill="#ffd779"/>
  <circle cx="262" cy="96" r="34" fill="#263041"/>
  <rect x="75" y="188" width="58" height="48" fill="#b98b56"/>
  <rect x="86" y="158" width="36" height="44" fill="#6f8a67"/>
  <circle cx="104" cy="150" r="24" fill="#7f996d"/>
  <rect x="194" y="195" width="91" height="16" fill="#9d6c43"/>
  <rect x="210" y="148" width="58" height="52" fill="#e1c184"/>
  <path d="M180 68 l8 18 19 2 -15 13 4 19 -16 -10 -17 10 5 -19 -15 -13 19 -2z" fill="#f3d38c"/>
</svg>`;

export const mockRoomPublicData: PublicRoomPlayData = publicRoomPlaySchema.parse({
  roomId: "mock-room",
  roomTitle: "纸板月光小屋",
  publicTitle: "朋友的心事小屋",
  visualTheme: "旧纸、暖灯、纸板小屋、未寄出的信",
  objects: [
    {
      id: "letter-envelope",
      name: "未寄出的信封",
      clue: "它知道地址，却一直没有出发。",
      keyword: "犹豫",
      position: { x: 52, y: 72 },
      assetKey: "envelope"
    },
    {
      id: "slow-clock",
      name: "慢下来的钟",
      clue: "指针总在同一个傍晚停住，好像舍不得往前走。",
      keyword: "反复想起",
      position: { x: 31, y: 24 },
      assetKey: "clock"
    },
    {
      id: "window-plant",
      name: "窗边植物",
      clue: "它一直朝着有光的地方长，却没有把自己搬过去。",
      keyword: "靠近",
      position: { x: 18, y: 48 },
      assetKey: "plant"
    },
    {
      id: "moon-window",
      name: "月亮窗",
      clue: "窗外很亮的时候，它会偷偷看向对面的灯。",
      keyword: "想念",
      position: { x: 74, y: 29 },
      assetKey: "window"
    },
    {
      id: "quiet-note",
      name: "椅背便签",
      clue: "上面只写了两个点，像一句话说到一半又收回去。",
      keyword: "没说出口",
      position: { x: 86, y: 48 },
      assetKey: "chair-note"
    }
  ],
  imageClue: {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(mockPhotoSvg)}`,
    caption: "放进信封的照片",
    safeDescription: "照片里是夜晚窗边的一盏灯，像是在等谁看见。"
  },
  pet: {
    type: "cat",
    name: "栗子",
    mood: "知道一点点，但会替秘密守口"
  },
  progress: 0,
  discoveredObjectIds: []
});
