// ==========================================
// MOTORE FORZA 4 (TOTALITY GAMES) - V4 MULTIPLAYER FIX DI RETE
// ==========================================

const styleF4 = document.createElement('style');
styleF4.innerHTML = `
.f4-col { display: flex; flex-direction: column; gap: 6px; cursor: pointer; }
.f4-col:hover { background: rgba(255,255,255,0.05); border-radius: 8px; }
.f4-cell {
    width: clamp(35px, 10vw, 55px); height: clamp(35px, 10vw, 55px);
    background: var(--app-bg); border-radius: 50%;
    border: 3px solid rgba(0,0,0,0.6); box-shadow: inset 0 5px 10px rgba(0,0,0,0.8);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.f4-p1 { background: radial-gradient(circle at 30% 30%, #ff4b4b, #bd2a2a); box-shadow: inset -3px -3px 6px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.5); border-color: #5a1515; }
.f4-p2 { background: radial-gradient(circle at 30% 30%, #ffdf00, #d1b438); box-shadow: inset -3px -3px 6px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.5); border-color: #8c7820; }
.f4-win { animation: f4Blink 1s infinite alternate; border-color: white !important; }
@keyframes f4Blink { 0% { filter: brightness(1); transform: scale(1); } 100% { filter: brightness(1.5); transform: scale(1.1); } }
`;
document.head.appendChild(styleF4);

const ROWS = 6;
const COLS = 7;
let board = [];
let turnoDiChiF4 = "p1"; // p1 (Rosso/Host), p2 (Giallo/Guest)
let isMultiplayerF4 = false;
let isHostF4 = false;
let roomF4 = "";
let gameOverF4 = false;
let diffBotF4 = "medio";
let nomeAvvF4 = "";

window.avviaPartitaDaMenuForza4 = function() {
    let diff = document.getElementById("forza4-setup-diff").value;
    document.getElementById("forza4-setup-menu").style.display = "none";
    document.getElementById("forza4-ui").style.display = "flex";
    avviaPartitaForza4(false, { diff: diff });
};

window.avviaPartitaForza4 = function(isMulti, dati) {
    isMultiplayerF4 = isMulti;
    turnoDiChiF4 = "p1";
    gameOverF4 = false;
    
    let nomeUtente = document.getElementById("setup-name") ? document.getElementById("setup-name").value : "Tu";
    if(!nomeUtente) nomeUtente = "Tu";
    let prevImg = document.getElementById("preview-foto");
    let fotoSrc = (prevImg && prevImg.style.display !== "none" && prevImg.src) ? prevImg.src : (typeof window.myPhotoBase64 !== 'undefined' ? window.myPhotoBase64 : "");
    let fotoTag = fotoSrc ? `<img src="${fotoSrc}" style="width:28px; height:28px; border-radius:50%; vertical-align:middle; margin-right:5px; border:2px solid #bd2a2a; object-fit:cover;">` : `👤`;

    if (isMulti) {
        // 🔥 Il nome esatto della stanza da Socket.io!
        roomF4 = typeof myRoom !== 'undefined' ? myRoom : "StanzaSconosciuta";
        isHostF4 = (dati.hostId === socket.id);
        
        let opp = dati.players.find(p => p.id !== socket.id);
        nomeAvvF4 = opp ? opp.name : "Avversario";
        
        let mioColore = isHostF4 ? "🔴" : "🟡";
        let suoColore = isHostF4 ? "🟡" : "🔴";
        
        document.getElementById("forza4-opponent-name").innerHTML = `${fotoTag} <b style="color:white;">${nomeUtente} (${mioColore})</b> vs <b style="color:#d1b438;">${nomeAvvF4} (${suoColore})</b>`;
        
        // 🌐 ASCIOLTO I PACCHETTI DELLA RETE 🌐
        socket.off("riceviF4SyncInit");
        socket.on("riceviF4SyncInit", (data) => {
            if (!isHostF4) {
                board = data.board; turnoDiChiF4 = data.turno; gameOverF4 = false;
                disegnaBoardF4();
            }
        });

        socket.off("riceviF4Mossa");
        socket.on("riceviF4Mossa", (data) => {
            // Un gettone è caduto nello schermo dell'avversario: lo replico qua!
            eseguiMossa(data.col, data.giocatore);
        });
        
        socket.off("riceviF4Restart");
        socket.on("riceviF4Restart", () => {
            resettaPartitaF4(false); 
        });

        socket.off("playerLeft");
        socket.on("playerLeft", (playerName) => {
            if (isMultiplayerF4 && document.getElementById("forza4-ui").style.display === "flex") {
                alert(`L'avversario ${playerName} è fuggito! Hai vinto a tavolino.`);
                window.esciDaForza4();
            }
        });

    } else {
        diffBotF4 = dati.diff || "medio";
        nomeAvvF4 = "Bot Zio Turi 🤖";
        document.getElementById("forza4-opponent-name").innerHTML = `${fotoTag} <b style="color:white;">${nomeUtente} (🔴)</b> vs <b style="color:#d1b438;">${nomeAvvF4} (🟡)</b> <span style='font-size:0.7rem; color:#aaa;'>(${diffBotF4.toUpperCase()})</span>`;
    }

    let mediaContainer = document.getElementById("forza4-media-buttons");
    if(mediaContainer) mediaContainer.style.display = isMulti ? "flex" : "none";
    
    inizializzaBoardF4();
};

