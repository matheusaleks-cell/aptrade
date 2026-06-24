# Relatório de Contexto — Plataforma APTRADE Funding

## 1. Resumo Executivo
A plataforma **APTRADE Funding** é um sistema de investimentos coletivos focado em operações logísticas de importação. O projeto encontra-se em estágio avançado de prototipagem funcional, com uma base de dados SQLite via Prisma, fluxos completos de autenticação baseada em JWT e layouts refinados para dois perfis de usuário (Investidor e Administrador). Atualmente, a plataforma já realiza cálculos precisos de impostos aduaneiros de importação (nacionalização) e divisão de lucros em ciclos rotativos. O maior gap para um estado "pronto para produção" é a transição de persistências do cliente (`localStorage` usado para suitability, notificações e parâmetros fiscais globais) para o banco de dados definitivo, além da implementação de testes automatizados e integração de uma solução robusta de assinatura eletrônica de contratos.

---

## 2. Stack Técnica
Conforme a análise dos arquivos de configuração e dependências do repositório ([package.json](file:///C:/Users/User/Desktop/APTRADE/package.json) e [tsconfig.json](file:///C:/Users/User/Desktop/APTRADE/tsconfig.json)), a stack técnica do projeto consiste em:

* **Framework e Versão**: Next.js 16.2.9 (utilizando React 19.2.4).
* **Linguagem**: TypeScript ^5. Habilitado com o modo estrito (`"strict": true` em [tsconfig.json](file:///C:/Users/User/Desktop/APTRADE/tsconfig.json)).
* **Biblioteca de Estilos**: Tailwind CSS v4 (com `@tailwindcss/postcss` configurado em [postcss.config.mjs](file:///C:/Users/User/Desktop/APTRADE/postcss.config.mjs)).
* **Biblioteca de Componentes UI**: Nenhuma. O projeto adota uma abordagem sob medida, estilizando elementos nativos do HTML com classes de utilidade do Tailwind.
* **Visualização de Dados / Gráficos**: Recharts ^3.8.1 (usado para gráficos interativos de pizza e área na área do investidor).
* **ORM e Banco de Dados**: Prisma ^7.8.0 operando sobre um banco de dados local SQLite (`better-sqlite3` ^12.11.1 e `@libsql/client` ^0.17.4).
* **Autenticação**: Solução customizada baseada em JSON Web Tokens ([auth.ts](file:///C:/Users/User/Desktop/APTRADE/src/lib/auth.ts)) com cookies `httpOnly` seguros de sessão (`aptrade-token`), criptografia de senhas usando `bcryptjs` e validação nos layouts Server Components.
* **Gerenciador de Estado**: Persistência simples via `localStorage` no browser para suitability, notificações e configurações fiscais. Estados de formulário e interatividade reativa são gerenciados via React hooks normais (`useState`, `useEffect`).
* **Gerenciador de Formulários**: Formulários nativos do HTML5 tratados por handlers nativos e Server Actions, sem bibliotecas externas como Formik ou React Hook Form.

---

## 3. Estrutura de Pastas
A estrutura principal do diretório `/src` do projeto está organizada da seguinte maneira:

```
src/
├── app/
│   ├── admin/
│   │   ├── configuracoes/
│   │   │   ├── ConfigRulesForm.tsx
│   │   │   └── page.tsx
│   │   ├── investidores/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── operacoes/
│   │   │   └── page.tsx
│   │   ├── projetos/
│   │   │   └── page.tsx
│   │   ├── AdminCharts.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   └── proxy/
│   │       └── route.ts
│   ├── investidor/
│   │   ├── extrato/
│   │   │   └── page.tsx
│   │   ├── perfil/
│   │   │   ├── PasswordForm.tsx
│   │   │   ├── ProfileContainer.tsx
│   │   │   └── page.tsx
│   │   ├── portfolio/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CapitalGrowthChart.tsx
│   ├── DashboardFilter.tsx
│   ├── Header.tsx
│   ├── PortfolioDonutChart.tsx
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   └── StatementContainer.tsx
├── generated/
│   └── prisma/
├── lib/
│   ├── actions.ts
│   ├── auth.ts
│   ├── calculations.ts
│   └── prisma.ts
└── proxy.ts
```

### Localização dos Principais Recursos:
* **Roteamento**: Next.js App Router (diretório `src/app`).
* **Componentes Compartilhados**: Localizados em `src/components/` (ex: gráficos, Sidebar, StatCard).
* **Lógica de Negócios / Serviços / Actions**: Definida em `src/lib/actions.ts` (operações no banco de dados e controle) e `src/lib/calculations.ts` (cálculos matemáticos e tributários).
* **Configuração de Estilo Global**: Centralizada em [globals.css](file:///C:/Users/User/Desktop/APTRADE/src/app/globals.css).
* **Types e Conexão de Banco**: Localizados em `src/lib/prisma.ts` e classes tipadas autogeradas pelo Prisma em `src/generated/prisma`.

---

## 4. Perfis de Usuário e Rotas

O sistema é dividido rigidamente em dois perfis por meio de verificação de permissões do cookie JWT nos arquivos de layout correspondentes:

### Perfis Ativos:
1. **Administrador (`role === "ADMIN"`)**: Operador interno com privilégios de gestão.
2. **Investidor (`role === "INVESTOR"`)**: Cliente final que realiza aportes e acompanha rendimentos.

### Mapeamento de Rotas por Perfil:

#### A. Área do Administrador (Rotas protegidas em [admin/layout.tsx](file:///C:/Users/User/Desktop/APTRADE/src/app/admin/layout.tsx))
* `/admin/login`: Tela de autenticação exclusiva para administradores.
* `/admin`: Dashboard consolidada com estatísticas gerais do sistema (total captado, faturamento de vendas, investidores ativos).
* `/admin/projetos`: Criação e visualização de projetos de captação de lote de produtos (ex: Eletrônicos, Bebidas).
* `/admin/operacoes`: Lançamento e controle de operações financeiras vinculadas a projetos, permitindo definir prazos de captação, estimativa de meses para conclusão e status.
* `/admin/investidores`: Lista de investidores cadastrados e aprovação/rejeição de documentações KYC para liberação de aportes.
* `/admin/configuracoes`: Formulário de parametrização tributária global e configuração do limite anual da CVM.

#### B. Área do Investidor (Rotas protegidas em [investidor/layout.tsx](file:///C:/Users/User/Desktop/APTRADE/src/app/investidor/layout.tsx))
* `/login`: Tela de login unificada para o investidor.
* `/investidor`: Dashboard pessoal exibindo patrimônio líquido total, rendimento histórico, ROI médio geral, acompanhamento de importações ativas (Track & Trace), gráfico de evolução e previsões de repasse.
* `/investidor/extrato`: Histórico cronológico detalhado de aportes e rendimentos distribuídos por operação, com painel de saldos, filtros locais e botão de exportação para PDF.
* `/investidor/portfolio`: Acompanhamento de projetos investidos e detalhes específicos de ciclos e vendas de mercadorias.
* `/investidor/perfil`: Informações cadastrais divididas em abas interativas, gerenciamento de senha, comprovante de informe de rendimentos (IRPF), central de alertas de notificações e o suitability do perfil de risco (CVM 88).

#### C. Proteção de Rotas:
A validação de privilégios de navegação ocorre na renderização de Server Components em [investidor/layout.tsx](file:///C:/Users/User/Desktop/APTRADE/src/app/investidor/layout.tsx) e [admin/layout.tsx](file:///C:/Users/User/Desktop/APTRADE/src/app/admin/layout.tsx). Ambos realizam a chamada para a action `getSession()` e verificam a compatibilidade do atributo `session.role` com o perfil exigido. Usuários sem sessão válida ou com permissão inadequada são redirecionados automaticamente por meio da função `redirect()`.

---

## 5. Modelo de Dados
O modelo relacional do projeto é definido em SQLite via Prisma ([schema.prisma](file:///C:/Users/User/Desktop/APTRADE/prisma/schema.prisma)):

```prisma
model User {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  password    String
  role        String   @default("INVESTOR") // ADMIN, INVESTOR, IMPORTER
  cpfCnpj     String?  @unique
  phone       String?
  approved    Boolean  @default(false)
  bankName    String?
  bankAgency  String?
  bankAccount String?
  pixKey      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  kycDocuments KycDocument[]
  investments  Investment[]

  @@map("users")
}

model KycDocument {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  docType    String   // CPF, RG, CNH, CNPJ
  frontPath  String
  backPath   String?
  status     String   @default("PENDING") // PENDING, APPROVED, REJECTED
  reviewNote String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("kyc_documents")
}

model FundingProject {
  id              String   @id @default(cuid())
  name            String
  description     String?
  productCategory String
  maxCycles       Int      @default(1)
  profitSplitPct  Float    @default(0.50)
  payoutRule      String   @default("AT_SETTLEMENT") // AT_SETTLEMENT, REINVEST
  status          String   @default("ACTIVE") // ACTIVE, COMPLETED, CANCELLED
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  operations FundingOperation[]

  @@map("funding_projects")
}

model FundingOperation {
  id               String   @id @default(cuid())
  operationCode    String   @unique
  projectId        String
  project          FundingProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  totalAmount      Float
  fundedAmount     Float    @default(0)
  minInvestment    Float    @default(1000)
  modality         String   @default("PROFIT_SHARE") // FIXED, PROFIT_SHARE
  fixedRateMonthly Float?
  expectedMonths   Int      @default(6)
  status           String   @default("DRAFT") // DRAFT, OPEN, FUNDING, IN_PROGRESS, SOLD, SETTLED
  openDate         DateTime?
  closeDate        DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  investments    Investment[]
  importCosts    ImportCostEntry[]
  cycles         OperationCycle[]

  @@map("funding_operations")
}

model ImportCostEntry {
  id            String   @id @default(cuid())
  operationId   String
  operation     FundingOperation @relation(fields: [operationId], references: [id], onDelete: Cascade)
  fobValue      Float
  freight       Float
  insurance     Float
  quantity      Int
  exchangeRate  Float
  iiRate        Float    @default(0.18)
  pisRate       Float    @default(0.021)
  cofinsRate    Float    @default(0.0965)
  icmsRate      Float    @default(0.18)
  icmsFactor    Float    @default(0.82)
  salesTaxRate  Float    @default(0.08)
  opExRate      Float    @default(0.15)
  siscomexFixed Float    @default(154.23)
  customsOpCost Float    @default(0)
  sellingPrice  Float?
  isActual      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("import_cost_entries")
}

model Investment {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  operationId      String
  operation        FundingOperation @relation(fields: [operationId], references: [id], onDelete: Cascade)
  amount           Float
  status           String   @default("PENDING") // PENDING, CONFIRMED, SETTLED
  grossReturn      Float?
  irAmount         Float?
  netReturn        Float?
  contractUrl      String?
  contractSignedAt DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("investments")
}

model OperationCycle {
  id            String   @id @default(cuid())
  operationId   String
  operation     FundingOperation @relation(fields: [operationId], references: [id], onDelete: Cascade)
  cycleNumber   Int
  quantity      Int      @default(0)
  grossRevenue  Float    @default(0)
  totalCost     Float    @default(0)
  investorShare Float    @default(0)
  companyShare  Float    @default(0)
  carryover     Float    @default(0)
  status        String   @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  sales CycleSale[]

  @@map("operation_cycles")
}

model CycleSale {
  id          String   @id @default(cuid())
  cycleId     String
  cycle       OperationCycle @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  buyerName   String
  quantity    Int
  unitPrice   Float
  totalValue  Float
  saleDate    DateTime
  createdAt   DateTime @default(now())

  @@map("cycle_sales")
}
```

### Relações e Entidades Centrais:
* **Entidades Centrais**:
  * `User`: A base para investidores e administradores do ecossistema.
  * `FundingProject`: Representa a campanha mãe de captação que contém as especificidades da categoria de mercadoria importada.
  * `FundingOperation`: Operações práticas lançadas sob campanhas de captação coletiva.
  * `Investment`: O vínculo de aporte financeiro do investidor em uma operação logística específica.
  * `OperationCycle`: Os lotes ou ciclos rotativos da mercadoria comercializada. Uma operação de importação pode ter mais de um ciclo rotativo caso o capital seja reinvestido para comprar novos lotes.
  * `CycleSale`: Vendas individualizadas de mercadorias no mercado local, gerando receita que compõe o retorno final dos ciclos.
* **Principais Relações**:
  * `User (1) <─> (N) Investment`: Um usuário investe em várias operações.
  * `FundingProject (1) <─> (N) FundingOperation`: Um projeto de captação pode ter múltiplas operações de importação logísticas lançadas ao longo do tempo.
  * `FundingOperation (1) <─> (N) OperationCycle`: Uma operação possui múltiplos ciclos de compra e venda de mercadorias.
  * `OperationCycle (1) <─> (N) CycleSale`: Um ciclo operacional tem várias vendas realizadas para diferentes compradores do lote.

---

## 6. Regras de Negócio
As fórmulas matemáticas que definem as regras operacionais da plataforma estão implementadas de forma centralizada em [calculations.ts](file:///C:/Users/User/Desktop/APTRADE/src/lib/calculations.ts):

### A. Nacionalização e Impostos Aduaneiros (`calcNationalization`)
Calcula a cadeia tributária sobre mercadorias desembaraçadas no porto do Brasil:
1. **Valor Aduaneiro**: `(FOB + Frete + Seguro) * Qtd * Câmbio`.
2. **Impostos Federais**: `Valor Aduaneiro * Alíquota` aplicada para II (Imposto de Importação), PIS e COFINS.
3. **ICMS Aduaneiro (Estadual)**: Calculado por dentro usando o fator de ICMS:
   $$\text{Base ICMS} = \frac{\text{Valor Aduaneiro} + \text{II} + \text{PIS} + \text{COFINS} + \text{Siscomex Fixo}}{\text{Fator ICMS}}$$
   $$\text{ICMS} = \text{Base ICMS} \times \text{Alíquota ICMS}$$
4. **Custo Total de Nacionalização**: Base ICMS somada a outras taxas aduaneiras operacionais (`customsOpCost`).

### B. Divisão de Lucros 50-50 (`calcProfitSplit`)
Define a distribuição dos lucros derivados das vendas de mercadorias ao fim de um ciclo logístico:
* **Lucro Líquido**: Faturamento bruto das vendas deduzido de Imposto sobre Vendas (*Sales Tax*), Taxa Operacional do lote (*OpEx*), custo total da mercadoria nacionalizada e acrescido do capital excedente não investido (*carryover*):
  $$\text{Lucro Líquido} = \text{Receita Bruta} - \text{Sales Tax} - \text{OpEx} + \text{Carryover} - \text{Custo Total Import}$$
* **Divisão de Lucro**: O investidor recebe uma fração baseada na regra de partilha cadastrada no projeto (`investorSplitPct`, cujo padrão costuma ser $0.50$ ou 50%). A empresa retém o restante.

### C. Reaplicação Automática de Capital (`calcReinvestment`)
Quando o projeto define que os retornos devem ser reinvestidos em novos lotes rotativos de importação (regra `REINVEST`):
* O capital atualizado (lote original + fatia do lucro do investidor do ciclo anterior) é usado como base.
* O sistema calcula a quantidade máxima de produtos a serem importados de acordo com o capital disponível e o custo unitário nacionalizado da mercadoria:
  $$\text{Qtd Máxima} = \text{Floor}\left(\frac{\text{Capital} - \text{Custo Fixo Lote}}{\text{Custo Variável Unitário}}\right)$$
* O custo total a ser importado é definido por esta quantidade, e qualquer valor remanescente é transportado para o próximo ciclo como capital líquido não investido (`carryover`).

### D. Testes Automatizados:
**Inexistentes**. O projeto não possui nenhuma suite de testes automatizados configurada no `package.json` ou arquivos `.spec`/`.test` no diretório de código. A consistência matemática e de types foi validada manualmente por compilações em tempo de desenvolvimento.

---

## 7. Interfaces de Usuário (Dashboard & UI)
A interface de usuário do painel do investidor e administrador é composta por componentes sob medida.

### Componentes Globais (`src/components/`):
1. [StatCard.tsx](file:///C:/Users/User/Desktop/APTRADE/src/components/StatCard.tsx): Exibe cards de patrimônio, ROI e saldos com micro-efeitos de hover e cores premium (Emerald, Yellow, Purple e Blue).
2. [CapitalGrowthChart.tsx](file:///C:/Users/User/Desktop/APTRADE/src/components/CapitalGrowthChart.tsx): Gráfico de área construído sobre a biblioteca `Recharts` que demonstra a evolução histórica do capital consolidado do investidor.
3. [PortfolioDonutChart.tsx](file:///C:/Users/User/Desktop/APTRADE/src/components/PortfolioDonutChart.tsx): Gráfico de rosca (`Recharts`) para visualização de diversificação patrimonial por categorias de produto.
4. [DashboardFilter.tsx](file:///C:/Users/User/Desktop/APTRADE/src/components/DashboardFilter.tsx): Barra de filtros contendo seletores por projetos, períodos rápidos (30/90/180 dias e anual) e campos customizados de intervalo de datas (De/Até) com suporte nativo a temas escuros.
5. [StatementContainer.tsx](file:///C:/Users/User/Desktop/APTRADE/src/components/StatementContainer.tsx): Painel de extrato financeiro em timeline (fintech style), contendo busca textual de lançamentos, totalizadores de saldos, abas rápidas por tipo de transação (Aportes/Rendimentos) e botão de exportação nativa em PDF.
6. [Sidebar.tsx](file:///C:/Users/User/Desktop/APTRADE/src/components/Sidebar.tsx): Painel de navegação lateral flutuante que se adapta de acordo com as permissões do usuário autenticado.

### Interface do Dashboard do Investidor (`/investidor`):
A tela principal do painel do investidor apresenta-se estruturada nas seguintes áreas:
* **Header**: Saudação personalizada ao usuário, badge KYC "Verificado CVM" ou "Em análise" baseada no status de aprovação de documentos e a barra flutuante de filtros (projetos, períodos e datas customizadas).
* **Quatro Cards de Métricas**: Patrimônio Total, Rendimento Acumulado (filtrável), ROI Médio Geral (percentual acumulado dos projetos liquidados) e Valor Disponível para Saque.
* **Seção de Evolução**: Gráfico de área dourada ilustrando o progresso financeiro das operações.
* **Acompanhamento das Importações (Track & Trace)**: Exibição passo a passo (5 etapas) do andamento físico-logístico das mercadorias de operações ativas do investidor (Planejamento -> Captação -> Trânsito & Aduana -> Vendas -> Finalizado).
* **Diversificação do Portfólio**: Gráfico de rosca exibindo a distribuição dos aportes em mercadorias.
* **Previsões de Retorno**: Lista cronológica organizada de pagamentos futuros estimados para os próximos meses baseados nas operações em andamento.
* **Tabela de Vendas Recentes**: Histórico de comercialização dos lotes de produtos atrelados aos ciclos de importação ativos do investidor.

---

## 8. Gaps e Dores Atuais

### A. Ausência de Persistência no Banco de Dados para Configurações:
* **Suitability e Investidor Qualificado**: Os resultados do questionário de suitability (Conservador, Moderado, Arrojado) e o status de declaração de investidor qualificado (que remove o limite de R$ 20 mil da CVM) são salvos exclusivamente no `localStorage` do browser do cliente ([ProfileContainer.tsx](file:///C:/Users/User/Desktop/APTRADE/src/app/investidor/perfil/ProfileContainer.tsx)).
* **Configurações Fiscais Globais do Administrador**: As alíquotas de tributos globais parametrizadas (II, PIS, COFINS, ICMS, etc.) e o limite padrão de aportes CVM são gravados de forma simulada no `localStorage` do operador ([ConfigRulesForm.tsx](file:///C:/Users/User/Desktop/APTRADE/src/app/admin/configuracoes/ConfigRulesForm.tsx)).
* **Impacto**: Se o investidor ou administrador acessar a plataforma de outro computador ou navegador, os dados serão perdidos ou reiniciados para os valores padrão. É crítico criar campos ou tabelas dedicadas de configurações no schema do Prisma para centralizar essa persistência no SQLite.

### B. Falta de Suite de Testes:
* Toda a lógica crítica de finanças e tributação aduaneira ([calculations.ts](file:///C:/Users/User/Desktop/APTRADE/src/lib/calculations.ts)) carece de testes unitários ou integrados. Alterações em fórmulas tributárias podem gerar erros silenciosos em cascata de saldos.

### C. Assinatura de Contratos de Investimento:
* O modelo `Investment` prevê os campos `contractUrl` e `contractSignedAt`, porém não há integração prática de assinatura de contratos ou upload do documento assinado na interface do investidor atualmente.
