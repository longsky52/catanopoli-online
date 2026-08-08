// ==========================================
// MOTORE TABOO SICILIANO (TOTALITY GAMES) - V2
// Suoni Procedurali, Layout Video Ampio, 50 Carte
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
    
    // 🔥 NUOVE 30 CARTE!
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

// 🔥 GENERATORI AUDIO PROCEDURALI (SINTETIZZATI DAL BROWSER) 🔥
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol=0.5) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Envelope (per non farlo "schioccare")
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function suonaBuzzerErrore() {
    // Doppio Beep Basso e Cattivo (Sconfitta/Taboo)
    playTone(150, 'sawtooth', 0.4, 0.8);
    setTimeout(() => playTone(120, 'square', 0.5, 0.8), 200);
}

function suonaDingEsatto() {
    // Campanellino Squillante (Vittoria/Esatto)
    playTone(800, 'sine', 0.1, 0.4);
    setTimeout(() => playTone(1200, 'sine', 0.4, 0.4), 100);
}


window.avviaPartitaTaboo = function(roomData) {
    punteggioTaboo = 0;
    document.getElementById("taboo-score").innerText = punteggioTaboo;
    resettaCartaTaboo();
    
    // 💡 TRUCCO MAGICO PER LA VIDEOCHAT: 
    // Spostiamo la griglia video della Sala AFK dentro l'area Taboo!
    let afkGrid = document.getElementById("afk-video-grid");
    let tabooVideoArea = document.getElementById("taboo-video-area");
    
    if(afkGrid && tabooVideoArea) {
        // 🔥 REGOLE CSS PER RENDERLA BELLA LARGA E VISIBILE
        afkGrid.style.height = "auto";
        afkGrid.style.minHeight = "180px";
        afkGrid.style.flexWrap = "wrap"; 
        afkGrid.style.overflowX = "hidden";
        afkGrid.style.background = "transparent";
        afkGrid.style.width = "100%";
        afkGrid.style.justifyContent = "center";
        
        // Cerca i video per farli più larghi
        let wrappers = afkGrid.querySelectorAll("div[id^='wrapper-'], #my-video-wrapper");
        wrappers.forEach(w => {
            w.style.flex = "1 1 45%"; // Prende mezza riga
            w.style.maxWidth = "280px";
            w.style.aspectRatio = "4/3"; // Più "quadrati" e meno schiacciati
        });

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
    
    // Inizializza l'audio-context su interazione utente (richiesto dai browser)
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    alert("ONESTÀ CATANESE: L'avversario non vede la tua carta.\n\nSe pronunci una delle parole vietate o una parola con la stessa radice, DEVI premere ❌ TABOO!");
    
    turnoAttivoTaboo = true;
    tabooTimeLeft = 60;
    document.getElementById("taboo-timer").innerText = tabooTimeLeft;
    document.getElementById("btn-taboo-start").style.display = "none";
    
    document.getElementById("btn-taboo-ok").disabled = false;
    document.getElementById("btn-taboo-err").disabled = false;
    
    // Suonino d'avvio (Ding alto e veloce)
    playTone(1000, 'sine', 0.2);
    setTimeout(() => playTone(1500, 'sine', 0.3), 200);

    pescaCartaTaboo();

    timerTaboo = setInterval(() => {
        tabooTimeLeft--;
        document.getElementById("taboo-timer").innerText = tabooTimeLeft;
        
        // Ticchettio ultimi 5 secondi
        if(tabooTimeLeft <= 5 && tabooTimeLeft > 0) {
            playTone(2000, 'triangle', 0.05, 0.2);
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
    suonaBuzzerErrore();
    setTimeout(suonaBuzzerErrore, 500);
    
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
    
    suonaDingEsatto(); // Il nuovo suono procedurale
    pescaCartaTaboo(); 
};

window.tabooErrore = function() {
    if(!turnoAttivoTaboo) return;
    
    suonaBuzzerErrore(); // Il nuovo buzzer brutto
    pescaCartaTaboo(); 
};