function inizializzaBoardF4() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameOverF4 = false;
    turnoDiChiF4 = "p1"; // Inizia sempre l'Host o Tu contro il Bot (p1)
    
    disegnaBoardF4();

    if (isMultiplayerF4 && isHostF4) {
        socket.emit("f4SyncInit", { room: roomF4, board: board, turno: turnoDiChiF4 });
    }
}

function disegnaBoardF4() {
    let b = document.getElementById("forza4-board");
    b.innerHTML = "";
    
    for (let col = 0; col < COLS; col++) {
        let colDiv = document.createElement("div");
        colDiv.className = "f4-col";
        colDiv.onclick = () => giocaColonna(col);
        
        for (let row = 0; row < ROWS; row++) {
            let cellDiv = document.createElement("div");
            cellDiv.className = "f4-cell";
            cellDiv.id = `f4-c-${row}-${col}`;
            
            if (board[row][col] === "p1") cellDiv.classList.add("f4-p1");
            else if (board[row][col] === "p2") cellDiv.classList.add("f4-p2");
            
            colDiv.appendChild(cellDiv);
        }
        b.appendChild(colDiv);
    }
    
    aggiornaUIF4();
}

function aggiornaUIF4() {
    let ind = document.getElementById("forza4-turn-indicator");
    if (gameOverF4) return;

    if (isMultiplayerF4) {
        let mioTurno = (isHostF4 && turnoDiChiF4 === "p1") || (!isHostF4 && turnoDiChiF4 === "p2");
        if (mioTurno) {
            ind.innerHTML = `<span style="color:#44ff44;">Tuo Turno! Inserisci il gettone.</span>`;
        } else {
            ind.innerHTML = `<span style="color:#ffdf00;">Attendi la mossa dell'avversario...</span>`;
        }
    } else {
        if (turnoDiChiF4 === "p1") ind.innerHTML = `<span style="color:#44ff44;">Tuo Turno! Inserisci il gettone.</span>`;
        else ind.innerHTML = `<span style="color:#ffdf00;">Il Bot sta calcolando...</span>`;
    }
}

function giocaColonna(col) {
    if (gameOverF4) return;
    
    if (isMultiplayerF4) {
        let mioTurno = (isHostF4 && turnoDiChiF4 === "p1") || (!isHostF4 && turnoDiChiF4 === "p2");
        if (!mioTurno) return; // Blocco anti-spam
        
        // Determino chi sono in modo fisso per questa mossa
        let chiGioca = isHostF4 ? "p1" : "p2";
        
        // Se la mossa è valida, aggiorniamo il gioco e la SPEDIAMO al Server! 🚀
        if (eseguiMossa(col, chiGioca)) {
            socket.emit("f4Mossa", { room: roomF4, col: col, giocatore: chiGioca });
        }
    } else {
        if (turnoDiChiF4 !== "p1") return;
        if (eseguiMossa(col, "p1")) {
            if (!gameOverF4) {
                turnoDiChiF4 = "p2"; // Passa il turno al Bot
                aggiornaUIF4();
                setTimeout(faiMossaBot, 800);
            }
        }
    }
}

