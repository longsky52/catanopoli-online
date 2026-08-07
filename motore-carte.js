// ==========================================
// MOTORE CARTE SICILIANE (TOTALITY GAMES) - V7 MULTIPLAYER INFALLIBILE
// ==========================================

const semiCarte = ['oro', 'coppe', 'spade', 'bastoni'];
const valoriCarte = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 

const puntiBriscola = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2, 7: 0, 6: 0, 5: 0, 4: 0, 2: 0 };
const forzaBriscola = { 1: 12, 3: 11, 10: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 2: 2 };
const valoriPrimiera = { 7: 21, 6: 18, 1: 16, 5: 15, 4: 14, 3: 13, 2: 12, 8: 10, 9: 10, 10: 10 };

const iconeSemi = { 'oro': '💰', 'coppe': '🍷', 'spade': '🗡️', 'bastoni': '🪵' };
const coloriSemi = { 'oro': '#d4af37', 'coppe': '#bd2a2a', 'spade': '#2c4a8a', 'bastoni': '#3b7a3b' };

let targetPuntiVittoria = 120; let punteggioGlobaleMio = 0; let punteggioGlobaleBot = 0;
let mazzoAttuale = []; let mioGiocatore = { mano: [], prese: [], punti: 0, scope: 0 }; let avversarioBot = { mano: [], prese: [], punti: 0, scope: 0 };
let carteAlCentro = []; let carteGiocateOra = []; let cartaBriscola = null; let carteSelezionateTavolo = [];
let giocoInCorso = ""; let difficoltaBot = "medio"; let turnoDiChi = "io"; let faseAnimazione = false;
let chiHaIniziatoMano = "io"; let ultimoAPrendere = "nessuno";

// Variabili Multiplayer e Timer
let isPartitaMultiplayer = false; let isHost = false; let roomMulti = "";
let timerTurno = null; let secondiRimasti = 30;

const attesa = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generaMazzo() {
    let nuovoMazzo = [];
    for (let s of semiCarte) {
        for (let v of valoriCarte) {
            nuovoMazzo.push({ valore: v, seme: s, nome: v + " di " + s, imgStr: "carte/" + v + "_" + s + ".png", valoreScopa: (v === 'A' ? 1 : v === 'F' ? 8 : v === 'C' ? 9 : v === 'Re' ? 10 : parseInt(v)) });
        }
    }
    return nuovoMazzo;
}

function mescolaMazzo(mazzo) {
    for (let i = mazzo.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]]; } return mazzo;
}

window.avviaPartitaDaMenuCarte = function() {
    let tipo = document.getElementById("cards-setup-tipo").value;
    let diff = document.getElementById("cards-setup-diff").value;
    let target = (tipo === "briscola") ? 120 : (parseInt(document.getElementById("cards-setup-target").value) || 11);

    document.getElementById("cards-setup-menu").style.display = "none";
    document.getElementById("cards-ui").style.display = "flex";
    avviaPartitaCarte(tipo, false, { diff: diff, target: target }); 
}

