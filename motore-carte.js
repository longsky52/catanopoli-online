// ==========================================
// MOTORE CARTE SICILIANE (TOTALITY GAMES) - V2.0 PRO
// ==========================================

const semiCarte = ['oro', 'coppe', 'spade', 'bastoni'];
const valoriCarte = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 8=Donna, 9=Cavallo, 10=Re

const puntiBriscola = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2, 7: 0, 6: 0, 5: 0, 4: 0, 2: 0 };
const forzaBriscola = { 1: 12, 3: 11, 10: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 2: 2 };
const valoriPrimiera = { 7: 21, 6: 18, 1: 16, 5: 15, 4: 14, 3: 13, 2: 12, 8: 10, 9: 10, 10: 10 };

const iconeSemi = { 'oro': '💰', 'coppe': '🍷', 'spade': '🗡️', 'bastoni': '🪵' };
const coloriSemi = { 'oro': '#d4af37', 'coppe': '#bd2a2a', 'spade': '#2c4a8a', 'bastoni': '#3b7a3b' };

// Stato Globale Partita
let targetPuntiVittoria = 11;
let punteggioGlobaleMio = 0;
let punteggioGlobaleBot = 0;

// Stato Mano Attuale
let mazzoAttuale = [];
let mioGiocatore = { mano: [], prese: [], scope: 0 };
let avversarioBot = { mano: [], prese: [], scope: 0 };
let carteAlCentro = []; 
let carteGiocateOra = [];
let cartaBriscola = null;
let carteSelezionateTavolo = []; // Array degli indici delle carte cliccate a terra

let giocoInCorso = ""; 
let difficoltaBot = "medio";
let turnoDiChi = "io"; 
let faseAnimazione = false;
let chiHaIniziatoMano = "io"; 
let ultimoAPrendere = "nessuno"; // A scopa, chi prende per ultimo piglia tutto a fine smazzata

function generaMazzo() {
    let nuovoMazzo = [];
    for (let s of semiCarte) {
        for (let v of valoriCarte) {
            nuovoMazzo.push({
                valore: v, seme: s,
                nome: v + " di " + s,
                icona: iconeSemi[s], colore: coloriSemi[s],
                imgStr: "carte/" + v + "_" + s + ".png",
                valoreScopa: (v === 'A' ? 1 : v === 'F' ? 8 : v === 'C' ? 9 : v === 'Re' ? 10 : parseInt(v))
            });
        }
    }
    return nuovoMazzo;
}

function mescolaMazzo(mazzo) {
    for (let i = mazzo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]];
    }
    return mazzo;
}

window.avviaPartitaCarte = function(tipoGioco, isMulti) {
    if(isMulti) { alert("Multiplayer in arrivo!"); return; }

    targetPuntiVittoria = parseInt(document.getElementById("setup-punti-carte").value) || 11;
    punteggioGlobaleMio = 0;
    punteggioGlobaleBot = 0;
    giocoInCorso = tipoGioco;
    difficoltaBot = document.getElementById("setup-bots-diff").value;
    chiHaIniziatoMano = "io";

    document.getElementById("cards-opponent-name").innerHTML = "Bot Zio Turi 🤖 <span style='font-size:0.7rem; color:#aaa;'>(" + difficoltaBot.toUpperCase() + ")</span>";
    iniziaNuovaSmazzata();
}

function iniziaNuovaSmazzata() {
    mazzoAttuale = mescolaMazzo(generaMazzo());
    mioGiocatore = { mano: [], prese: [], scope: 0 };
    avversarioBot = { mano: [], prese: [], scope: 0 };
    carteAlCentro = [];
    carteGiocateOra = [];
    carteSelezionateTavolo = [];
    cartaBriscola = null;
    ultimoAPrendere = "nessuno";
    turnoDiChi = chiHaIniziatoMano;
    faseAnimazione = false;

    // Distribuzione
    for (let i = 0; i < 3; i++) {
        mioGiocatore.mano.push(mazzoAttuale.pop());
        avversarioBot.mano.push(mazzoAttuale.pop());
    }

    if (giocoInCorso === "scopa") {
        for (let i = 0; i < 4; i++) carteAlCentro.push(mazzoAttuale.pop());
    } else if (giocoInCorso === "briscola") {
        cartaBriscola = mazzoAttuale.pop();
        carteAlCentro.push(cartaBriscola);
    }

    aggiornaInterfaccia();
    if(turnoDiChi === "avversario") setTimeout(turnoDelBot, 1000);
}

