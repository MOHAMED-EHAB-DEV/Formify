const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-form", (formId) => {
      console.log(`Client ${socket.id} joining form-${formId}`);
      socket.join(`form-${formId}`);
      console.log(`Client ${socket.id} joined form-${formId}`);

      console.log("Socket rooms:", Array.from(socket.rooms));
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client ${socket.id} disconnected:`, reason);
    });

    socket.on("error", (error) => {
      console.error(`Socket ${socket.id} error:`, error);
    });

    socket.onAny((eventName, ...args) => {
      console.log(`Socket ${socket.id} event:`, eventName, args);
    });
  });

  // Make io accessible to our route
  global.io = io;

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