// 🌐 ENTRY POINT UNIVERSALE (Chiama sia il Single che il Multi)
window.avviaPartitaCarte = function(tipoGioco, isMulti, datiAggiuntivi) {
    giocoInCorso = tipoGioco;
    isPartitaMultiplayer = isMulti;
    chiHaIniziatoMano = "io";
    punteggioGlobaleMio = 0; punteggioGlobaleBot = 0;

    let nomeUtente = document.getElementById("setup-name") ? document.getElementById("setup-name").value : "Tu";
    if(!nomeUtente) nomeUtente = "Tu";
    let prevImg = document.getElementById("preview-foto");
    let fotoSrc = (prevImg && prevImg.style.display !== "none" && prevImg.src) ? prevImg.src : (typeof window.myPhotoBase64 !== 'undefined' ? window.myPhotoBase64 : "");
    let fotoTag = fotoSrc ? `<img src="${fotoSrc}" style="width:28px; height:28px; border-radius:50%; vertical-align:middle; margin-right:5px; border:2px solid #c99c51; object-fit:cover;">` : `🃏`;

    if (isMulti) {
        roomMulti = typeof myRoom !== 'undefined' ? myRoom : "StanzaSconosciuta";
        targetPuntiVittoria = datiAggiuntivi.targetCarte || 11;
        isHost = (datiAggiuntivi.hostId === socket.id);
        difficoltaBot = "UMANO";
        
        let opp = datiAggiuntivi.players.find(p => p.id !== socket.id);
        document.getElementById("cards-opponent-name").innerHTML = `${fotoTag} <b style="color:white;">${nomeUtente}</b> vs <b style="color:#ff4444;">${opp ? opp.name : "Avversario"}</b> <span style='font-size:0.7rem; color:#aaa;'>(Online)</span>`;

        // 🌐 SOCKET: Ricezione Dati
        socket.off("riceviCarteSyncInit");
        socket.on("riceviCarteSyncInit", (data) => {
            if (!isHost) {
                mazzoAttuale = data.mazzoAttuale; mioGiocatore.mano = data.guestMano; avversarioBot.mano = data.hostMano;
                carteAlCentro = data.carteAlCentro; cartaBriscola = data.cartaBriscola; chiHaIniziatoMano = data.chiHaIniziatoMano;
                turnoDiChi = data.turnoDiChi === "io" ? "avversario" : "io";
                faseAnimazione = false; aggiornaInterfaccia(); gestisciTimer();
            }
        });

        socket.off("riceviCarteAzione");
        socket.on("riceviCarteAzione", (data) => { eseguiAzioneAvversarioRete(data.indexMano, data.indiciTavolo); });
        socket.off("playerLeft"); socket.on("playerLeft", (playerName) => { alert(`L'avversario ${playerName} è fuggito! Hai vinto.`); window.esciDaTavoloCarte(); });

    } else {
        difficoltaBot = datiAggiuntivi.diff || "medio";
        targetPuntiVittoria = datiAggiuntivi.target || 11;
        document.getElementById("cards-opponent-name").innerHTML = `${fotoTag} <b style="color:white;">${nomeUtente}</b> vs Bot Zio Turi 🤖 <span style='font-size:0.7rem; color:#aaa;'>(${difficoltaBot.toUpperCase()})</span>`;
    }

    let mediaContainer = document.getElementById("cards-media-buttons"); if(mediaContainer) mediaContainer.style.display = "none";
    let btnAud = document.getElementById("btn-cards-audio"); if(btnAud) btnAud.style.display = "none";
    let btnVid = document.getElementById("btn-cards-video"); if(btnVid) btnVid.style.display = "none";

    iniziaNuovaSmazzata();
}

async function iniziaNuovaSmazzata() {
    fermaTimer(); faseAnimazione = true;
    mioGiocatore.mano = []; mioGiocatore.prese = []; mioGiocatore.punti = 0; mioGiocatore.scope = 0;
    avversarioBot.mano = []; avversarioBot.prese = []; avversarioBot.punti = 0; avversarioBot.scope = 0;
    carteAlCentro = []; carteGiocateOra = []; carteSelezionateTavolo = [];
    cartaBriscola = null; ultimoAPrendere = "nessuno"; turnoDiChi = chiHaIniziatoMano;

    if (isPartitaMultiplayer) {
        if (isHost) {
            await distribuisciCarteAnimazione();
            // 🔥 SPARA LE CARTE 4 VOLTE DI FILA PER ESSERE SICURO CHE ARRIVINO ALL'OSPITE CHE STA CARICANDO!
            for(let syncs = 0; syncs < 4; syncs++) {
                setTimeout(() => {
                    socket.emit("carteSyncInit", { room: roomMulti, mazzoAttuale: mazzoAttuale, hostMano: mioGiocatore.mano, guestMano: avversarioBot.mano, carteAlCentro: carteAlCentro, cartaBriscola: cartaBriscola, chiHaIniziatoMano: chiHaIniziatoMano, turnoDiChi: turnoDiChi });
                }, 500 + (syncs * 800));
            }
            gestisciTimer();
        } else {
            document.getElementById("cards-turn-indicator").innerHTML = "<span style='color:gold;'>Attendi il Mazziere (Host)...</span>";
            mazzoAttuale = []; aggiornaInterfaccia(); 
        }
    } else {
        await distribuisciCarteAnimazione();
        faseAnimazione = false; gestisciTimer();
        if(turnoDiChi === "avversario") setTimeout(turnoDelBot, 1500);
    }
}