function eseguiMossa(col, giocatore) {
    let rowPlaced = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === null) {
            board[r][col] = giocatore;
            rowPlaced = r;
            break;
        }
    }
    
    if (rowPlaced === -1) return false; 
    
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('dadi'); } catch(e){} }
    disegnaBoardF4(); 
    
    let winCells = controllaVittoriaF4(rowPlaced, col, giocatore);
    if (winCells) {
        gameOverF4 = true;
        winCells.forEach(c => {
            document.getElementById(`f4-c-${c.r}-${c.c}`).classList.add("f4-win");
        });
        
        let msg = "";
        if (isMultiplayerF4) {
            let iWon = (isHostF4 && giocatore === "p1") || (!isHostF4 && giocatore === "p2");
            if(iWon) { if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('cassa'); }catch(e){} }
            else { if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('sconfitta'); }catch(e){} }
            msg = iWon ? "🏆 HAI VINTO!" : "☠️ HA VINTO " + nomeAvvF4.toUpperCase();
        } else {
            msg = giocatore === "p1" ? "🏆 HAI BATTUTO IL BOT!" : "☠️ ZIO TURI TI HA STRACCIATO!";
        }
        
        document.getElementById("forza4-turn-indicator").innerHTML = `<b>${msg}</b> <button onclick="richiediRestartF4()" style="margin-left:10px; background:#c99c51; color:black; border:none; border-radius:4px; padding:4px 8px; font-weight:bold; cursor:pointer;">RIGIOCA</button>`;
        return true;
    }
    
    let isDraw = board[0].every(c => c !== null);
    if (isDraw) {
        gameOverF4 = true;
        document.getElementById("forza4-turn-indicator").innerHTML = `<b>🤝 PAREGGIO! TABELLONE PIENO.</b> <button onclick="richiediRestartF4()" style="margin-left:10px; background:#c99c51; color:black; border:none; border-radius:4px; padding:4px 8px; font-weight:bold; cursor:pointer;">RIGIOCA</button>`;
        return true;
    }
    
    // Inverti Turno!
    turnoDiChiF4 = (giocatore === "p1") ? "p2" : "p1";
    aggiornaUIF4();
    return true;
}

window.richiediRestartF4 = function() {
    if(isMultiplayerF4 && socket) {
        socket.emit("f4Restart", { room: roomF4 });
    }
    resettaPartitaF4(true);
}

function resettaPartitaF4(chiEmette) {
    inizializzaBoardF4();
}

function controllaVittoriaF4(r, c, gioca) {
    const dir = [
        [[0,1], [0,-1]], // Orizzontale
        [[1,0], [-1,0]], // Verticale
        [[1,1], [-1,-1]], // Diagonale \
        [[1,-1], [-1,1]]  // Diagonale /
    ];

    for (let d of dir) {
        let count = 1;
        let winArray = [{r:r, c:c}];
        
        for (let s of d) {
            let dr = s[0]; let dc = s[1];
            let nr = r + dr; let nc = c + dc;
            while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === gioca) {
                count++;
                winArray.push({r:nr, c:nc});
                nr += dr; nc += dc;
            }
        }
        if (count >= 4) return winArray;
    }
    return null;
}

window.esciDaForza4 = function() {
    if (confirm("Vuoi abbandonare la partita e tornare al Menu?")) {
        if(isMultiplayerF4 && socket) socket.disconnect(); 
        window.location.reload();
    }
};

// ==========================
// IA BOT (FORZA 4)
// ==========================
function faiMossaBot() {
    if(gameOverF4 || isMultiplayerF4) return;

    let availableCols = [];
    for(let c=0; c<COLS; c++) {
        if(board[0][c] === null) availableCols.push(c);
    }
    if(availableCols.length === 0) return;

    let colScelta = -1;

    if (diffBotF4 === "facile") {
        colScelta = availableCols[Math.floor(Math.random() * availableCols.length)];
    } else {
        colScelta = trovaMossaVincente("p2", availableCols);
        
        if (colScelta === -1) {
            colScelta = trovaMossaVincente("p1", availableCols);
        }

        if (colScelta === -1) {
            if (diffBotF4 === "difficile") {
                let pref = [3, 2, 4, 1, 5, 0, 6];
                for(let c of pref) {
                    if (availableCols.includes(c)) { colScelta = c; break; }
                }
            } else {
                colScelta = availableCols[Math.floor(Math.random() * availableCols.length)];
            }
        }
    }

    eseguiMossa(colScelta, "p2");
    
    if(!gameOverF4) {
        turnoDiChiF4 = "p1";
        aggiornaUIF4();
    }
}

function trovaMossaVincente(giocatore, disponibili) {
    for(let c of disponibili) {
        let rDrop = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][c] === null) { rDrop = r; break; }
        }
        if (rDrop !== -1) {
            board[rDrop][c] = giocatore; // Simula
            let isWin = controllaVittoriaF4(rDrop, c, giocatore);
            board[rDrop][c] = null; // Ripristina
            if (isWin) return c;
        }
    }
    return -1;
}
