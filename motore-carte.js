// ==========================================
// MOTORE CARTE SICILIANE (TOTALITY GAMES) - V10 SINCRONIZZAZIONE DEFINITIVA E 4 GIOCATORI
// ==========================================

const semiCarte = ['oro', 'coppe', 'spade', 'bastoni'];
const valoriCarte = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
const puntiBriscola = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2, 7: 0, 6: 0, 5: 0, 4: 0, 2: 0 };
const forzaBriscola = { 1: 12, 3: 11, 10: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 2: 2 };
const valoriPrimiera = { 7: 21, 6: 18, 1: 16, 5: 15, 4: 14, 3: 13, 2: 12, 8: 10, 9: 10, 10: 10 };

let targetPuntiVittoria = 120; 
let giocoInCorso = ""; let difficoltaBot = "medio"; let faseAnimazione = false;
let isPartitaMultiplayer = false; let isHost = false; let roomMulti = "";

// ARRAY GIOCATORI: 0=Basso(Io), 1=Destra(Avv1), 2=Alto(Socio), 3=Sinistra(Avv2)
let numGiocatori = 2; 
let giocatori = []; 
let mazzoAttuale = []; 
let carteAlCentro = []; 
let carteGiocateOra = []; 
let cartaBriscola = null; 
let carteSelezionateTavolo = [];
let indexTurnoAttuale = 0; 
let indexMazziere = 1; 
let ultimoAPrendereTeam = -1;

let timerTurno = null; let secondiRimasti = 30;
const attesa = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generaMazzo() {
    let nuovoMazzo = [];
    for (let s of semiCarte) {
        for (let v of valoriCarte) {
            nuovoMazzo.push({ valore: v, seme: s, imgStr: `carte/${v}_${s}.png`, valoreScopa: (v==='A'?1: v==='F'?8: v==='C'?9: v==='Re'?10: parseInt(v)) });
        }
    }
    return nuovoMazzo;
}

function mescolaMazzo(mazzo) {
    for (let i = mazzo.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]]; } return mazzo;
}

window.avviaPartitaDaMenuCarte = function() {
    let tipo = document.getElementById("cards-setup-tipo").value;
    let nP = document.getElementById("cards-setup-players") ? parseInt(document.getElementById("cards-setup-players").value) : 2;
    let target = (tipo === "briscola") ? 120 : (parseInt(document.getElementById("cards-setup-target").value) || 11);
    
    document.getElementById("cards-setup-menu").style.display = "none";
    document.getElementById("cards-ui").style.display = "flex";
    avviaPartitaCarte(tipo, false, { numPlayers: nP, target: target }); 
}