async function distribuisciCarteAnimazione() {
    mazzoAttuale = mescolaMazzo(generaMazzo()); aggiornaInterfaccia();
    for (let i = 0; i < 3; i++) { await attesa(300); mioGiocatore.mano.push(mazzoAttuale.pop()); avversarioBot.mano.push(mazzoAttuale.pop()); aggiornaInterfaccia(); }
    if (giocoInCorso === "scopa") {
        for (let i = 0; i < 4; i++) { await attesa(300); carteAlCentro.push(mazzoAttuale.pop()); aggiornaInterfaccia(); }
    } else if (giocoInCorso === "briscola") {
        await attesa(300); cartaBriscola = mazzoAttuale.pop(); aggiornaInterfaccia();
    }
}

function gestisciTimer() {
    clearInterval(timerTurno);
    if (turnoDiChi === "io" && !faseAnimazione) {
        secondiRimasti = 30; aggiornaInterfaccia();
        timerTurno = setInterval(() => {
            secondiRimasti--; aggiornaInterfaccia();
            if (secondiRimasti <= 0) { clearInterval(timerTurno); giocaCartaPerScadenzaTempo(); }
        }, 1000);
    }
}
function fermaTimer() { clearInterval(timerTurno); }

function giocaCartaPerScadenzaTempo() {
    if(mioGiocatore.mano.length === 0) return;
    let idx = Math.floor(Math.random() * mioGiocatore.mano.length);
    if (giocoInCorso === "scopa") {
        let prendibile = carteAlCentro.findIndex(c => c.valoreScopa === mioGiocatore.mano[idx].valoreScopa);
        if(prendibile !== -1) completaGiocataScopa(idx, [prendibile]); else completaGiocataScopa(idx, []);
    } else { completaGiocataBriscola(idx); }
}

window.selezionaCartaTavolo = function(index) {
    if (giocoInCorso !== "scopa" || turnoDiChi !== "io" || faseAnimazione) return;
    let pos = carteSelezionateTavolo.indexOf(index);
    if (pos > -1) carteSelezionateTavolo.splice(pos, 1); else carteSelezionateTavolo.push(index);
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();
}

