const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const rooms = {};

io.on("connection", (socket) => {
  socket.emit("roomList", getPublicRooms());

  socket.on("getRooms", () => {
    socket.emit("roomList", getPublicRooms());
  });

  // 1. CREA LA STANZA
  socket.on("createRoom", ({ roomName, roomPass, name, startMoney, gioco, tipoCarte, targetCarte, numPlayers }) => {
    if (rooms[roomName]) {
      socket.emit("roomError", "Esiste già una stanza con questo nome!");
      return;
    }
    socket.join(roomName);
    rooms[roomName] = {
      pass: roomPass || "",
      status: "waiting",
      hostId: socket.id,
      gioco: gioco || "catanopoli",
      tipoCarte: tipoCarte || "scopa",
      targetCarte: targetCarte || 11,
      maxPlayers: gioco === "carte" ? (numPlayers || 2) : 4, // 🔥 ORA IL SERVER SA SE SIETE IN 2 O IN 4!
      players: [
        {
          id: socket.id, name: name, money: startMoney, position: 0,
          color: "#bd2a2a", inJail: false, jailTurns: 0, bankrupt: false,
        },
      ],
      turnIndex: 0,
      properties: {},
    };

    io.emit("roomList", getPublicRooms());
    io.to(roomName).emit("waitingRoomUpdate", rooms[roomName]);
  });

  // 2. UNISCITI A UNA STANZA
  socket.on("joinSpecificRoom", ({ roomName, roomPass, name, startMoney }) => {
    const roomData = rooms[roomName];

    if (!roomData) { socket.emit("roomError", "Stanza inesistente!"); return; }
    if (roomData.status !== "waiting") { socket.emit("roomError", "Partita già iniziata!"); return; }
    if (roomData.pass && roomData.pass !== roomPass) { socket.emit("roomError", "Password errata!"); return; }
    
    // LIMITI GIOCATORI DINAMICI
    let maxP = roomData.maxPlayers || 4;
    if (roomData.players.length >= maxP) { socket.emit("roomError", `Stanza piena (max ${maxP})!`); return; }

    socket.join(roomName);
    const colors = ["#bd2a2a", "#2c4a8a", "#3b7a3b", "#d1b438"];
    const color = colors[roomData.players.length % colors.length];

    roomData.players.push({
      id: socket.id, name: name, money: startMoney, position: 0,
      color: color, inJail: false, jailTurns: 0, bankrupt: false,
    });

    io.emit("roomList", getPublicRooms());
    io.to(roomName).emit("waitingRoomUpdate", roomData);
  });

  // 3. L'HOST AVVIA LA PARTITA
  socket.on("hostStartGame", ({ roomName }) => {
    if (rooms[roomName] && rooms[roomName].hostId === socket.id) {
      rooms[roomName].status = "playing";
      io.emit("roomList", getPublicRooms());
      io.to(roomName).emit("gameStarted", rooms[roomName]);
    }
  });

  // ==========================================
  // 🃏 POSTINI PER IL MULTIPLAYER DELLE CARTE 
  // ==========================================
  socket.on("carteSyncInit", (data) => {
      socket.to(data.room).emit("riceviCarteSyncInit", data);
  });
  socket.on("carteAzione", (data) => {
      socket.to(data.room).emit("riceviCarteAzione", data);
  });
  // ==========================================

  socket.on("sendTradeOffer", (data) => { io.to(data.room).emit("receiveTradeOffer", data); });
  socket.on("tradeAnswer", (data) => { io.to(data.room).emit("tradeResult", data); });

  socket.on("voiceReady", ({ room, peerId }) => { socket.to(room).emit("userVoiceReady", peerId); });
  socket.on("rollDice", ({ room, d1, d2 }) => { io.to(room).emit("diceRolled", { d1, d2, playerId: socket.id }); });

  socket.on("syncAction", ({ room, players, properties, logMsg }) => {
    if (rooms[room]) {
      rooms[room].players = players; rooms[room].properties = properties;
      io.to(room).emit("stateSynced", { players, properties, logMsg });
    }
  });

  socket.on("endTurn", ({ room }) => {
    if (rooms[room]) {
      do { rooms[room].turnIndex = (rooms[room].turnIndex + 1) % rooms[room].players.length;
      } while (rooms[room].players[rooms[room].turnIndex].bankrupt);
      io.to(room).emit("updateState", rooms[room]);
    }
  });

  socket.on("disconnect", () => {
    for (const roomName in rooms) {
      const room = rooms[roomName];
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players[playerIndex].bankrupt = true;
        const giocatoriAttivi = room.players.filter((p) => !p.bankrupt);
        if (giocatoriAttivi.length === 0) { delete rooms[roomName]; } 
        else if (room.status === "playing") {
          io.to(roomName).emit("playerLeft", room.players[playerIndex].name); 
          io.to(roomName).emit("updateState", room);
        } else { io.to(roomName).emit("waitingRoomUpdate", room); }
        io.emit("roomList", getPublicRooms());
        break;
      }
    }
  });
});

function getPublicRooms() {
  const list = [];
  for (const r in rooms) {
    if (rooms[r].status === "waiting") {
      let iconaGioco = rooms[r].gioco === "carte" ? "🃏" : "🎲";
      list.push({ 
          name: iconaGioco + " " + r, 
          rawName: r, 
          playersCount: rooms[r].players.length, 
          hasPass: rooms[r].pass !== "", 
          gioco: rooms[r].gioco, 
          maxPlayers: rooms[r].maxPlayers || 4 
      });
    }
  }
  return list;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server Catanopoli Online attivo sulla porta ${PORT}!`));
