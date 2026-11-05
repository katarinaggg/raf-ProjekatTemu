# Temu sa Temua – Full-Stack Marketplace (Vue 3 + Express)

A small full-stack marketplace web application built for the **Scripting Languages (Skript jezici)** course at the Faculty of Computing (RAF). Users can register, log in, publish products, browse and filter the product catalogue, buy products from other users and review their order history. Stock changes caused by purchases are pushed to all connected clients in real time via **Socket.IO**.

The project consists of two independent applications that communicate over HTTP/JSON and WebSockets:

| Part | Folder | Stack |
| --- | --- | --- |
| REST API + real-time server | [`ProjekatBackend/`](ProjekatBackend) | Node.js, TypeScript, Express 5, Socket.IO |
| Single-page application | [`ProjekatFrontend/`](ProjekatFrontend) | Vue 3, TypeScript, Vite, Vue Router, Pinia, Socket.IO client |

> **Note:** The repository also contains a separate folder, `uslovniDomaci/`, with an additional course assignment. It is not related to the main project and is not described in this README.

---

## Table of Contents

- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Backend](#backend)
- [Frontend](#frontend)
- [Backend–Frontend Communication](#backendfrontend-communication)
- [How It Works](#how-it-works)
- [Installation and Setup](#installation-and-setup)
- [How to Run](#how-to-run)
- [Limitations](#limitations)
- [Author](#author)

---

## Key Features

- **User registration and login** – username/password accounts with validation on both client and server; login returns a JWT-style bearer token.
- **Persistent session on the client** – the token, username and user ID are stored in `localStorage` and restored when the app starts.
- **Product catalogue** – paginated product grid (10 items per page) sorted by newest first, with an "OUT OF STOCK" badge for sold-out items.
- **Filtering** – "All" products, "My Gallery" (products created by the logged-in user), or products of any creator by clicking the creator's name.
- **Product management (CRUD)** – create a product with live form validation and image preview, edit it (full edit on the detail page or inline title edit in the grid) and delete it. Only the product owner can edit or delete.
- **Purchasing** – buy a chosen quantity of another user's product; the server checks ownership and stock, computes the order value and decreases the stock.
- **Real-time stock updates** – after every purchase the backend broadcasts a `product:update` event and every open product list / product page updates the displayed quantity without reloading.
- **Order history** – the "My Profile" page shows the user's orders with pagination, total value, unit price, quantity and relative time ("5 min ago").
- **Consistent error handling** – the API returns machine-readable error codes that the frontend maps to user-friendly toast notifications.

## Technologies Used

**Backend** (`ProjekatBackend/package.json`)

| Technology | Purpose |
| --- | --- |
| Node.js + TypeScript 5.9 (strict mode) | Runtime and language |
| Express 5 | HTTP server, routing, middleware |
| Socket.IO 4.8 | Real-time server → client events |
| cors | Cross-origin requests from the Vite dev server |
| ts-node-dev | Development server with automatic restart |
| Node `crypto.randomUUID` | ID generation for users, products and orders |

**Frontend** (`ProjekatFrontend/package.json`)

| Technology | Purpose |
| --- | --- |
| Vue 3.5 (Composition API, `<script setup>`) | UI framework |
| TypeScript 5.9 + vue-tsc | Static typing and type checking |
| Vite 7 | Dev server and production build |
| Vue Router 4 | Client-side routing with lazy-loaded views |
| Pinia 3 | Global state (authentication, toast notifications) |
| socket.io-client 4.8 | Receiving real-time stock updates |
| Fetch API | HTTP communication with the backend |
| ESLint 9, Prettier, EditorConfig | Linting and formatting |

## Project Structure

```text
.
├── ProjekatBackend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts              # Entry point: Express app, routers, error handler, Socket.IO
│       ├── routes/                # auth.ts, products.ts, orders.ts – URL → middleware → controller
│       ├── controllers/           # authController, productsController, ordersController – business logic
│       ├── middleware/
│       │   ├── requireAuth.ts     # Reads Bearer token, attaches userId to the request
│       │   └── errorHandler.ts    # Converts thrown { code } objects into { failed: true, code }
│       ├── data/                  # In-memory "database": users, products (seeded), orders
│       ├── types/                 # DTOs and the ErrorCode union type
│       └── utils/jwtLike.ts       # Builds a JWT-formatted token (header.payload.signature)
│
├── ProjekatFrontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.ts                # Entry point: creates app, installs Pinia + router, restores session
│       ├── App.vue                # Layout: navbar, <RouterView>, toast, footer
│       ├── api/client.ts          # Generic typed fetch wrapper (apiGet/apiPost/apiPatch/apiDelete)
│       ├── socket.ts              # Shared Socket.IO client instance
│       ├── router/index.ts        # Route definitions
│       ├── stores/                # auth.ts, toast.ts (Pinia)
│       ├── utils/errorHandler.ts  # Error code → message mapping
│       ├── components/            # AppNavbar, AppFooter, AppToast
│       └── views/                 # Home, Login, Register, Products, Product, CreateProduct, MyProfile
│
└── uslovniDomaci/                 # Separate course assignment (not part of this project)
```

## Backend

The backend follows a layered **routes → middleware → controllers → data** structure.

- **Entry point** – `src/server.ts` creates the Express app, registers global middleware (`cors()`, `express.json()`), mounts the routers under `/auth`, `/products` and `/orders`, registers the global `errorHandler`, wraps the app in a Node `http` server and attaches a Socket.IO server to it. The server listens on port **3000**.
- **Authentication** – `POST /auth/login` returns a token built by `createJwtLikeToken` (`utils/jwtLike.ts`) whose payload contains `user_id` and `username`. Protected routes use the `requireAuth` middleware, which reads the `Authorization: Bearer <token>` header, decodes the payload and attaches `userId` to the request.
- **Authorization** – controllers enforce ownership rules: only the creator can update or delete a product, a user cannot buy their own product, and users can only read their own orders (`NOT_YOURS`).
- **Validation** – every controller validates input types and ranges (e.g. username 2–32 chars, password 8–128, title 1–40, description ≤ 200, positive price/quantity, valid image URL via the `URL` constructor).
- **Error handling** – controllers `throw { code }` with a value from the `ErrorCode` union type; `middleware/errorHandler.ts` turns it into `{ "failed": true, "code": "..." }`.
- **Data storage** – data is kept **in memory** in arrays exported from `src/data/`. The server starts with one demo user and four seeded products (see `src/data/users.ts` and `src/data/products.ts`); all data is reset on restart.

### API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | – | Create an account. Body: `{ username, password }` → `{ failed: false, user_id }` |
| `POST` | `/auth/login` | – | Log in. Body: `{ username, password }` → `{ failed: false, token }` |
| `GET` | `/products` | – | List products. Query: `page`, `limit` (default 10, max 25), `creator`, `older_first` → `{ failed: false, products, total }` |
| `GET` | `/products/:productId` | – | Get one product → `{ failed: false, product }` |
| `POST` | `/products` | Bearer | Create a product. Body: `{ title, description?, price, quantity, image_url }` → `{ failed: false, product_id }` |
| `PATCH` | `/products/:productId` | Bearer (owner) | Partially update any of the product fields → `{ failed: false }` |
| `DELETE` | `/products/:productId` | Bearer (owner) | Delete a product → `{ failed: false }` |
| `POST` | `/orders` | Bearer | Buy a product. Body: `{ product_id, quantity }` → `{ failed: false, order }` and emits `product:update` |
| `GET` | `/orders/:userId` | Bearer (same user) | List the user's orders. Query: `page`, `limit` → `{ orders, total }` |

**Error codes:** `DUPLICATE_USERNAME`, `BAD_IMAGE_DATA`, `LOGGED_IN`, `INCORRECT_CREDENTIALS`, `INVALID_DATA`, `NO_SUCH_ENTITY`, `NOT_YOURS`, `NOT_AUTHENTICATED`, `OUT_OF_STOCK`, `INTERNAL_ERROR`.

**Socket.IO event:** `product:update` – payload `{ productId, quantity }`, broadcast to all clients after a successful order.

## Frontend

- **Entry point** – `src/main.ts` creates the Vue app, installs Pinia and Vue Router, calls `useAuthStore().restore()` to reload the session from `localStorage`, and mounts the app.
- **Routing** (`src/router/index.ts`) – all views are lazy-loaded:

  | Path | View | Purpose |
  | --- | --- | --- |
  | `/` | `HomeView` | Landing page with a "Shop Now" call to action |
  | `/login`, `/register` | `LoginView`, `RegisterView` | Authentication forms |
  | `/products` | `ProductsView` | Paginated catalogue, filters, inline edit/delete for owners |
  | `/products/:id` | `ProductView` | Product details, buy, full edit, delete |
  | `/create` | `CreateProductView` | New product form with live validation and image preview |
  | `/me` | `MyProfileView` | Order history with pagination |
  | any other path | – | Redirects to `/` |

- **State management** – Pinia stores: `auth` (token, username, userId, loading, error; `login`, `logout`, `restore` actions) and `toast` (global info/error notifications that hide automatically). Page-level state lives in each view via `ref`, `reactive`, `computed` and `watch`.
- **API layer** – `src/api/client.ts` exposes a generic `request<T>()` function and typed helpers `apiGet`, `apiPost`, `apiPatch`, `apiDelete`. It builds the query string, sets JSON headers, adds the bearer token, parses the response and throws an `ApiError` when the response contains `failed: true`.
- **Validation** – forms validate input on blur and disable the submit button until the input is valid (mirroring the backend rules, plus password confirmation on registration and an integer-quantity check on product creation).
- **UI** – responsive layout with a sticky navbar that changes based on login state, product cards, pagination controls and toast notifications.

## Backend–Frontend Communication

```text
 Vue view ──► api/client.ts (fetch, JSON, Bearer token) ──HTTP──► Express router
                                                                    │
                                                         requireAuth (protected routes)
                                                                    │
                                                              Controller ──► in-memory data
                                                                    │
 Toast / re-render ◄── ApiError or typed data ◄──── JSON ◄──────────┘  (or errorHandler → { failed, code })

 ProductsView / ProductView ◄── socket.io-client ◄── WebSocket ◄── io.emit('product:update') after an order
```

- All requests and responses use **JSON**. The base URL (`http://localhost:3000`) is set in `ProjekatFrontend/src/api/client.ts` and `ProjekatFrontend/src/socket.ts`.
- Authenticated requests send `Authorization: Bearer <token>`. The frontend decodes the token payload to obtain `user_id`, which it uses to show owner-only controls, to filter "My Gallery" and to request `/orders/:userId`.
- Every error response has the shape `{ "failed": true, "code": "<ERROR_CODE>" }`. `client.ts` turns it into a thrown error and `utils/errorHandler.ts` maps the code to a readable message shown in a toast.

## How It Works

**Buying a product (end-to-end):**

1. On `/products/:id`, `ProductView` loads the product with `GET /products/:id` and subscribes to the `product:update` socket event.
2. The user picks a quantity and clicks **Buy**. The button is disabled when the user is not logged in, owns the product or the product is out of stock.
3. `buyProduct()` sends `POST /orders` with the bearer token.
4. `requireAuth` extracts the user ID from the token; `createOrder` validates the quantity, checks that the product exists, that it is not the buyer's own product and that enough stock is available, computes `value = price × quantity` on the server, decreases the stock and stores the order.
5. The server broadcasts `product:update { productId, quantity }` and returns the order summary.
6. The buyer sees a success toast and the refreshed product; every other user viewing the product list or that product page sees the new stock (or the "OUT OF STOCK" badge) immediately.

**Logging in:** `LoginView` validates the form → `auth.login()` calls `POST /auth/login` → the token is stored in the Pinia store and `localStorage` → the navbar switches to "My Profile" / "Logout" and the user is redirected to the home page.

## Installation and Setup

**Prerequisites**

- [Node.js](https://nodejs.org/) `^20.19.0` or `>=22.12.0` (required by the frontend's `engines` field / Vite 7) and npm.

**Install dependencies** (once per application):

```bash
cd ProjekatBackend
npm install

cd ../ProjekatFrontend
npm install
```

No environment variables or database are required. The backend port (`3000`) and the API URL used by the frontend are hard-coded in `ProjekatBackend/src/server.ts`, `ProjekatFrontend/src/api/client.ts` and `ProjekatFrontend/src/socket.ts`.

## How to Run

Start the two applications in separate terminals.

**1. Backend** (runs on `http://localhost:3000`):

```bash
cd ProjekatBackend
npm run dev
```

**2. Frontend** (Vite dev server, by default `http://localhost:5173`):

```bash
cd ProjekatFrontend
npm run dev
```

Open the URL printed by Vite in the browser. You can register a new account, or use the demo account seeded in `ProjekatBackend/src/data/users.ts`, which owns the four sample products.

**Other frontend scripts**

| Command | Description |
| --- | --- |
| `npm run build` | Type-check with `vue-tsc` and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run format` | Format `src/` with Prettier |

The backend only defines a `dev` script; there is no production build or start script.

## Limitations

This is an educational project, and several parts are intentionally simplified:

- **In-memory storage** – all users, products and orders are lost when the backend restarts.
- **Simplified authentication** – the token has a JWT format but uses a placeholder signature that is not verified, and passwords are stored in plain text. It is not suitable for production.
- **Error status codes** – all API errors are returned with HTTP status `400`; the error type is carried in the `code` field.
- **No automated tests.**
- **Hard-coded configuration** – the API URL and port are not read from environment variables.

## Author

**Katarina Gordić** – Scripting Languages (Skript jezici) course project, Faculty of Computing (RAF), Belgrade.