// GESTIONE SELEZIONE MANUALE A TERRA
window.selezionaCartaTavolo = function(index) {
    if (giocoInCorso !== "scopa" || turnoDiChi !== "io" || faseAnimazione) return;
    
    let pos = carteSelezionateTavolo.indexOf(index);
    if (pos > -1) {
        carteSelezionateTavolo.splice(pos, 1); // Deseleziona
    } else {
        carteSelezionateTavolo.push(index); // Seleziona
    }
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();
}

function aggiornaInterfaccia() {
    let divMiaMano = document.getElementById("my-hand");
    let divAvversario = document.getElementById("opponent-hand");
    let divCentro = document.getElementById("cards-table-center");

    // DISEGNA LE TUE CARTE
    divMiaMano.innerHTML = mioGiocatore.mano.map((carta, index) => {
        let rot = (index - Math.floor(mioGiocatore.mano.length/2)) * 8;
        let yOff = (index === Math.floor(mioGiocatore.mano.length/2)) ? -10 : 0;
        return `
            <div class="playing-card" onclick="tentaGiocataMia(${index})" style="transform: rotate(${rot}deg) translateY(${yOff}px); z-index: ${10 + index}; padding:0; background:none; border:none;">
                <img src="${carta.imgStr}" onerror="this.onerror=null; this.src='carte/fallback.png'; this.parentElement.innerHTML='<div class=\\'playing-card\\' style=\\'background:white; color:black; border: 2px solid ${carta.colore};\\'>${carta.valore}<br>${carta.icona}</div>';" style="width:100%; height:100%; border-radius:8px; box-shadow: 2px 4px 10px rgba(0,0,0,0.6); pointer-events:none;">
            </div>
        `;
    }).join("");

    divAvversario.innerHTML = avversarioBot.mano.map(() => `<div class="playing-card card-back"></div>`).join("");

    // DISEGNA CENTRO TAVOLO (Con o senza contorno dorato)
    let centroHTML = "";
    if (giocoInCorso === "briscola" && cartaBriscola) {
        let opacita = mazzoAttuale.length === 0 ? "0.5" : "1";
        centroHTML += `
            <div style="position:relative; width: 100px; height: 100px; margin-right: 30px; opacity: ${opacita};">
                <img src="${cartaBriscola.imgStr}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 65px; position:absolute; transform: rotate(90deg) translate(20px, 0px); border-radius:6px; box-shadow: 0 4px 8px rgba(0,0,0,0.5);">
                <div style="display:none; width: 65px; height: 90px; background: white; color: black; border: 2px solid ${cartaBriscola.colore}; border-radius: 6px; position:absolute; transform: rotate(90deg) translate(15px, -15px); flex-direction:column; align-items:center; justify-content:center; font-weight:bold;">${cartaBriscola.valore}<br>${cartaBriscola.icona}</div>
                ${mazzoAttuale.length > 0 ? `<div class="playing-card card-back" style="position:absolute; top:0; left:10px; z-index:5;"><div style="background:rgba(0,0,0,0.8); color:white; border-radius:50%; width:25px; height:25px; display:flex; justify-content:center; align-items:center; position:absolute; top:-10px; right:-10px; font-weight:bold; font-size:0.8rem; border:2px solid var(--border-color);">${mazzoAttuale.length}</div></div>` : ""}
            </div>
        `;
    }

    if (giocoInCorso === "scopa") {
        centroHTML += carteAlCentro.map((carta, i) => {
            let selectedClass = carteSelezionateTavolo.includes(i) ? "selezionata" : "";
            return `
                <div class="playing-card ${selectedClass}" onclick="selezionaCartaTavolo(${i})" style="width: clamp(55px, 16vw, 75px); height: clamp(82px, 24vw, 112px); padding:0; background:none; border:none; z-index:5;">
                    <img src="${carta.imgStr}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width:100%; height:100%; border-radius:6px; pointer-events:none;">
                    <div style="display:none; width:100%; height:100%; background:white; color:black; border:2px solid ${carta.colore}; border-radius:6px; flex-direction:column; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; pointer-events:none;">${carta.valore}<br>${carta.icona}</div>
                </div>
            `;
        }).join("");
        
        if(mazzoAttuale.length > 0) {
            centroHTML += `<div class="playing-card card-back" style="position:relative; margin-left:20px; transform:rotate(-5deg);"><div style="background:rgba(0,0,0,0.8); color:white; border-radius:50%; width:25px; height:25px; display:flex; justify-content:center; align-items:center; position:absolute; top:-10px; right:-10px; font-weight:bold; font-size:0.8rem; border:2px solid var(--border-color);">${mazzoAttuale.length}</div></div>`;
        }
    }

    // CARTE GETTATE A TERRA DURANTE IL TURNO
    let sceseHTML = carteGiocateOra.map((giocata) => {
        let coloreGlow = giocata.proprietario === "io" ? "#44ff44" : "#ff4444";
        return `
            <div style="width: 80px; height: 120px; border-radius:8px; box-shadow: 0 0 15px ${coloreGlow}; margin: 0 10px; transform: scale(1.1); z-index:20; position:relative;">
                <img src="${giocata.carta.imgStr}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width:100%; height:100%; border-radius:8px;">
                <div style="display:none; width:100%; height:100%; background:white; color:black; border:2px solid ${giocata.carta.colore}; border-radius:8px; flex-direction:column; align-items:center; justify-content:center; font-weight:bold; font-size:1.5rem;">${giocata.carta.valore}<br>${giocata.carta.icona}</div>
            </div>
        `;
    }).join("");

    divCentro.innerHTML = centroHTML + "<div style='width:100%; display:flex; justify-content:center; margin-top:15px;'>" + sceseHTML + "</div>";

    // HUD PUNTI
    if (giocoInCorso === "briscola") {
        document.querySelector(".cards-hud span:first-child").innerHTML = `Round: Tu ${mioGiocatore.punti} | Bot ${avversarioBot.punti} <br><span style="color:#c99c51">Totale: ${punteggioGlobaleMio} a ${punteggioGlobaleBot} (Target ${targetPuntiVittoria})</span>`;
    } else {
        document.querySelector(".cards-hud span:first-child").innerHTML = `Mano: ${mioGiocatore.prese.length} carte, ${mioGiocatore.scope} scope <br><span style="color:#c99c51">Totale: ${punteggioGlobaleMio} a ${punteggioGlobaleBot} (Target ${targetPuntiVittoria})</span>`;
    }
    
    document.getElementById("cards-turn-indicator").innerHTML = turnoDiChi === "io" ? "<span style='color:#44ff44'>Tuo Turno</span>" : "<span style='color:#ff4444'>Pensa Zio Turi...</span>";
}