// 🌐 ENTRY POINT UNIVERSALE
window.avviaPartitaCarte = function(tipoGioco, isMulti, datiAggiuntivi) {
    giocoInCorso = tipoGioco;
    isPartitaMultiplayer = isMulti;
    numGiocatori = datiAggiuntivi.numPlayers || (isMulti && datiAggiuntivi.players ? datiAggiuntivi.players.length : 2);
    targetPuntiVittoria = datiAggiuntivi.targetCarte || datiAggiuntivi.target || 11;
    punteggioGlobaleMio = 0; punteggioGlobaleBot = 0;

    let nomeUtente = document.getElementById("setup-name") ? document.getElementById("setup-name").value : "Tu";
    if(!nomeUtente) nomeUtente = "Tu";
    let prevImg = document.getElementById("preview-foto");
    let miaFoto = (prevImg && prevImg.style.display !== "none" && prevImg.src) ? prevImg.src : (typeof window.myPhotoBase64 !== 'undefined' ? window.myPhotoBase64 : null);

    giocatori = [];
    if (!isMulti) {
        // SINGLE PLAYER
        indexMazziere = numGiocatori === 2 ? 1 : 3; 
        indexTurnoAttuale = 0; 
        giocatori.push({ id: "io", name: nomeUtente, photo: miaFoto, mano: [], prese: [], punti: 0, scope: 0, isBot: false, team: 0 });
        if (numGiocatori === 2) {
            giocatori.push({ id: "bot1", name: "Zio Turi 🤖", photo: null, mano: [], prese: [], punti: 0, scope: 0, isBot: true, team: 1 });
        } else {
            giocatori.push({ id: "bot1", name: "Alfio 🤖", photo: null, mano: [], prese: [], punti: 0, scope: 0, isBot: true, team: 1 }); 
            giocatori.push({ id: "bot2", name: "Socio Cettina 🤖", photo: null, mano: [], prese: [], punti: 0, scope: 0, isBot: true, team: 0 }); 
            giocatori.push({ id: "bot3", name: "Zio Turi 🤖", photo: null, mano: [], prese: [], punti: 0, scope: 0, isBot: true, team: 1 }); 
        }
    } else {
        // MULTIPLAYER
        roomMulti = typeof myRoom !== 'undefined' ? myRoom : "Stanza";
        isHost = (datiAggiuntivi.hostId === socket.id);
        
        let myDataIndex = datiAggiuntivi.players.findIndex(p => p.id === socket.id);
        for(let i=0; i<numGiocatori; i++) {
            let pData = datiAggiuntivi.players[(myDataIndex + i) % numGiocatori];
            giocatori.push({ id: pData.id, name: pData.name, photo: pData.photo, mano: [], prese: [], punti: 0, scope: 0, isBot: false, team: i % 2 });
        }
        
        if (isHost) { 
            indexMazziere = 0; 
            indexTurnoAttuale = 1; // L'Host fa le carte, l'Ospite gioca!
        } 

        // 🔥 LA SINCRONIZZAZIONE DEFINITIVA (Basata sugli ID Univoci e non sugli indici)
        socket.off("riceviCarteSyncInit");
        socket.on("riceviCarteSyncInit", (data) => {
            if (!isHost) {
                mazzoAttuale = data.mazzoAttuale; 
                carteAlCentro = data.carteAlCentro; 
                cartaBriscola = data.cartaBriscola;
                
                indexMazziere = giocatori.findIndex(g => g.id === data.mazziereId);
                indexTurnoAttuale = giocatori.findIndex(g => g.id === data.turnoDiId);
                
                for(let i=0; i<numGiocatori; i++) {
                    let realIdx = data.giocatoriData.findIndex(p => p.id === giocatori[i].id);
                    if(realIdx !== -1) giocatori[i].mano = data.giocatoriData[realIdx].mano;
                }
                
                faseAnimazione = false; 
                aggiornaInterfaccia();
                if (indexTurnoAttuale === 0) gestisciTimer(); // Sblocca il timer per chi deve giocare
            }
        });

        socket.off("riceviCarteAzione");
        socket.on("riceviCarteAzione", (data) => {
            let idxG = giocatori.findIndex(g => g.id === data.giocatoreId);
            if(idxG !== -1) eseguiAzioneRete(idxG, data.indexMano, data.indiciTavolo);
        });

        socket.off("playerLeft"); socket.on("playerLeft", (playerName) => { alert(`L'avversario ${playerName} è fuggito! Hai vinto a tavolino.`); window.esciDaTavoloCarte(); });
    }

    let pToken = document.getElementById("setup-token") ? document.getElementById("setup-token").value : "👤";
    let fotoTag = miaFoto ? `<img src="${miaFoto}" style="width:28px; height:28px; border-radius:50%; vertical-align:middle; margin-right:5px; border:2px solid #c99c51; object-fit:cover;">` : `<span style="font-size:1.5rem; vertical-align:middle; margin-right:5px;">${pToken}</span>`;
    
    // Mostriamo dinamicamente tutti i nomi degli avversari
    let oppNames = giocatori.filter(g => g.team === 1).map(g => g.name).join(" e ");
    document.getElementById("cards-opponent-name").innerHTML = `${fotoTag} <b style="color:white;">${giocatori[0].name}</b> vs <b style="color:#ff4444;">${oppNames}</b>`;

    let mediaContainer = document.getElementById("cards-media-buttons"); if(mediaContainer) mediaContainer.style.display = "none";
    iniziaNuovaSmazzata();
}