function aggiornaInterfaccia() {
    let divMiaMano = document.getElementById("my-hand"); let divAvversario = document.getElementById("opponent-hand"); let divCentro = document.getElementById("cards-table-center");
    divCentro.style.position = "relative";
    let vecchi = document.querySelectorAll("#mazzo-laterale"); vecchi.forEach(e => e.remove());

    divMiaMano.innerHTML = mioGiocatore.mano.map((carta, index) => {
        let rot = (index - Math.floor(mioGiocatore.mano.length/2)) * 8; let yOff = (index === Math.floor(mioGiocatore.mano.length/2)) ? -10 : 0;
        return `<div class="playing-card" onclick="tentaGiocataMia(${index})" style="transform: rotate(${rot}deg) translateY(${yOff}px); z-index: ${10 + index}; padding:0; background:none; border:none; transition: all 0.3s ease;">
                <img src="${carta.imgStr}" onerror="this.onerror=null; this.src='carte/fallback.png'; this.parentElement.innerHTML='<div class=\\'playing-card\\' style=\\'background:white; color:black; border: 2px solid #000;\\'>${carta.valore}<br>${carta.seme[0].toUpperCase()}</div>';" style="width:100%; height:100%; border-radius:8px; box-shadow: 2px 4px 10px rgba(0,0,0,0.6); pointer-events:none;"></div>`;
    }).join("");

    divAvversario.innerHTML = avversarioBot.mano.map(() => `<div class="playing-card card-back" style="transition: all 0.3s ease;"></div>`).join("");

    let mazzoHTML = "";
    if (giocoInCorso === "briscola" && (cartaBriscola || mazzoAttuale.length > 0)) {
        let opacita = mazzoAttuale.length === 0 ? "0.6" : "1";
        mazzoHTML = `<div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 120px; height: 110px; opacity: ${opacita}; z-index: 10;">
                ${cartaBriscola ? `<div style="position: absolute; left: -10px; top: 15px; width: 75px; height: 105px;"><img src="${cartaBriscola.imgStr}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 100%; height: 100%; border-radius:6px; box-shadow: 0 4px 8px rgba(0,0,0,0.5); transform: rotate(90deg) scale(0.9);"><div style="display:none; width: 100%; height: 100%; background: white; color: black; border: 2px solid #000; border-radius: 6px; transform: rotate(90deg) scale(0.9); flex-direction:column; align-items:center; justify-content:center; font-weight:bold;">${cartaBriscola.valore}</div></div>` : ""}
                ${mazzoAttuale.length > 0 ? `<div class="playing-card card-back" style="position: absolute; left: 35px; top: 0; z-index: 5; box-shadow: -4px 4px 10px rgba(0,0,0,0.8);"><div style="background:rgba(0,0,0,0.8); color:white; border-radius:50%; width:25px; height:25px; display:flex; justify-content:center; align-items:center; position:absolute; top:-10px; right:-10px; font-weight:bold; font-size:0.8rem; border:2px solid var(--border-color);">${mazzoAttuale.length}</div></div>` : ""}</div>`;
    } else if (giocoInCorso === "scopa" && mazzoAttuale.length > 0) {
        let posizioneY = (chiHaIniziatoMano === "io") ? "top: -60px;" : "bottom: -60px;";
        mazzoHTML = `<div style="position: absolute; right: 20px; ${posizioneY} transform: rotate(-5deg); z-index: 10; transition: all 0.5s ease;"><div class="playing-card card-back" style="box-shadow: -4px 4px 10px rgba(0,0,0,0.8);"><div style="background:rgba(0,0,0,0.8); color:white; border-radius:50%; width:25px; height:25px; display:flex; justify-content:center; align-items:center; position:absolute; top:-10px; right:-10px; font-weight:bold; font-size:0.8rem; border:2px solid var(--border-color);">${mazzoAttuale.length}</div></div></div>`;
    }

    let centroHTML = "";
    if (giocoInCorso === "scopa") {
        centroHTML += carteAlCentro.map((carta, i) => {
            let selectedClass = carteSelezionateTavolo.includes(i) ? "selezionata" : "";
            return `<div class="playing-card ${selectedClass}" onclick="selezionaCartaTavolo(${i})" style="width: clamp(55px, 16vw, 75px); height: clamp(82px, 24vw, 112px); padding:0; background:none; border:none; z-index:5; transition: all 0.3s ease;"><img src="${carta.imgStr}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width:100%; height:100%; border-radius:6px; pointer-events:none;"><div style="display:none; width:100%; height:100%; background:white; color:black; border:2px solid #000; border-radius:6px; flex-direction:column; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; pointer-events:none;">${carta.valore}</div></div>`;
        }).join("");
    }

    let sceseHTML = carteGiocateOra.map((giocata) => {
        let coloreGlow = giocata.proprietario === "io" ? "#44ff44" : "#ff4444";
        return `<div style="width: 80px; height: 120px; border-radius:8px; box-shadow: 0 0 15px ${coloreGlow}; margin: 0 10px; transform: scale(1.1); z-index:20; position:relative; transition: all 0.3s ease;"><img src="${giocata.carta.imgStr}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width:100%; height:100%; border-radius:8px;"><div style="display:none; width:100%; height:100%; background:white; color:black; border:2px solid #000; border-radius:8px; flex-direction:column; align-items:center; justify-content:center; font-weight:bold; font-size:1.5rem;">${giocata.carta.valore}</div></div>`;
    }).join("");

    divCentro.innerHTML = centroHTML + mazzoHTML + "<div style='display:flex; justify-content:center; align-items:center; position:absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events:none; z-index: 30;'>" + sceseHTML + "</div>";

    let pMioDisp = mioGiocatore.punti || 0; let pBotDisp = avversarioBot.punti || 0;
    if (giocoInCorso === "briscola") { document.querySelector(".cards-hud span:first-child").innerHTML = `Round: Tu <b>${pMioDisp}</b> | Avv <b>${pBotDisp}</b> <br><span style="color:#c99c51">Totale: ${punteggioGlobaleMio} a ${punteggioGlobaleBot} (Target ${targetPuntiVittoria})</span>`; } 
    else { document.querySelector(".cards-hud span:first-child").innerHTML = `Mano: <b>${mioGiocatore.prese.length}</b> carte (Scope: ${mioGiocatore.scope}) <br><span style="color:#c99c51">Totale: ${punteggioGlobaleMio} a ${punteggioGlobaleBot} (Target ${targetPuntiVittoria})</span>`; }
    
    // Non scriviamo "Turno Tuo" se siamo guest ed è appena iniziato!
    if (faseAnimazione || (!isHost && isPartitaMultiplayer && mazzoAttuale.length === 0)) return;
    
    let timerTesto = (turnoDiChi === "io") ? ` <span style='color:gold; font-size:0.9em;'>(⏱️ ${secondiRimasti}s)</span>` : "";
    document.getElementById("cards-turn-indicator").innerHTML = turnoDiChi === "io" ? `<span style='color:#44ff44'>Tuo Turno</span>${timerTesto}` : "<span style='color:#ff4444'>Turno Avversario...</span>";
}

