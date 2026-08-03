# Graph Report - gerenciamento-senhas-jabprev  (2026-08-02)

## Corpus Check
- 110 files · ~40,314 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 578 nodes · 936 edges · 37 communities (29 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `638ab483`
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
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `ApiClient` - 25 edges
2. `compilerOptions` - 16 edges
3. `compilerOptions` - 16 edges
4. `useTodayQueue()` - 15 edges
5. `Ticket` - 15 edges
6. `Logger` - 14 edges
7. `Service` - 13 edges
8. `Ticket` - 11 edges
9. `useAuth()` - 11 edges
10. `config` - 10 edges

## Surprising Connections (you probably didn't know these)
- `FilterState` --references--> `UserType`  [EXTRACTED]
  apps/frontend/src/features/queue/components/MetricsDashboard.tsx → apps/frontend/src/shared/types/database.ts
- `RestrictedArea()` --calls--> `useAuth()`  [EXTRACTED]
  apps/frontend/src/features/queue/components/RestrictedArea.tsx → apps/frontend/src/features/auth/contexts/AuthContext.tsx
- `ServiceManagementScreen()` --calls--> `useTodayQueue()`  [EXTRACTED]
  apps/frontend/src/features/queue/components/ServiceManagementScreen.tsx → apps/frontend/src/features/queue/contexts/TodayQueueContext.tsx
- `LoginScreen()` --calls--> `useAuth()`  [EXTRACTED]
  apps/frontend/src/features/auth/components/LoginScreen.tsx → apps/frontend/src/features/auth/contexts/AuthContext.tsx
- `ServiceSelectionScreen()` --calls--> `useTodayQueue()`  [EXTRACTED]
  apps/frontend/src/features/queue/components/ServiceSelectionScreen.tsx → apps/frontend/src/features/queue/contexts/TodayQueueContext.tsx

## Import Cycles
- 2-file cycle: `apps/backend/src/db/index.ts -> apps/backend/src/db/queries.ts -> apps/backend/src/db/index.ts`

## Communities (37 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (41): createUser(), deleteUser(), getDashboard(), getMetrics(), listUsers(), updateUser(), login(), logout() (+33 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (36): supabase, config, missing, requiredEnvVars, AppError, errorHandler(), createUser(), Dashboard (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (11): AdminUser, createUserSchema, ROLE_LABELS, roleOptions, STATUS_CONFIG, statusOptions, updatePasswordSchema, UserDraft (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (33): dependencies, appwrite, date-fns, echarts, echarts-for-react, @emotion/react, @emotion/styled, framer-motion (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (14): createServer(), setupQueueHandlers(), createRoutes(), createApplication(), startServer(), LOG_LEVELS, Logger, SOCKET_EVENTS (+6 more)

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
Cohesion: 0.16
Nodes (10): HomeScreenProps, JaboataoPrevLogo(), LogoProps, NameInputScreenProps, PrioritySelectionScreen(), PrioritySelectionScreenProps, ServiceSelectionScreen(), ServiceSelectionScreenProps (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (5): ConfirmationModal(), ConfirmationModalProps, ICON_OPTIONS, ServiceDraft, ServiceManagementScreen()

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (5): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, LoadingProps, ModalProps

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (13): AuthContext, AuthContextType, AuthProvider(), AuthUser, root, rootElement, AuditLogEntry, CallHistoryEntry (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.23
Nodes (7): UserTypeSelectionScreen(), UserTypeSelectionScreenProps, TodayQueueContext, TodayQueueContextType, initializeSocket(), TicketStatus, UserType

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (16): STATUS_CONFIG, FilterState, MetricsDashboard(), TicketScreenProps, Toast(), ToastProps, toneByType, QueueContext (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.21
Nodes (9): OperatorPanel(), AttendanceTrackingScreen(), Classification, OuvidoriaClassificationModalProps, TicketScreen(), useAuth(), TodayQueueProvider(), useTodayQueue() (+1 more)

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
Nodes (5): loginSchema, LoginScreen(), LoginScreenProps, SERVICES, TRANSLATIONS

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (6): AttendanceTrackingScreen, MetricsDashboard, RestrictedArea(), ServiceManagementScreen, TvSettingsScreen, UserManagementScreen

### Community 24 - "Community 24"
Cohesion: 0.43
Nodes (3): useAsync(), useLocalStorage(), useWebSocket()

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (6): ClientConfig, Screen, Service, Ticket, User, UserType

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (7): ChartImages, generateExecutivePDFReport(), loadLogoBase64(), ReportFilterInfo, ReportMetrics, ServiceDistItem, TimeSeriesItem

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): ClientConfig, Ticket, User

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (3): QueueRoom, SocketEvents, SocketUser

### Community 35 - "Community 35"
Cohesion: 0.40
Nodes (4): ApiResponse, AttendanceRecord, Notification, User

## Knowledge Gaps
- **201 isolated node(s):** `ReportFilterInfo`, `ReportMetrics`, `ServiceDistItem`, `TimeSeriesItem`, `ChartImages` (+196 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiClient` connect `Community 2` to `Community 12`, `Community 22`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Ticket` connect `Community 14` to `Community 35`, `Community 12`, `Community 13`, `Community 15`, `Community 18`, `Community 26`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Ticket` connect `Community 14` to `Community 12`, `Community 13`, `Community 15`, `Community 16`, `Community 18`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `ReportFilterInfo`, `ReportMetrics`, `ServiceDistItem` to the rest of the system?**
  _201 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05563093622795115 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07764705882352942 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08534850640113797 - nodes in this community are weakly interconnected._