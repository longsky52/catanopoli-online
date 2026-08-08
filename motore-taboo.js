// ==========================================
// MOTORE TABOO SICILIANO (TOTALITY GAMES)
// ==========================================

const mazzoTaboo = [
    { w: "ARANCINO", f: ["Riso", "Carne", "Punta", "Mangiare", "Sugo"] },
    { w: "LIOTRU", f: ["Elefante", "Piazza", "Duomo", "Statua", "Catania"] },
    { w: "GRANITA", f: ["Brioche", "Estate", "Fredda", "Ghiaccio", "Colazione"] },
    { w: "MOTORINO", f: ["Honda", "SH", "Casco", "Ruote", "Guidare"] },
    { w: "PANTERA", f: ["Polizia", "Macchina", "Sirena", "Arresto", "Sbirri"] },
    { w: "S.G. LI CUTI", f: ["Mare", "Spiaggia", "Sassi", "Porticciolo", "Bagno"] },
    { w: "PESCHERIA", f: ["Pesce", "Mercato", "Archi", "Acqua", "Vendere"] },
    { w: "CHIOSCO", f: ["Seltz", "Limone", "Sale", "Bere", "Sciroppo"] },
    { w: "ETNA", f: ["Vulcano", "Montagna", "Neve", "Fuoco", "Lava"] },
    { w: "SANT'AGATA", f: ["Festa", "Patrona", "Febbraio", "Vara", "Cittadini"] },
    { w: "CIBALI", f: ["Stadio", "Calcio", "Catania", "Partita", "Tifosi"] },
    { w: "LAPA", f: ["Ape", "Piaggio", "Moto", "Tre Ruote", "Carico"] },
    { w: "ARRUSTI E MANGIA", f: ["Carne", "Cavallo", "Fumo", "Brace", "Strada"] },
    { w: "MINNIZZA", f: ["Spazzatura", "Cassonetto", "Buttare", "Strada", "Puzza"] },
    { w: "POSTEGGIATORE", f: ["Soldi", "Euro", "Macchina", "Strada", "Caffè"] },
    { w: "ZAFFERANA", f: ["Paese", "Miele", "Ottobrata", "Montagna", "Freddo"] },
    { w: "MASSIMINO", f: ["Teatro", "Piazza", "Bellini", "Opera", "Catania"] },
    { w: "BRT", f: ["Autobus", "Corsia", "Veloce", "Multe", "AMT"] },
    { w: "CARNE DI CAVALLO", f: ["Plebiscito", "Arrustire", "Mangiare", "Panino", "Fumo"] },
    { w: "MACCHINETTA", f: ["Caffè", "Gettoni", "Pausa", "Scuola", "Bere"] }
];

let punteggioTaboo = 0;
let timerTaboo = null;
let tabooTimeLeft = 60;
let turnoAttivoTaboo = false;

window.avviaPartitaTaboo = function(roomData) {
    punteggioTaboo = 0;
    document.getElementById("taboo-score").innerText = punteggioTaboo;
    resettaCartaTaboo();
    
    // 💡 TRUCCO MAGICO: Spostiamo la griglia video della Sala AFK dentro l'area Taboo!
    let afkGrid = document.getElementById("afk-video-grid");
    let tabooVideoArea = document.getElementById("taboo-video-area");
    if(afkGrid && tabooVideoArea) {
        // Modifichiamo al volo lo stile per farlo entrare bello stretto in alto
        afkGrid.style.height = "130px";
        afkGrid.style.flexWrap = "nowrap";
        afkGrid.style.overflowX = "auto";
        afkGrid.style.background = "rgba(0,0,0,0.4)";
        afkGrid.style.borderRadius = "8px";
        tabooVideoArea.appendChild(afkGrid);
    }
    
    // Accende automaticamente videocamera e microfono!
    if (typeof accendiMedia === 'function') {
        setTimeout(() => { accendiMedia(true); }, 800); 
    }
};

window.esciDaTaboo = function() {
    if (confirm("Vuoi abbandonare la stanza Taboo?")) {
        if(typeof socket !== 'undefined' && socket) socket.disconnect(); 
        window.location.reload();
    }
};

window.iniziaTurnoTaboo = function() {
    if(turnoAttivoTaboo) return;
    
    // Mostra l'avviso di onestà!
    alert("ONESTÀ CATANESE: L'avversario non vede la tua carta. Se pronunci una delle parole vietate o una parola con la stessa radice, DEVI premere 'TABOO!'");
    
    turnoAttivoTaboo = true;
    tabooTimeLeft = 60;
    document.getElementById("taboo-timer").innerText = tabooTimeLeft;
    document.getElementById("btn-taboo-start").style.display = "none";
    
    document.getElementById("btn-taboo-ok").disabled = false;
    document.getElementById("btn-taboo-err").disabled = false;
    
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('dadi'); }catch(e){} // Suonino d'avvio

    pescaCartaTaboo();

    timerTaboo = setInterval(() => {
        tabooTimeLeft--;
        document.getElementById("taboo-timer").innerText = tabooTimeLeft;
        if(tabooTimeLeft <= 0) {
            fineTurnoTaboo();
        }
    }, 1000);
};

function fineTurnoTaboo() {
    clearInterval(timerTaboo);
    turnoAttivoTaboo = false;
    document.getElementById("taboo-timer").innerText = "TEMPO SCADUTO!";
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('sirena'); }catch(e){} // Suono fine
    
    document.getElementById("btn-taboo-ok").disabled = true;
    document.getElementById("btn-taboo-err").disabled = true;
    document.getElementById("btn-taboo-start").style.display = "block";
    document.getElementById("btn-taboo-start").innerText = "▶️ PASSA IL TURNO A UN ALTRO";
    resettaCartaTaboo();
}

function pescaCartaTaboo() {
    let rnd = Math.floor(Math.random() * mazzoTaboo.length);
    let c = mazzoTaboo[rnd];
    
    document.getElementById("taboo-word").innerText = c.w;
    let vietateHtml = "";
    c.f.forEach(v => {
        vietateHtml += `<span style="font-size:1.4rem; color:#bd2a2a; font-weight:bold; text-transform:uppercase;">${v}</span>`;
    });
    document.getElementById("taboo-forbidden-words").innerHTML = vietateHtml;
}

function resettaCartaTaboo() {
    document.getElementById("taboo-word").innerText = "IN ATTESA...";
    document.getElementById("taboo-forbidden-words").innerHTML = `
        <span style="font-size:1.4rem; color:#bd2a2a; font-weight:bold;">???</span>
        <span style="font-size:1.4rem; color:#bd2a2a; font-weight:bold;">???</span>
        <span style="font-size:1.4rem; color:#bd2a2a; font-weight:bold;">???</span>
        <span style="font-size:1.4rem; color:#bd2a2a; font-weight:bold;">???</span>
        <span style="font-size:1.4rem; color:#bd2a2a; font-weight:bold;">???</span>
    `;
}

window.tabooIndovinata = function() {
    if(!turnoAttivoTaboo) return;
    punteggioTaboo++;
    document.getElementById("taboo-score").innerText = punteggioTaboo;
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('cassa'); }catch(e){} 
    pescaCartaTaboo(); // Estrae subito una nuova carta
};

window.tabooErrore = function() {
    if(!turnoAttivoTaboo) return;
    // SUONA IL BUZZER SCONFITTA. In videochat lo sentiranno tutti!
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('sconfitta'); }catch(e){} 
    pescaCartaTaboo(); 
};