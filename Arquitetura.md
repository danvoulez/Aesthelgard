Arquitetura final do projeto, já pensada como monorepo, com pastas, arquivos e responsabilidades.

Ela segue o que o material fecha como stack e fluxo: Next.js na UI, Supabase Edge Functions para streaming/prompt engineering, Supabase/Postgres + pgvector como memória relacional/grafo, e Rust Worker para compute pesado, auditoria de paradoxos e jobs offline. O núcleo funcional continua sendo Three-Pane Studio + LoreNodes/NodeEdges + Gatekeeper Loop + Ghost Nodes + pre-heating + Paradox Queue.  ￼  ￼  ￼  ￼  ￼

Arquitetura de repositório

universal-world-engine/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (marketing)/
│       │   │   ├── page.tsx
│       │   │   ├── layout.tsx
│       │   │   └── pricing/page.tsx
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   ├── signup/page.tsx
│       │   │   ├── callback/route.ts
│       │   │   └── layout.tsx
│       │   ├── (studio)/
│       │   │   ├── layout.tsx
│       │   │   ├── universe/
│       │   │   │   ├── [universeId]/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── loading.tsx
│       │   │   │   │   ├── error.tsx
│       │   │   │   │   ├── settings/page.tsx
│       │   │   │   │   ├── anomalies/page.tsx
│       │   │   │   │   ├── graph/page.tsx
│       │   │   │   │   ├── timeline/page.tsx
│       │   │   │   │   ├── gallery/page.tsx
│       │   │   │   │   ├── maps/page.tsx
│       │   │   │   │   └── node/
│       │   │   │   │       └── [nodeId]/page.tsx
│       │   │   └── genesis/
│       │   │       ├── page.tsx
│       │   │       ├── genre/page.tsx
│       │   │       ├── tone/page.tsx
│       │   │       ├── axioms/page.tsx
│       │   │       ├── starters/page.tsx
│       │   │       └── crossroads/page.tsx
│       │   ├── api/
│       │   │   ├── health/route.ts
│       │   │   ├── pre-heat-context/route.ts
│       │   │   ├── presence/token/route.ts
│       │   │   └── webhooks/
│       │   │       └── rust-worker/route.ts
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── providers.tsx
│       ├── components/
│       │   ├── studio/
│       │   │   ├── studio-shell.tsx
│       │   │   ├── studio-topbar.tsx
│       │   │   ├── studio-resizer.tsx
│       │   │   ├── left-pane/
│       │   │   │   ├── omniscient-index.tsx
│       │   │   │   ├── category-tree.tsx
│       │   │   │   ├── graph-mini-map.tsx
│       │   │   │   ├── anomaly-queue-link.tsx
│       │   │   │   └── universe-switcher.tsx
│       │   │   ├── center-pane/
│       │   │   │   ├── node-stage.tsx
│       │   │   │   ├── markdown-renderer.tsx
│       │   │   │   ├── smart-link.tsx
│       │   │   │   ├── media-stage.tsx
│       │   │   │   ├── image-stage.tsx
│       │   │   │   ├── model-stage.tsx
│       │   │   │   ├── video-stage.tsx
│       │   │   │   ├── timeline-strip.tsx
│       │   │   │   ├── node-metadata-panel.tsx
│       │   │   │   └── paradox-badge.tsx
│       │   │   ├── right-pane/
│       │   │   │   ├── drafting-table.tsx
│       │   │   │   ├── chat-stream.tsx
│       │   │   │   ├── chat-message.tsx
│       │   │   │   ├── prompt-input.tsx
│       │   │   │   ├── persona-selector.tsx
│       │   │   │   ├── proposed-lore-card.tsx
│       │   │   │   ├── tweak-sheet.tsx
│       │   │   │   └── commit-actions.tsx
│       │   │   ├── graph/
│       │   │   │   ├── graph-canvas.tsx
│       │   │   │   ├── graph-node.tsx
│       │   │   │   ├── graph-edge.tsx
│       │   │   │   ├── graph-toolbar.tsx
│       │   │   │   └── graph-legend.tsx
│       │   │   ├── timeline/
│       │   │   │   ├── timeline-canvas.tsx
│       │   │   │   ├── timeline-event.tsx
│       │   │   │   ├── branch-lane.tsx
│       │   │   │   └── temporal-filter.tsx
│       │   │   └── gallery/
│       │   │       ├── asset-grid.tsx
│       │   │       ├── asset-card.tsx
│       │   │       ├── asset-viewer.tsx
│       │   │       └── asset-linker.tsx
│       │   ├── genesis/
│       │   │   ├── genre-card.tsx
│       │   │   ├── tone-toggle.tsx
│       │   │   ├── axiom-chip.tsx
│       │   │   ├── starter-card.tsx
│       │   │   └── genesis-crossroads.tsx
│       │   ├── shared/
│       │   │   ├── app-logo.tsx
│       │   │   ├── icon.tsx
│       │   │   ├── empty-state.tsx
│       │   │   ├── error-state.tsx
│       │   │   ├── shimmer.tsx
│       │   │   ├── command-menu.tsx
│       │   │   └── confirm-dialog.tsx
│       │   └── ui/
│       │       └── ...
│       ├── lib/
│       │   ├── auth/
│       │   │   ├── guards.ts
│       │   │   └── session.ts
│       │   ├── supabase/
│       │   │   ├── browser.ts
│       │   │   ├── server.ts
│       │   │   ├── admin.ts
│       │   │   └── realtime.ts
│       │   ├── ai/
│       │   │   ├── client.ts
│       │   │   ├── stream-parser.ts
│       │   │   ├── schemas.ts
│       │   │   ├── personas.ts
│       │   │   └── prompt-builders.ts
│       │   ├── graph/
│       │   │   ├── graph-layout.ts
│       │   │   ├── blast-radius.ts
│       │   │   ├── smart-links.ts
│       │   │   └── node-projections.ts
│       │   ├── timeline/
│       │   │   ├── tick-format.ts
│       │   │   ├── branch-layout.ts
│       │   │   ├── cycle-render.ts
│       │   │   └── entropy-validation.ts
│       │   ├── cache/
│       │   │   ├── cas.ts
│       │   │   ├── exact-cache.ts
│       │   │   └── predictive-cache.ts
│       │   ├── validations/
│       │   │   ├── node.ts
│       │   │   ├── edge.ts
│       │   │   ├── universe.ts
│       │   │   └── commit-payload.ts
│       │   ├── constants/
│       │   │   ├── categories.ts
│       │   │   ├── node-status.ts
│       │   │   └── relationship-types.ts
│       │   ├── utils/
│       │   │   ├── slug.ts
│       │   │   ├── dates.ts
│       │   │   ├── ids.ts
│       │   │   └── cn.ts
│       │   └── telemetry/
│       │       ├── logger.ts
│       │       ├── events.ts
│       │       └── tracing.ts
│       ├── hooks/
│       │   ├── use-studio-shell.ts
│       │   ├── use-active-node.ts
│       │   ├── use-chat-stream.ts
│       │   ├── use-commit-lore.ts
│       │   ├── use-optimistic-node.ts
│       │   ├── use-predictive-cache.ts
│       │   ├── use-graph-presence.ts
│       │   ├── use-node-assets.ts
│       │   └── use-anomaly-queue.ts
│       ├── stores/
│       │   ├── studio-store.ts
│       │   ├── chat-store.ts
│       │   ├── graph-store.ts
│       │   ├── timeline-store.ts
│       │   ├── presence-store.ts
│       │   ├── asset-store.ts
│       │   └── genesis-store.ts
│       ├── actions/
│       │   ├── commit-lore.ts
│       │   ├── discard-proposal.ts
│       │   ├── tweak-proposal.ts
│       │   ├── create-universe.ts
│       │   ├── reroll-starters.ts
│       │   ├── flag-node.ts
│       │   └── resolve-paradox.ts
│       ├── types/
│       │   ├── universe.ts
│       │   ├── lore-node.ts
│       │   ├── node-edge.ts
│       │   ├── temporal.ts
│       │   ├── asset.ts
│       │   ├── ai.ts
│       │   └── database.ts
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── e2e/
│       ├── middleware.ts
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       └── package.json
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_extensions.sql
│   │   ├── 0002_enums.sql
│   │   ├── 0003_universes.sql
│   │   ├── 0004_global_axioms.sql
│   │   ├── 0005_lore_nodes.sql
│   │   ├── 0006_node_edges.sql
│   │   ├── 0007_node_assets.sql
│   │   ├── 0008_chat_threads.sql
│   │   ├── 0009_chat_messages.sql
│   │   ├── 0010_proposals.sql
│   │   ├── 0011_background_jobs.sql
│   │   ├── 0012_anomalies.sql
│   │   ├── 0013_timelines.sql
│   │   ├── 0014_branching.sql
│   │   ├── 0015_rls.sql
│   │   ├── 0016_indexes.sql
│   │   ├── 0017_functions.sql
│   │   ├── 0018_triggers.sql
│   │   ├── 0019_realtime.sql
│   │   └── 0020_storage.sql
│   ├── functions/
│   │   ├── ai-compile-node/
│   │   │   └── index.ts
│   │   ├── ai-reroll-starters/
│   │   │   └── index.ts
│   │   ├── ai-preheat-context/
│   │   │   └── index.ts
│   │   ├── ai-generate-embeddings/
│   │   │   └── index.ts
│   │   ├── ai-detect-links/
│   │   │   └── index.ts
│   │   ├── graph-blast-radius/
│   │   │   └── index.ts
│   │   ├── enqueue-job/
│   │   │   └── index.ts
│   │   ├── resolve-anomaly/
│   │   │   └── index.ts
│   │   ├── export-universe/
│   │   │   └── index.ts
│   │   └── _shared/
│   │       ├── cors.ts
│   │       ├── env.ts
│   │       ├── vertex.ts
│   │       ├── supabase.ts
│   │       ├── schemas.ts
│   │       ├── prompt-builders.ts
│   │       ├── stream.ts
│   │       └── errors.ts
│   ├── seed/
│   │   ├── dev.sql
│   │   └── aethelgard.sql
│   └── tests/
│       ├── rls.sql
│       └── functions.sql
│
├── workers/
│   └── world-engine-worker/
│       ├── Cargo.toml
│       ├── Cargo.lock
│       ├── rust-toolchain.toml
│       ├── .env.example
│       ├── src/
│       │   ├── main.rs
│       │   ├── config.rs
│       │   ├── error.rs
│       │   ├── telemetry.rs
│       │   ├── models/
│       │   │   ├── mod.rs
│       │   │   ├── lore_node.rs
│       │   │   ├── node_edge.rs
│       │   │   ├── temporal_data.rs
│       │   │   ├── background_job.rs
│       │   │   ├── anomaly.rs
│       │   │   └── asset.rs
│       │   ├── database/
│       │   │   ├── mod.rs
│       │   │   ├── client.rs
│       │   │   ├── jobs.rs
│       │   │   ├── nodes.rs
│       │   │   ├── edges.rs
│       │   │   └── anomalies.rs
│       │   ├── jobs/
│       │   │   ├── mod.rs
│       │   │   ├── generate_embeddings.rs
│       │   │   ├── summarize_cluster.rs
│       │   │   ├── paradox_audit.rs
│       │   │   ├── graph_rebuild.rs
│       │   │   ├── export_pdf.rs
│       │   │   ├── export_markdown.rs
│       │   │   ├── media_pipeline.rs
│       │   │   └── stub_expansion.rs
│       │   ├── llm/
│       │   │   ├── mod.rs
│       │   │   ├── ollama.rs
│       │   │   ├── vertex.rs
│       │   │   └── schema_retry.rs
│       │   ├── graph/
│       │   │   ├── mod.rs
│       │   │   ├── causality.rs
│       │   │   ├── branching.rs
│       │   │   ├── blast_radius.rs
│       │   │   └── topo_sort.rs
│       │   ├── timeline/
│       │   │   ├── mod.rs
│       │   │   ├── entropy.rs
│       │   │   ├── cycle.rs
│       │   │   └── tick_validator.rs
│       │   ├── webhooks/
│       │   │   ├── mod.rs
│       │   │   └── handler.rs
│       │   └── http/
│       │       ├── mod.rs
│       │       ├── server.rs
│       │       └── health.rs
│       └── tests/
│           ├── integration/
│           └── fixtures/
│
├── packages/
│   ├── domain/
│   │   ├── src/
│   │   │   ├── node-category.ts
│   │   │   ├── node-status.ts
│   │   │   ├── relationship-type.ts
│   │   │   ├── lore-node.ts
│   │   │   ├── node-edge.ts
│   │   │   ├── temporal-data.ts
│   │   │   ├── universe.ts
│   │   │   ├── proposal.ts
│   │   │   ├── anomaly.ts
│   │   │   └── asset.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ai-contracts/
│   │   ├── src/
│   │   │   ├── node-schema.ts
│   │   │   ├── starter-schema.ts
│   │   │   ├── anomaly-schema.ts
│   │   │   ├── prompt-types.ts
│   │   │   └── streamed-events.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/
│   │   ├── src/
│   │   │   ├── proposed-lore-card.tsx
│   │   │   ├── node-badge.tsx
│   │   │   ├── status-pill.tsx
│   │   │   ├── timeline-chip.tsx
│   │   │   └── ...
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── docs/
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── data-flow.md
│   │   ├── gatekeeper-loop.md
│   │   ├── graph-rag.md
│   │   ├── anomaly-queue.md
│   │   ├── temporal-model.md
│   │   ├── asset-pipeline.md
│   │   └── collaboration.md
│   ├── api/
│   │   ├── edge-functions.md
│   │   └── worker-webhooks.md
│   ├── schemas/
│   │   ├── lore-node.md
│   │   ├── node-edge.md
│   │   ├── universe.md
│   │   └── proposal.md
│   └── decisions/
│       ├── adr-001-monorepo.md
│       ├── adr-002-supabase-first.md
│       ├── adr-003-ai-author-of-record.md
│       └── adr-004-time-is-hybrid.md
│
├── .github/
│   └── workflows/
│       ├── web-ci.yml
│       ├── worker-ci.yml
│       ├── supabase-ci.yml
│       └── deploy.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── biome.json
├── .editorconfig
├── .env.example
└── README.md

