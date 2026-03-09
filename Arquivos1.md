Perfeito. Ajustei o recorte pra ficar coerente com o que o material realmente fecha: three-pane studio + grafo relacional + gatekeeper loop + ghost nodes/pre-heating, e com a arquitetura mais madura em que Next.js cuida da UI, Supabase Edge Functions seguram o streaming/prompting pesado, Postgres/pgvector guardam a ontologia, e Rust fica nos jobs offline/auditoria. Também normalizei o campo principal do node para title porque o contrato do compilador e o <ProposedLoreCard /> trabalham com title, não com name.  ￼  ￼  ￼
A versão mais madura da arquitetura move o trabalho pesado para Supabase Edge Functions. Então abaixo esse arquivo vira um relay autenticado fino, não o lugar onde o Vertex é orquestrado de verdade.  ￼  ￼

1) apps/web/app/studio/[worldId]/layout.tsx

import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StudioShell } from '@/components/studio/studio-shell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ worldId: string }>;
};

export default async function StudioWorldLayout({ children, params }: LayoutProps) {
  const { worldId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: world, error } = await supabase
    .from('universes')
    .select('id, owner_id, name, genre, temporal_resolution, epoch_name, created_at')
    .eq('id', worldId)
    .single();

  if (error || !world) {
    notFound();
  }

  const { data: axioms } = await supabase
    .from('global_axioms')
    .select('id, rule_text, is_active')
    .eq('universe_id', worldId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  return (
    <StudioShell
      world={{
        id: world.id,
        name: world.name,
        genre: world.genre,
        temporalResolution: world.temporal_resolution,
        epochName: world.epoch_name,
      }}
      initialAxioms={axioms ?? []}
    >
      {children}
    </StudioShell>
  );
}

2) apps/web/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'edge';

