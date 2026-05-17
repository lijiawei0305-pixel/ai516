**心事小屋 (Heart Cabin)** — 一个用 AI 把「一句心事」变成可互动的 2.5D 微缩小屋解谜游戏。




### 项目简介

**心事小屋** 是一款情感 + 解谜 + AI 生成的社交小游戏。

- **创作者（A）** 输入一句心事（可附带图片线索），AI 自动生成一个温馨的纸板微缩小屋。
- **玩家（B）** 进入小屋，点击散落在房间里的 5 个线索物件、和宠物聊天、选择选项，最终猜出 A 的心事。
- 猜得越准，默契度越高，默契度达标后可申请查看 A 的日记片段，双方建立情感连接。

项目采用 **Next.js 15 + TypeScript + Tailwind + PixiJS** 实现 2.5D 渲染，后端使用 **Supabase** + **OpenAI 兼容 LLM**（支持多种供应商）生成内容和图像。

### 核心玩法

1. **创建房间**
   - 输入一句心事（例如：“今天又加班到凌晨，心里有点空”）
   - 可选上传一张图片作为额外线索
   - 选择可见性（私有 / 仅链接 / 公开）
   - AI 自动完成：语义分析 → 房间设计 → 线索生成 → 图像素材生成 → 组装 2.5D 小屋

2. **游玩房间**
   - 进入一个 2.5D 纸板风格的小屋（暖色手账风、月光、老纸质感）
   - 点击 5 个线索物件（信封、时钟、钥匙、便签、植物等），每个物件有文字线索
   - 和房间里的宠物（猫或狗）聊天，宠物会给温和提示（不会直接剧透）
   - 收集足够线索后，选择 4 个选项中的一个，或自由输入猜测
   - 提交后立即看到得分、默契度、评价和部分揭晓的心事

3. **结果与社交**
   - 玩家查看自己的猜谜结果
   - 创作者在后台看到所有玩家的猜测记录
   - 高默契玩家可申请查看创作者的日记片段
   - 支持分享房间链接、结果卡片

### 技术亮点

- **2.5D 纸板微缩风格**：不是一张大图，而是由独立生成的 sprite（线索物件 + 宠物 + 前景遮挡 + 房间壳）通过坐标、层级、阴影、Y-sort 组合而成，视觉统一且可扩展。
- **多阶段 LLM Pipeline**：语义分析 → 叙事设计 → 图像提示词生成 → 并发生成，确保内容安全、可玩、情感准确。
- **图像生成**：支持 OpenAI DALL·E、Flux、SD 等兼容接口，生成 8 个独立素材（1 张房间壳 + 5 个物件 + 1 个宠物 + 1 个前景）。
- **安全与隐私**：答案（original_sentence、hiddenMeaning）永不暴露给玩家或前端；宠物聊天有安全过滤；日记访问需双方同意。
- **Supabase** 存储房间、资产、用户数据、猜测记录。

### 安装与运行

#### 1. 克隆项目

```bash
git clone https://github.com/lijiawei0305-pixel/ai516.git
cd ai516
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 环境变量（.env.local）

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # 用于服务端上传和数据库操作

# LLM（任选其一或多个）
OPENAI_API_KEY=sk-...
# 或其他 OpenAI 兼容提供商
# ANTHROPIC_API_KEY=...
# GROQ_API_KEY=...

# 图像生成（可选）
# 可通过 LLM_PROVIDER_CONFIG 配置不同模型
```

详细配置参考 `docs/LLM_PROVIDER_CONFIG.md`

#### 4. 数据库迁移

项目使用 Supabase，本地可直接运行 migrations：

```bash
# 如果你有 supabase cli
supabase db push
```

或在 Supabase Dashboard 手动执行 `supabase/migrations/` 下的 SQL 文件。

#### 5. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可开始创建/游玩房间。

### 项目结构（核心部分）

- `app/` — Next.js App Router 页面（首页、创建、游玩、结果等）
- `lib/llm/` — LLM 多阶段流水线（语义分析、房间设计、提示词、生成计划）
- `lib/llm/imageJobs/` — 图像并发生成与资产上传
- `components/heart-cabin/` — 游戏核心 UI 与 PixiJS 渲染
- `docs/` — 详细设计文档（强烈建议阅读）
  - `ROOM_JSON_SPEC.md` — 房间数据格式
  - `LLM_PIPELINE.md` — 内容生成流程
  - `IMAGE_GENERATION_PIPELINE.md` — 图像生成细节
  - `API_CONTRACT.md` — 前端可用的 API 接口
  - `DATA_SCHEMA.md`、`PET_SAFETY.md` 等
- `public/assets/` — 静态素材与占位图

### 如何贡献 / 二次开发

1. 阅读 `docs/` 下所有文档，理解数据流和安全规则。
2. 新增 LLM 提供商时，继承 `LlmProvider` 并在 `LLM_PROVIDER_CONFIG` 中注册。
3. 图像风格调整主要修改共享 prompt（`sharedStylePrompt`）。
4. 前端渲染逻辑集中在 PixiJS 容器组件中，支持自定义主题。

### 未来计划（Roadmap）

- 多语言支持
- 更多房间主题（雨夜、星空、书房等）
- 多人联机房间
- 移动端优化与 PWA
- 社区画廊与公开房间排行

---

欢迎 Star、Fork、PR！  
这是一个把「心事」变成温暖小游戏的实验项目，希望它能带给大家一点情感连接的乐趣。

**作者**：lijiawei0305-pixel  
**仓库**：https://github.com/lijiawei0305-pixel/ai516

Enjoy your heart cabin! 🏠✨
