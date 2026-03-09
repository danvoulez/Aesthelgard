PROJETO — Universal World Engine

1) O que é

Um IDE de documentação arquitetural de mundos, guiado por IA, para criadores organizarem, expandirem e manterem universos consistentes. Não é jogo, não é app narrativo para “ser jogado”; é uma Living World Bible com catálogo, grafo relacional, chat de drafting, consistência ativa e galeria ligada aos nodes. O usuário é o Architect; a IA é compiladora, arquivista e guardrail.  ￼  ￼

2) O que ele faz

O produto tem quatro núcleos:

Catalog: tudo vira node — personagem, lugar, facção, evento, item, conceito — com relações navegáveis.
Drafting Table: o usuário brainstorma no chat e, quando gostar do resultado, transforma aquilo em canon via Commit to Lore.
Consistency Engine: axiomas globais impedem contradições estruturais.
Gallery / Media: imagens, assets e mídia ficam linkados aos respectivos nodes.  ￼

3) O que ele não é

Não é um NotebookLM genérico com chat em cima de documentos. A diferença proposta é ser opinativo sobre ontologia: saber o que é Character, Location, Rule, Event; modelar relações; avisar blast radius quando algo muda; e trabalhar com timeline, mapa e axiomas como partes nativas do sistema.  ￼

4) Interface principal

A UI canônica é um studio de 3 panes:
	•	Left Pane: índice / explorer / grafo.
	•	Center Pane: renderização do node ativo em markdown/media.
	•	Right Pane: chat persistente com a IA.

O mecanismo base é: a IA produz uma ideia boa no chat, o usuário clica Save to Wiki / Commit to Lore, e isso injeta o conteúdo no catálogo como LoreNode.  ￼

5) Regra central de produto

O banco não é escrito diretamente pelo humano. O fluxo correto é:

Human proposes → AI compiles → UI previews → user commits.

Esse princípio aparece no onboarding e no loop principal: a IA checa axiomas, gera JSON estrito, mostra um <ProposedLoreCard />, e só depois do clique em Commit to Lore o node entra no canon.  ￼

6) Onboarding real

O onboarding certo não é texto livre logo na tela 1. Ele vira um Button-Driven Genesis:
	1.	o usuário escolhe gênero por cards;
	2.	escolhe tom por toggles;
	3.	escolhe até 2 axiomas gerados;
	4.	o sistema compila 3 starter nodes;
	5.	o usuário pode:
	•	aceitar um starter,
	•	rerollar / mudar constraints,
	•	ou entrar com blank slate.

Isso evita blank canvas, ensina o botão de commit e usa o mesmo motor do app para gerar o tutorial. Não existe tutorial fake separado.  ￼  ￼  ￼

7) Modelo de dados

O coração é um grafo relacional com quatro peças:
	•	Universes: container mestre.
	•	GlobalAxioms: leis imutáveis do universo.
	•	LoreNodes: unidade atômica de tudo.
	•	NodeEdges: ligações e causalidade.

A filosofia é: não guardar docs planos, e sim um web de entidades interconectadas para RAG semântico, navegação, impacto relacional e consistência.  ￼

8) Stack final

A arquitetura que fecha melhor no material é:
	•	Next.js para UI, Zustand e rendering.
	•	Supabase Edge Functions para streaming e prompt engineering do Vertex.
	•	Supabase Database para schema, RLS e pgvector.
	•	Rust Worker para compute offline, export pesado, embeddings locais e auditorias.  ￼  ￼

O ponto importante é que o texto abandona a ideia de centralizar isso em API route do Next e puxa a orquestração pesada da IA para Supabase Edge Functions, usando o Supabase como BaaS de verdade: Auth, RLS, Realtime, Broadcast, Webhooks e vetor.  ￼

9) Worker em Rust

O Rust não é o produto; ele é o heavy lifter.
Funções previstas:
	•	consumir fila background_jobs,
	•	orquestrar Ollama/local GPU para tarefas menores,
	•	gerar embeddings locais,
	•	checar integridade do grafo,
	•	processar exports pesados.

O loop é: UI cria job → worker trava linha → processa → valida JSON com serde → grava de volta no Supabase → Realtime atualiza a UI.  ￼

10) Tempo

O modelo de tempo que faz sentido para o projeto é:

tempo armazenado como inteiro relativo ao zero-point, não como data absoluta.
Cada universo define:
	•	resolução do tick,
	•	epoch,
	•	formato de renderização.

Isso resolve fantasia, screenplay e brand na mesma estrutura. Depois, quando o problema fica mais sério, tempo deixa de ser só linha e vira também dimensão de grafo: branch_id, edges causais/paradoxais e repetição cíclica. Em outras palavras: primeiro você tem zero-point relative integer; depois pode evoluir para time as graph.  ￼  ￼

11) Custos e caching

A proposta de custo é boa e pragmática:
	•	Gemini Pro só no loop pesado de compilação.
	•	Gemini Flash para reflexos/UI.
	•	RAG curto: top 3–5 nodes, não 50.
	•	Filtro por metadata antes de mandar coisa pro LLM.
	•	CAS para mídia e cache exato de prompt/contexto.
	•	Ollama/local para sumarização, embeddings e tarefas assíncronas baratas.  ￼  ￼  ￼

12) Lacunas que já nasceram mapeadas

O material já identifica quatro extensões importantes, mas como camadas sobre a fundação, não como motivo para inflar o MVP:
	•	Escape Hatch / Compilation Engine: exportar em JSON bruto, vault markdown estilo Obsidian e Series Bible PDF/EPUB.
	•	Stub System: entidades citadas e inexistentes viram stub node automaticamente.
	•	Collaboration Collision: Presence + locking/merge.
	•	Graph RAG: macro-summaries por cluster quando o universo ficar enorme.  ￼  ￼  ￼

13) Definição do MVP

O MVP que cai naturalmente desse projeto é este:

MVP 1 — Studio Base
	•	auth,
	•	universe creation,
	•	3-pane shell,
	•	lista de nodes,
	•	center renderer,
	•	chat local/dummy,
	•	Commit to Lore salvando no Supabase.  ￼  ￼

MVP 2 — AI Compiler
	•	GlobalAxioms,
	•	Edge Function chamando Vertex,
	•	schema JSON estrito,
	•	<ProposedLoreCard />,
	•	commit explícito,
	•	busca vetorial curta pra grounding.  ￼  ￼

MVP 3 — World Engine de verdade
	•	onboarding por botões,
	•	starter cards dinâmicos,
	•	React Flow/grafo,
	•	optimistic UI com ghost nodes,
	•	Realtime básico,
	•	background jobs + worker Rust.  ￼  ￼  ￼

14) Frase final do produto

A formulação mais fiel ao arquivo é:

“Um IDE de world architecture guiado por IA, com grafo relacional, axiomas globais, commit explícito de lore e capacidade de exportar o universo como documentação viva.”  ￼  ￼

Se você quiser, no próximo passo eu transformo isso em um PRD técnico enxuto, com:
objetivo, escopo de MVP, tabelas, rotas, stores do Zustand, jobs do Rust e ordem exata de implementação.