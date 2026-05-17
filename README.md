**# 心事小屋（ai516）**

一个用 AI 驱动的**温暖治愈系心事分享与猜谜互动小游戏**。  
玩家 A 输入一句「心事」（可以附带图片线索），AI 自动生成一个**2.5D 纸艺微缩小屋**，里面藏着 5 个线索物件、一只性格鲜活的宠物，以及 4 个选择题。  
玩家 B 进入房间探索、和宠物聊天、收集线索，最后猜测 A 的真实心事。猜得越准，默契度越高，还能解锁 A 的日记片段。

项目技术栈：**Next.js 15 (App Router) + TypeScript + Tailwind + Supabase + LLM + 多模型图像生成**。

---

## ✨ 核心玩法

### 1. 创建房间（玩家 A）
- 输入一句**心事**（原句仅自己可见）
- 可选上传一张图片作为额外线索
- 选择情绪标签和可见性（私密 / 仅链接 / 公开）
- AI 自动完成：
  - 语义分析 + 隐藏含义提炼
  - 房间叙事设计（5 个物件 + 4 个选项）
  - 纸艺风 2.5D 素材生成（房间壳、物件 sprite、宠物、遮挡物）
  - 组装完整可玩的 `room_json`

### 2. 游玩房间（玩家 B）
- 进入 2.5D 微缩纸艺小屋（顶部视角 + 轻微等距）
- 点击物件查看线索（带软阴影、悬浮反馈）
- 和房间宠物聊天（可索要提示，但宠物不会直接剧透）
- 收集线索后进入**猜测环节**（选择题 + 自由文本）
- 提交后立即看到**默契度评分**、评语和部分揭晓

### 3. 结果与社交
- 玩家 B 查看个人结果，可申请查看 A 的日记片段（需达到默契度阈值）
- 房间主人可查看所有玩家的猜测记录和日记访问请求
- 支持分享卡片和结果链接

### 4. 特色机制
- **纸艺 2.5D 渲染**：所有物件独立 sprite + y-sort + 接地阴影 + 前景遮挡，呈现手工感
- **安全与隐私**：原句永不泄露给玩家 B，宠物聊天有严格安全过滤
- **日记系统**：高默契度可解锁主人日记，双方可留言互动
- **多 LLM + 多图像模型支持**：可灵活切换 OpenAI 兼容提供商

---

## 📁 项目结构（核心部分）

```
ai516/
├── app/                    # Next.js App Router 页面
│   ├── create/            # 创建房间
│   ├── rooms/[roomId]/play/  # 游玩页面
│   ├── guess/[roomId]/    # 猜测提交
│   ├── result/[guessId]/  # 结果页
│   └── admin/llm-settings/ # LLM 配置后台
├── components/             # 可复用 UI 组件
├── lib/
│   ├── llm/               # LLM 流水线（语义分析 → 房间设计 → 图像 prompt）
│   ├── imageJobs/         # 图像生成并发任务
│   ├── schemas/           # Zod API 与数据校验
│   └── api/               # HTTP 客户端与 mock 服务
├── docs/                   # 详细设计文档（强烈建议阅读）
│   ├── ROOM_JSON_SPEC.md
│   ├── API_CONTRACT.md
│   ├── LLM_PIPELINE.md
│   ├── IMAGE_GENERATION_PIPELINE.md
│   └── ...
├── supabase/               # 数据库迁移
├── public/assets/          # 静态资源
└── .screenshots/           # 界面截图参考
```

---

## 🚀 安装与运行

### 1. 克隆项目
```bash
git clone https://github.com/lijiawei0305-pixel/ai516.git
cd ai516
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境变量（`.env.local`）
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LLM & 图像生成（任选其一或多个）
OPENAI_API_KEY=sk-...
# 或其他 OpenAI 兼容服务（DeepSeek、Groq、Claude 等）

# 推荐在 app/admin/llm-settings 页面配置更多提供商
```

### 4. 数据库初始化
```bash
# 运行 Supabase 迁移
npx supabase migration up
# 或手动执行 supabase/migrations/ 下的 SQL
```

### 5. 本地开发
```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可体验。

---

## 🛠️ 配置 LLM 与图像生成

项目支持**多提供商**切换：

1. 访问 `/admin/llm-settings`（需登录）
2. 添加/编辑 LLM Provider（chat + image）
3. 配置默认模型、并发数、提示词风格等

详细说明见 `docs/LLM_PROVIDER_CONFIG.md` 和 `docs/LLM_PIPELINE.md`。

---

## 📖 重要文档（推荐先读）

- **`docs/API_CONTRACT.md`** —— 前端可依赖的所有接口规范
- **`docs/ROOM_JSON_SPEC.md`** —— 2.5D 房间渲染数据结构（最重要）
- **`docs/LLM_PIPELINE.md`** —— 内容生成流水线
- **`docs/IMAGE_GENERATION_PIPELINE.md`** —— 图像素材生成细节
- **`docs/DATA_SCHEMA.md`** —— 数据库表结构

---

## 🎨 视觉风格参考

项目采用**老纸手工、剪贴簿、温暖纸艺**风格，所有生成的素材均遵循统一 prompt 规范（见图像流水线文档）。  
可在 `.screenshots/` 文件夹查看当前界面效果。

---

## 🧪 测试与开发

```bash
npm run test
# 或针对特定模块
```

Mock 服务位于 `lib/api/mock-services.ts`，适合本地无 API Key 时快速开发。

---

## 🚧 当前状态

- 核心玩法已完整实现（创建 → 探索 → 猜测 → 结果）
- 2.5D 纸艺渲染框架就绪
- LLM + 图像流水线模块化，可扩展
- Supabase 认证、存储、数据库已接入

欢迎 PR、提 Issue，或直接 Fork 部署自己的心事小屋！

---

**Made with ❤️ for gentle emotional connection.**

有任何问题或想一起完善，随时在 GitHub 联系作者！