// ==========================
// LOGICA MIA GIOCATA
// ==========================
window.tentaGiocataMia = function(index) {
    if (turnoDiChi !== "io" || faseAnimazione) return;
    
    let cartaMia = mioGiocatore.mano[index];

    if (giocoInCorso === "scopa") {
        let prendibileSingola = carteAlCentro.findIndex(c => c.valoreScopa === cartaMia.valoreScopa);

        if (carteSelezionateTavolo.length > 0) {
            let somma = carteSelezionateTavolo.reduce((acc, i) => acc + carteAlCentro[i].valoreScopa, 0);
            if (somma === cartaMia.valoreScopa) {
                if (prendibileSingola !== -1 && carteSelezionateTavolo.length > 1) {
                    alert("Regola Scopa: C'è già un " + cartaMia.valoreScopa + " a terra, DEVI prendere quello singolo!");
                    return;
                }
                completaGiocataScopa(index, carteSelezionateTavolo);
            } else {
                alert("La somma (" + somma + ") non fa " + cartaMia.valoreScopa + "!");
            }
        } else {
            // NESSUNA SELEZIONE. SE C'È LA SINGOLA, LA PRENDE LUI IN AUTOMATICO.
            if (prendibileSingola !== -1) {
                completaGiocataScopa(index, [prendibileSingola]);
            } else {
                // Controlla se per caso POTEVA sommare qualcosa e ha dimenticato di selezionare
                let puoSommare = false;
                for(let i=0; i<carteAlCentro.length; i++) {
                    for(let j=i+1; j<carteAlCentro.length; j++) {
                        if(carteAlCentro[i].valoreScopa + carteAlCentro[j].valoreScopa === cartaMia.valoreScopa) puoSommare = true;
                    }
                }
                if (puoSommare) {
                    alert("Puoi prendere delle carte! Selezionale a terra prima di tirare.");
                } else {
                    // Non prende nulla, butta a terra
                    completaGiocataScopa(index, []);
                }
            }
        }
    } else {
        completaGiocataBriscola(index);
    }
};

