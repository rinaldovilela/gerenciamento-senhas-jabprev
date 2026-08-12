# Graph Report - gerenciamento-senhas-jabprev  (2026-08-12)

## Corpus Check
- 111 files · ~41,335 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 587 nodes · 959 edges · 34 communities (27 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5208825f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]

## God Nodes (most connected - your core abstractions)
1. `ApiClient` - 26 edges
2. `Logger` - 16 edges
3. `compilerOptions` - 16 edges
4. `Ticket` - 16 edges
5. `compilerOptions` - 16 edges
6. `useTodayQueue()` - 15 edges
7. `useAuth()` - 15 edges
8. `Service` - 13 edges
9. `Ticket` - 11 edges
10. `config` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ServiceManagementScreen()` --calls--> `useTodayQueue()`  [EXTRACTED]
  apps/frontend/src/features/queue/components/ServiceManagementScreen.tsx → apps/frontend/src/features/queue/contexts/TodayQueueContext.tsx
- `ServiceSelectionScreen()` --calls--> `useTodayQueue()`  [EXTRACTED]
  apps/frontend/src/features/queue/components/ServiceSelectionScreen.tsx → apps/frontend/src/features/queue/contexts/TodayQueueContext.tsx
- `TicketScreen()` --calls--> `useTodayQueue()`  [EXTRACTED]
  apps/frontend/src/features/queue/components/TicketScreen.tsx → apps/frontend/src/features/queue/contexts/TodayQueueContext.tsx
- `LoginScreen()` --calls--> `useAuth()`  [EXTRACTED]
  apps/frontend/src/features/auth/components/LoginScreen.tsx → apps/frontend/src/features/auth/contexts/AuthContext.tsx
- `RestrictedArea()` --calls--> `useAuth()`  [EXTRACTED]
  apps/frontend/src/features/queue/components/RestrictedArea.tsx → apps/frontend/src/features/auth/contexts/AuthContext.tsx

## Import Cycles
- 2-file cycle: `apps/backend/src/db/index.ts -> apps/backend/src/db/queries.ts -> apps/backend/src/db/index.ts`

## Communities (34 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (37): createUser(), deleteUser(), getDashboard(), getMetrics(), listUsers(), updateUser(), login(), logout() (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (35): AppError, errorHandler(), createUser(), Dashboard, deleteUser(), getDashboard(), getMetrics(), listUsers() (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (10): AdminUser, createUserSchema, ROLE_LABELS, roleOptions, STATUS_CONFIG, statusOptions, updatePasswordSchema, UserDraft (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (33): dependencies, appwrite, date-fns, echarts, echarts-for-react, @emotion/react, @emotion/styled, framer-motion (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (22): supabase, config, missing, requiredEnvVars, createServer(), setupQueueHandlers(), createRoutes(), createApplication() (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (27): dependencies, bcrypt, cors, dotenv, express, joi, jsonwebtoken, socket.io (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (11): ApiError, AuthenticationError, AuthorizationError, ConflictError, InternalServerError, NotFoundError, ValidationError, isValidEmail() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (12): JaboataoPrevLogo(), LogoProps, FilterState, NameInputScreenProps, PrioritySelectionScreen(), PrioritySelectionScreenProps, ServiceSelectionScreen(), ServiceSelectionScreenProps (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.19
Nodes (6): STATUS_CONFIG, ConfirmationModal(), ConfirmationModalProps, ICON_OPTIONS, ServiceDraft, ServiceManagementScreen()

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (5): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, LoadingProps, ModalProps

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (11): AuthContext, AuthContextType, AuthProvider(), AuthUser, AuditLogEntry, CallHistoryEntry, QueueState, Screen (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (8): TodayQueueContext, TodayQueueContextType, TodayQueueProvider(), CreatedTicketRow, CreateTicketPayload, config, initializeSocket(), TicketStatus

### Community 14 - "Community 14"
Cohesion: 0.05
Nodes (31): MetricsDashboard(), TicketScreen(), TicketScreenProps, Toast(), ToastProps, toneByType, QueueContext, QueueContextType (+23 more)

### Community 16 - "Community 16"
Cohesion: 0.27
Nodes (8): OperatorPanel(), AttendanceTrackingScreen(), LoginModal(), LoginModalProps, loginSchema, useAuth(), useTodayQueue(), AppContent()

### Community 17 - "Community 17"
Cohesion: 0.35
Nodes (7): formatDate(), formatDateTime(), formatTime(), calculatePercentage(), formatCurrency(), classNames(), cn()

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (14): getAtendenteOrGuiche(), getGuicheForTicket(), INFO_SLIDES, NEWS_TICKER_TEXTS, PublicDisplayScreen(), PublicDisplayScreenProps, SlideItem, PANEL_CONFIG (+6 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, build:backend, build:frontend, dev:backend, dev:frontend (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (9): AuthResponse, CreateTicketRequest, CreateUserRequest, DashboardResponse, ErrorResponse, LoginRequest, RegisterRequest, UpdateTicketRequest (+1 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (7): HomeScreenProps, loginSchema, LoginScreen(), LoginScreenProps, SERVICES, TRANSLATIONS, Language

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (6): AttendanceTrackingScreen, MetricsDashboard, RestrictedArea(), ServiceManagementScreen, TvSettingsScreen, UserManagementScreen

### Community 24 - "Community 24"
Cohesion: 0.43
Nodes (3): useAsync(), useLocalStorage(), useWebSocket()

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (6): ClientConfig, Screen, Service, Ticket, User, UserType

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): ClientConfig, Ticket, User

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (3): QueueRoom, SocketEvents, SocketUser

## Knowledge Gaps
- **208 isolated node(s):** `createTicketSchema`, `updateTicketSchema`, `Ticket`, `TicketUserType`, `CreateTicketInput` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiClient` connect `Community 2` to `Community 12`, `Community 13`, `Community 22`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Ticket` connect `Community 14` to `Community 16`, `Community 9`, `Community 18`, `Community 13`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `Ticket` connect `Community 14` to `Community 9`, `Community 12`, `Community 13`, `Community 16`, `Community 18`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `createTicketSchema`, `updateTicketSchema`, `Ticket` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06948051948051948 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07878787878787878 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._