async function iniziaNuovaSmazzata() {
    fermaTimer(); faseAnimazione = true;
    for(let i=0; i<numGiocatori; i++) { giocatori[i].mano = []; giocatori[i].prese = []; giocatori[i].scope = 0; }
    carteAlCentro = []; carteGiocateOra = []; carteSelezionateTavolo = []; cartaBriscola = null; ultimoAPrendereTeam = -1;

    if (isPartitaMultiplayer) {
        if (isHost) {
            await distribuisciCarteAnimazione();
            faseAnimazione = false; 
            aggiornaInterfaccia();
            
            // L'host spara i dati all'ospite!
            for(let syncs = 0; syncs < 3; syncs++) {
                setTimeout(() => { 
                    socket.emit("carteSyncInit", { 
                        room: roomMulti, 
                        mazzoAttuale: mazzoAttuale, 
                        giocatoriData: giocatori.map(g => ({id: g.id, mano: g.mano})), 
                        carteAlCentro: carteAlCentro, 
                        cartaBriscola: cartaBriscola, 
                        mazziereId: giocatori[indexMazziere].id, 
                        turnoDiId: giocatori[indexTurnoAttuale].id 
                    }); 
                }, 500 + (syncs * 800));
            }
            if(indexTurnoAttuale === 0) gestisciTimer();
        } else {
            document.getElementById("cards-turn-indicator").innerHTML = "<span style='color:gold;'>Attendi il Mazziere (Host)...</span>";
            mazzoAttuale = []; aggiornaInterfaccia(); 
        }
    } else {
        await distribuisciCarteAnimazione();
        faseAnimazione = false;
        if(indexTurnoAttuale === 0) gestisciTimer();
        else setTimeout(() => turnoDelBot(indexTurnoAttuale), 1500);
    }
}

async function distribuisciCarteAnimazione() {
    mazzoAttuale = mescolaMazzo(generaMazzo()); aggiornaInterfaccia();
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < numGiocatori; i++) {
            await attesa(200);
            let targetIdx = (indexMazziere + 1 + i) % numGiocatori; 
            giocatori[targetIdx].mano.push(mazzoAttuale.pop());
            aggiornaInterfaccia();
        }
    }
    if (giocoInCorso === "scopa") {
        for (let i = 0; i < 4; i++) { await attesa(300); carteAlCentro.push(mazzoAttuale.pop()); aggiornaInterfaccia(); }
    } else if (giocoInCorso === "briscola") {
        await attesa(300); cartaBriscola = mazzoAttuale.pop(); aggiornaInterfaccia();
    }
}

function gestisciTimer() {
    clearInterval(timerTurno);
    if (indexTurnoAttuale === 0 && !faseAnimazione) {
        secondiRimasti = 30; aggiornaInterfaccia();
        timerTurno = setInterval(() => {
            secondiRimasti--; aggiornaInterfaccia();
            if (secondiRimasti <= 0) { clearInterval(timerTurno); giocaCartaPerScadenzaTempo(); }
        }, 1000);
    }
}
function fermaTimer() { clearInterval(timerTurno); }

function giocaCartaPerScadenzaTempo() {
    if(giocatori[0].mano.length === 0) return;
    let idx = Math.floor(Math.random() * giocatori[0].mano.length);
    if (giocoInCorso === "scopa") {
        let prendibile = carteAlCentro.findIndex(c => c.valoreScopa === giocatori[0].mano[idx].valoreScopa);
        if(prendibile !== -1) completaGiocataScopa(0, idx, [prendibile]); else completaGiocataScopa(0, idx, []);
    } else { completaGiocataBriscola(0, idx); }
}

window.selezionaCartaTavolo = function(index) {
    if (giocoInCorso !== "scopa" || indexTurnoAttuale !== 0 || faseAnimazione) return;
    let pos = carteSelezionateTavolo.indexOf(index);
    if (pos > -1) carteSelezionateTavolo.splice(pos, 1); else carteSelezionateTavolo.push(index);
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();
}