Como essa árvore se encaixa no projeto

1) apps/web

É o Studio mesmo.
O material bate várias vezes em Three-Pane Layout, com Left = index/graph, Center = wiki/media/timeline, Right = chat + ProposedLoreCard + Commit/Tweak/Discard. Então a pasta da web precisa nascer já separada por pane e por domínio visual, não por “página aleatória”.  ￼

2) supabase/functions

Aqui fica a parte que o material moveu para Supabase Edge Functions: streaming de Vertex, prompt engineering, embeddings, pré-aquecimento de contexto, blast radius, export e enfileiramento. O desenho final do data flow deixa isso explícito.  ￼

3) workers/world-engine-worker

Aqui fica o Heavy Lifter em Rust: embeddings locais, export pesado, paradox audit, graph rebuild, cluster summaries, mídia assíncrona e jobs de stub expansion. O material já propunha Rust com tokio, sqlx, serde, reqwest e uma estrutura modular com main.rs, models, database, ollama e jobs; eu só expandi isso para cobrir os módulos que o resto da arquitetura pede.  ￼  ￼

4) packages/domain

O projeto precisa de um contrato único de domínio entre UI, Edge Functions e schemas da IA. Isso existe porque o sistema depende de JSON estrito, categorias universais, estados de node e payloads consistentes para o loop “human proposes → AI compiles → commit”.  ￼  ￼