window.tentaGiocataMia = function(index) {
    if (turnoDiChi !== "io" || faseAnimazione) return;
    fermaTimer();
    let cartaMia = mioGiocatore.mano[index];

    if (giocoInCorso === "scopa") {
        let prendibileSingola = carteAlCentro.findIndex(c => c.valoreScopa === cartaMia.valoreScopa);
        if (carteSelezionateTavolo.length > 0) {
            let somma = carteSelezionateTavolo.reduce((acc, i) => acc + carteAlCentro[i].valoreScopa, 0);
            if (somma === cartaMia.valoreScopa) {
                if (prendibileSingola !== -1 && carteSelezionateTavolo.length > 1) { alert("C'è la singola a terra!"); gestisciTimer(); return; }
                completaGiocataScopa(index, carteSelezionateTavolo);
            } else { alert("Somma errata!"); gestisciTimer(); }
        } else {
            if (prendibileSingola !== -1) completaGiocataScopa(index, [prendibileSingola]); else completaGiocataScopa(index, []);
        }
    } else { completaGiocataBriscola(index); }
};

// 🌐 PROPAGAZIONE MULTIPLAYER: L'Avversario riproduce la tua mossa!
function eseguiAzioneAvversarioRete(indexMano, indiciTavolo) {
    fermaTimer(); faseAnimazione = true;
    let cartaMessa = avversarioBot.mano.splice(indexMano, 1)[0];
    carteGiocateOra.push({carta: cartaMessa, proprietario: "bot"});
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();

    if (giocoInCorso === "scopa") {
        setTimeout(() => {
            indiciTavolo.sort((a,b) => b-a);
            if (indiciTavolo.length > 0) {
                ultimoAPrendere = "avversario"; let prese = [cartaMessa];
                indiciTavolo.forEach(i => prese.push(carteAlCentro.splice(i, 1)[0]));
                avversarioBot.prese.push(...prese);
                if (carteAlCentro.length === 0 && mazzoAttuale.length > 0) avversarioBot.scope++;
            } else { carteAlCentro.push(cartaMessa); }

            carteGiocateOra = []; turnoDiChi = "io"; aggiornaInterfaccia();
            setTimeout(verificaPescataEPassa, 500);
        }, 2000);
    } else {
        gestisciScontroBriscola("bot");
    }
}