function aggiornaInterfaccia() {
    let contenitoreUI = document.getElementById("cards-ui");
    let divMiaMano = document.getElementById("my-hand"); 
    let divAvversarioTop = document.getElementById("opponent-hand"); 
    let divCentro = document.getElementById("cards-table-center");
    
    // 1. RESTRINGIAMO IL QUADRATO CENTRALE PER CELLULARI
    divCentro.style.position = "relative";
    divCentro.style.maxWidth = (numGiocatori === 4) ? "220px" : "400px";
    divCentro.style.minHeight = (numGiocatori === 4) ? "260px" : "150px";
    divCentro.style.margin = "auto";

    let vecchi = document.querySelectorAll("#mazzo-laterale"); vecchi.forEach(e => e.remove());

    // IO (BASSO)
    divMiaMano.innerHTML = giocatori[0].mano.map((carta, index) => {
        let rot = (index - Math.floor(giocatori[0].mano.length/2)) * 8; let yOff = (index === Math.floor(giocatori[0].mano.length/2)) ? -10 : 0;
        return `<div class="playing-card" onclick="tentaGiocataMia(${index})" style="transform: rotate(${rot}deg) translateY(${yOff}px); z-index: ${10 + index}; padding:0; background:none; border:none; transition: all 0.3s ease;">
                <img src="${carta.imgStr}" onerror="this.onerror=null; this.src='carte/fallback.png'; this.parentElement.innerHTML='<div class=\\'playing-card\\' style=\\'background:white; color:black; border: 2px solid #000;\\'>${carta.valore}</div>';" style="width:100%; height:100%; border-radius:8px; box-shadow: 2px 4px 10px rgba(0,0,0,0.6); pointer-events:none;"></div>`;
    }).join("");

    // AVVERSARIO FRONTALE / SOCIO
    let indexAlto = numGiocatori === 2 ? 1 : 2;
    divAvversarioTop.innerHTML = giocatori[indexAlto].mano.map(() => `<div class="playing-card card-back" style="transition: all 0.3s ease;"></div>`).join("");

    // 🔥 MANI LATERALI ISOLATE (Incolonnate e senza sbordare)
    if (numGiocatori === 4) {
        let leftHand = document.getElementById("left-hand-container");
        if (!leftHand) { leftHand = document.createElement("div"); leftHand.id = "left-hand-container"; leftHand.style = "position:absolute; left: 5px; top:45%; transform:translateY(-50%); display:flex; flex-direction:column; gap:-25px; pointer-events:none; z-index:5;"; contenitoreUI.appendChild(leftHand); }
        leftHand.innerHTML = giocatori[3].mano.map(()=> `<div class="playing-card card-back" style="width:45px; height:65px; box-shadow:-2px 2px 5px black; transform: rotate(90deg);"></div>`).join("");

        let rightHand = document.getElementById("right-hand-container");
        if (!rightHand) { rightHand = document.createElement("div"); rightHand.id = "right-hand-container"; rightHand.style = "position:absolute; right: 5px; top:45%; transform:translateY(-50%); display:flex; flex-direction:column; gap:-25px; pointer-events:none; z-index:5;"; contenitoreUI.appendChild(rightHand); }
        rightHand.innerHTML = giocatori[1].mano.map(()=> `<div class="playing-card card-back" style="width:45px; height:65px; box-shadow:2px -2px 5px black; transform: rotate(-90deg);"></div>`).join("");
    } else {
        let lh = document.getElementById("left-hand-container"); if(lh) lh.remove();
        let rh = document.getElementById("right-hand-container"); if(rh) rh.remove();
    }

    // 🔥 MAZZO E BRISCOLA MESSI IN UN ANGOLO SICURO
    let mazzoHTML = "";
    if (giocoInCorso === "briscola" && (cartaBriscola || mazzoAttuale.length > 0)) {
        let opacita = mazzoAttuale.length === 0 ? "0.6" : "1";
        mazzoHTML = `<div style="position: absolute; right: 0px; top: 10px; width: 70px; height: 90px; opacity: ${opacita}; z-index: 1;">
                ${cartaBriscola ? `<div style="position: absolute; left: -20px; top: 10px; width: 55px; height: 80px;"><img src="${cartaBriscola.imgStr}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 100%; height: 100%; border-radius:6px; box-shadow: 0 4px 8px rgba(0,0,0,0.5); transform: rotate(90deg) scale(0.9);"></div>` : ""}
                ${mazzoAttuale.length > 0 ? `<div class="playing-card card-back" style="position: absolute; left: 10px; top: 0; width:50px; height:75px; z-index: 5; box-shadow: -4px 4px 10px rgba(0,0,0,0.8);"><div style="background:rgba(0,0,0,0.8); color:white; border-radius:50%; width:22px; height:22px; display:flex; justify-content:center; align-items:center; position:absolute; top:-8px; right:-8px; font-weight:bold; font-size:0.7rem; border:2px solid var(--border-color);">${mazzoAttuale.length}</div></div>` : ""}</div>`;
    } else if (giocoInCorso === "scopa" && mazzoAttuale.length > 0) {
        let posizioneMazzo = "right: 10px; top: -30px;"; 
        if (indexMazziere === 0) posizioneMazzo = "right: 10px; bottom: -30px;";
        else if (indexMazziere === 3) posizioneMazzo = "left: -10px; top: 10px;";
        else if (indexMazziere === 1) posizioneMazzo = "right: -10px; top: 10px;";

        mazzoHTML = `<div style="position: absolute; ${posizioneMazzo} z-index: 1; transition: all 0.5s ease;"><div class="playing-card card-back" style="width:45px; height:65px; box-shadow: -4px 4px 10px rgba(0,0,0,0.8); transform: rotate(15deg);"><div style="background:rgba(0,0,0,0.8); color:white; border-radius:50%; width:20px; height:20px; display:flex; justify-content:center; align-items:center; position:absolute; top:-8px; right:-8px; font-weight:bold; font-size:0.7rem; border:2px solid var(--border-color);">${mazzoAttuale.length}</div></div></div>`;
    }

    let centroHTML = "";
    if (giocoInCorso === "scopa") {
        centroHTML += carteAlCentro.map((carta, i) => {
            let selectedClass = carteSelezionateTavolo.includes(i) ? "selezionata" : "";
            return `<div class="playing-card ${selectedClass}" onclick="selezionaCartaTavolo(${i})" style="width: clamp(45px, 13vw, 65px); height: clamp(67px, 19vw, 97px); padding:0; background:none; border:none; z-index:5; transition: all 0.3s ease; margin:2px;"><img src="${carta.imgStr}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width:100%; height:100%; border-radius:6px; pointer-events:none;"></div>`;
        }).join("");
    }

    // DISPOSIZIONE A CROCE PIÙ PICCOLA E COMPATTA
    let sceseHTML = carteGiocateOra.map((giocata) => {
        let coloreGlow = giocata.proprietarioIndex % 2 === 0 ? "#44ff44" : "#ff4444";
        let posStyle = "position:relative; margin: 0 5px;";
        if (numGiocatori === 4 && giocoInCorso === "briscola") {
            if (giocata.proprietarioIndex === 0) posStyle = "position:absolute; bottom:5px; left:50%; transform:translateX(-50%);";
            if (giocata.proprietarioIndex === 1) posStyle = "position:absolute; right:5px; top:50%; transform:translateY(-50%);";
            if (giocata.proprietarioIndex === 2) posStyle = "position:absolute; top:5px; left:50%; transform:translateX(-50%);";
            if (giocata.proprietarioIndex === 3) posStyle = "position:absolute; left:5px; top:50%; transform:translateY(-50%);";
        }
        return `<div style="width: 55px; height: 85px; border-radius:6px; box-shadow: 0 0 10px ${coloreGlow}; z-index:20; transition: all 0.3s ease; ${posStyle}"><img src="${giocata.carta.imgStr}" style="width:100%; height:100%; border-radius:6px;"></div>`;
    }).join("");

    let croceStyle = (numGiocatori === 4 && giocoInCorso === "briscola") ? "width: 170px; height: 170px; display:block; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);" : "width:100%; display:flex; justify-content:center; margin-top:15px; position:absolute; bottom: 10px; left:0;";

    divCentro.innerHTML = `<div style="display:flex; flex-wrap:wrap; justify-content:center; align-content:center; width:100%; height:100%; padding:10px;">` + centroHTML + `</div>` + mazzoHTML + `<div style='pointer-events:none; z-index: 30; ${croceStyle}'>` + sceseHTML + "</div>";

    let pMioDisp = giocatori[0].punti + (numGiocatori===4 ? giocatori[2].punti : 0); 
    let pBotDisp = giocatori[1].punti + (numGiocatori===4 ? giocatori[3].punti : 0);
    
    if (giocoInCorso === "briscola") { document.querySelector(".cards-hud span:first-child").innerHTML = `Round: Team 1 <b>${pMioDisp}</b> | Team 2 <b>${pBotDisp}</b> <br><span style="color:#c99c51">Totale: ${punteggioGlobaleMio} a ${punteggioGlobaleBot} (Target ${targetPuntiVittoria})</span>`; } 
    else { document.querySelector(".cards-hud span:first-child").innerHTML = `Prese Team 1: <b>${giocatori[0].prese.length + (numGiocatori===4?giocatori[2].prese.length:0)}</b> <br><span style="color:#c99c51">Totale: ${punteggioGlobaleMio} a ${punteggioGlobaleBot} (Target ${targetPuntiVittoria})</span>`; }
    
    if (faseAnimazione || (!isHost && isPartitaMultiplayer && mazzoAttuale.length === 0)) return;
    
    let timerTesto = (indexTurnoAttuale === 0) ? ` <span style='color:gold; font-size:0.9em;'>(⏱️ ${secondiRimasti}s)</span>` : "";
    document.getElementById("cards-turn-indicator").innerHTML = indexTurnoAttuale === 0 ? `<span style='color:#44ff44'>Tuo Turno</span>${timerTesto}` : `<span style='color:#ff4444'>Turno di ${giocatori[indexTurnoAttuale].name}...</span>`;
}