function completaGiocataScopa(indexMano, indiciTavoloSelezionati) {
    faseAnimazione = true;
    let cartaMessa = mioGiocatore.mano.splice(indexMano, 1)[0];
    carteGiocateOra.push({carta: cartaMessa, proprietario: "io"});
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    
    // Ordino decrescente per non sballare gli indici quando taglio l'array
    indiciTavoloSelezionati.sort((a,b) => b-a);
    
    let prese = [];
    if (indiciTavoloSelezionati.length > 0) {
        ultimoAPrendere = "io";
        prese.push(cartaMessa);
        indiciTavoloSelezionati.forEach(i => {
            prese.push(carteAlCentro.splice(i, 1)[0]);
        });
        mioGiocatore.prese.push(...prese);

        // Controllo Scopa
        if (carteAlCentro.length === 0 && mazzoAttuale.length > 0) {
            mioGiocatore.scope++;
            setTimeout(() => alert("🧹 SCOPA!"), 200);
        }
    } else {
        carteAlCentro.push(cartaMessa);
    }

    carteSelezionateTavolo = [];
    carteGiocateOra = []; // a Scopa la tolgo subito dal centro scontro per metterla nel tavolo o tra le prese
    
    turnoDiChi = "avversario";
    aggiornaInterfaccia();
    verificaPescataEPassa();
}

function completaGiocataBriscola(indexMano) {
    faseAnimazione = true;
    let cartaMessa = mioGiocatore.mano.splice(indexMano, 1)[0];
    carteGiocateOra.push({carta: cartaMessa, proprietario: "io"});
    if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
    aggiornaInterfaccia();
    gestisciScontroBriscola("io");
}

// ==========================
// IA BOT
// ==========================
function turnoDelBot() {
    if (avversarioBot.mano.length === 0) return;

    if (giocoInCorso === "scopa") {
        // Cerca presa
        let indiciDaPrendere = [];
        let indexManoScelto = 0;
        let presaFatta = false;

        // Cerca prima le singole
        for(let m=0; m<avversarioBot.mano.length; m++) {
            let vMano = avversarioBot.mano[m].valoreScopa;
            let found = carteAlCentro.findIndex(c => c.valoreScopa === vMano);
            if(found !== -1) { indiciDaPrendere = [found]; indexManoScelto = m; presaFatta = true; break; }
        }
        
        // Se non ci sono singole, cerca somme (2 carte)
        if(!presaFatta && difficoltaBot !== "facile") {
            for(let m=0; m<avversarioBot.mano.length && !presaFatta; m++) {
                let vMano = avversarioBot.mano[m].valoreScopa;
                for(let i=0; i<carteAlCentro.length; i++) {
                    for(let j=i+1; j<carteAlCentro.length; j++) {
                        if(carteAlCentro[i].valoreScopa + carteAlCentro[j].valoreScopa === vMano) {
                            indiciDaPrendere = [i, j]; indexManoScelto = m; presaFatta = true; break;
                        }
                    }
                    if(presaFatta) break;
                }
            }
        }

        if(!presaFatta) indexManoScelto = Math.floor(Math.random() * avversarioBot.mano.length); // Butta a caso

        let cartaMessa = avversarioBot.mano.splice(indexManoScelto, 1)[0];
        carteGiocateOra.push({carta: cartaMessa, proprietario: "bot"});
        if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }

        indiciDaPrendere.sort((a,b) => b-a);
        
        if (indiciDaPrendere.length > 0) {
            ultimoAPrendere = "avversario";
            let prese = [cartaMessa];
            indiciDaPrendere.forEach(i => prese.push(carteAlCentro.splice(i, 1)[0]));
            avversarioBot.prese.push(...prese);

            if (carteAlCentro.length === 0 && mazzoAttuale.length > 0) {
                avversarioBot.scope++;
            }
        } else {
            carteAlCentro.push(cartaMessa);
        }

        carteGiocateOra = [];
        turnoDiChi = "io";
        aggiornaInterfaccia();
        verificaPescataEPassa();

    } else {
        // IA BRISCOLA
        let indexManoScelto = Math.floor(Math.random() * avversarioBot.mano.length);
        let cartaMessa = avversarioBot.mano.splice(indexManoScelto, 1)[0];
        carteGiocateOra.push({carta: cartaMessa, proprietario: "bot"});
        if(typeof window.suonaEffetto === 'function') { try { window.suonaEffetto('carta'); } catch(e){} }
        aggiornaInterfaccia();
        gestisciScontroBriscola("bot");
    }
}