5) docs/architecture

Isso não é perfumaria.
Com esse tipo de sistema, documentação de fluxo é parte da arquitetura: gatekeeper loop, temporal model, anomaly queue, Graph RAG, asset pipeline. O próprio material já foi andando por esses tópicos como blocos arquiteturais independentes.  ￼

⸻

Estrutura lógica do banco

O material fecha forte em Universes, GlobalAxioms, LoreNodes e NodeEdges como base do grafo relacional. Também adiciona status tipo canon / paradox / stub / unverified, e usa pgvector para RAG semântico.  ￼  ￼

Então a camada SQL tem que nascer assim:
	•	universes
	•	global_axioms
	•	lore_nodes
	•	node_edges
	•	node_assets
	•	chat_threads
	•	chat_messages
	•	proposals
	•	background_jobs
	•	anomalies
	•	timeline_branches

O que cada tabela representa

universes
Container mestre + configurações de tempo/render. O material põe genre, temporal_resolution, epoch_name.  ￼

global_axioms
Leis duras do universo, injetadas sempre no prompt.  ￼

lore_nodes
Unidade atômica de tudo: personagem, local, facção, evento, item, conceito. O texto faz questão de dizer que unificar isso numa tabela só é o coração da flexibilidade, do RAG e da renderização dinâmica.  ￼

