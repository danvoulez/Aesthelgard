Bora. Fiz os 8 adjacentes já no corte certo: three-pane shell, relay fino na web, Edge Function como cérebro, pgvector RAG real, e uma correção importante no RPC: ele agora recebe embedding vetorial, não texto cru, porque o próprio projeto descreve o RAG como comparação semântica contra a coluna embedding de LoreNodes. Para isso, o helper usa embedContent, e o compilador usa o fluxo de geração estruturada do Vertex com responseMimeType + responseSchema, que seguem a forma atual documentada pela Google.  ￼  ￼  ￼  ￼

1) apps/web/components/studio/studio-shell.tsx

'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useStudioStore } from '@/stores/studio-store';

type StudioShellProps = {
  world: {
    id: string;
    name: string;
    genre: string;
    temporalResolution: string;
    epochName?: string | null;
  };
  initialAxioms: Array<{
    id: string;
    rule_text: string;
    is_active: boolean;
  }>;
  children: ReactNode;
};

export function StudioShell({
  world,
  initialAxioms,
  children,
}: StudioShellProps) {
  const activeNodeId = useStudioStore((s) => s.activeNodeId);
  const leftPaneMode = useStudioStore((s) => s.leftPaneMode);
  const setLeftPaneMode = useStudioStore((s) => s.setLeftPaneMode);
  const nodes = useStudioStore((s) => s.nodes);
  const proposedLore = useStudioStore((s) => s.proposedLore);

  const activeNode = activeNodeId ? nodes[activeNodeId] ?? null : null;

  const nodeCount = useMemo(() => Object.keys(nodes).length, [nodes]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 text-white">
      <div className="flex h-full flex-col">
        <header className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{world.name}</div>
            <div className="truncate text-xs text-neutral-400">
              {world.genre} · {world.temporalResolution}
              {world.epochName ? ` · ${world.epochName}` : ''}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/studio/${world.id}/timeline`}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
            >
              Timeline
            </Link>
            <Link
              href={`/studio/${world.id}/graph`}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
            >
              Graph
            </Link>
            <Link
              href={`/studio/${world.id}/gallery`}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
            >
              Gallery
            </Link>
            <Link
              href={`/studio/${world.id}/axioms`}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
            >
              Axioms
            </Link>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_380px]">
          <aside className="min-h-0 overflow-hidden border-r border-white/10 bg-neutral-950/80">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Omniscient Index
                </div>
                <div className="text-xs text-neutral-400">
                  {nodeCount} nodes
                </div>
              </div>

              <div className="flex overflow-hidden rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setLeftPaneMode('list')}
                  className={`px-2 py-1 text-xs ${
                    leftPaneMode === 'list'
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-400'
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setLeftPaneMode('graph')}
                  className={`px-2 py-1 text-xs ${
                    leftPaneMode === 'graph'
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-400'
                  }`}
                >
                  Graph
                </button>
              </div>
            </div>

            {leftPaneMode === 'list' ? (
              <div className="h-full overflow-auto px-2 py-2">
                {Object.values(nodes).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-3 text-sm text-neutral-500">
                    No nodes yet.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Object.values(nodes).map((node) => (
                      <Link
                        key={node.id}
                        href={`/studio/${world.id}/node/${node.id}`}
                        className={`block rounded-xl px-3 py-2 text-sm transition ${
                          node.id === activeNodeId
                            ? 'bg-white/10 text-white'
                            : 'text-neutral-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="truncate font-medium">{node.title}</div>
                        <div className="truncate text-xs text-neutral-500">
                          {node.category} · {node.status}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid h-full place-items-center px-4 text-center text-sm text-neutral-500">
                React Flow mini-graph lives here.
              </div>
            )}
          </aside>

          <main className="min-h-0 overflow-auto bg-neutral-950">{children}</main>

          <aside className="min-h-0 overflow-hidden border-l border-white/10 bg-neutral-950/80">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Drafting Table
              </div>
              <div className="mt-1 text-sm text-neutral-300">
                Active context:{' '}
                <span className="text-white">
                  {activeNode?.title ?? world.name}
                </span>
              </div>
            </div>

            <div className="space-y-4 overflow-auto p-4">
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Global axioms
                </div>
                <div className="space-y-2">
                  {initialAxioms.length === 0 ? (
                    <div className="text-sm text-neutral-500">
                      No active axioms.
                    </div>
                  ) : (
                    initialAxioms.map((axiom) => (
                      <div
                        key={axiom.id}
                        className="rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-neutral-300"
                      >
                        {axiom.rule_text}
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Pending proposal
                </div>
                {proposedLore ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-white">
                      {proposedLore.title}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {proposedLore.category}
                    </div>
                    <div className="line-clamp-6 text-sm text-neutral-300">
                      {proposedLore.contentMd}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500">
                    Nothing staged yet.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-dashed border-white/10 p-3 text-sm text-neutral-500">
                Chat stream mounts here.
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

2) apps/web/app/api/pre-heat-context/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'edge';

type PreHeatBody = {
  worldId: string;
  activeNodeId?: string | null;
  contentMd: string;
};

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as PreHeatBody;

  if (!body.worldId || !body.contentMd?.trim()) {
    return NextResponse.json(
      { error: 'worldId and contentMd are required' },
      { status: 400 },
    );
  }

  const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-preheat-context`;

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
      contentMd: body.contentMd,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    return NextResponse.json(
      { error: 'Edge function failed', details: text || upstream.statusText },
      { status: upstream.status },
    );
  }

  const payload = await upstream.json().catch(() => ({ ok: true }));
  return NextResponse.json(payload);
}

3) apps/web/lib/supabase/server.ts

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/database';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignored in read-only server contexts
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch {
            // ignored in read-only server contexts
          }
        },
      },
    },
  );
}