window.tentaGiocataMia = function(indexMano) {
    if (indexTurnoAttuale !== 0 || faseAnimazione) return;
    fermaTimer();
    let cartaMia = giocatori[0].mano[indexMano];

    if (giocoInCorso === "scopa") {
        let prendibileSingola = carteAlCentro.findIndex(c => c.valoreScopa === cartaMia.valoreScopa);
        if (carteSelezionateTavolo.length > 0) {
            let somma = carteSelezionateTavolo.reduce((acc, i) => acc + carteAlCentro[i].valoreScopa, 0);
            if (somma === cartaMia.valoreScopa) {
                if (prendibileSingola !== -1 && carteSelezionateTavolo.length > 1) { alert("C'è la singola a terra!"); gestisciTimer(); return; }
                completaGiocataScopa(0, indexMano, carteSelezionateTavolo);
            } else { alert("Somma errata!"); gestisciTimer(); }
        } else {
            if (prendibileSingola !== -1) completaGiocataScopa(0, indexMano, [prendibileSingola]); else completaGiocataScopa(0, indexMano, []);
        }
    } else { completaGiocataBriscola(0, indexMano); }
};

// 🌐 RICEZIONE RETE: Identifica chi ha lanciato la carta in base all'ID unico
function eseguiAzioneRete(pIndex, indexMano, indiciTavolo) {
    if (giocoInCorso === "scopa") completaGiocataScopa(pIndex, indexMano, indiciTavolo || []);
    else completaGiocataBriscola(pIndex, indexMano);
}

