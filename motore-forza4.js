// ==========================================
// MOTORE FORZA 4 (TOTALITY GAMES) - V5 SQUALO MINIMAX
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
        roomF4 = typeof myRoom !== 'undefined' ? myRoom : "StanzaSconosciuta";
        isHostF4 = (dati.hostId === socket.id);
        let opp = dati.players.find(p => p.id !== socket.id);
        nomeAvvF4 = opp ? opp.name : "Avversario";
        let mioColore = isHostF4 ? "🔴" : "🟡";
        let suoColore = isHostF4 ? "🟡" : "🔴";
        document.getElementById("forza4-opponent-name").innerHTML = `${fotoTag} <b style="color:white;">${nomeUtente} (${mioColore})</b> vs <b style="color:#d1b438;">${nomeAvvF4} (${suoColore})</b>`;
        
        socket.off("riceviF4SyncInit");
        socket.on("riceviF4SyncInit", (data) => {
            if (!isHostF4) { board = data.board; turnoDiChiF4 = data.turno; gameOverF4 = false; disegnaBoardF4(); }
        });
        socket.off("riceviF4Mossa");
        socket.on("riceviF4Mossa", (data) => { eseguiMossa(data.col, data.giocatore); });
        socket.off("riceviF4Restart");
        socket.on("riceviF4Restart", () => { resettaPartitaF4(false); });
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
    turnoDiChiF4 = "p1";
    disegnaBoardF4();
    if (isMultiplayerF4 && isHostF4) socket.emit("f4SyncInit", { room: roomF4, board: board, turno: turnoDiChiF4 });
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
        if (mioTurno) ind.innerHTML = `<span style="color:#44ff44;">Tuo Turno! Inserisci il gettone.</span>`;
        else ind.innerHTML = `<span style="color:#ffdf00;">Attendi la mossa dell'avversario...</span>`;
    } else {
        if (turnoDiChiF4 === "p1") ind.innerHTML = `<span style="color:#44ff44;">Tuo Turno! Inserisci il gettone.</span>`;
        else ind.innerHTML = `<span style="color:#ffdf00;">Il Bot sta calcolando... 🧠</span>`;
    }
}

function giocaColonna(col) {
    if (gameOverF4) return;
    if (isMultiplayerF4) {
        let mioTurno = (isHostF4 && turnoDiChiF4 === "p1") || (!isHostF4 && turnoDiChiF4 === "p2");
        if (!mioTurno) return;
        let chiGioca = isHostF4 ? "p1" : "p2";
        if (eseguiMossa(col, chiGioca)) socket.emit("f4Mossa", { room: roomF4, col: col, giocatore: chiGioca });
    } else {
        if (turnoDiChiF4 !== "p1") return;
        if (eseguiMossa(col, "p1")) {
            if (!gameOverF4) {
                turnoDiChiF4 = "p2";
                aggiornaUIF4();
                setTimeout(faiMossaBot, 100); // Passa la palla al cervellone
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
        winCells.forEach(c => { document.getElementById(`f4-c-${c.r}-${c.c}`).classList.add("f4-win"); });
        let msg = "";
        if (isMultiplayerF4) {
            let iWon = (isHostF4 && giocatore === "p1") || (!isHostF4 && giocatore === "p2");
            if(iWon) { if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('cassa'); }catch(e){} }
            else { if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('sconfitta'); }catch(e){} }
            msg = iWon ? "🏆 HAI VINTO!" : "☠️ HA VINTO " + nomeAvvF4.toUpperCase();
        } else {
            if(giocatore === "p1") { if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('cassa'); }catch(e){} }
            else { if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('sconfitta'); }catch(e){} }
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
    
    turnoDiChiF4 = (giocatore === "p1") ? "p2" : "p1";
    aggiornaUIF4();
    return true;
}

window.richiediRestartF4 = function() {
    if(isMultiplayerF4 && socket) socket.emit("f4Restart", { room: roomF4 });
    resettaPartitaF4(true);
}
function resettaPartitaF4(chiEmette) { inizializzaBoardF4(); }

