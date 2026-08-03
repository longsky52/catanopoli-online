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

  // 1. CREA LA STANZA E METTE IN ATTESA
  socket.on("createRoom", ({ roomName, roomPass, name, startMoney }) => {
    if (rooms[roomName]) {
      socket.emit("roomError", "Esiste già una stanza con questo nome!");
      return;
    }
    socket.join(roomName);
    rooms[roomName] = {
      pass: roomPass || "",
      status: "waiting", // Stato: In attesa di giocatori
      hostId: socket.id, // Chi ha creato la stanza comanda
      players: [
        {
          id: socket.id,
          name: name,
          money: startMoney,
          position: 0,
          color: "#bd2a2a",
          inJail: false,
          jailTurns: 0,
          bankrupt: false,
        },
      ],
      turnIndex: 0,
      properties: {},
    };

    io.emit("roomList", getPublicRooms());
    io.to(roomName).emit("waitingRoomUpdate", rooms[roomName]);
  });

  // 2. UNISCITI A UNA STANZA IN ATTESA
  socket.on("joinSpecificRoom", ({ roomName, roomPass, name, startMoney }) => {
    const roomData = rooms[roomName];

    if (!roomData) {
      socket.emit("roomError", "La stanza non esiste più!");
      return;
    }
    if (roomData.status !== "waiting") {
      socket.emit("roomError", "La partita è già iniziata, porte chiuse!");
      return;
    }
    if (roomData.pass && roomData.pass !== roomPass) {
      socket.emit("roomError", "Password errata!");
      return;
    }
    if (roomData.players.length >= 4) {
      socket.emit("roomError", "La stanza è al completo (max 4)!");
      return;
    }

    socket.join(roomName);
    const colors = ["#bd2a2a", "#2c4a8a", "#3b7a3b", "#d1b438"];
    const color = colors[roomData.players.length % colors.length];

    roomData.players.push({
      id: socket.id,
      name: name,
      money: startMoney,
      position: 0,
      color: color,
      inJail: false,
      jailTurns: 0,
      bankrupt: false,
    });

    io.emit("roomList", getPublicRooms());
    io.to(roomName).emit("waitingRoomUpdate", roomData);
  });

  // 3. L'HOST AVVIA LA PARTITA
  socket.on("hostStartGame", ({ roomName }) => {
    if (rooms[roomName] && rooms[roomName].hostId === socket.id) {
      rooms[roomName].status = "playing"; // Chiude le porte
      io.emit("roomList", getPublicRooms()); // Aggiorna la lobby pubblica togliendola
      io.to(roomName).emit("gameStarted", rooms[roomName]);
    }
  });

  // ==========================================
  // ✉️ I POSTINI DEGLI SCAMBI MULTIPLAYER (AGGIUNTI ORA!)
  // ==========================================
  socket.on("sendTradeOffer", (data) => {
    // Inoltra la proposta di scambio alla stanza
    io.to(data.room).emit("receiveTradeOffer", data);
  });

  socket.on("tradeAnswer", (data) => {
    // Inoltra la risposta (Accettato/Rifiutato) alla stanza
    io.to(data.room).emit("tradeResult", data);
  });
  // ==========================================

  // 4. MICROFONO E GIOCO
  socket.on("voiceReady", ({ room, peerId }) => {
    socket.to(room).emit("userVoiceReady", peerId);
  });

  socket.on("rollDice", ({ room, d1, d2 }) => {
    io.to(room).emit("diceRolled", { d1, d2, playerId: socket.id });
  });

  socket.on("syncAction", ({ room, players, properties, logMsg }) => {
    if (rooms[room]) {
      rooms[room].players = players;
      rooms[room].properties = properties;
      io.to(room).emit("stateSynced", { players, properties, logMsg });
    }
  });

  socket.on("endTurn", ({ room }) => {
    if (rooms[room]) {
      do {
        rooms[room].turnIndex =
          (rooms[room].turnIndex + 1) % rooms[room].players.length;
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
        if (giocatoriAttivi.length === 0) {
          delete rooms[roomName];
        } else if (room.status === "playing") {
          io.to(roomName).emit("updateState", room);
        } else {
          io.to(roomName).emit("waitingRoomUpdate", room);
        }

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
      // Mostra solo quelle non ancora iniziate
      list.push({
        name: r,
        playersCount: rooms[r].players.length,
        hasPass: rooms[r].pass !== "",
      });
    }
  }
  return list;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server Catanopoli Online attivo!`));
