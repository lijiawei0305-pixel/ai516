# 《心事小屋》2.5D 图像生成流水线

本模块位于 `lib/llm/imageJobs/*`，负责把 `RoomAssetPlan.imagePromptPlan` 中的 2.5D 素材 prompt 并发变成可落库的图片资产。

核心策略：不要指望生图模型直接生成完整可玩的 2.5D 房间。生图模型只负责生成统一视角的素材；真正的 2.5D 空间由前端通过房间壳背景、y-sort、接地阴影、前景遮挡和底部中心锚点实现。

## 资产类型

`generationPlan.jobs` 固定包含 8 条：

- `room_shell_background`: 2.5D 纸板小屋房间壳背景
- `clue_object_sprite`: 5 个可点击线索物件 sprite
- `pet_sprite`: 小猫/小狗宠物 sprite
- `foreground_occluder`: 前景遮挡元素，例如桌边、门框、地毯边缘

## 输入

- `provider`
- `roomAssetPlan`
- `roomId`
- `creatorId`

其中 `roomAssetPlan.imagePromptPlan.objectImagePrompts` 固定 5 条，另外还有 `roomShellBackgroundPrompt`、`petSpritePrompt` 和 `foregroundOccluderPrompt`。

## 处理流程

1. `runObjectImageJobs()` 读取 `generationPlan.jobs`。
2. 通过 Promise-based limiter 并发执行，限制值取自 `provider.config.maxConcurrentImageJobs`。
3. 每个任务调用 provider 的 `imageGeneration()`。
4. 对返回值执行 `normalizeImageResponse()`，兼容：
   - `data[].url`
   - `data[].b64_json`
   - `base64`
   - data URL
   - chat completion 中返回的嵌入 JSON
5. 使用 `downloadOrDecodeImage()` 将 URL 下载成 buffer，或将 base64 解码成 buffer。
6. 使用 `uploadGeneratedAsset()` 上传到 Supabase Storage，或在缺少后端存储时回退到本地 `public/generated/room-assets/`。
7. 使用 `storeGeneratedAsset()` 写入 `room_assets`。

## 返回结构

```ts
{
  roomAssetResults: [...],
  generationSummary: {
    successCount: number,
    failedCount: number
  }
}
```

单个任务失败不会中断其他任务。失败项会返回：

- `status: "failed"`
- `error`
- `retryable`
- `fallbackPlan`

成功项会返回：

- `assetId`
- `storagePath`
- `publicUrl`
- `sourceType`
- `mimeType`

## 存储约定

- 资产表：`room_assets`
- 资产类型：`image`
- 角色：`clue_image`（兼容旧表枚举）
- 细分角色：写入 `signed_url_strategy.asset_role`
- 存储桶：`room-assets`

服务端优先使用 Supabase Storage。若没有配置 Supabase 服务角色，则会回退到本地 `public/generated/room-assets/`，以保证开发环境可运行。

## 失败策略

- 不允许 1 张失败导致整组失败。
- 对失败项保留错误信息和可重试标记。
- 上游可根据 `fallbackPlan` 决定是否替换为占位素材。

## 注意

线索物件 prompt 必须强调“独立可合成的 clue object sprite”，要求完整物件露出、透明底或纯净单色底、四周有留白、45 度 top-front 视角、底部中心锚点、轻微接地阴影、旧纸纸板材质、暖光、干净 cutout，并明确排除完整房间背景、横向切片、矩形卡片构图、扁平贴纸、icon、正面插画、文字、霓虹、赛博和写实商品照。

房间壳背景 prompt 必须强调 `2.5D top-down mobile game room shell background`、纸板微缩房间、旧纸手账风、后墙/左右墙/暖色地板、窗户/灯/书架/桌子底座/植物、5 个线索物件空位、左上暖光、角落软阴影，并排除主线索物件、角色和可读文字。