function controllaVittoriaF4(r, c, gioca) {
    const dir = [ [[0,1], [0,-1]], [[1,0], [-1,0]], [[1,1], [-1,-1]], [[1,-1], [-1,1]] ];
    for (let d of dir) {
        let count = 1; let winArray = [{r:r, c:c}];
        for (let s of d) {
            let dr = s[0]; let dc = s[1]; let nr = r + dr; let nc = c + dc;
            while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === gioca) {
                count++; winArray.push({r:nr, c:nc}); nr += dr; nc += dc;
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
// 🧠 INTELLIGENZA ARTIFICIALE BOT (MINIMAX ALPHA-BETA)
// ==========================

function getMosseValide(b) {
    let mosse = [];
    let ordine = [3, 2, 4, 1, 5, 0, 6]; // Controlla prima il centro
    for(let c of ordine) { if(b[0][c] === null) mosse.push(c); }
    return mosse;
}

function getRigaVuota(b, c) {
    for (let r = ROWS - 1; r >= 0; r--) { if (b[r][c] === null) return r; }
    return -1;
}

function controllaVittoriaSimulata(b, r, c, gioca) {
    const dir = [ [[0,1], [0,-1]], [[1,0], [-1,0]], [[1,1], [-1,-1]], [[1,-1], [-1,1]] ];
    for (let d of dir) {
        let count = 1;
        for (let s of d) {
            let dr = s[0]; let dc = s[1]; let nr = r + dr; let nc = c + dc;
            while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === gioca) {
                count++; nr += dr; nc += dc;
            }
        }
        if (count >= 4) return true;
    }
    return false;
}

function punteggioFinestra(finestra, pezzo) {
    let oppPezzo = (pezzo === "p1") ? "p2" : "p1";
    let countPezzo = 0; let countVuoti = 0; let countOpp = 0;
    for(let i=0; i<4; i++) {
        if(finestra[i] === pezzo) countPezzo++;
        else if(finestra[i] === null) countVuoti++;
        else if(finestra[i] === oppPezzo) countOpp++;
    }
    let punteggio = 0;
    if (countPezzo === 4) punteggio += 100;
    else if (countPezzo === 3 && countVuoti === 1) punteggio += 5;
    else if (countPezzo === 2 && countVuoti === 2) punteggio += 2;
    if (countOpp === 3 && countVuoti === 1) punteggio -= 80; // Blocca i 3 avversari!
    return punteggio;
}

function valutaScacchiera(b, pezzo) {
    let punteggio = 0;
    let countCentro = 0;
    for(let r=0; r<ROWS; r++) if(b[r][3] === pezzo) countCentro++;
    punteggio += countCentro * 3;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            punteggio += punteggioFinestra([b[r][c], b[r][c+1], b[r][c+2], b[r][c+3]], pezzo);
        }
    }
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r <= ROWS - 4; r++) {
            punteggio += punteggioFinestra([b[r][c], b[r+1][c], b[r+2][c], b[r+3][c]], pezzo);
        }
    }
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            punteggio += punteggioFinestra([b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]], pezzo);
        }
    }
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            punteggio += punteggioFinestra([b[r+3][c], b[r+2][c+1], b[r+1][c+2], b[r][c+3]], pezzo);
        }
    }
    return punteggio;
}

function minimax(boardStato, profondita, alpha, beta, isMaximizing, lastR, lastC) {
    let isWinP2 = lastR !== -1 ? controllaVittoriaSimulata(boardStato, lastR, lastC, "p2") : false;
    let isWinP1 = lastR !== -1 ? controllaVittoriaSimulata(boardStato, lastR, lastC, "p1") : false;

    if (isWinP2) return 10000000 + profondita; 
    if (isWinP1) return -10000000 - profondita;

    let mosse = getMosseValide(boardStato);
    if (mosse.length === 0) return 0; 
    if (profondita === 0) return valutaScacchiera(boardStato, "p2");

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (let c of mosse) {
            let r = getRigaVuota(boardStato, c);
            boardStato[r][c] = "p2";
            let score = minimax(boardStato, profondita - 1, alpha, beta, false, r, c);
            boardStato[r][c] = null;
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (let c of mosse) {
            let r = getRigaVuota(boardStato, c);
            boardStato[r][c] = "p1";
            let score = minimax(boardStato, profondita - 1, alpha, beta, true, r, c);
            boardStato[r][c] = null;
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        return minScore;
    }
}

function faiMossaBot() {
    if(gameOverF4 || isMultiplayerF4) return;

    let mosse = getMosseValide(board);
    if(mosse.length === 0) return;

    let colScelta = -1;

    if (diffBotF4 === "facile") {
        colScelta = mosse[Math.floor(Math.random() * mosse.length)];
    } else if (diffBotF4 === "medio") {
        // Medio: L'equivalente del vecchio difficile (vede solo 1 mossa avanti)
        let rDrop = -1;
        for(let c of mosse) { // Cerca se può vincere
            let r = getRigaVuota(board, c);
            board[r][c] = "p2";
            if(controllaVittoriaSimulata(board, r, c, "p2")) { colScelta = c; board[r][c] = null; break; }
            board[r][c] = null;
        }
        if(colScelta === -1) { // Cerca se deve bloccare
            for(let c of mosse) {
                let r = getRigaVuota(board, c);
                board[r][c] = "p1";
                if(controllaVittoriaSimulata(board, r, c, "p1")) { colScelta = c; board[r][c] = null; break; }
                board[r][c] = null;
            }
        }
        if(colScelta === -1) colScelta = mosse[0]; // Centro
    } else {
        // 🦈 SQUALO MINIMAX: Guarda 5 mosse nel futuro
        let bestScore = -Infinity;
        colScelta = mosse[0];
        
        // Se è la prima mossa, prendi subito il centro per non perdere tempo a calcolare
        if (getRigaVuota(board, 3) === ROWS - 1) {
            colScelta = 3;
        } else {
            for (let c of mosse) {
                let r = getRigaVuota(board, c);
                board[r][c] = "p2";
                let score = minimax(board, 5, -Infinity, Infinity, false, r, c); // PROFONDITÀ 5!
                board[r][c] = null;

                if (score > bestScore) {
                    bestScore = score;
                    colScelta = c;
                }
            }
        }
    }

    eseguiMossa(colScelta, "p2");
}