type ChatRouteBody = {
  worldId: string;
  activeNodeId?: string | null;
  userIntent: string;
  persona?: string;
  manualContextIds?: string[];
};

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as ChatRouteBody;

  if (!body.worldId || !body.userIntent?.trim()) {
    return NextResponse.json(
      { error: 'worldId and userIntent are required' },
      { status: 400 },
    );
  }

  const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-compile-node`;

  const upstream = await fetch(edgeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      'x-client-info': 'universal-world-engine/web',
    },
    body: JSON.stringify({
      worldId: body.worldId,
      activeNodeId: body.activeNodeId ?? null,
      userIntent: body.userIntent,
      persona: body.persona ?? 'archivist',
      manualContextIds: body.manualContextIds ?? [],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '');
    return NextResponse.json(
      { error: 'Edge function failed', details: text || upstream.statusText },
      { status: upstream.status },
    );
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

3) apps/web/components/studio/right-pane/proposed-lore-card.tsx

'use client';

import { useTransition } from 'react';
import { commitLoreNode } from '@/actions/commit-lore-node';

export type ProposedLoreNode = {
  title: string;
  category: 'character' | 'location' | 'faction' | 'event' | 'item' | 'concept';
  contentMd: string;
  summary?: string | null;
  startTick?: number | null;
  endTick?: number | null;
  metadata?: Record<string, unknown>;
  relatedNodeIds?: string[];
  mediaAssets?: Array<{
    kind: 'image' | 'model' | 'video' | 'document';
    url: string;
    alt?: string;
  }>;
};

type Props = {
  worldId: string;
  proposal: ProposedLoreNode;
  onTweak: () => void;
  onDiscard: () => void;
  onCommitted?: (nodeId: string) => void;
};

const categoryEmoji: Record<Props['proposal']['category'], string> = {
  character: '👤',
  location: '📍',
  faction: '🛡️',
  event: '🕰️',
  item: '🗝️',
  concept: '🧠',
};

export function ProposedLoreCard({
  worldId,
  proposal,
  onTweak,
  onDiscard,
  onCommitted,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleCommit = () => {
    startTransition(async () => {
      const result = await commitLoreNode({
        worldId,
        proposal,
      });

      if (result.ok && result.nodeId) {
        onCommitted?.(result.nodeId);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-4 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-400">
            Proposed Lore
          </div>
          <h3 className="text-lg font-semibold text-white">
            <span className="mr-2">{categoryEmoji[proposal.category]}</span>
            {proposal.title}
          </h3>
        </div>

        <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-neutral-300">
          {proposal.category}
        </span>
      </div>

      {proposal.summary ? (
        <p className="mb-3 text-sm leading-6 text-neutral-300">{proposal.summary}</p>
      ) : null}

      <div className="mb-4 max-h-56 overflow-auto rounded-xl bg-white/5 p-3 text-sm leading-6 text-neutral-200">
        <pre className="whitespace-pre-wrap font-sans">{proposal.contentMd}</pre>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-neutral-400">
        {proposal.startTick != null && (
          <span className="rounded-full bg-white/5 px-2 py-1">start {proposal.startTick}</span>
        )}
        {proposal.endTick != null && (
          <span className="rounded-full bg-white/5 px-2 py-1">end {proposal.endTick}</span>
        )}
        {proposal.relatedNodeIds?.length ? (
          <span className="rounded-full bg-white/5 px-2 py-1">
            {proposal.relatedNodeIds.length} relations
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onTweak}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5"
          disabled={isPending}
        >
          Tweak
        </button>

        <button
          type="button"
          onClick={onDiscard}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-neutral-300 hover:bg-white/5"
          disabled={isPending}
        >
          Discard
        </button>

        <button
          type="button"
          onClick={handleCommit}
          className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? 'Committing…' : 'Commit to Lore'}
        </button>
      </div>
    </div>
  );
}

4) apps/web/components/studio/center-pane/media-stage.tsx

'use client';

type MediaAsset = {
  kind: 'image' | 'model' | 'video' | 'document';
  url: string;
  alt?: string;
  posterUrl?: string;
};

type Props = {
  assets: MediaAsset[];
  title: string;
};

export function MediaStage({ assets, title }: Props) {
  if (!assets.length) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-sm text-neutral-500">
        No media linked to this node yet.
      </div>
    );
  }

  const primary = assets[0];

  switch (primary.kind) {
    case 'image':
      return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primary.url}
            alt={primary.alt ?? title}
            className="h-auto max-h-[560px] w-full object-cover"
          />
        </div>
      );

    case 'model':
      return (
        <div className="grid min-h-[360px] place-items-center rounded-2xl border border-white/10 bg-neutral-950 text-neutral-300">
          <div className="text-center">
            <div className="mb-2 text-sm uppercase tracking-[0.2em] text-neutral-500">3D Model</div>
            <div className="text-sm">{primary.url}</div>
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video
            controls
            preload="metadata"
            poster={primary.posterUrl}
            className="max-h-[560px] w-full"
          >
            <source src={primary.url} />
          </video>
        </div>
      );

    case 'document':
      return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
          <iframe
            src={primary.url}
            title={`${title} document`}
            className="h-[640px] w-full"
          />
        </div>
      );

    default:
      return null;
  }
}

5) apps/web/stores/studio-store.ts

'use client';

import { create } from 'zustand';

export type NodeCategory =
  | 'character'
  | 'location'
  | 'faction'
  | 'event'
  | 'item'
  | 'concept';

export type NodeStatus = 'canon' | 'paradox' | 'stub' | 'unverified' | 'ghost';

export type LoreNode = {
  id: string;
  worldId: string;
  title: string;
  category: NodeCategory;
  status: NodeStatus;
  contentMd: string;
  startTick?: number | null;
  endTick?: number | null;
  mediaAssets?: Array<{
    kind: 'image' | 'model' | 'video' | 'document';
    url: string;
    alt?: string;
  }>;
  metadata?: Record<string, unknown>;
};

export type NodeEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
  status: Exclude<NodeStatus, 'ghost'>;
};

export type ProposedLore = {
  title: string;
  category: NodeCategory;
  contentMd: string;
  summary?: string | null;
  startTick?: number | null;
  endTick?: number | null;
  metadata?: Record<string, unknown>;
  relatedNodeIds?: string[];
  mediaAssets?: LoreNode['mediaAssets'];
};

type StudioState = {
  worldId: string | null;
  activeNodeId: string | null;
  leftPaneMode: 'list' | 'graph';
  timelineScrubberTick: number;
  proposedLore: ProposedLore | null;
  chatHistory: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
  nodes: Record<string, LoreNode>;
  edges: NodeEdge[];

  bootstrapWorld: (input: {
    worldId: string;
    nodes?: LoreNode[];
    edges?: NodeEdge[];
  }) => void;

  setActiveNode: (nodeId: string | null) => void;
  setLeftPaneMode: (mode: 'list' | 'graph') => void;
  setTimelineScrubberTick: (tick: number) => void;

  stageLoreProposal: (proposal: ProposedLore) => void;
  clearProposal: () => void;

  appendChatMessage: (message: { id: string; role: 'user' | 'assistant'; content: string }) => void;

  upsertNode: (node: LoreNode) => void;
  commitProposedLoreOptimistically: (nodeId: string) => void;
  createGhostNode: (input: {
    tempId: string;
    worldId: string;
    title: string;
    category: NodeCategory;
  }) => void;
  solidifyGhostNode: (tempId: string, persisted: LoreNode) => void;
  rollbackGhostNode: (tempId: string) => void;
};

export const useStudioStore = create<StudioState>((set) => ({
  worldId: null,
  activeNodeId: null,
  leftPaneMode: 'list',
  timelineScrubberTick: 0,
  proposedLore: null,
  chatHistory: [],
  nodes: {},
  edges: [],

  bootstrapWorld: ({ worldId, nodes = [], edges = [] }) =>
    set(() => ({
      worldId,
      nodes: Object.fromEntries(nodes.map((node) => [node.id, node])),
      edges,
    })),

  setActiveNode: (nodeId) => set(() => ({ activeNodeId: nodeId })),
  setLeftPaneMode: (mode) => set(() => ({ leftPaneMode: mode })),
  setTimelineScrubberTick: (tick) => set(() => ({ timelineScrubberTick: tick })),

  stageLoreProposal: (proposal) => set(() => ({ proposedLore: proposal })),
  clearProposal: () => set(() => ({ proposedLore: null })),

  appendChatMessage: (message) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, message],
    })),

  upsertNode: (node) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        [node.id]: node,
      },
    })),

  commitProposedLoreOptimistically: (nodeId) =>
    set((state) => {
      const current = state.nodes[nodeId];
      if (!current) return state;

      return {
        nodes: {
          ...state.nodes,
          [nodeId]: {
            ...current,
            status: 'canon',
          },
        },
        proposedLore: null,
        activeNodeId: nodeId,
      };
    }),

  createGhostNode: ({ tempId, worldId, title, category }) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        [tempId]: {
          id: tempId,
          worldId,
          title,
          category,
          status: 'ghost',
          contentMd: '',
          mediaAssets: [],
          metadata: {},
        },
      },
      activeNodeId: tempId,
    })),

  solidifyGhostNode: (tempId, persisted) =>
    set((state) => {
      const nextNodes = { ...state.nodes };
      delete nextNodes[tempId];
      nextNodes[persisted.id] = persisted;

      return {
        nodes: nextNodes,
        activeNodeId: persisted.id,
      };
    }),

  rollbackGhostNode: (tempId) =>
    set((state) => {
      const nextNodes = { ...state.nodes };
      delete nextNodes[tempId];

      return {
        nodes: nextNodes,
        activeNodeId: state.activeNodeId === tempId ? null : state.activeNodeId,
      };
    }),
}));

6) apps/web/hooks/use-predictive-cache.ts

'use client';

import { useEffect } from 'react';

type UsePredictiveCacheArgs = {
  worldId: string | null;
  activeNodeId: string | null;
  contentMd: string;
};

export function usePredictiveCache({
  worldId,
  activeNodeId,
  contentMd,
}: UsePredictiveCacheArgs) {
  useEffect(() => {
    if (!worldId || !activeNodeId) return;
    if (!contentMd.trim()) return;

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        await fetch('/api/pre-heat-context', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            worldId,
            activeNodeId,
            contentMd,
          }),
        });
      } catch {
        // Quiet on purpose: pre-heating is an optimization, not a user-facing action.
      }
    }, 2000);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [worldId, activeNodeId, contentMd]);
}

7) apps/web/actions/commit-lore-node.ts

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const mediaAssetSchema = z.object({
  kind: z.enum(['image', 'model', 'video', 'document']),
  url: z.string().url(),
  alt: z.string().optional(),
});

const proposalSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['character', 'location', 'faction', 'event', 'item', 'concept']),
  contentMd: z.string().min(1),
  summary: z.string().nullable().optional(),
  startTick: z.number().int().nullable().optional(),
  endTick: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  relatedNodeIds: z.array(z.string().uuid()).optional(),
  mediaAssets: z.array(mediaAssetSchema).optional(),
});

const commitInputSchema = z.object({
  worldId: z.string().uuid(),
  proposal: proposalSchema,
});

type CommitInput = z.infer<typeof commitInputSchema>;

export async function commitLoreNode(rawInput: CommitInput) {
  const input = commitInputSchema.parse(rawInput);
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { ok: false as const, error: 'Unauthorized' };
  }

  const {
    data: insertedNode,
    error: nodeError,
  } = await supabase
    .from('lore_nodes')
    .insert({
      universe_id: input.worldId,
      title: input.proposal.title,
      category: input.proposal.category,
      status: 'canon',
      content_md: input.proposal.contentMd,
      summary: input.proposal.summary ?? null,
      start_tick: input.proposal.startTick ?? null,
      end_tick: input.proposal.endTick ?? null,
      media_assets: input.proposal.mediaAssets ?? [],
      metadata: input.proposal.metadata ?? {},
    })
    .select('id, universe_id, title, category, status, content_md, summary, start_tick, end_tick, media_assets, metadata')
    .single();

  if (nodeError || !insertedNode) {
    return { ok: false as const, error: nodeError?.message ?? 'Could not insert lore node' };
  }

  if (input.proposal.relatedNodeIds?.length) {
    const edgeRows = input.proposal.relatedNodeIds.map((targetId) => ({
      universe_id: input.worldId,
      source_node_id: insertedNode.id,
      target_node_id: targetId,
      relationship_type: 'RELATED_TO',
      status: 'canon',
    }));

    const { error: edgeError } = await supabase.from('node_edges').insert(edgeRows);

    if (edgeError) {
      return { ok: false as const, error: edgeError.message };
    }
  }

  revalidatePath(`/studio/${input.worldId}`);
  revalidatePath(`/studio/${input.worldId}/node/${insertedNode.id}`);

  return {
    ok: true as const,
    nodeId: insertedNode.id,
    node: insertedNode,
  };
}

8) apps/web/lib/ai/context-assembly.ts

import { createServerSupabaseClient } from '@/lib/supabase/server';

type AssembleContextInput = {
  worldId: string;
  activeNodeId?: string | null;
  userIntent: string;
  manualContextIds?: string[];
};

export type AssembledAIContext = {
  axioms: string[];
  activeNode: {
    id: string;
    title: string;
    category: string;
    contentMd: string;
  } | null;
  contextNodes: Array<{
    id: string;
    title: string;
    category: string;
    contentMd: string;
  }>;
};

export async function assembleAIContext({
  worldId,
  activeNodeId,
  userIntent,
  manualContextIds = [],
}: AssembleContextInput): Promise<AssembledAIContext> {
  const supabase = await createServerSupabaseClient();

  const [{ data: axioms }, { data: activeNode }] = await Promise.all([
    supabase
      .from('global_axioms')
      .select('rule_text')
      .eq('universe_id', worldId)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),

    activeNodeId
      ? supabase
          .from('lore_nodes')
          .select('id, title, category, content_md')
          .eq('id', activeNodeId)
          .eq('universe_id', worldId)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const manualContextPromise = manualContextIds.length
    ? supabase
        .from('lore_nodes')
        .select('id, title, category, content_md')
        .in('id', manualContextIds)
        .eq('universe_id', worldId)
        .limit(8)
    : Promise.resolve({ data: [] });

  const ragPromise = supabase.rpc('match_lore_nodes', {
    query_text: userIntent,
    query_universe_id: worldId,
    match_count: 5,
  });

  const [{ data: manualContext }, { data: ragContext }] = await Promise.all([
    manualContextPromise,
    ragPromise,
  ]);

  const byId = new Map<string, { id: string; title: string; category: string; contentMd: string }>();

  for (const row of manualContext ?? []) {
    byId.set(row.id, {
      id: row.id,
      title: row.title,
      category: row.category,
      contentMd: row.content_md,
    });
  }

  for (const row of ragContext ?? []) {
    byId.set(row.id, {
      id: row.id,
      title: row.title,
      category: row.category,
      contentMd: row.content_md,
    });
  }

  if (activeNode) {
    byId.set(activeNode.id, {
      id: activeNode.id,
      title: activeNode.title,
      category: activeNode.category,
      contentMd: activeNode.content_md,
    });
  }

  return {
    axioms: (axioms ?? []).map((row) => row.rule_text),
    activeNode: activeNode
      ? {
          id: activeNode.id,
          title: activeNode.title,
          category: activeNode.category,
          contentMd: activeNode.content_md,
        }
      : null,
    contextNodes: [...byId.values()],
  };
}

9) supabase/migrations/0003_universes.sql

create extension if not exists pgcrypto;

create table if not exists public.universes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  genre text not null,
  temporal_resolution text not null default 'years',
  epoch_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint universes_name_length check (char_length(name) >= 2),
  constraint universes_temporal_resolution_check check (
    temporal_resolution in ('minutes', 'hours', 'days', 'months', 'years')
  )
);

create index if not exists universes_owner_id_idx on public.universes(owner_id);
create index if not exists universes_created_at_idx on public.universes(created_at desc);

alter table public.universes enable row level security;

create policy "universes_select_own"
on public.universes
for select
using (owner_id = auth.uid());

create policy "universes_insert_own"
on public.universes
for insert
with check (owner_id = auth.uid());

create policy "universes_update_own"
on public.universes
for update
using (owner_id = auth.uid());

create policy "universes_delete_own"
on public.universes
for delete
using (owner_id = auth.uid());

10) supabase/migrations/0004_global_axioms.sql

create table if not exists public.global_axioms (
  id uuid primary key default gen_random_uuid(),
  universe_id uuid not null references public.universes(id) on delete cascade,
  rule_text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint global_axioms_rule_text_length check (char_length(rule_text) >= 3)
);

create index if not exists global_axioms_universe_id_idx
  on public.global_axioms(universe_id);

create index if not exists global_axioms_universe_active_idx
  on public.global_axioms(universe_id, is_active);

alter table public.global_axioms enable row level security;

create policy "global_axioms_select_if_owner"
on public.global_axioms
for select
using (
  exists (
    select 1
    from public.universes u
    where u.id = global_axioms.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "global_axioms_insert_if_owner"
on public.global_axioms
for insert
with check (
  exists (
    select 1
    from public.universes u
    where u.id = global_axioms.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "global_axioms_update_if_owner"
on public.global_axioms
for update
using (
  exists (
    select 1
    from public.universes u
    where u.id = global_axioms.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "global_axioms_delete_if_owner"
on public.global_axioms
for delete
using (
  exists (
    select 1
    from public.universes u
    where u.id = global_axioms.universe_id
      and u.owner_id = auth.uid()
  )
);

11) supabase/migrations/0005_lore_nodes.sql

create extension if not exists vector;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'node_category') then
    create type public.node_category as enum (
      'character',
      'location',
      'faction',
      'event',
      'item',
      'concept'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'node_status') then
    create type public.node_status as enum (
      'canon',
      'paradox',
      'stub',
      'unverified'
    );
  end if;
end $$;

create table if not exists public.lore_nodes (
  id uuid primary key default gen_random_uuid(),
  universe_id uuid not null references public.universes(id) on delete cascade,

  title text not null,
  category public.node_category not null,
  status public.node_status not null default 'unverified',

  summary text,
  content_md text not null default '',

  start_tick bigint,
  end_tick bigint,
  is_cyclical boolean not null default false,

  media_assets jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,

  embedding vector(768),
  locked_by uuid references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lore_nodes_title_length check (char_length(title) >= 1),
  constraint lore_nodes_valid_tick_range check (
    start_tick is null
    or end_tick is null
    or start_tick <= end_tick
  ),
  constraint lore_nodes_media_assets_array check (jsonb_typeof(media_assets) = 'array'),
  constraint lore_nodes_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists lore_nodes_universe_id_idx
  on public.lore_nodes(universe_id);

create index if not exists lore_nodes_universe_category_idx
  on public.lore_nodes(universe_id, category);

create index if not exists lore_nodes_universe_status_idx
  on public.lore_nodes(universe_id, status);

create index if not exists lore_nodes_start_tick_idx
  on public.lore_nodes(universe_id, start_tick);

create index if not exists lore_nodes_end_tick_idx
  on public.lore_nodes(universe_id, end_tick);

create index if not exists lore_nodes_embedding_idx
  on public.lore_nodes
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.lore_nodes enable row level security;

create policy "lore_nodes_select_if_owner"
on public.lore_nodes
for select
using (
  exists (
    select 1
    from public.universes u
    where u.id = lore_nodes.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "lore_nodes_insert_if_owner"
on public.lore_nodes
for insert
with check (
  exists (
    select 1
    from public.universes u
    where u.id = lore_nodes.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "lore_nodes_update_if_owner"
on public.lore_nodes
for update
using (
  exists (
    select 1
    from public.universes u
    where u.id = lore_nodes.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "lore_nodes_delete_if_owner"
on public.lore_nodes
for delete
using (
  exists (
    select 1
    from public.universes u
    where u.id = lore_nodes.universe_id
      and u.owner_id = auth.uid()
  )
);

12) supabase/migrations/0006_node_edges.sql

create table if not exists public.node_edges (
  id uuid primary key default gen_random_uuid(),
  universe_id uuid not null references public.universes(id) on delete cascade,

  source_node_id uuid not null references public.lore_nodes(id) on delete cascade,
  target_node_id uuid not null references public.lore_nodes(id) on delete cascade,

  relationship_type text not null,
  context text,
  is_causal boolean not null default false,
  status public.node_status not null default 'unverified',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint node_edges_distinct_nodes check (source_node_id <> target_node_id),
  constraint node_edges_unique_triplet unique (source_node_id, target_node_id, relationship_type)
);

create index if not exists node_edges_universe_id_idx
  on public.node_edges(universe_id);

create index if not exists node_edges_source_idx
  on public.node_edges(source_node_id);

create index if not exists node_edges_target_idx
  on public.node_edges(target_node_id);

create index if not exists node_edges_status_idx
  on public.node_edges(universe_id, status);

alter table public.node_edges enable row level security;

create policy "node_edges_select_if_owner"
on public.node_edges
for select
using (
  exists (
    select 1
    from public.universes u
    where u.id = node_edges.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "node_edges_insert_if_owner"
on public.node_edges
for insert
with check (
  exists (
    select 1
    from public.universes u
    where u.id = node_edges.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "node_edges_update_if_owner"
on public.node_edges
for update
using (
  exists (
    select 1
    from public.universes u
    where u.id = node_edges.universe_id
      and u.owner_id = auth.uid()
  )
);

create policy "node_edges_delete_if_owner"
on public.node_edges
for delete
using (
  exists (
    select 1
    from public.universes u
    where u.id = node_edges.universe_id
      and u.owner_id = auth.uid()
  )
);

Isso já te deixa com o núcleo certo: layout do studio, relay de chat, card de proposta, media stage, store central, pre-heating, commit action e a ontologia SQL base de universes, global_axioms, lore_nodes e node_edges. Tudo isso bate com o material: ontologia em grafo, UI em três panes, proposta compilada com Commit to Lore, ghost nodes/pre-heating e divisão Next.js/Supabase/Rust.  ￼  ￼  ￼  ￼

A próxima peça certa é eu te entregar os 8 arquivos imediatamente adjacentes a esses doze, que fazem isso realmente respirar: studio-shell.tsx, pre-heat-context/route.ts, lib/supabase/server.ts, lib/supabase/client.ts, supabase/functions/ai-compile-node/index.ts, supabase/functions/_shared/vertex.ts, types/database.ts e o RPC match_lore_nodes.