function gestisciScontroBriscola(ultimoGiocatore) {
    if (carteGiocateOra.length < 2) {
        turnoDiChi = (ultimoGiocatore === "io") ? "avversario" : "io";
        faseAnimazione = false;
        aggiornaInterfaccia();
        if (turnoDiChi === "avversario") setTimeout(turnoDelBot, 1200);
        return;
    }

    setTimeout(() => {
        let c1 = carteGiocateOra[0]; let c2 = carteGiocateOra[1];
        let semeBriscola = cartaBriscola ? cartaBriscola.seme : null;

        let f1 = (c1.carta.seme === semeBriscola) ? forzaBriscola[c1.carta.valore] + 100 : forzaBriscola[c1.carta.valore];
        let f2 = (c2.carta.seme === semeBriscola) ? forzaBriscola[c2.carta.valore] + 100 : (c2.carta.seme === c1.carta.seme ? forzaBriscola[c2.carta.valore] : -1);

        let vincitore = (f2 > f1) ? c2.proprietario : c1.proprietario;
        let puntiGirati = puntiBriscola[c1.carta.valore] + puntiBriscola[c2.carta.valore];

        if (vincitore === "io") { mioGiocatore.punti += puntiGirati; chiHaIniziatoMano = "io"; } 
        else { avversarioBot.punti += puntiGirati; chiHaIniziatoMano = "avversario"; }

        carteGiocateOra = [];
        turnoDiChi = chiHaIniziatoMano;

        verificaPescataEPassa();
    }, 1500);
}

function verificaPescataEPassa() {
    if (mioGiocatore.mano.length === 0 && avversarioBot.mano.length === 0) {
        if (mazzoAttuale.length > 0) {
            // Pescano 3 carte
            for (let i = 0; i < 3; i++) {
                if (turnoDiChi === "io") { mioGiocatore.mano.push(mazzoAttuale.pop()); avversarioBot.mano.push(mazzoAttuale.pop()); }
                else { avversarioBot.mano.push(mazzoAttuale.pop()); mioGiocatore.mano.push(mazzoAttuale.pop()); }
            }
        } else if (giocoInCorso === "briscola" && cartaBriscola) {
            // Briscola, pescano le ultime 2 
            if (turnoDiChi === "io") { mioGiocatore.mano.push(mazzoAttuale.pop() || cartaBriscola); avversarioBot.mano.push(mazzoAttuale.pop() || cartaBriscola); }
            else { avversarioBot.mano.push(mazzoAttuale.pop() || cartaBriscola); mioGiocatore.mano.push(mazzoAttuale.pop() || cartaBriscola); }
            cartaBriscola = null;
            carteAlCentro = []; // Svuota il centro perché la briscola in fondo è stata presa
        } else {
            return chiudiManoEContaPunti();
        }
    }
    
    faseAnimazione = false;
    aggiornaInterfaccia();
    if(turnoDiChi === "avversario" && mazzoAttuale.length >= 0) setTimeout(turnoDelBot, 1000);
}