// 🤖 LOGICA BOT
function turnoDelBot(botIndex) {
    if (isPartitaMultiplayer || giocatori[botIndex].mano.length === 0) return;
    fermaTimer();
    let indexManoScelto = 0; let indiciDaPrendere = []; let presaFatta = false;

    if (giocoInCorso === "scopa") {
        for(let m=0; m<giocatori[botIndex].mano.length; m++) {
            let found = carteAlCentro.findIndex(c => c.valoreScopa === giocatori[botIndex].mano[m].valoreScopa);
            if(found !== -1) { indiciDaPrendere = [found]; indexManoScelto = m; presaFatta = true; break; }
        }
        if(!presaFatta && difficoltaBot !== "facile") {
            for(let m=0; m<giocatori[botIndex].mano.length && !presaFatta; m++) {
                for(let i=0; i<carteAlCentro.length; i++) {
                    for(let j=i+1; j<carteAlCentro.length; j++) {
                        if(carteAlCentro[i].valoreScopa + carteAlCentro[j].valoreScopa === giocatori[botIndex].mano[m].valoreScopa) { indiciDaPrendere = [i, j]; indexManoScelto = m; presaFatta = true; break; }
                    }
                    if(presaFatta) break;
                }
            }
        }
        if(!presaFatta) indexManoScelto = Math.floor(Math.random() * giocatori[botIndex].mano.length);
        completaGiocataScopa(botIndex, indexManoScelto, indiciDaPrendere); 
    } else {
        indexManoScelto = Math.floor(Math.random() * giocatori[botIndex].mano.length);
        completaGiocataBriscola(botIndex, indexManoScelto);
    }
}

