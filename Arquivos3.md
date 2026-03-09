Seguem os 3 próximos arquivos que fazem o circuito respirar na UI: a página principal do studio, a página do node específico e o hook de stream do chat. Mantive coerência com o que já fechamos: studio de 3 panes, center pane renderizando node/media, right pane recebendo stream SSE da Edge Function, e proposal indo para o store como staged lore, sem persistir canon direto. Isso continua alinhado com o fluxo “human proposes → AI compiles → UI previews → user commits”. ✨

1) apps/web/app/studio/[worldId]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MediaStage } from '@/components/studio/center-pane/media-stage';

type PageProps = {
  params: Promise<{ worldId: string }>;
};

export default async function StudioWorldPage({ params }: PageProps) {
  const { worldId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: world, error: worldError } = await supabase
    .from('universes')
    .select('id, name, genre, temporal_resolution, epoch_name')
    .eq('id', worldId)
    .single();

  if (worldError || !world) {
    notFound();
  }

  const { data: featuredNode } = await supabase
    .from('lore_nodes')
    .select(
      'id, title, category, status, summary, content_md, start_tick, end_tick, media_assets, metadata',
    )
    .eq('universe_id', worldId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  const { count: nodeCount } = await supabase
    .from('lore_nodes')
    .select('*', { count: 'exact', head: true })
    .eq('universe_id', worldId);

  const { count: proposalCount } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })
    .eq('universe_id', worldId)
    .eq('status', 'pending');

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-8 py-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
          World overview
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-white">{world.name}</h1>

          <div className="flex flex-wrap gap-2 text-sm text-neutral-400">
            <span className="rounded-full bg-white/[0.04] px-3 py-1">
              genre: {world.genre}
            </span>
            <span className="rounded-full bg-white/[0.04] px-3 py-1">
              resolution: {world.temporal_resolution}
            </span>
            {world.epoch_name ? (
              <span className="rounded-full bg-white/[0.04] px-3 py-1">
                epoch: {world.epoch_name}
              </span>
            ) : null}
            <span className="rounded-full bg-white/[0.04] px-3 py-1">
              nodes: {nodeCount ?? 0}
            </span>
            <span className="rounded-full bg-white/[0.04] px-3 py-1">
              pending proposals: {proposalCount ?? 0}
            </span>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-neutral-300">
            This is the top-level studio view. Open a node from the left pane, draft in the
            right pane, and commit structured lore back into the canon graph.
          </p>
        </div>
      </section>

      {featuredNode ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
              Featured node
            </div>

            <div className="mb-4">
              <div className="mb-1 text-sm text-neutral-500">
                {featuredNode.category} · {featuredNode.status}
              </div>
              <h2 className="text-2xl font-semibold text-white">{featuredNode.title}</h2>
            </div>

            {featuredNode.summary ? (
              <p className="mb-4 text-sm leading-7 text-neutral-300">
                {featuredNode.summary}
              </p>
            ) : null}

            <div className="mb-5">
              <MediaStage
                title={featuredNode.title}
                assets={Array.isArray(featuredNode.media_assets) ? (featuredNode.media_assets as never[]) : []}
              />
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-neutral-200">
                {featuredNode.content_md}
              </pre>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
              Quick actions
            </div>

            <div className="space-y-2">
              <Link
                href={`/studio/${worldId}/node/${featuredNode.id}`}
                className="block rounded-2xl border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/5"
              >
                Open featured node
              </Link>

              <Link
                href={`/studio/${worldId}/graph`}
                className="block rounded-2xl border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/5"
              >
                Open graph view
              </Link>

              <Link
                href={`/studio/${worldId}/timeline`}
                className="block rounded-2xl border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/5"
              >
                Open timeline
              </Link>

              <Link
                href={`/studio/${worldId}/gallery`}
                className="block rounded-2xl border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/5"
              >
                Open gallery
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid min-h-[320px] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
          <div>
            <div className="mb-2 text-lg font-medium text-white">No canon nodes yet</div>
            <div className="max-w-md text-sm leading-7 text-neutral-400">
              Use the drafting table to compile your first lore node. Once committed, it will
              appear here and in the Omniscient Index.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}


⸻

2) apps/web/app/studio/[worldId]/node/[nodeId]/page.tsx

import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MediaStage } from '@/components/studio/center-pane/media-stage';

type PageProps = {
  params: Promise<{ worldId: string; nodeId: string }>;
};

