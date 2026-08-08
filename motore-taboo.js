// ==========================================
// MOTORE TABOO SICILIANO (TOTALITY GAMES) - V3
// Suoni Realistici Esterni e Telecamere Affiancate
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
    { w: "MACCHINETTA", f: ["Caffè", "Gettoni", "Pausa", "Scuola", "Bere"] },
    
    // NUOVE CARTE
    { w: "PUPARI", f: ["Teatro", "Spada", "Marionette", "Orlando", "Spettacolo"] },
    { w: "CANNOLO", f: ["Ricotta", "Dolce", "Scorza", "Pistacchio", "Gocce"] },
    { w: "PLAYA", f: ["Sabbia", "Lidi", "Estate", "Viale Kennedy", "Mare"] },
    { w: "VILLAGGIO DUSMET", f: ["Aeroporto", "Aerei", "Quartiere", "Zona", "Catania"] },
    { w: "LIBRINO", f: ["Quartiere", "Palazzi", "Viale", "Catania", "Periferia"] },
    { w: "VIA ETNEA", f: ["Negozi", "Lunga", "Centro", "Passeggiata", "Shopping"] },
    { w: "VILLA BELLINI", f: ["Alberi", "Parco", "Chiosco", "Passeggiata", "Verde"] },
    { w: "LUNGOMARE", f: ["Acqua", "Passeggiare", "Ognina", "Pista", "Ciclabile"] },
    { w: "CRISTO RE", f: ["Chiesa", "Corso", "Italia", "Piazza", "Messa"] },
    { w: "FERROVIA", f: ["Treni", "Centrale", "Piazza", "Binari", "Viaggio"] },
    { w: "BORGO", f: ["Piazza", "Cavour", "Fontana", "Chiosco", "Quartiere"] },
    { w: "SAN CRISTOFORO", f: ["Quartiere", "Centro", "Storico", "Catania", "Strade"] },
    { w: "ACITREZZA", f: ["Faraglioni", "Mare", "Malavoglia", "Paese", "Pesce"] },
    { w: "ACICASTELLO", f: ["Castello", "Mare", "Piazza", "Scogli", "Normanno"] },
    { w: "CASTELLO URSINO", f: ["Federico", "Piazza", "Museo", "Antico", "Centro"] },
    { w: "PORTA UGEDA", f: ["Archi", "Marina", "Pescheria", "Duomo", "Muro"] },
    { w: "TAVOLA CALDA", f: ["Pezzi", "Cartocciata", "Cipollina", "Pizzetta", "Forno"] },
    { w: "CIPOLLINA", f: ["Sfoglia", "Prosciutto", "Pomodoro", "Formaggio", "Mangiare"] },
    { w: "CARTOCCIATA", f: ["Wurstel", "Forno", "Mozzarella", "Pezzo", "Calda"] },
    { w: "BOMBA", f: ["Fritto", "Pezzo", "Calda", "Ripieno", "Tavola"] },
    { w: "SFINCIONE", f: ["Riso", "Fritto", "Miele", "Dolce", "Zucchero"] },
    { w: "OLIVETTE", f: ["Sant'Agata", "Verde", "Pasta di mandorla", "Dolce", "Festa"] },
    { w: "CALIA", f: ["Seme", "Festa", "Simenza", "Bancarella", "Sgranocchiare"] },
    { w: "TORRONE", f: ["Mandorle", "Zucchero", "Duro", "Festa", "Bancarella"] },
    { w: "SCACCIATA", f: ["Natale", "Broccoli", "Tumazzo", "Forno", "Tuma"] },
    { w: "TUMAZZO", f: ["Formaggio", "Pecorino", "Giallo", "Salato", "Scacciata"] },
    { w: "CAPONATA", f: ["Melanzane", "Aceto", "Dolce", "Salato", "Freddo"] },
    { w: "PARMIGIANA", f: ["Melanzane", "Sugo", "Uovo", "Forno", "Formaggio"] },
    { w: "MAU MAU", f: ["Festa", "Discoteca", "Ballare", "Locale", "Notte"] },
    { w: "FARAGLIONI", f: ["Scogli", "Mare", "Ciclopi", "Trezza", "Polifemo"] }
];

