# Graph Report - apps  (2026-07-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 545 nodes · 893 edges · 35 communities (26 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `42beb334`
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

## God Nodes (most connected - your core abstractions)
1. `ApiClient` - 25 edges
2. `compilerOptions` - 16 edges
3. `compilerOptions` - 16 edges
4. `useTodayQueue()` - 15 edges
5. `Ticket` - 15 edges
6. `Logger` - 14 edges
7. `Service` - 13 edges
8. `useAuth()` - 11 edges
9. `config` - 10 edges
10. `Ticket` - 10 edges

## Surprising Connections (you probably didn't know these)
- `NameInputScreenProps` --references--> `Service`  [EXTRACTED]
  frontend/src/features/queue/components/NameInputScreen.tsx → frontend/src/shared/types/database.ts
- `ServiceSelectionScreenProps` --references--> `Service`  [EXTRACTED]
  frontend/src/features/queue/components/ServiceSelectionScreen.tsx → frontend/src/shared/types/database.ts
- `ServiceSelectionScreen()` --calls--> `useTodayQueue()`  [EXTRACTED]
  frontend/src/features/queue/components/ServiceSelectionScreen.tsx → frontend/src/features/queue/contexts/TodayQueueContext.tsx
- `AppContent()` --calls--> `useTodayQueue()`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/features/queue/contexts/TodayQueueContext.tsx
- `LoginScreen()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/features/auth/components/LoginScreen.tsx → frontend/src/features/auth/contexts/AuthContext.tsx

## Import Cycles
- 2-file cycle: `backend/src/db/index.ts -> backend/src/db/queries.ts -> backend/src/db/index.ts`

## Communities (35 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (33): supabase, config, missing, requiredEnvVars, createServer(), setupQueueHandlers(), errorHandler(), createRoutes() (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (37): createUser(), deleteUser(), getDashboard(), getMetrics(), listUsers(), updateUser(), login(), logout() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (11): AdminUser, createUserSchema, ROLE_LABELS, roleOptions, STATUS_CONFIG, statusOptions, updatePasswordSchema, UserDraft (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (29): dependencies, appwrite, date-fns, @emotion/react, @emotion/styled, html2canvas, jspdf, jspdf-autotable (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (27): dependencies, bcrypt, cors, dotenv, express, joi, jsonwebtoken, socket.io (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (21): AppError, createUser(), Dashboard, deleteUser(), getDashboard(), getMetrics(), listUsers(), mapToUser() (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (15): TicketScreenProps, Toast(), ToastProps, toneByType, QueueContext, QueueContextType, QueueProvider(), AlertLevel (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (11): ApiError, AuthenticationError, AuthorizationError, ConflictError, InternalServerError, NotFoundError, ValidationError, isValidEmail() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (12): AttendanceTrackingScreen(), STATUS_CONFIG, ConfirmationModal(), ConfirmationModalProps, Classification, OuvidoriaClassificationModalProps, ICON_OPTIONS, ServiceDraft (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (7): OperatorPanel(), loginSchema, LoginScreen(), LoginScreenProps, RestrictedArea(), useAuth(), TRANSLATIONS

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (9): HomeScreenProps, JaboataoPrevLogo(), LogoProps, NameInputScreenProps, PrioritySelectionScreen(), PrioritySelectionScreenProps, ServiceSelectionScreen(), ServiceSelectionScreenProps (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (5): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, LoadingProps, ModalProps

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (11): AuthContext, AuthContextType, AuthProvider(), AuthUser, AuditLogEntry, CallHistoryEntry, QueueState, Screen (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (8): getAtendenteOrGuiche(), getGuicheForTicket(), INFO_SLIDES, NEWS_TICKER_TEXTS, PublicDisplayScreen(), PublicDisplayScreenProps, SlideItem, PANEL_CONFIG

### Community 16 - "Community 16"
Cohesion: 0.35
Nodes (7): formatDate(), formatDateTime(), formatTime(), calculatePercentage(), formatCurrency(), classNames(), cn()

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (9): AuthResponse, CreateTicketRequest, CreateUserRequest, DashboardResponse, ErrorResponse, LoginRequest, RegisterRequest, UpdateTicketRequest (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (5): TodayQueueContext, TodayQueueContextType, TodayQueueProvider(), initializeSocket(), TicketStatus

### Community 20 - "Community 20"
Cohesion: 0.31
Nodes (6): FilterState, MetricsDashboard(), UserTypeSelectionScreen(), UserTypeSelectionScreenProps, useQueue(), UserType

### Community 23 - "Community 23"
Cohesion: 0.43
Nodes (3): useAsync(), useLocalStorage(), useWebSocket()

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (6): ClientConfig, Screen, Service, Ticket, User, UserType

### Community 25 - "Community 25"
Cohesion: 0.40
Nodes (4): ApiResponse, AttendanceRecord, Notification, User

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (3): ClientConfig, Ticket, User

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): QueueRoom, SocketEvents, SocketUser

## Knowledge Gaps
- **178 isolated node(s):** `name`, `version`, `description`, `main`, `type` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiClient` connect `Community 2` to `Community 11`, `Community 14`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Logger` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `Ticket` connect `Community 6` to `Community 9`, `Community 11`, `Community 15`, `Community 18`, `Community 20`, `Community 25`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _178 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06948051948051948 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08534850640113797 - nodes in this community are weakly interconnected._