// ==========================
// CONTEGGIO PUNTI FINE MANO
// ==========================
function chiudiManoEContaPunti() {
    let msg = "FINE MANO!\n\n";

    if (giocoInCorso === "scopa") {
        // Chi ha preso per ultimo svuota il tavolo
        if (ultimoAPrendere === "io") mioGiocatore.prese.push(...carteAlCentro);
        else if (ultimoAPrendere === "avversario") avversarioBot.prese.push(...carteAlCentro);
        carteAlCentro = [];

        // Calcolo Scopa Completo
        let pMio = mioGiocatore.scope; let pBot = avversarioBot.scope;
        
        let carteMio = mioGiocatore.prese.length; let carteBot = avversarioBot.prese.length;
        if(carteMio > 20) { pMio++; msg += "CARTE: Tu (+1)\n"; } else if(carteBot > 20) { pBot++; msg += "CARTE: Bot (+1)\n"; }

        let oriMio = mioGiocatore.prese.filter(c => c.seme === 'oro').length; let oriBot = avversarioBot.prese.filter(c => c.seme === 'oro').length;
        if(oriMio > 5) { pMio++; msg += "DENARI: Tu (+1)\n"; } else if(oriBot > 5) { pBot++; msg += "DENARI: Bot (+1)\n"; }

        let settebelloMio = mioGiocatore.prese.find(c => c.valore === 7 && c.seme === 'oro');
        if(settebelloMio) { pMio++; msg += "SETTEBELLO: Tu (+1)\n"; } else { pBot++; msg += "SETTEBELLO: Bot (+1)\n"; }

        // Primiera
        let calcPrimiera = (prese) => {
            let maxM = { oro:0, coppe:0, spade:0, bastoni:0 };
            prese.forEach(c => { if(valoriPrimiera[c.valore] > maxM[c.seme]) maxM[c.seme] = valoriPrimiera[c.valore]; });
            return maxM.oro + maxM.coppe + maxM.spade + maxM.bastoni;
        };
        let priMio = calcPrimiera(mioGiocatore.prese); let priBot = calcPrimiera(avversarioBot.prese);
        if(priMio > priBot) { pMio++; msg += "PRIMIERA: Tu (+1)\n"; } else if(priBot > priMio) { pBot++; msg += "PRIMIERA: Bot (+1)\n"; }

        msg += `Scope tue: ${mioGiocatore.scope} | Scope Bot: ${avversarioBot.scope}\n`;
        punteggioGlobaleMio += pMio; punteggioGlobaleBot += pBot;
    } else {
        // Briscola
        punteggioGlobaleMio += mioGiocatore.punti; punteggioGlobaleBot += avversarioBot.punti;
        msg += `Punti Tuoi: ${mioGiocatore.punti} | Punti Bot: ${avversarioBot.punti}\n`;
    }

    msg += `\nPUNTEGGIO TOTALE:\nTu: ${punteggioGlobaleMio} / ${targetPuntiVittoria}\nBot: ${punteggioGlobaleBot} / ${targetPuntiVittoria}`;
    
    aggiornaInterfaccia();

    setTimeout(() => {
        alert(msg);
        if (punteggioGlobaleMio >= targetPuntiVittoria || punteggioGlobaleBot >= targetPuntiVittoria) {
            let esito = punteggioGlobaleMio > punteggioGlobaleBot ? "🏆 HAI VINTO LA PARTITA!" : (punteggioGlobaleMio === punteggioGlobaleBot ? "Pareggio pazzesco!" : "☠️ Hai perso la partita.");
            alert("🔥 PARTITA CONCLUSA! 🔥\n\n" + esito);
            window.esciDaTavoloCarte();
        } else {
            // Nuova mano! Si inverte il mazziere.
            chiHaIniziatoMano = (chiHaIniziatoMano === "io") ? "avversario" : "io";
            iniziaNuovaSmazzata();
        }
    }, 1500);
}