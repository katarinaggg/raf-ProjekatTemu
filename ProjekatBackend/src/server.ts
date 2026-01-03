import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import http from "http";
import { Server } from "socket.io";

// ubacujemo rute
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";

const app = express();
const PORT = 3000;

// globalni middleware
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

app.use(errorHandler);

/*
// test ruta
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
*/

const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