async function completaGiocataScopa(indexMano, indiciTavoloSelezionati) {
    if (isPartitaMultiplayer && turnoDiChi === "io") socket.emit("carteAzione", { room: roomMulti, indexMano: indexMano, indiciTavolo: indiciTavoloSelezionati });
    faseAnimazione = true;
    let cartaMessa = mioGiocatore.mano.splice(indexMano, 1)[0];
    carteGiocateOra.push({carta: cartaMessa, proprietario: "io"});
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();

    await attesa(2000); 

    indiciTavoloSelezionati.sort((a,b) => b-a);
    let prese = [];
    if (indiciTavoloSelezionati.length > 0) {
        ultimoAPrendere = "io"; prese.push(cartaMessa);
        indiciTavoloSelezionati.forEach(i => prese.push(carteAlCentro.splice(i, 1)[0]));
        mioGiocatore.prese.push(...prese);
        if (carteAlCentro.length === 0 && mazzoAttuale.length > 0) { mioGiocatore.scope++; setTimeout(() => alert("🧹 SCOPA!"), 200); }
    } else { carteAlCentro.push(cartaMessa); }

    carteSelezionateTavolo = []; carteGiocateOra = []; aggiornaInterfaccia();
    await attesa(500); turnoDiChi = "avversario"; verificaPescataEPassa();
}

function completaGiocataBriscola(indexMano) {
    if (isPartitaMultiplayer && turnoDiChi === "io") socket.emit("carteAzione", { room: roomMulti, indexMano: indexMano });
    faseAnimazione = true;
    let cartaMessa = mioGiocatore.mano.splice(indexMano, 1)[0];
    carteGiocateOra.push({carta: cartaMessa, proprietario: "io"});
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();
    gestisciScontroBriscola("io");
}

function turnoDelBot() {
    if (isPartitaMultiplayer || avversarioBot.mano.length === 0) return; // 🌐 IL BOT NON ESISTE IN MULTIPLAYER!
    fermaTimer();
    let indexManoScelto = 0; let indiciDaPrendere = []; let presaFatta = false;

    if (giocoInCorso === "scopa") {
        for(let m=0; m<avversarioBot.mano.length; m++) {
            let found = carteAlCentro.findIndex(c => c.valoreScopa === avversarioBot.mano[m].valoreScopa);
            if(found !== -1) { indiciDaPrendere = [found]; indexManoScelto = m; presaFatta = true; break; }
        }
        if(!presaFatta && difficoltaBot !== "facile") {
            for(let m=0; m<avversarioBot.mano.length && !presaFatta; m++) {
                for(let i=0; i<carteAlCentro.length; i++) {
                    for(let j=i+1; j<carteAlCentro.length; j++) {
                        if(carteAlCentro[i].valoreScopa + carteAlCentro[j].valoreScopa === avversarioBot.mano[m].valoreScopa) { indiciDaPrendere = [i, j]; indexManoScelto = m; presaFatta = true; break; }
                    }
                    if(presaFatta) break;
                }
            }
        }
        if(!presaFatta) indexManoScelto = Math.floor(Math.random() * avversarioBot.mano.length);
        eseguiAzioneAvversarioRete(indexManoScelto, indiciDaPrendere); 
    } else {
        indexManoScelto = Math.floor(Math.random() * avversarioBot.mano.length);
        eseguiAzioneAvversarioRete(indexManoScelto, []);
    }
}