node_edges
Tecido conectivo do grafo: relações, causalidade, blast radius, paradoxos temporais.  ￼  ￼

proposals
Tabela separada para tudo que a IA propõe antes de virar canon. Isso é consequência direta da regra “o humano nunca escreve lore no banco; ele aprova a última versão compilada pela LLM”.  ￼

background_jobs
Fila para Rust + Edge + mídia + auditoria. O worker e os webhooks acordam a partir daqui.  ￼  ￼

anomalies
Fila de reconciliação para amarelos/paradoxos. Isso vira a Anomaly Queue do editor.  ￼

⸻

Estrutura de tipos principais

types/lore-node.ts

export type NodeCategory =
  | 'character'
  | 'location'
  | 'faction'
  | 'event'
  | 'item'
  | 'concept';

export type NodeStatus =
  | 'canon'
  | 'paradox'
  | 'stub'
  | 'unverified';

export interface TemporalData {
  startTick?: number | null;
  endTick?: number | null;
  branchId?: string;
  causalityLocks?: string[];
  isCyclical?: boolean;
  cycleLength?: number | null;
}

export interface LoreNode {
  id: string;
  universeId: string;
  title: string;
  category: NodeCategory;
  status: NodeStatus;
  content: string;
  summary?: string | null;
  temporal?: TemporalData | null;
  metadata: Record<string, unknown>;
  mediaAssets: NodeAssetRef[];
  embedding?: number[] | null;
  createdAt: string;
  updatedAt: string;
}