async function completaGiocataScopa(pIndex, indexMano, indiciTavoloSelezionati) {
    if (isPartitaMultiplayer && pIndex === 0) socket.emit("carteAzione", { room: roomMulti, giocatoreId: socket.id, indexMano: indexMano, indiciTavolo: indiciTavoloSelezionati });
    faseAnimazione = true;
    let cartaMessa = giocatori[pIndex].mano.splice(indexMano, 1)[0];
    carteGiocateOra.push({carta: cartaMessa, proprietarioIndex: pIndex});
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();

    await attesa(1500); 

    indiciTavoloSelezionati.sort((a,b) => b-a);
    let prese = [];
    if (indiciTavoloSelezionati.length > 0) {
        ultimoAPrendereTeam = giocatori[pIndex].team; 
        prese.push(cartaMessa);
        indiciTavoloSelezionati.forEach(i => prese.push(carteAlCentro.splice(i, 1)[0]));
        giocatori[pIndex].prese.push(...prese);
        if (carteAlCentro.length === 0 && mazzoAttuale.length > 0) { giocatori[pIndex].scope++; setTimeout(() => alert("🧹 SCOPA!"), 200); }
    } else { carteAlCentro.push(cartaMessa); }

    carteSelezionateTavolo = []; carteGiocateOra = []; aggiornaInterfaccia();
    await attesa(200); 
    
    indexTurnoAttuale = (indexTurnoAttuale + 1) % numGiocatori; 
    verificaPescataEPassa();
}

async function completaGiocataBriscola(pIndex, indexMano) {
    if (isPartitaMultiplayer && pIndex === 0) socket.emit("carteAzione", { room: roomMulti, giocatoreId: socket.id, indexMano: indexMano });
    faseAnimazione = true;
    let cartaMessa = giocatori[pIndex].mano.splice(indexMano, 1)[0];
    carteGiocateOra.push({carta: cartaMessa, proprietarioIndex: pIndex});
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();
    
    if (carteGiocateOra.length < numGiocatori) {
        indexTurnoAttuale = (indexTurnoAttuale + 1) % numGiocatori;
        faseAnimazione = false; aggiornaInterfaccia();
        if (giocatori[indexTurnoAttuale].isBot) setTimeout(() => turnoDelBot(indexTurnoAttuale), 1200);
        else if (indexTurnoAttuale === 0) gestisciTimer(); 
        return;
    }

    await attesa(2500); 

    let semeBriscola = cartaBriscola ? cartaBriscola.seme : null;
    let semeIniziale = carteGiocateOra[0].carta.seme;
    let cartaVincente = carteGiocateOra[0];
    let forzaMax = forzaBriscola[cartaVincente.carta.valore];
    if (cartaVincente.carta.seme === semeBriscola) forzaMax += 100;
    let puntiGirati = puntiBriscola[cartaVincente.carta.valore];

    for(let i=1; i<numGiocatori; i++) {
        let c = carteGiocateOra[i];
        puntiGirati += puntiBriscola[c.carta.valore];
        let forzaC = -1;
        if (c.carta.seme === semeBriscola) forzaC = forzaBriscola[c.carta.valore] + 100;
        else if (c.carta.seme === semeIniziale) forzaC = forzaBriscola[c.carta.valore];
        
        if (forzaC > forzaMax) { forzaMax = forzaC; cartaVincente = c; }
    }

    let vincitoreIndex = cartaVincente.proprietarioIndex;
    giocatori[vincitoreIndex].punti += puntiGirati;

    carteGiocateOra = []; indexTurnoAttuale = vincitoreIndex; 
    verificaPescataEPassa();
}

async function verificaPescataEPassa() {
    if (giocoInCorso === "scopa") {
        if (giocatori.every(g => g.mano.length === 0)) {
            if (mazzoAttuale.length > 0) {
                for (let j = 0; j < 3; j++) {
                    for (let i = 0; i < numGiocatori; i++) {
                        await attesa(150); 
                        let targetIdx = (indexMazziere + 1 + i) % numGiocatori;
                        giocatori[targetIdx].mano.push(mazzoAttuale.pop());
                        aggiornaInterfaccia();
                    }
                }
            } else return chiudiManoEContaPunti();
        }
    } else if (giocoInCorso === "briscola") {
        if (giocatori.some(g => g.mano.length < 3)) {
            if (mazzoAttuale.length > 0 || cartaBriscola) {
                await attesa(500);
                for(let i=0; i<numGiocatori; i++) {
                    let targetIdx = (indexTurnoAttuale + i) % numGiocatori; 
                    let c = mazzoAttuale.pop(); if(!c && cartaBriscola) { c = cartaBriscola; cartaBriscola = null; }
                    if (c) giocatori[targetIdx].mano.push(c);
                }
                aggiornaInterfaccia();
            }
        }
        if (giocatori.every(g => g.mano.length === 0)) return chiudiManoEContaPunti();
    }
    
    faseAnimazione = false; gestisciTimer(); aggiornaInterfaccia();
    if(giocatori[indexTurnoAttuale].isBot) setTimeout(() => turnoDelBot(indexTurnoAttuale), 1200);
}