async function gestisciScontroBriscola(ultimoGiocatore) {
    if (carteGiocateOra.length < 2) {
        turnoDiChi = (ultimoGiocatore === "io") ? "avversario" : "io";
        faseAnimazione = false; aggiornaInterfaccia();
        if (turnoDiChi === "avversario" && !isPartitaMultiplayer) setTimeout(turnoDelBot, 1500);
        else gestisciTimer(); 
        return;
    }

    await attesa(2500); 

    let c1 = carteGiocateOra[0]; let c2 = carteGiocateOra[1];
    let semeBriscola = cartaBriscola ? cartaBriscola.seme : null;

    let f1 = (c1.carta.seme === semeBriscola) ? forzaBriscola[c1.carta.valore] + 100 : forzaBriscola[c1.carta.valore];
    let f2 = (c2.carta.seme === semeBriscola) ? forzaBriscola[c2.carta.valore] + 100 : (c2.carta.seme === c1.carta.seme ? forzaBriscola[c2.carta.valore] : -1);

    let vincitore = (f2 > f1) ? c2.proprietario : c1.proprietario;
    let puntiGirati = puntiBriscola[c1.carta.valore] + puntiBriscola[c2.carta.valore];

    if (vincitore === "io") { mioGiocatore.punti = (mioGiocatore.punti || 0) + puntiGirati; chiHaIniziatoMano = "io"; } 
    else { avversarioBot.punti = (avversarioBot.punti || 0) + puntiGirati; chiHaIniziatoMano = "avversario"; }

    carteGiocateOra = []; turnoDiChi = chiHaIniziatoMano;
    verificaPescataEPassa();
}

async function verificaPescataEPassa() {
    if (giocoInCorso === "scopa") {
        if (mioGiocatore.mano.length === 0 && avversarioBot.mano.length === 0) {
            if (mazzoAttuale.length > 0) {
                for (let i = 0; i < 3; i++) {
                    await attesa(400); 
                    if (turnoDiChi === "io") { mioGiocatore.mano.push(mazzoAttuale.pop()); avversarioBot.mano.push(mazzoAttuale.pop()); }
                    else { avversarioBot.mano.push(mazzoAttuale.pop()); mioGiocatore.mano.push(mazzoAttuale.pop()); }
                    aggiornaInterfaccia();
                }
            } else return chiudiManoEContaPunti();
        }
    } else if (giocoInCorso === "briscola") {
        if (mioGiocatore.mano.length < 3 || avversarioBot.mano.length < 3) {
            if (mazzoAttuale.length > 0 || cartaBriscola) {
                await attesa(500);
                let c1 = mazzoAttuale.pop(); if(!c1 && cartaBriscola) { c1 = cartaBriscola; cartaBriscola = null; }
                let c2 = mazzoAttuale.pop(); if(!c2 && cartaBriscola) { c2 = cartaBriscola; cartaBriscola = null; }
                if (turnoDiChi === "io") { if (c1) mioGiocatore.mano.push(c1); if (c2) avversarioBot.mano.push(c2); } 
                else { if (c1) avversarioBot.mano.push(c1); if (c2) mioGiocatore.mano.push(c2); }
                aggiornaInterfaccia();
            }
        }
        if (mioGiocatore.mano.length === 0 && avversarioBot.mano.length === 0) return chiudiManoEContaPunti();
    }
    
    faseAnimazione = false; gestisciTimer(); aggiornaInterfaccia();
    if(turnoDiChi === "avversario" && avversarioBot.mano.length > 0 && !isPartitaMultiplayer) setTimeout(turnoDelBot, 1500);
}

