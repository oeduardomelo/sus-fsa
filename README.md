<div align="center">

# SUS +Ágil Feira

### Sistema de Gestão de Saúde Pública — Feira de Santana, BA

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/Licença-Acadêmica-blue?style=for-the-badge)

<br/>

> Projeto Integrador — Disciplina de Desenvolvimento Mobile  
> Centro Universitário UNIFAN · Feira de Santana, Bahia

</div>

---

## Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Módulos do Sistema](#-módulos-do-sistema)
- [Fluxo de Utilização](#-fluxo-de-utilização)
- [Arquitetura da Aplicação](#-arquitetura-da-aplicação)
- [Banco de Dados](#-banco-de-dados)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução](#-instalação-e-execução)
- [Screenshots](#-screenshots)
- [Limitações Atuais](#-limitações-atuais)
- [Melhorias Futuras](#-melhorias-futuras)
- [Equipe](#-equipe)
- [Repositório](#-repositório)
- [Licença](#-licença)

---

## 🏥 Sobre o Projeto

O **SUS +Ágil Feira** é um sistema web de gestão de saúde pública desenvolvido como **Projeto Integrador** da disciplina de **Desenvolvimento Mobile** do Centro Universitário UNIFAN, em Feira de Santana, Bahia.

### Problema Identificado

O processo de atendimento nas unidades básicas de saúde (UBS) de Feira de Santana ainda é predominantemente manual, com fichas em papel, dificuldade no controle de filas de triagem e acesso limitado ao histórico clínico dos pacientes. Isso resulta em atrasos, retrabalho e riscos para a segurança dos pacientes.

### Solução Proposta

O sistema digitaliza o fluxo completo de atendimento, contemplando:

- **Cadastro unificado** de pacientes com histórico de saúde
- **Triagem clínica** com classificação de risco pelo Protocolo de Manchester
- **Gestão da equipe** de saúde com controle de acesso por cargo
- **Painel de controle** em tempo real para gestores e profissionais
- **Impressão de fichas** de triagem no padrão A4

### Contexto Acadêmico

O projeto foi desenvolvido ao longo do semestre como trabalho interdisciplinar, integrando conhecimentos de engenharia de software, desenvolvimento web, banco de dados e experiência do usuário (UX), com foco em solucionar um problema real da saúde pública municipal.

---

## ✅ Funcionalidades

### Autenticação e Controle de Acesso
- [x] Login com e-mail **ou** CPF
- [x] Proteção de rotas via Middleware Next.js (cookie `auth_token`)
- [x] Persistência de sessão (cookie com expiração de 24h)
- [x] Logout com limpeza de cookie e localStorage
- [x] Redirecionamento automático conforme estado de autenticação

### Dashboard
- [x] Contagem de triagens realizadas no dia (tempo real)
- [x] Contagem de profissionais por cargo (Médicos, Enfermeiros, Recepcionistas)
- [x] Listagem de todas as triagens em aberto com prioridade visual
- [x] Impressão de ficha de triagem em formato A4 diretamente do painel
- [x] Badges de prioridade especial: PCD e Idoso (60+)
- [x] Ação de concluir triagem diretamente pelo painel

### Gestão de Pacientes
- [x] Listagem completa com busca por nome, CPF ou Cartão SUS
- [x] Modal de prontuário rápido (somente leitura)
- [x] Modal de edição completa do cadastro do paciente
- [x] Cadastro de novo paciente com formulário em múltiplas seções
- [x] Aplicação de máscaras automáticas (CPF, Cartão SUS, telefone)
- [x] Cálculo automático de idade a partir da data de nascimento
- [x] Exigência de responsável legal para menores de 18 anos ou PCD
- [x] Registro de informações clínicas: alergias, doenças crônicas e medicações contínuas

### Gestão de Profissionais
- [x] Listagem da equipe com badges coloridos por cargo
- [x] Edição de dados do profissional via modal (inline)
- [x] Campos dinâmicos por cargo: CRM (Médico), COREN (Enfermeiro), Setor (Recepcionista), Área Técnica (TI)
- [x] Remoção de profissional com confirmação
- [x] Cadastro de novo profissional com credenciais de acesso ao sistema
- [x] Busca por nome ou CPF

### Central de Triagem
- [x] Visualização separada por abas: **Abertas** e **Concluídas**
- [x] Classificação de Risco pelo **Protocolo de Manchester** (5 níveis)
- [x] Indicadores visuais de risco com escala de cores (Vermelho → Azul)
- [x] Modal detalhado com sinais vitais, queixa principal e alergias
- [x] Ação de marcar triagem como concluída
- [x] Busca por nome ou CPF do paciente
- [x] Sidebar com resumo: total de triagens abertas e contagem de prioritários
- [x] Impressão de ficha de triagem a qualquer momento

### Nova Triagem
- [x] Busca de paciente por nome ou CPF com **autocomplete** (até 5 sugestões)
- [x] Coleta completa de sinais vitais: PA, temperatura, saturação, FC, peso e altura
- [x] **Cálculo automático de IMC** (suporte a vírgula e ponto como separador decimal)
- [x] Seleção visual de classificação de risco (5 botões interativos com escala de cores)
- [x] Campo de queixa principal em texto livre
- [x] Link direto para cadastrar novo paciente caso não seja encontrado
- [x] Redirecionamento automático após salvar

---

## 📦 Módulos do Sistema

### 🔐 Autenticação

O módulo de autenticação é composto por três camadas:

1. **Página de Login** (`/login`): Recebe identificador (e-mail ou CPF) e senha. Consulta a tabela `usuarios` no Supabase, valida as credenciais e, em caso de sucesso, grava o cookie `auth_token` (válido por 24h) e salva os dados do usuário no `localStorage`.

2. **Middleware** (`middleware.js`): Intercepta todas as requisições às rotas `/dashboard/*`. Se não há cookie de autenticação, redireciona para `/login`. Se o usuário já está autenticado e tenta acessar `/login`, redireciona para `/dashboard`.

3. **Layout Root** (`src/app/layout.js`): Verifica o `localStorage` no lado do cliente ao montar o componente. Exibe uma tela de carregamento ("Verificando Acesso...") enquanto a verificação ocorre, impedindo flash de conteúdo protegido.

---

### 📊 Dashboard

Painel central de operações da unidade. Exibe em tempo real:

- **Cards de estatísticas** com consultas ao banco para contar triagens do dia e profissionais por cargo.
- **Lista de triagens em aberto** com indicadores de risco coloridos, badges de prioridade especial (PCD, Idoso 60+) e hora de entrada.
- **Ações rápidas** por triagem: imprimir ficha, abrir na central e marcar como concluída.
- **Impressão de ficha A4** via CSS `@media print` que oculta toda a UI e renderiza apenas a ficha formatada.

---

### 👤 Gestão de Pacientes

Módulo completo para administração do cadastro de pacientes:

- **Listagem** com busca em tempo real filtrada por nome, CPF ou Cartão SUS.
- **Prontuário Rápido**: modal de visualização com destaque visual para informações críticas (alergias em laranja, doenças em azul, medicamentos em verde).
- **Edição Completa**: modal com formulário em scroll, cabeçalho e rodapé fixos, editando todos os campos do cadastro.
- **Novo Paciente**: formulário dividido em 4 seções — Documentação Civil, Informações Pessoais, Triagem Rápida de Saúde e Contato de Emergência — com aparecimento condicional de campos e validações de negócio.

---

### 👨‍⚕️ Gestão de Profissionais

Módulo para gerenciamento da equipe de saúde com acesso ao sistema:

- **Listagem** com badges coloridos por cargo para identificação visual rápida.
- **Modal de detalhes/edição**: alterna entre modo leitura e modo edição, com campos condicionais conforme o cargo selecionado.
- **Exclusão** com diálogo de confirmação antes de remover o registro.
- **Novo Profissional**: cria tanto o perfil profissional quanto as credenciais de acesso ao sistema, com campos que aparecem dinamicamente conforme o cargo.

---

### 🩺 Central de Triagem

O núcleo clínico do sistema, organizado em duas abas:

- **Abertas**: triagens aguardando atendimento, com ações de concluir, imprimir e ver detalhes.
- **Concluídas**: histórico de triagens finalizadas, com tempo de permanência.

O **Modal de Detalhes** exibe o conjunto completo de informações clínicas com cabeçalho colorido de acordo com o nível de risco Manchester:

| Nível | Classificação | Cor |
|---|---|---|
| 1 | Emergência | Vermelho |
| 2 | Muito Urgente | Laranja |
| 3 | Urgente | Amarelo |
| 4 | Pouco Urgente | Verde |
| 5 | Não Urgente | Azul |

A **Sidebar de Resumo** exibe totais de triagens abertas e quantidade de pacientes prioritários (Emergência, Muito Urgente, PCD e Idosos 60+).

---

### 📋 Nova Triagem

Formulário de coleta clínica em etapas:

1. **Identificação do Paciente**: campo de busca com autocomplete que retorna até 5 sugestões do banco. Após seleção, exibe card com nome, CPF e Cartão SUS.
2. **Sinais Vitais**: campos para PA, temperatura, saturação, frequência cardíaca, peso e altura, com cálculo automático de IMC.
3. **Queixa Principal**: campo de texto livre para descrição do motivo do atendimento.
4. **Classificação de Risco**: 5 botões visuais com animação de seleção (escala, borda e sombra).

---

## 🔄 Fluxo de Utilização

```
┌─────────────┐
│    /login   │  ← Usuário insere e-mail ou CPF + senha
└──────┬──────┘
       │ Autenticação bem-sucedida
       ▼
┌─────────────────┐
│   /dashboard    │  ← Visão geral: triagens abertas + estatísticas
└────────┬────────┘
         │
    ┌────┴────────────────────────┐
    │                             │
    ▼                             ▼
┌──────────────────┐   ┌─────────────────────┐
│ /pacientes       │   │ /triagem             │
│ Cadastrar/Editar │   │ Central (abertas/    │
│ pacientes        │   │ concluídas)          │
└────────┬─────────┘   └──────────┬──────────┘
         │                        │
         ▼                        ▼
┌──────────────────┐   ┌─────────────────────┐
│ /pacientes/novo  │   │ /triagem/nova        │
│ Formulário de    │   │ Buscar paciente →    │
│ cadastro         │   │ Sinais vitais →      │
└──────────────────┘   │ Classificar risco →  │
                        │ Salvar triagem       │
                        └─────────────────────┘
         │                        │
         └────────────┬───────────┘
                      ▼
         ┌─────────────────────────┐
         │ /profissionais          │
         │ Gerenciar equipe de     │
         │ saúde e acessos         │
         └─────────────────────────┘
```

**Passo a passo típico de um dia de atendimento:**

1. O recepcionista faz login com seu CPF ou e-mail.
2. Verifica no **Dashboard** as triagens em aberto do turno atual.
3. Acessa **Pacientes** para localizar o prontuário de quem chegou ou **cadastra um novo paciente**.
4. Navega para **Nova Triagem**, busca o paciente pelo nome/CPF, preenche os sinais vitais e classifica o risco.
5. A triagem aparece imediatamente no **Dashboard** e na **Central de Triagem**.
6. O profissional de saúde visualiza os detalhes no modal, imprime a ficha se necessário e **conclui a triagem** após o atendimento.

---

## 🏗️ Arquitetura da Aplicação

### Visão Geral

```
┌─────────────────────────────────────────────┐
│              CLIENTE (Browser)               │
│                                             │
│  React 19 Components (Client-Side)          │
│  ├─ Estado local com useState/useEffect     │
│  ├─ Roteamento com next/navigation          │
│  └─ Estilização com Tailwind CSS 4          │
└──────────────────────┬──────────────────────┘
                       │ HTTP / HTTPS
                       ▼
┌─────────────────────────────────────────────┐
│           SERVIDOR (Next.js 15)              │
│                                             │
│  App Router (SSR + Client Components)       │
│  ├─ middleware.js → Proteção de rotas       │
│  ├─ layout.js → Autenticação visual         │
│  └─ page.js → Páginas e formulários         │
└──────────────────────┬──────────────────────┘
                       │ Supabase JS Client
                       ▼
┌─────────────────────────────────────────────┐
│         SUPABASE (Backend as a Service)      │
│                                             │
│  PostgreSQL Database                        │
│  ├─ Tabela: usuarios                        │
│  ├─ Tabela: pacientes                       │
│  └─ Tabela: triagens                        │
└─────────────────────────────────────────────┘
```

### Frontend

- **Framework:** Next.js 15 com App Router — todo o roteamento é baseado em sistema de arquivos dentro de `src/app/`.
- **Renderização:** Os componentes utilizam a diretiva `"use client"` para interatividade no lado do cliente (formulários, modais, buscas em tempo real).
- **Estilização:** Tailwind CSS 4 com design system customizado (cores SUS e paleta Apple), classes utilitárias reutilizáveis (`.apple-card`, `.btn-sus`, `.apple-input`) e responsividade nativa.
- **Roteamento:** Baseado em pastas — cada `page.js` dentro de `src/app/` corresponde a uma rota pública.

### Backend

- O projeto utiliza **Supabase como BaaS (Backend as a Service)**, eliminando a necessidade de um servidor backend dedicado.
- O cliente Supabase é inicializado em `lib/supabase.js` e importado diretamente nos componentes para operações de leitura e escrita no banco.
- A proteção de rotas é implementada no **Middleware do Next.js** (`middleware.js`), que roda no Edge Runtime antes de qualquer renderização.

### Banco de Dados

- **Supabase (PostgreSQL)** hospedado na nuvem.
- Comunicação via **Supabase JS SDK** com queries declarativas (`.select()`, `.insert()`, `.update()`, `.delete()`).
- Relacionamentos realizados por Foreign Key e resolvidos com JOIN automático pelo SDK.

### Fluxo de Dados

```
Usuário interage com componente React
        ↓
useState atualiza estado local
        ↓
Chamada ao Supabase Client (lib/supabase.js)
        ↓
Query executada no PostgreSQL (Supabase Cloud)
        ↓
Resposta retorna ao componente
        ↓
useState atualiza → Re-render da UI
```

---

## 🗄️ Banco de Dados

### Diagrama de Entidade-Relacionamento

```
┌───────────────────────────┐          ┌───────────────────────────┐
│          usuarios          │          │          pacientes          │
├───────────────────────────┤          ├───────────────────────────┤
│ id             UUID (PK)  │          │ id             UUID (PK)  │
│ nome_completo  TEXT       │          │ nome_completo  TEXT       │
│ email          TEXT       │          │ sexo           CHAR(1)    │
│ cpf            TEXT       │          │ cpf            TEXT       │
│ senha          TEXT       │          │ cartao_sus     TEXT       │
│ cargo          TEXT       │          │ rg             TEXT       │
│ registro_prof  TEXT       │          │ data_nascimento DATE      │
│ especialidade  TEXT       │          │ endereco       TEXT       │
│ setor          TEXT       │          │ municipio      TEXT       │
│ criado_at      TIMESTAMP  │          │ is_especial    BOOLEAN    │
└───────────────────────────┘          │ nome_responsavel TEXT     │
                                        │ contato_emergencia TEXT   │
                                        │ alergias_desc  TEXT       │
                                        │ doencas_cronicas TEXT     │
                                        │ medicacoes_cont TEXT      │
                                        │ criado_at      TIMESTAMP  │
                                        └─────────────┬─────────────┘
                                                      │ 1
                                                      │
                                                      │ N
                                        ┌─────────────┴─────────────┐
                                        │          triagens          │
                                        ├───────────────────────────┤
                                        │ id             UUID (PK)  │
                                        │ paciente_id    UUID (FK)  │
                                        │ pa             TEXT       │
                                        │ temperatura    FLOAT      │
                                        │ saturacao      INTEGER    │
                                        │ fc             INTEGER    │
                                        │ peso           FLOAT      │
                                        │ altura         FLOAT      │
                                        │ imc            FLOAT      │
                                        │ queixa_princ   TEXT       │
                                        │ classif_risco  TEXT       │
                                        │ concluido      BOOLEAN    │
                                        │ criado_at      TIMESTAMP  │
                                        └───────────────────────────┘
```

### Descrição das Tabelas

#### `usuarios`
Armazena os profissionais de saúde com acesso ao sistema.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único (PK) |
| `nome_completo` | TEXT | Nome completo do profissional |
| `email` | TEXT | E-mail de acesso (único) |
| `cpf` | TEXT | CPF do profissional (único) |
| `senha` | TEXT | Senha de acesso |
| `cargo` | TEXT | `Médico`, `Enfermeiro`, `Recepcionista` ou `TI` |
| `registro_profissional` | TEXT | CRM, COREN ou equivalente |
| `especialidade` | TEXT | Especialidade médica (se aplicável) |
| `setor` | TEXT | Setor de atuação (se aplicável) |
| `criado_at` | TIMESTAMP | Data e hora de cadastro |

#### `pacientes`
Armazena o cadastro e histórico de saúde dos pacientes atendidos.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único (PK) |
| `nome_completo` | TEXT | Nome completo do paciente |
| `sexo` | CHAR(1) | `M` (Masculino), `F` (Feminino) ou `O` (Outro) |
| `cpf` | TEXT | CPF do paciente (único) |
| `cartao_sus` | TEXT | Número do Cartão SUS (único) |
| `rg` | TEXT | RG/Identidade |
| `data_nascimento` | DATE | Data de nascimento |
| `endereco` | TEXT | Endereço residencial |
| `municipio` | TEXT | Município (padrão: Feira de Santana) |
| `is_especial` | BOOLEAN | Indica se é PCD ou paciente especial |
| `nome_responsavel` | TEXT | Nome do responsável legal (menores/PCD) |
| `contato_emergencia_fone` | TEXT | Telefone de contato de emergência |
| `alergias_desc` | TEXT | Descrição de alergias conhecidas |
| `doencas_cronicas_desc` | TEXT | Doenças crônicas pré-existentes |
| `medicacoes_continuas_desc` | TEXT | Medicamentos de uso contínuo |
| `criado_at` | TIMESTAMP | Data e hora de cadastro |

#### `triagens`
Registra cada atendimento de triagem vinculado a um paciente.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único (PK) |
| `paciente_id` | UUID | Referência ao paciente (FK → `pacientes.id`) |
| `pa` | TEXT | Pressão arterial (ex: `"120/80"`) |
| `temperatura` | FLOAT | Temperatura corporal em °C |
| `saturacao` | INTEGER | Saturação de oxigênio em % |
| `fc` | INTEGER | Frequência cardíaca em bpm |
| `peso` | FLOAT | Peso em kg |
| `altura` | FLOAT | Altura em metros |
| `imc` | FLOAT | Índice de Massa Corporal (calculado) |
| `queixa_principal` | TEXT | Descrição da queixa do paciente |
| `classificacao_risco` | TEXT | Nível Manchester: Emergência, Muito Urgente, etc. |
| `concluido` | BOOLEAN | `false` = em aberto, `true` = concluída |
| `criado_at` | TIMESTAMP | Data e hora de registro |

### Relacionamentos

- **`triagens.paciente_id` → `pacientes.id`**: Relacionamento Many-to-One. Um paciente pode ter múltiplas triagens ao longo do tempo.
- Queries utilizam o JOIN automático do Supabase SDK com seleção aninhada: `select('*, pacientes(*)')`.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Categoria | Uso no Projeto |
|---|---|---|---|
| [Next.js](https://nextjs.org/) | 15.5.14 | Framework Web | Base da aplicação, roteamento App Router, SSR |
| [React](https://react.dev/) | 19.1.0 | Biblioteca UI | Construção de componentes e gerenciamento de estado |
| [React DOM](https://react.dev/) | 19.1.0 | Renderização | Renderização dos componentes no browser |
| [Supabase JS](https://supabase.com/) | ^2.100.0 | BaaS / Banco de Dados | Banco PostgreSQL + cliente de queries |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.0 | Estilização | Design system, responsividade, temas customizados |
| [@tailwindcss/postcss](https://tailwindcss.com/) | ^4.0 | Tooling | Processamento CSS com PostCSS |
| [Turbopack](https://turbo.build/pack) | (embutido) | Bundler | Build ultrarrápido em desenvolvimento e produção |
| [Node.js](https://nodejs.org/) | >= 18.x | Runtime | Execução do servidor Next.js |
| [PostgreSQL](https://www.postgresql.org/) | (via Supabase) | Banco de Dados | Armazenamento relacional dos dados |

---

## 📁 Estrutura do Projeto

```
sus-fsa/
│
├── src/
│   └── app/                          # App Router do Next.js
│       ├── layout.js                 # Layout raiz — verificação de autenticação
│       ├── globals.css               # Estilos globais, variáveis CSS e classes Tailwind
│       ├── page.js                   # Rota raiz — redireciona para /login
│       │
│       ├── login/
│       │   └── page.js               # Página de login (e-mail/CPF + senha)
│       │
│       └── dashboard/
│           ├── layout.js             # Layout do painel — Sidebar + Header + logout
│           ├── page.js               # Dashboard — estatísticas e triagens em aberto
│           │
│           ├── pacientes/
│           │   ├── page.js           # Listagem, busca, modal de prontuário e edição
│           │   └── novo/
│           │       └── page.js       # Formulário de cadastro de novo paciente
│           │
│           ├── profissionais/
│           │   ├── page.js           # Listagem, edição e remoção de profissionais
│           │   └── novo/
│           │       └── page.js       # Formulário de cadastro de novo profissional
│           │
│           └── triagem/
│               ├── page.js           # Central de triagem (abas: abertas/concluídas)
│               ├── BuscaPaciente.js  # Componente de autocomplete para busca de paciente
│               └── nova/
│                   └── page.js       # Formulário de nova triagem clínica
│
├── lib/
│   ├── supabase.js                   # Inicialização e exportação do cliente Supabase
│   └── utils.js                      # Funções utilitárias auxiliares
│
├── public/                           # Assets estáticos (SVGs)
│
├── middleware.js                     # Proteção de rotas via cookie auth_token
├── tailwind.config.js                # Configuração do Tailwind (cores SUS, Apple)
├── postcss.config.mjs                # Configuração do PostCSS
├── next.config.mjs                   # Configuração do Next.js
├── jsconfig.json                     # Configuração de paths do JavaScript
├── package.json                      # Dependências e scripts do projeto
└── .env.local                        # Variáveis de ambiente (não versionado)
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão **18.x ou superior**
- [npm](https://www.npmjs.com/) versão **9.x ou superior**
- Conta ativa no [Supabase](https://supabase.com/) com as tabelas configuradas

### 1. Clonar o Repositório

```bash
git clone https://github.com/oeduardomelo/sus-fsa.git
cd sus-fsa
```

### 2. Instalar as Dependências

```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

> As credenciais podem ser obtidas em **Supabase → Project Settings → API**.

### 4. Criar as Tabelas no Supabase

Execute os seguintes SQLs no **SQL Editor** do Supabase:

```sql
-- Tabela de usuários (profissionais de saúde)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  email TEXT UNIQUE,
  cpf TEXT UNIQUE,
  senha TEXT,
  cargo TEXT CHECK (cargo IN ('Médico', 'Enfermeiro', 'Recepcionista', 'TI')),
  registro_profissional TEXT,
  especialidade TEXT,
  setor TEXT,
  criado_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  sexo CHAR(1) CHECK (sexo IN ('M', 'F', 'O')),
  cpf TEXT UNIQUE,
  cartao_sus TEXT UNIQUE,
  rg TEXT,
  data_nascimento DATE,
  endereco TEXT,
  municipio TEXT DEFAULT 'Feira de Santana',
  is_especial BOOLEAN DEFAULT FALSE,
  nome_responsavel TEXT,
  contato_emergencia_fone TEXT,
  alergias_desc TEXT,
  doencas_cronicas_desc TEXT,
  medicacoes_continuas_desc TEXT,
  criado_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de triagens
CREATE TABLE triagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id),
  pa TEXT,
  temperatura FLOAT,
  saturacao INTEGER,
  fc INTEGER,
  peso FLOAT,
  altura FLOAT,
  imc FLOAT,
  queixa_principal TEXT,
  classificacao_risco TEXT,
  concluido BOOLEAN DEFAULT FALSE,
  criado_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 6. Build de Produção

```bash
npm run build
```

### 7. Executar em Produção

```bash
npm start
```

### Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com Turbopack |
| `npm run build` | Gera o build otimizado para produção com Turbopack |
| `npm start` | Inicia o servidor de produção |

---

## 📸 Screenshots

> As imagens serão adicionadas após a apresentação do projeto.

| Tela | Descrição |
|---|---|
| `screenshots/login.png` | Tela de Login |
| `screenshots/dashboard.png` | Painel de Controle Principal |
| `screenshots/pacientes.png` | Listagem de Pacientes |
| `screenshots/paciente-prontuario.png` | Modal de Prontuário Rápido |
| `screenshots/paciente-novo.png` | Formulário de Novo Paciente |
| `screenshots/triagem-central.png` | Central de Triagem |
| `screenshots/triagem-nova.png` | Formulário de Nova Triagem |
| `screenshots/profissionais.png` | Gestão da Equipe de Saúde |
| `screenshots/ficha-impressao.png` | Ficha de Triagem para Impressão |

---

## ⚠️ Limitações Atuais

As seguintes limitações foram identificadas na versão atual do sistema e devem ser consideradas para implantação em ambiente de produção:

### Segurança
- **Senhas em texto plano:** As senhas dos usuários são armazenadas sem criptografia (hash) no banco de dados. Em produção, é obrigatório implementar hashing (ex: bcrypt ou argon2).
- **Autenticação simplificada:** O controle de sessão utiliza um cookie booleano simples (`auth_token=true`) sem JWT, sem CSRF token e sem assinatura criptográfica.
- **Validações apenas no frontend:** Não há validações ou políticas de Row Level Security (RLS) configuradas no Supabase, o que significa que a chave anônima tem acesso irrestrito ao banco.
- **Sem controle de permissões por cargo:** Todos os usuários autenticados têm o mesmo nível de acesso, independentemente do cargo (Médico, Recepcionista, TI, etc.).

### Funcionalidades
- **Sem recuperação de senha:** Não há fluxo de redefinição de senha via e-mail.
- **Sem paginação:** As listagens de pacientes e triagens carregam todos os registros de uma vez, sem paginação ou virtualização.
- **Ajuste de fuso horário hardcoded:** A correção de −3h (fuso de Brasília) nas fichas de triagem está fixada diretamente no código, sem configuração via variável de ambiente.
- **Sem histórico de edições:** Alterações no cadastro de pacientes e profissionais sobrescrevem os dados sem rastreamento.

---

## 🔮 Melhorias Futuras

As seguintes evoluções são sugeridas para versões posteriores:

### Segurança e Autenticação
- [ ] Hashing de senhas com **bcrypt** ou **argon2**
- [ ] Autenticação nativa via **Supabase Auth** (e-mail/senha com confirmação)
- [ ] Fluxo de recuperação e redefinição de senha
- [ ] Autenticação em dois fatores (2FA)
- [ ] Configuração de **Row Level Security (RLS)** no Supabase por perfil de acesso

### Funcionalidades Clínicas
- [ ] Histórico completo de triagens por paciente (linha do tempo)
- [ ] Prontuário eletrônico com evoluções clínicas
- [ ] Relatórios e exportação de dados (CSV/PDF)
- [ ] Controle de fila de atendimento com estimativa de espera
- [ ] Notificações em tempo real (Supabase Realtime) para novas triagens

### Performance e Escalabilidade
- [ ] Paginação nas listagens
- [ ] Cache de dados com **SWR** ou **React Query**
- [ ] Otimização de queries com índices no banco
- [ ] Lazy loading de componentes pesados

### Experiência do Usuário
- [ ] Notificações toast (sucesso/erro) no lugar de `alert()`
- [ ] Modo escuro (dark mode)
- [ ] PWA (Progressive Web App) para uso offline básico
- [ ] Acessibilidade (WCAG 2.1 AA)

### Infraestrutura
- [ ] Testes unitários e de integração (Jest + React Testing Library)
- [ ] Testes end-to-end (Cypress ou Playwright)
- [ ] Pipeline CI/CD automatizado
- [ ] Monitoramento de erros (Sentry)
- [ ] Deploy automatizado (Vercel)

---

## 👥 Equipe

O projeto foi desenvolvido de forma **colaborativa** pelos integrantes da equipe durante a disciplina de Desenvolvimento Mobile da UNIFAN. Cada integrante participou das etapas de levantamento de requisitos, design de interface, desenvolvimento das funcionalidades e testes do sistema.

<br/>

<div align="center">

| Nome | GitHub |
|---|---|
| **Eduardo Melo** | [@oeduardomelo](https://github.com/oeduardomelo) |
| **Eduardo Mendes** | — |
| **Lucas Ferreira** | — |
| **Deivid Santana** | — |

<br/>

*Centro Universitário UNIFAN — Feira de Santana, Bahia*  
*Disciplina: Desenvolvimento Mobile · 2025*

</div>

---

## 📂 Repositório

```bash
# Clonar o repositório
git clone https://github.com/oeduardomelo/sus-fsa.git

# Entrar na pasta
cd sus-fsa

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Crie o arquivo .env.local com suas credenciais do Supabase

# Iniciar em desenvolvimento
npm run dev
```

🔗 **Link do repositório:** [https://github.com/oeduardomelo/sus-fsa](https://github.com/oeduardomelo/sus-fsa)

---

## 📄 Licença

Este projeto foi desenvolvido com **finalidade exclusivamente acadêmica** como parte do Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas do **Centro Universitário UNIFAN**.

Não é permitida a utilização, distribuição ou implantação deste software em ambientes de produção sem as devidas adaptações de segurança e conformidade com a **LGPD (Lei Geral de Proteção de Dados — Lei nº 13.709/2018)** e demais normas aplicáveis à área da saúde.

---

<div align="center">

Desenvolvido com dedicação pela equipe **SUS +Ágil Feira**  
UNIFAN · Feira de Santana, Bahia · 2025

</div>