export default async function StudioNodePage({ params }: PageProps) {
  const { worldId, nodeId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: node, error: nodeError } = await supabase
    .from('lore_nodes')
    .select(
      'id, universe_id, title, category, status, summary, content_md, start_tick, end_tick, is_cyclical, media_assets, metadata',
    )
    .eq('id', nodeId)
    .eq('universe_id', worldId)
    .single();

  if (nodeError || !node) {
    notFound();
  }

  const { data: outgoingEdges } = await supabase
    .from('node_edges')
    .select(
      'id, relationship_type, context, is_causal, status, target_node_id, lore_nodes!node_edges_target_node_id_fkey(id, title, category)',
    )
    .eq('universe_id', worldId)
    .eq('source_node_id', nodeId)
    .limit(24);

  const { data: incomingEdges } = await supabase
    .from('node_edges')
    .select(
      'id, relationship_type, context, is_causal, status, source_node_id, lore_nodes!node_edges_source_node_id_fkey(id, title, category)',
    )
    .eq('universe_id', worldId)
    .eq('target_node_id', nodeId)
    .limit(24);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-8 py-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <span>{node.category}</span>
          <span>•</span>
          <span>{node.status}</span>
          {node.is_cyclical ? (
            <>
              <span>•</span>
              <span>cyclical</span>
            </>
          ) : null}
        </div>

        <h1 className="mb-3 text-3xl font-semibold text-white">{node.title}</h1>

        {node.summary ? (
          <p className="mb-5 max-w-3xl text-sm leading-7 text-neutral-300">{node.summary}</p>
        ) : null}

        <div className="mb-5 flex flex-wrap gap-2 text-sm text-neutral-400">
          {node.start_tick != null ? (
            <span className="rounded-full bg-white/[0.04] px-3 py-1">
              start: {node.start_tick}
            </span>
          ) : null}
          {node.end_tick != null ? (
            <span className="rounded-full bg-white/[0.04] px-3 py-1">
              end: {node.end_tick}
            </span>
          ) : null}
        </div>

        <MediaStage
          title={node.title}
          assets={Array.isArray(node.media_assets) ? (node.media_assets as never[]) : []}
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
          Canon content
        </div>

        <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-neutral-200">
          {node.content_md}
        </pre>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
            Outgoing relations
          </div>

          {!outgoingEdges?.length ? (
            <div className="text-sm text-neutral-500">No outgoing edges.</div>
          ) : (
            <div className="space-y-2">
              {outgoingEdges.map((edge) => {
                const target = Array.isArray(edge.lore_nodes) ? edge.lore_nodes[0] : edge.lore_nodes;
                return (
                  <div
                    key={edge.id}
                    className="rounded-2xl border border-white/10 bg-black/10 p-3"
                  >
                    <div className="text-sm font-medium text-white">
                      {edge.relationship_type}
                    </div>
                    <div className="text-sm text-neutral-300">
                      {target?.title ?? 'Unknown target'}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {target?.category ?? 'unknown'} · {edge.status}
                      {edge.is_causal ? ' · causal' : ''}
                    </div>
                    {edge.context ? (
                      <div className="mt-2 text-sm text-neutral-400">{edge.context}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
            Incoming relations
          </div>

          {!incomingEdges?.length ? (
            <div className="text-sm text-neutral-500">No incoming edges.</div>
          ) : (
            <div className="space-y-2">
              {incomingEdges.map((edge) => {
                const source = Array.isArray(edge.lore_nodes) ? edge.lore_nodes[0] : edge.lore_nodes;
                return (
                  <div
                    key={edge.id}
                    className="rounded-2xl border border-white/10 bg-black/10 p-3"
                  >
                    <div className="text-sm font-medium text-white">
                      {edge.relationship_type}
                    </div>
                    <div className="text-sm text-neutral-300">
                      {source?.title ?? 'Unknown source'}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {source?.category ?? 'unknown'} · {edge.status}
                      {edge.is_causal ? ' · causal' : ''}
                    </div>
                    {edge.context ? (
                      <div className="mt-2 text-sm text-neutral-400">{edge.context}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


⸻

3) apps/web/hooks/use-chat-stream.ts

'use client';

import { useCallback, useRef, useState } from 'react';
import { useStudioStore } from '@/stores/studio-store';

type StreamStartInput = {
  worldId: string;
  activeNodeId?: string | null;
  userIntent: string;
  persona?: string;
  manualContextIds?: string[];
};

type ProposalPayload = {
  proposalId?: string | null;
  proposal: {
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
};

function parseSSEChunk(chunk: string) {
  const events: Array<{ event: string; data: unknown }> = [];
  const blocks = chunk.split('\n\n').filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    let event = 'message';
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (!dataLines.length) continue;

    try {
      events.push({
        event,
        data: JSON.parse(dataLines.join('\n')),
      });
    } catch {
      // ignore malformed chunks
    }
  }

  return events;
}

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const appendChatMessage = useStudioStore((s) => s.appendChatMessage);
  const stageLoreProposal = useStudioStore((s) => s.stageLoreProposal);

  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const start = useCallback(async (input: StreamStartInput) => {
    setIsStreaming(true);
    setLastError(null);

    appendChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: input.userIntent,
    });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          worldId: input.worldId,
          activeNodeId: input.activeNodeId ?? null,
          userIntent: input.userIntent,
          persona: input.persona ?? 'archivist',
          manualContextIds: input.manualContextIds ?? [],
        }),
      });

      if (!response.ok || !response.body) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Failed to start chat stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const parsed = parseSSEChunk(part + '\n\n');

          for (const event of parsed) {
            if (event.event === 'proposal') {
              const payload = event.data as ProposalPayload;
              if (payload?.proposal) {
                stageLoreProposal(payload.proposal);
                appendChatMessage({
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: `Compiled proposal ready: ${payload.proposal.title}`,
                });
              }
            }

            if (event.event === 'error') {
              const payload = event.data as { message?: string };
              throw new Error(payload?.message || 'Unknown stream error');
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const message =
          error instanceof Error ? error.message : 'Unexpected chat error';
        setLastError(message);
        appendChatMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${message}`,
        });
      }
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  }, [appendChatMessage, stageLoreProposal]);

  return {
    start,
    stop,
    isStreaming,
    lastError,
  };
}

O que isso resolve

Esses 3 arquivos fecham o próximo anel da app:
	•	a home do world já mostra overview + featured node;
	•	a página do node já materializa o center pane com conteúdo, mídia e relações;
	•	o hook de chat já consome o SSE da Edge Function e transforma o resultado em proposta staged no store.

A próxima peça realmente útil agora é plugar isso no pane direito de verdade, com:
	•	components/studio/right-pane/drafting-table.tsx
	•	components/studio/right-pane/chat-input.tsx
	•	components/studio/right-pane/chat-stream.tsx

Aí o loop fica usável ponta a ponta.