function chiudiManoEContaPunti() {
    fermaTimer(); let msg = "FINE MANO!\n\n";

    if (giocoInCorso === "scopa") {
        if (ultimoAPrendere === "io") mioGiocatore.prese.push(...carteAlCentro); else if (ultimoAPrendere === "avversario") avversarioBot.prese.push(...carteAlCentro);
        carteAlCentro = [];

        let pMio = mioGiocatore.scope; let pBot = avversarioBot.scope;
        let carteMio = mioGiocatore.prese.length; let carteBot = avversarioBot.prese.length;
        if(carteMio > 20) { pMio++; msg += "CARTE: Tu (+1)\n"; } else if(carteBot > 20) { pBot++; msg += "CARTE: Avversario (+1)\n"; }

        let oriMio = mioGiocatore.prese.filter(c => c.seme === 'oro').length; let oriBot = avversarioBot.prese.filter(c => c.seme === 'oro').length;
        if(oriMio > 5) { pMio++; msg += "DENARI: Tu (+1)\n"; } else if(oriBot > 5) { pBot++; msg += "DENARI: Avversario (+1)\n"; }

        let settebelloMio = mioGiocatore.prese.find(c => c.valore === 7 && c.seme === 'oro');
        if(settebelloMio) { pMio++; msg += "SETTEBELLO: Tu (+1)\n"; } else { pBot++; msg += "SETTEBELLO: Avversario (+1)\n"; }

        let calcPrimiera = (prese) => { let maxM = { oro:0, coppe:0, spade:0, bastoni:0 }; prese.forEach(c => { if(valoriPrimiera[c.valore] > maxM[c.seme]) maxM[c.seme] = valoriPrimiera[c.valore]; }); return maxM.oro + maxM.coppe + maxM.spade + maxM.bastoni; };
        let priMio = calcPrimiera(mioGiocatore.prese); let priBot = calcPrimiera(avversarioBot.prese);
        if(priMio > priBot) { pMio++; msg += "PRIMIERA: Tu (+1)\n"; } else if(priBot > priMio) { pBot++; msg += "PRIMIERA: Avversario (+1)\n"; }

        punteggioGlobaleMio += pMio; punteggioGlobaleBot += pBot;
    } else {
        punteggioGlobaleMio += (mioGiocatore.punti || 0); punteggioGlobaleBot += (avversarioBot.punti || 0);
        msg += `Punti Tuoi: ${mioGiocatore.punti || 0} | Punti Avversario: ${avversarioBot.punti || 0}\n`;
    }

    msg += `\nPUNTEGGIO TOTALE:\nTu: ${punteggioGlobaleMio} / ${targetPuntiVittoria}\nAvv: ${punteggioGlobaleBot} / ${targetPuntiVittoria}`;
    aggiornaInterfaccia();

    setTimeout(() => {
        alert(msg);
        if (punteggioGlobaleMio >= targetPuntiVittoria || punteggioGlobaleBot >= targetPuntiVittoria) {
            let esito = punteggioGlobaleMio > punteggioGlobaleBot ? "🏆 HAI VINTO LA PARTITA!" : (punteggioGlobaleMio === punteggioGlobaleBot ? "Pareggio!" : "☠️ Hai perso la partita.");
            alert("🔥 PARTITA CONCLUSA! 🔥\n\n" + esito); window.esciDaTavoloCarte();
        } else {
            chiHaIniziatoMano = (chiHaIniziatoMano === "io") ? "avversario" : "io";
            
            if (isPartitaMultiplayer) {
                if (isHost) {
                    iniziaNuovaSmazzata(); // Solo l'host decide quando riavviare la mano
                } else {
                    document.getElementById("cards-turn-indicator").innerHTML = "<span style='color:gold;'>Attendi il Mazziere (Host)...</span>";
                    mazzoAttuale = []; aggiornaInterfaccia(); 
                }
            } else {
                iniziaNuovaSmazzata();
            }
        }
    }, 1500);
}