Esse shape mistura o que o material já definia para LoreNodes com a evolução posterior de tempo híbrido: tick relativo + branch + causalidade + ciclo. Isso é coerente com a proposta de “zero-point relative integer” evoluindo para “time as graph, not a line”.  ￼  ￼  ￼

types/node-edge.ts

export interface NodeEdge {
  id: string;
  universeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
  context?: string | null;
  status: NodeStatus;
  createdAt: string;
}

types/proposal.ts

export interface ProposedLoreNode {
  proposalId: string;
  threadId: string;
  basedOnMessageIds: string[];
  compiledBy: 'vertex';
  payload: LoreNodeDraft;
  validation: {
    axiomCheck: 'pass' | 'warn' | 'fail';
    paradoxCheck: 'clean' | 'yellow';
    notes: string[];
  };
}

Isso existe porque a UI não recebe “texto cru”; ela recebe um objeto compilado que vira <ProposedLoreCard />.  ￼

⸻

Organização interna da web

stores/

Eu não deixaria um store monolítico.
Separaria assim:
	•	studio-store.ts → active node, pane state, layout
	•	chat-store.ts → stream, messages, proposals
	•	graph-store.ts → nodes/edges visuais, ghost nodes, graph mode
	•	timeline-store.ts → zoom, branch filters, tick format
	•	presence-store.ts → broadcast ephemeral
	•	asset-store.ts → media stage / uploads / linking
	•	genesis-store.ts → onboarding/reskin/starters

Isso bate com o material que pede Zustand para sincronizar panes, draft node, graph toggle e fluidez de UI sem reloads.  ￼

actions/

As actions importantes são:
	•	commit-lore.ts
	•	tweak-proposal.ts
	•	discard-proposal.ts
	•	resolve-paradox.ts
	•	create-universe.ts
	•	reroll-starters.ts
	•	flag-node.ts

Porque o fluxo central não é CRUD genérico; é proposal → review → commit, com reconciliação de paradoxos separada.  ￼  ￼

hooks/

Os hooks que valem nascer desde já:
	•	use-optimistic-node
	•	use-predictive-cache
	•	use-chat-stream
	•	use-commit-lore
	•	use-graph-presence
	•	use-anomaly-queue

Porque o material não trata “ghost node” e “pre-heating” como detalhe; trata como parte da sensação de produto.  ￼

⸻

Organização das Edge Functions

ai-compile-node

Função mais importante do sistema.
Recebe:
	•	universeId
	•	threadId
	•	activeNodeId
	•	userIntent
	•	persona
	•	contexto semântico dos nodes relacionados
	•	axiomas ativos

Monta o prompt, chama Vertex, força JSON, streama eventos para a UI e persiste uma proposal, não um lore_node canon. Isso é literalmente o Gatekeeper Loop descrito no material.  ￼  ￼

ai-preheat-context

Busca embeddings e prepara contexto “quente” quando o usuário seleciona node, começa a digitar ou abre chat. Isso vem do pre-heating/predictive background generation.  ￼

graph-blast-radius

Dada uma mutação ou deleção, calcula impacto na malha de edges. O texto já cita isso como uma das “superpowers” do ontological graph.  ￼