function chiudiManoEContaPunti() {
    fermaTimer(); let msg = "FINE MANO!\n\n";

    if (giocoInCorso === "scopa") {
        if (ultimoAPrendereTeam !== -1) {
            let playerTarget = ultimoAPrendereTeam === 0 ? 0 : 1; 
            giocatori[playerTarget].prese.push(...carteAlCentro);
        }
        carteAlCentro = [];

        let preseTeam0 = giocatori[0].prese.concat(numGiocatori===4 ? giocatori[2].prese : []);
        let preseTeam1 = giocatori[1].prese.concat(numGiocatori===4 ? giocatori[3].prese : []);
        
        let pMio = giocatori[0].scope + (numGiocatori===4 ? giocatori[2].scope : 0); 
        let pBot = giocatori[1].scope + (numGiocatori===4 ? giocatori[3].scope : 0);

        if(preseTeam0.length > 20) { pMio++; msg += "CARTE: Team 1 (+1)\n"; } else if(preseTeam1.length > 20) { pBot++; msg += "CARTE: Team 2 (+1)\n"; }

        let oriMio = preseTeam0.filter(c => c.seme === 'oro').length; let oriBot = preseTeam1.filter(c => c.seme === 'oro').length;
        if(oriMio > 5) { pMio++; msg += "DENARI: Team 1 (+1)\n"; } else if(oriBot > 5) { pBot++; msg += "DENARI: Team 2 (+1)\n"; }

        if(preseTeam0.find(c => c.valore === 7 && c.seme === 'oro')) { pMio++; msg += "SETTEBELLO: Team 1 (+1)\n"; } else { pBot++; msg += "SETTEBELLO: Team 2 (+1)\n"; }

        let calcPrimiera = (prese) => { let maxM = { oro:0, coppe:0, spade:0, bastoni:0 }; prese.forEach(c => { if(valoriPrimiera[c.valore] > maxM[c.seme]) maxM[c.seme] = valoriPrimiera[c.valore]; }); return maxM.oro + maxM.coppe + maxM.spade + maxM.bastoni; };
        let priMio = calcPrimiera(preseTeam0); let priBot = calcPrimiera(preseTeam1);
        if(priMio > priBot) { pMio++; msg += "PRIMIERA: Team 1 (+1)\n"; } else if(priBot > priMio) { pBot++; msg += "PRIMIERA: Team 2 (+1)\n"; }

        punteggioGlobaleMio += pMio; punteggioGlobaleBot += pBot;
    } else {
        let pMio = giocatori[0].punti + (numGiocatori===4 ? giocatori[2].punti : 0);
        let pBot = giocatori[1].punti + (numGiocatori===4 ? giocatori[3].punti : 0);
        punteggioGlobaleMio += pMio; punteggioGlobaleBot += pBot;
        msg += `Punti Team 1: ${pMio} | Punti Team 2: ${pBot}\n`;
    }

    msg += `\nPUNTEGGIO TOTALE:\nTeam 1: ${punteggioGlobaleMio} / ${targetPuntiVittoria}\nTeam 2: ${punteggioGlobaleBot} / ${targetPuntiVittoria}`;
    aggiornaInterfaccia();

    setTimeout(() => {
        alert(msg);
        if (punteggioGlobaleMio >= targetPuntiVittoria || punteggioGlobaleBot >= targetPuntiVittoria) {
            let esito = punteggioGlobaleMio > punteggioGlobaleBot ? "🏆 IL TUO TEAM HA VINTO!" : (punteggioGlobaleMio === punteggioGlobaleBot ? "Pareggio!" : "☠️ Sconfitta.");
            alert("🔥 PARTITA CONCLUSA! 🔥\n\n" + esito); window.esciDaTavoloCarte();
        } else {
            indexMazziere = (indexMazziere + 1) % numGiocatori;
            indexTurnoAttuale = (indexMazziere + 1) % numGiocatori;
            
            if (isPartitaMultiplayer) {
                if (isHost) iniziaNuovaSmazzata(); 
                else { document.getElementById("cards-turn-indicator").innerHTML = "<span style='color:gold;'>Attendi il Mazziere (Host)...</span>"; mazzoAttuale = []; aggiornaInterfaccia(); }
            } else iniziaNuovaSmazzata();
        }
    }, 1500);
}
