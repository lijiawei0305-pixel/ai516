-- Add layer/object scoping columns to room_assets for paper-diorama multi-layer sprites.
-- A single clue object can now own multiple PNG layers (back / mid / front),
-- aggregated client-side via render.layers[].

alter table public.room_assets
  add column if not exists object_id text,
  add column if not exists layer_role text not null default 'main';

create index if not exists room_assets_room_object_layer_idx
  on public.room_assets (room_id, object_id, layer_role);

comment on column public.room_assets.object_id is
  'Logical clue object id this asset belongs to. Null for background/foreground occluder/pet sprite (asset_role-only).';

comment on column public.room_assets.layer_role is
  'Paper-diorama layer slot: main (single-layer fallback) | back | mid | front. Defaults to main for legacy rows.';