let punteggioTaboo = 0;
let timerTaboo = null;
let tabooTimeLeft = 60;
let turnoAttivoTaboo = false;

// 🔥 STILI FORZATI PER AFFIANCARE LE DUE VIDEOCAMERE IN MODO PERFETTO 🔥
const styleVidTaboo = document.createElement('style');
styleVidTaboo.innerHTML = `
    #taboo-video-area #afk-video-grid {
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        justify-content: center !important;
        align-items: center !important;
        height: 180px !important;
        background: transparent !important;
    }
    #taboo-video-area #afk-video-grid > div {
        flex: 1 1 50% !important;
        max-width: 50% !important;
        height: 100% !important;
        aspect-ratio: auto !important;
        border-radius: 12px;
        margin: 0 4px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.8);
    }
    #taboo-video-area video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        border-radius: 12px !important;
    }
`;
document.head.appendChild(styleVidTaboo);

window.avviaPartitaTaboo = function(roomData) {
    punteggioTaboo = 0;
    document.getElementById("taboo-score").innerText = punteggioTaboo;
    resettaCartaTaboo();
    
    // Spostiamo la griglia video della Sala AFK dentro l'area Taboo
    let afkGrid = document.getElementById("afk-video-grid");
    let tabooVideoArea = document.getElementById("taboo-video-area");
    if(afkGrid && tabooVideoArea) {
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
    
    alert("ONESTÀ CATANESE: L'avversario non vede la tua carta.\n\nSe pronunci una delle parole vietate o usi una traduzione/radice simile, DEVI premere ❌ TABOO!");
    
    turnoAttivoTaboo = true;
    tabooTimeLeft = 60;
    document.getElementById("taboo-timer").innerText = tabooTimeLeft;
    document.getElementById("btn-taboo-start").style.display = "none";
    
    document.getElementById("btn-taboo-ok").disabled = false;
    document.getElementById("btn-taboo-err").disabled = false;
    
    // Suono Inizio Turno
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_start'); }catch(e){}

    pescaCartaTaboo();

    timerTaboo = setInterval(() => {
        tabooTimeLeft--;
        document.getElementById("taboo-timer").innerText = tabooTimeLeft;
        
        // Tic Tac finali (ultimi 5 secondi)
        if(tabooTimeLeft <= 5 && tabooTimeLeft > 0) {
            if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_tic'); }catch(e){}
        }

        if(tabooTimeLeft <= 0) {
            fineTurnoTaboo();
        }
    }, 1000);
};

function fineTurnoTaboo() {
    clearInterval(timerTaboo);
    turnoAttivoTaboo = false;
    document.getElementById("taboo-timer").innerText = "TEMPO SCADUTO!";
    
    // Suono Sirena di fine turno
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_fine'); }catch(e){}
    
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
        vietateHtml += `<span style="font-size:1.3rem; color:#bd2a2a; font-weight:bold; text-transform:uppercase;">${v}</span>`;
    });
    document.getElementById("taboo-forbidden-words").innerHTML = vietateHtml;
}

function resettaCartaTaboo() {
    document.getElementById("taboo-word").innerText = "IN ATTESA...";
    document.getElementById("taboo-forbidden-words").innerHTML = `
        <span style="font-size:1.3rem; color:#bd2a2a; font-weight:bold;">???</span>
        <span style="font-size:1.3rem; color:#bd2a2a; font-weight:bold;">???</span>
        <span style="font-size:1.3rem; color:#bd2a2a; font-weight:bold;">???</span>
        <span style="font-size:1.3rem; color:#bd2a2a; font-weight:bold;">???</span>
        <span style="font-size:1.3rem; color:#bd2a2a; font-weight:bold;">???</span>
    `;
}

window.tabooIndovinata = function() {
    if(!turnoAttivoTaboo) return;
    punteggioTaboo++;
    document.getElementById("taboo-score").innerText = punteggioTaboo;
    
    // Suono Reale Esatto
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_esatto'); }catch(e){}
    
    pescaCartaTaboo(); 
};

window.tabooErrore = function() {
    if(!turnoAttivoTaboo) return;
    
    // Suono Reale Buzzer
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_errore'); }catch(e){}
    
    pescaCartaTaboo(); 
};