4) apps/web/lib/supabase/client.ts

'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return browserClient;
}

5) supabase/functions/ai-compile-node/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  compileLoreNode,
  embedText,
  toPgVectorLiteral,
  type CompiledLoreNode,
} from '../_shared/vertex.ts';

type RequestBody = {
  worldId: string;
  activeNodeId?: string | null;
  userIntent: string;
  persona?: string;
  manualContextIds?: string[];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await request.json()) as RequestBody;
    if (!body.worldId || !body.userIntent?.trim()) {
      return new Response(
        JSON.stringify({ error: 'worldId and userIntent are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) =>
          controller.enqueue(new TextEncoder().encode(sse(event, data)));

        try {
          send('started', {
            worldId: body.worldId,
            activeNodeId: body.activeNodeId ?? null,
          });

          const [{ data: axioms }, { data: activeNode }] = await Promise.all([
            supabase
              .from('global_axioms')
              .select('id, rule_text')
              .eq('universe_id', body.worldId)
              .eq('is_active', true)
              .order('created_at', { ascending: true }),

            body.activeNodeId
              ? supabase
                  .from('lore_nodes')
                  .select('id, title, category, content_md')
                  .eq('id', body.activeNodeId)
                  .eq('universe_id', body.worldId)
                  .single()
              : Promise.resolve({ data: null, error: null }),
          ]);

          send('context', {
            axioms: axioms?.length ?? 0,
            hasActiveNode: Boolean(activeNode),
          });

          const queryEmbedding = await embedText({
            text: body.userIntent,
            title: activeNode?.title ?? undefined,
          });

          const { data: ragNodes, error: ragError } = await supabase.rpc(
            'match_lore_nodes',
            {
              query_universe_id: body.worldId,
              query_embedding: toPgVectorLiteral(queryEmbedding),
              match_count: 5,
            },
          );

          if (ragError) throw ragError;

          const manualContextIds = body.manualContextIds ?? [];
          const { data: manualContext } = manualContextIds.length
            ? await supabase
                .from('lore_nodes')
                .select('id, title, category, content_md')
                .in('id', manualContextIds)
                .eq('universe_id', body.worldId)
                .limit(8)
            : { data: [] as Array<Record<string, unknown>> };

          const contextNodesById = new Map<string, {
            id: string;
            title: string;
            category: string;
            content_md: string;
          }>();

          for (const node of ragNodes ?? []) {
            contextNodesById.set(node.id, node);
          }

          for (const node of manualContext ?? []) {
            contextNodesById.set(node.id as string, {
              id: node.id as string,
              title: node.title as string,
              category: node.category as string,
              content_md: node.content_md as string,
            });
          }

          if (activeNode) {
            contextNodesById.set(activeNode.id, activeNode);
          }

          send('compiling', {
            contextNodes: contextNodesById.size,
            persona: body.persona ?? 'archivist',
          });

          const compiled = await compileLoreNode({
            worldName: 'Active Universe',
            persona: body.persona ?? 'archivist',
            userIntent: body.userIntent,
            axioms: (axioms ?? []).map((x) => x.rule_text),
            activeNode: activeNode
              ? {
                  id: activeNode.id,
                  title: activeNode.title,
                  category: activeNode.category,
                  contentMd: activeNode.content_md,
                }
              : null,
            contextNodes: [...contextNodesById.values()].map((node) => ({
              id: node.id,
              title: node.title,
              category: node.category,
              contentMd: node.content_md,
            })),
          });

          let proposalId: string | null = null;

          const { data: insertedProposal } = await supabase
            .from('proposals')
            .insert({
              universe_id: body.worldId,
              author_user_id: user.id,
              active_node_id: body.activeNodeId ?? null,
              prompt_text: body.userIntent,
              payload: compiled,
              status: 'pending',
            })
            .select('id')
            .single();

          proposalId = insertedProposal?.id ?? null;

          send('proposal', {
            proposalId,
            proposal: compiled,
          });

          controller.enqueue(new TextEncoder().encode(sse('done', { ok: true })));
          controller.close();
        } catch (error) {
          controller.enqueue(
            new TextEncoder().encode(
              sse('error', {
                message: error instanceof Error ? error.message : 'Unknown error',
              }),
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unhandled edge error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

6) supabase/functions/_shared/vertex.ts

export type CompiledLoreNode = {
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

type CompileInput = {
  worldName: string;
  persona: string;
  userIntent: string;
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

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function getAccessToken(): Promise<string> {
  const staticToken = Deno.env.get('GOOGLE_VERTEX_ACCESS_TOKEN');
  if (staticToken) return staticToken;

  const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY');

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Missing Google auth. Set GOOGLE_VERTEX_ACCESS_TOKEN or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY.',
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const enc = new TextEncoder();

  const base64Url = (input: Uint8Array | string) => {
    const raw =
      typeof input === 'string'
        ? btoa(input)
        : btoa(String.fromCharCode(...input));
    return raw.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const unsignedJwt = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(payload),
  )}`;

  const pem = privateKey.replace(/\\n/g, '\n');
  const binaryDer = pemToArrayBuffer(pem);

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    enc.encode(unsignedJwt),
  );

  const jwt = `${unsignedJwt}.${base64Url(new Uint8Array(signature))}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to obtain Google access token: ${text}`);
  }

  const json = await response.json();
  return json.access_token as string;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

function getPublisherModelPath(modelId: string) {
  const project = Deno.env.get('GOOGLE_CLOUD_PROJECT');
  const location = Deno.env.get('GOOGLE_CLOUD_LOCATION') ?? 'global';

  if (!project) throw new Error('Missing GOOGLE_CLOUD_PROJECT');

  return {
    location,
    path: `projects/${project}/locations/${location}/publishers/google/models/${modelId}`,
  };
}

export function toPgVectorLiteral(values: number[]) {
  return `[${values.join(',')}]`;
}

export async function embedText(input: {
  text: string;
  title?: string;
}): Promise<number[]> {
  const modelId = Deno.env.get('GOOGLE_VERTEX_EMBED_MODEL') ?? 'text-embedding-005';
  const { path } = getPublisherModelPath(modelId);
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/${path}:embedContent`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          role: 'USER',
          parts: [{ text: input.text }],
        },
        title: input.title,
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: 768,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vertex embedContent failed: ${text}`);
  }

  const json = await response.json();
  const values = json.embedding?.values;

  if (!Array.isArray(values)) {
    throw new Error('Vertex embedContent returned no embedding values');
  }

  return values as number[];
}

export async function compileLoreNode(
  input: CompileInput,
): Promise<CompiledLoreNode> {
  const modelId = Deno.env.get('GOOGLE_VERTEX_MODEL') ?? 'gemini-2.0-flash';
  const { path } = getPublisherModelPath(modelId);
  const accessToken = await getAccessToken();

  const systemInstruction = [
    `You are the Master Compiler for the universe.`,
    `The human proposes. You compile.`,
    `Never return prose outside the JSON schema.`,
    `Respect these axioms strictly:`,
    ...input.axioms.map((rule) => `- ${rule}`),
  ].join('\n');

  const activeNodeBlock = input.activeNode
    ? [
        'ACTIVE NODE:',
        `id: ${input.activeNode.id}`,
        `title: ${input.activeNode.title}`,
        `category: ${input.activeNode.category}`,
        input.activeNode.contentMd,
      ].join('\n')
    : 'ACTIVE NODE: none';

  const contextBlock =
    input.contextNodes.length === 0
      ? 'CONTEXT NODES: none'
      : [
          'CONTEXT NODES:',
          ...input.contextNodes.map((node) =>
            [
              `id: ${node.id}`,
              `title: ${node.title}`,
              `category: ${node.category}`,
              node.contentMd,
            ].join('\n'),
          ),
        ].join('\n\n---\n\n');

  const prompt = [
    `WORLD: ${input.worldName}`,
    `PERSONA: ${input.persona}`,
    activeNodeBlock,
    contextBlock,
    `USER INTENT: ${input.userIntent}`,
    `Return a single lore node proposal that is consistent with the axioms and context.`,
  ].join('\n\n');

  const responseSchema = {
    type: 'OBJECT',
    required: ['title', 'category', 'contentMd'],
    properties: {
      title: { type: 'STRING' },
      category: {
        type: 'STRING',
        enum: ['character', 'location', 'faction', 'event', 'item', 'concept'],
      },
      contentMd: { type: 'STRING' },
      summary: { type: 'STRING' },
      startTick: { type: 'INTEGER' },
      endTick: { type: 'INTEGER' },
      metadata: {
        type: 'OBJECT',
        additionalProperties: true,
      },
      relatedNodeIds: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      mediaAssets: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          required: ['kind', 'url'],
          properties: {
            kind: {
              type: 'STRING',
              enum: ['image', 'model', 'video', 'document'],
            },
            url: { type: 'STRING' },
            alt: { type: 'STRING' },
          },
        },
      },
    },
  };

  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/${path}:generateContent`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'USER',
            parts: [{ text: prompt }],
          },
        ],
        generation_config: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
          responseSchema,
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vertex generateContent failed: ${text}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== 'string') {
    throw new Error('Vertex returned no structured text payload');
  }

  const parsed = JSON.parse(text) as CompiledLoreNode;
  return parsed;
}

7) apps/web/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      universes: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          genre: string;
          temporal_resolution: string;
          epoch_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          genre: string;
          temporal_resolution?: string;
          epoch_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          genre?: string;
          temporal_resolution?: string;
          epoch_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      global_axioms: {
        Row: {
          id: string;
          universe_id: string;
          rule_text: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          universe_id: string;
          rule_text: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          universe_id?: string;
          rule_text?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      lore_nodes: {
        Row: {
          id: string;
          universe_id: string;
          title: string;
          category:
            | 'character'
            | 'location'
            | 'faction'
            | 'event'
            | 'item'
            | 'concept';
          status: 'canon' | 'paradox' | 'stub' | 'unverified';
          summary: string | null;
          content_md: string;
          start_tick: number | null;
          end_tick: number | null;
          is_cyclical: boolean;
          media_assets: Json;
          metadata: Json;
          embedding: string | null;
          locked_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          universe_id: string;
          title: string;
          category:
            | 'character'
            | 'location'
            | 'faction'
            | 'event'
            | 'item'
            | 'concept';
          status?: 'canon' | 'paradox' | 'stub' | 'unverified';
          summary?: string | null;
          content_md?: string;
          start_tick?: number | null;
          end_tick?: number | null;
          is_cyclical?: boolean;
          media_assets?: Json;
          metadata?: Json;
          embedding?: string | null;
          locked_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          universe_id?: string;
          title?: string;
          category?:
            | 'character'
            | 'location'
            | 'faction'
            | 'event'
            | 'item'
            | 'concept';
          status?: 'canon' | 'paradox' | 'stub' | 'unverified';
          summary?: string | null;
          content_md?: string;
          start_tick?: number | null;
          end_tick?: number | null;
          is_cyclical?: boolean;
          media_assets?: Json;
          metadata?: Json;
          embedding?: string | null;
          locked_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      node_edges: {
        Row: {
          id: string;
          universe_id: string;
          source_node_id: string;
          target_node_id: string;
          relationship_type: string;
          context: string | null;
          is_causal: boolean;
          status: 'canon' | 'paradox' | 'stub' | 'unverified';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          universe_id: string;
          source_node_id: string;
          target_node_id: string;
          relationship_type: string;
          context?: string | null;
          is_causal?: boolean;
          status?: 'canon' | 'paradox' | 'stub' | 'unverified';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          universe_id?: string;
          source_node_id?: string;
          target_node_id?: string;
          relationship_type?: string;
          context?: string | null;
          is_causal?: boolean;
          status?: 'canon' | 'paradox' | 'stub' | 'unverified';
          created_at?: string;
          updated_at?: string;
        };
      };

      proposals: {
        Row: {
          id: string;
          universe_id: string;
          author_user_id: string;
          active_node_id: string | null;
          prompt_text: string;
          payload: Json;
          status: 'pending' | 'committed' | 'discarded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          universe_id: string;
          author_user_id: string;
          active_node_id?: string | null;
          prompt_text: string;
          payload: Json;
          status?: 'pending' | 'committed' | 'discarded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          universe_id?: string;
          author_user_id?: string;
          active_node_id?: string | null;
          prompt_text?: string;
          payload?: Json;
          status?: 'pending' | 'committed' | 'discarded';
          created_at?: string;
          updated_at?: string;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      match_lore_nodes: {
        Args: {
          query_universe_id: string;
          query_embedding: string;
          match_count?: number;
        };
        Returns: {
          id: string;
          title: string;
          category: string;
          content_md: string;
          similarity: number;
        }[];
      };
    };

    Enums: {
      node_category:
        | 'character'
        | 'location'
        | 'faction'
        | 'event'
        | 'item'
        | 'concept';
      node_status: 'canon' | 'paradox' | 'stub' | 'unverified';
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

8) supabase/migrations/0018_match_lore_nodes_rpc.sql

drop function if exists public.match_lore_nodes(uuid, vector, integer);

create or replace function public.match_lore_nodes(
  query_universe_id uuid,
  query_embedding vector(768),
  match_count integer default 5
)
returns table (
  id uuid,
  title text,
  category text,
  content_md text,
  similarity double precision
)
language sql
stable
set search_path = public
as $$
  select
    ln.id,
    ln.title,
    ln.category::text,
    ln.content_md,
    1 - (ln.embedding <=> query_embedding) as similarity
  from public.lore_nodes ln
  where ln.universe_id = query_universe_id
    and ln.embedding is not null
    and ln.status in ('canon', 'unverified')
  order by ln.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

grant execute on function public.match_lore_nodes(uuid, vector, integer) to authenticated;

Esses 8 fecham o circuito que faltava: shell real do studio, pre-heat relay, clients Supabase, Edge Function compiladora, helper de Vertex, tipos do banco e RPC vetorial. Isso segue o desenho do projeto: left pane em índice/mini-graph, center pane em node/media, right pane em chat/proposal; ghost nodes e pre-heating para esconder latência; LoreNodes + NodeEdges + embedding para RAG semântico; e Edge Functions no lugar do trabalho pesado que antes cairia em API route do Next.  ￼  ￼  ￼  ￼  ￼

O próximo bloco natural é o trio que faz isso “andar de verdade” na UI: apps/web/app/studio/[worldId]/page.tsx, apps/web/app/studio/[worldId]/node/[nodeId]/page.tsx e apps/web/hooks/use-chat-stream.ts.