resolve-anomaly

Move nó/edge de amarelo para verde depois de correção, ou cria sugestão de reparo assistida.

export-universe

Dispara job para PDF / markdown vault / export bundle.

⸻

Organização do worker Rust

Eu deixaria o worker dividido em 4 eixos:

models/

Structs fortes para:
	•	LoreNode
	•	NodeEdge
	•	TemporalData
	•	BackgroundJob
	•	Anomaly
	•	Asset

database/

Queries sqlx compile-time checked:
	•	fetch job
	•	lock job
	•	mark complete/failed
	•	read graph neighborhood
	•	write anomaly
	•	finalize export

jobs/

Handlers unitários:
	•	generate_embeddings
	•	paradox_audit
	•	graph_rebuild
	•	summarize_cluster
	•	export_pdf
	•	export_markdown
	•	media_pipeline
	•	stub_expansion

graph/ e timeline/

Aqui fica o que é algoritmo de verdade:
	•	topological sort
	•	causal edges
	•	branching
	•	cyclical rendering math
	•	entropy validation
	•	tick validation

Isso se encaixa no que o material fala sobre Rust como guardrail forte, concorrência segura, sqlx, serde, reqwest, e também na parte em que tempo vira híbrido entre ticks e grafo causal.  ￼  ￼

⸻

Rotas de produto

Essas são as rotas reais que eu assumiria como arquitetura “certa”:
	•	/genesis
	•	/genesis/genre
	•	/genesis/tone
	•	/genesis/axioms
	•	/genesis/starters
	•	/genesis/crossroads

Porque o onboarding vira Button-Driven Genesis e termina no Genesis Crossroads com: aceitar starter, reroll ou blank slate.  ￼
	•	/universe/[universeId]
	•	/universe/[universeId]/node/[nodeId]
	•	/universe/[universeId]/graph
	•	/universe/[universeId]/timeline
	•	/universe/[universeId]/gallery
	•	/universe/[universeId]/anomalies
	•	/universe/[universeId]/settings

Porque isso bate com os pilares explícitos de graph, timeline, gallery e anomaly queue.  ￼  ￼

⸻

Regras de separação que eu não quebraria

1) proposal não é canon

Nunca salvar proposal na mesma tabela e com o mesmo ciclo mental de lore definitivo.
A arquitetura depende da separação entre ideia compilada e canon confirmado.  ￼

2) temporal não pode ser só string ou timestamp

O material vai muito longe nesse ponto.
O motor precisa aceitar:
	•	tick relativo,
	•	branch timeline,
	•	causalidade,
	•	ciclos,
	•	validação híbrida por entropia + UI anchor.  ￼  ￼  ￼

3) broadcast efêmero não vai pro banco

Dragging de node, presence, cursor e movimento leve vão por Supabase Broadcast/Presence, não por persistência row-by-row.  ￼

4) RLS nasce junto, não depois

IP privada de universo exige isso desde a primeira migration séria. O material é explícito nisso.  ￼

⸻

O que é explícito no material e o que é síntese minha

Explícito no material:
	•	Next.js + Supabase + Vertex + Rust Worker  ￼
	•	LoreNodes + NodeEdges + GlobalAxioms + Universes  ￼
	•	Three-Pane Studio  ￼
	•	ProposedLoreCard + Commit/Tweak/Discard  ￼
	•	Ghost Nodes + pre-heating  ￼
	•	Rust modular + jobs + strict structs  ￼
	•	Time híbrido e Paradox Queue  ￼  ￼  ￼

Síntese minha para virar projeto executável:
	•	monorepo com apps/web, supabase, workers, packages, docs
	•	separação de stores/actions/hooks
	•	nome exato das rotas
	•	nome exato de algumas tabelas auxiliares como proposals, chat_threads, anomalies, timeline_branches
	•	distribuição dos módulos Rust em graph/, timeline/, llm/, database/, jobs/

Essa síntese é a forma de transformar o que o material descreve em arquitetura de código que dá para manter.

Veredito

A forma certa de fazer “direto e direito” é essa:
	•	monorepo
	•	web app em Next App Router
	•	Edge Functions no Supabase para IA
	•	grafo relacional no Postgres
	•	worker Rust separado
	•	packages compartilhados para domínio e contratos
	•	proposal layer separada de canon
	•	temporal model híbrido
	•	anomaly queue nativa
	•	UI organizada por pane, não por página solta

