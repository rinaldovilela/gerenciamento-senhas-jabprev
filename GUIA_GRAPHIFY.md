# 📊 Guia Completo do Graphify no Antigravity — JABPREV

Este documento descreve como o **Graphify** foi configurado e integrado ao ambiente **Antigravity (AG Kit)** para o projeto **JABPREV - Gerenciamento de Senhas e Filas**.

---

## 🎯 O que é o Graphify e por que usar?

O **Graphify** (`graphifyy`) é uma ferramenta de mapeamento estrutural e gravação de conhecimento em grafo de código-fonte baseada em **Tree-sitter** e **SQLite**.

### 💡 Principais Benefícios:
- **Economia Massiva de Tokens (até 71.5x):** Em vez de a IA ler dezenas de arquivos inteiros do frontend e backend para entender a aplicação, ela consulta o grafo local (`graph.json`) e lê apenas os arquivos afetados no **raio de impacto (*blast radius*)**.
- **Análise 100% Local e Rápida:** Funciona via análise sintática (AST) sem dependência de APIs externas de LLM para extração de código.
- **Navegação Interativa e Visual:** Gera mapas HTML 2D/3D interativos e relatórios estruturados de arquitetura.

---

## 🚀 Passo a Passo de Instalação e Configuração

### Passo 1: Instalação do Pacote Python
No terminal, o pacote oficial foi instalado via pip:
```bash
python -m pip install graphifyy
```

### Passo 2: Integração Nativa no Antigravity
Para habilitar o suporte nativo e os hooks do Antigravity/AG Kit:
```bash
graphify antigravity install
```
*Este comando criou os arquivos de integração em `.agents/rules/graphify.md` e `.agents/workflows/graphify.md`.*

---

## 🎯 Escopo Restrito para a Pasta `apps/`

Para evitar desperdício de processamento com documentação, mídias e arquivos de build, criamos o arquivo `.graphifyignore` na raiz do projeto:

```gitignore
# .graphifyignore - Restringir análise do Graphify para a pasta apps/

# Pastas fora do escopo de código da aplicação
docs/
scripts/
supabase/
roku/
.agents/
.config/
.github/

# Dependências e artefatos de build
node_modules/
dist/
build/
*.log

# Filtros para corpus 100% de código
*.png
*.jpg
*.jpeg
*.svg
*.ico
*.webp
*.gif
*.pdf
*.md
*.doc
*.docx
*.html
```

---

## 🏗️ Como o Grafo Foi Construído

Executamos a extração determinística de AST e o agrupamento (*clustering*) apontando para a pasta `apps`:

```bash
# 1. Extração do grafo de código (Frontend + Backend)
graphify extract apps

# 2. Agrupamento de comunidades e geração de relatórios
graphify cluster-only apps
```

### 📊 Resultado da Indexação Inicial:
- **Localização dos arquivos:** `apps/graphify-out/`
- **Nós Mapeados:** 545 componentes, funções, rotas, tipos e hooks.
- **Arestas (Conexões):** 893 relações de chamadas e importações.
- **Comunidades:** 35 módulos funcionais identificados.

---

## 🔄 Atualização Automática (Git Hooks)

Para garantir que o grafo esteja **sempre atualizado** sem você precisar se preocupar, instalamos os Git Hooks:

```bash
graphify hook install
```

### Como funciona:
- Sempre que for feito um **`git commit`** ou **`git checkout`**, o Graphify é acionado automaticamente.
- Ele usa um cache interno em SHA256 e reindexa **apenas os arquivos modificados em milissegundos**.

---

## 🛠️ Comandos Manuais Úteis

| Comando | Descrição |
| :--- | :--- |
| `graphify extract apps` | Reindexar o código dentro da pasta `apps/` |
| `graphify cluster-only apps` | Atualizar os relatórios `GRAPH_REPORT.md` e `graph.html` |
| `graphify hook status` | Verificar se os hooks do git estão ativos |

---

## 🎨 Como Extrair o Máximo Benefício

### 1. Interação com a IA no Antigravity
Sempre que pedir uma alteração ou criação de feature no projeto, a IA utilizará o grafo para ir direto ao ponto de alteração, reduzindo o custo de tokens e garantindo maior precisão.

### 2. Visualizador Interativo no Navegador (`graph.html`)
Abra o arquivo abaixo diretamente no seu navegador de preferência:
```
apps/graphify-out/graph.html
```
Você verá o mapa visual 2D/3D da arquitetura, podendo clicar nos nós e navegar pelas dependências entre os componentes React e os endpoints/websockets Node.js.

### 3. Relatório da Arquitetura (`GRAPH_REPORT.md`)
Consulte o arquivo:
```
apps/graphify-out/GRAPH_REPORT.md
```
Ele contém o resumo das entidades centrais (*God Nodes*) e das comunidades mapeadas no projeto.
