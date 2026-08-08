// ==========================================
// MOTORE TABOO SICILIANO (TOTALITY GAMES) - V4
// 100 Carte + Sincronizzazione Turni Perfetta!
// ==========================================

const mazzoTaboo = [
    // --- LE TUE PRIME 20 CARTE ---
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
    
    // --- LE 30 CARTE AGGIUNTE IERI ---
    { w: "PUPI", f: ["Teatro", "Spada", "Marionette", "Orlando", "Spettacolo"] },
    { w: "CANNOLO", f: ["Ricotta", "Dolce", "Scorza", "Pistacchio", "Gocce"] },
    { w: "PLAYA", f: ["Sabbia", "Lidi", "Estate", "Viale Kennedy", "Mare"] },
    { w: "VILLAGGIO DUSMET", f: ["Aeroporto", "Aerei", "Quartiere", "Zona", "Catania"] },
    { w: "LIBRINO", f: ["Quartiere", "Palazzi", "Viale", "Catania", "Periferia"] },
    { w: "VIA ETNEA", f: ["Negozi", "Lunga", "Centro", "Passeggiata", "Shopping"] },
    { w: "VILLA BELLINI", f: ["Alberi", "Parco", "Chiosco", "Passeggiata", "Verde"] },
    { w: "LUNGOMARE", f: ["Acqua", "Passeggiare", "Ognina", "Pista", "Ciclabile"] },
    { w: "CATTEDRALE", f: ["Chiesa", "Corso", "Italia", "Piazza", "Messa"] },
    { w: "FERROVIA", f: ["Treni", "Centrale", "Piazza", "Binari", "Viaggio"] },
    { w: "BORGO", f: ["Piazza", "Cavour", "Fontana", "Chiosco", "Quartiere"] },
    { w: "SAN CRISTOFORO", f: ["Quartiere", "Centro", "Storico", "Catania", "Strade"] },
    { w: "ACITREZZA", f: ["Faraglioni", "Mare", "Malavoglia", "Paese", "Pesce"] },
    { w: "ACICASTELLO", f: ["Castello", "Mare", "Piazza", "Scogli", "Normanno"] },
    { w: "CASTELLO URSINO", f: ["Federico", "Piazza", "Museo", "Antico", "Centro"] },
    { w: "PORTA UZEDA", f: ["Archi", "Marina", "Pescheria", "Duomo", "Muro"] },
    { w: "TAVOLA CALDA", f: ["Pezzi", "Cartocciata", "Cipollina", "Pizzetta", "Forno"] },
    { w: "CIPOLLINA", f: ["Sfoglia", "Prosciutto", "Pomodoro", "Formaggio", "Mangiare"] },
    { w: "CARTOCCIATA", f: ["Wurstel", "Forno", "Mozzarella", "Pezzo", "Calda"] },
    { w: "BOMBA", f: ["Fritto", "Pezzo", "Calda", "Ripieno", "Tavola"] },
    { w: "SFINCIONE", f: ["Riso", "Fritto", "Miele", "Dolce", "Zucchero"] },
    { w: "OLIVETTE", f: ["Sant'Agata", "Verde", "Pasta di mandorla", "Dolce", "Festa"] },
    { w: "CALIA", f: ["Seme", "Festa", "Simenza", "Bancarella", "Sgranocchiare"] },
    { w: "TORRONE", f: ["Mandorle", "Zucchero", "Duro", "Festa", "Bancarella"] },
    { w: "SCACCIATA", f: ["Natale", "Broccoli", "Tumazzo", "Forno", "Tuma"] },
    { w: "TUMA", f: ["Formaggio", "Pecorino", "Giallo", "Salato", "Scacciata"] },
    { w: "CAPONATA", f: ["Melanzane", "Aceto", "Dolce", "Salato", "Freddo"] },
    { w: "PARMIGIANA", f: ["Melanzane", "Sugo", "Uovo", "Forno", "Formaggio"] },
    { w: "MAU MAU", f: ["Festa", "Discoteca", "Ballare", "Locale", "Notte"] },
    { w: "FARAGLIONI", f: ["Scogli", "Mare", "Ciclopi", "Trezza", "Polifemo"] },

    // 🔥 LE NUOVISSIME 50 CARTE! (SIAMO A 100 TOTALI!)
    { w: "MACCARRONE", f: ["Pasta", "Sugo", "Domenica", "Mangiare", "Piatto"] },
    { w: "CRISPEDDE", f: ["Fritte", "Ricotta", "Acciughe", "Natale", "Forno"] },
    { w: "TRECASTAGNI", f: ["Paese", "Santi", "Alfio", "Montagna", "Festa"] },
    { w: "MISTERBIANCO", f: ["Paese", "Carnevale", "Costumi", "Etna", "Vicino"] },
    { w: "ACIREALE", f: ["Carnevale", "Carri", "Timpa", "Mare", "Paese"] },
    { w: "OGNINA", f: ["Porticciolo", "Mare", "Lungomare", "Pesce", "Barche"] },
    { w: "SAN GIOVANNI GALERMO", f: ["Quartiere", "Nord", "Periferia", "Strada", "Catania"] },
    { w: "SANGUINACCIO", f: ["Sangue", "Maiale", "Budello", "Arrustire", "Mangiare"] },
    { w: "STIGGHIOLE", f: ["Intestino", "Arrustire", "Fumo", "Plebiscito", "Limone"] },
    { w: "QUARUME", f: ["Caldume", "Trippa", "Pentolone", "Brodo", "Inverno"] },
    { w: "FIERA O LUNI", f: ["Mercato", "Carlo Alberto", "Lunedì", "Vestiti", "Bancarelle"] },
    { w: "VILLA PACINI", f: ["Archi", "Marina", "Giardino", "Vecchi", "Porto"] },
    { w: "PORTO", f: ["Navi", "Traghetti", "Mare", "Acqua", "Molo"] },
    { w: "AEROPORTO", f: ["Fontanarossa", "Aerei", "Volo", "Viaggio", "Valigie"] },
    { w: "ROSSAZZURRI", f: ["Colori", "Squadra", "Calcio", "Tifosi", "Maglia"] },
    { w: "AMENICANO", f: ["Tamarro", "Zaurdo", "Modo", "Collana", "Scooter"] },
    { w: "ZAURDO", f: ["Tamarro", "Grezzo", "Modi", "Fare", "Ignorante"] },
    { w: "MBARI", f: ["Compare", "Amico", "Fratello", "Chiamare", "Catanese"] },
    { w: "CIUSCIA", f: ["Fiato", "Soffiare", "Vento", "Caldo", "Bocca"] },
    { w: "PUMMARORO", f: ["Sugo", "Rosso", "Pasta", "Condimento", "Bottiglia"] },
    { w: "MULINCIANA", f: ["Parmigiana", "Pasta", "Norma", "Fritta", "Viola"] },
    { w: "PASTA ALLA NORMA", f: ["Melanzane", "Ricotta", "Salata", "Pomodoro", "Bellini"] },
    { w: "MINNE DI SANT'AGATA", f: ["Dolce", "Cassatella", "Ciliegia", "Ricotta", "Festa"] },
    { w: "CANDELORA", f: ["Festa", "Sant'Agata", "Legno", "Portatori", "Cera"] },
    { w: "CITTADINI", f: ["Urlo", "Festa", "Sant'Agata", "Viva", "Devoti"] },
    { w: "SACCO", f: ["Bianco", "Vestito", "Sant'Agata", "Devoto", "Votivo"] },
    { w: "CORDONE", f: ["Tirare", "Vara", "Sant'Agata", "Devoti", "Bianco"] },
    { w: "VARA", f: ["Fercolo", "Sant'Agata", "Tirare", "Argento", "Reliquie"] },
    { w: "CASSATELLA", f: ["Dolce", "Ricotta", "Zucchero", "Minna", "Verde"] },
    { w: "IRIS", f: ["Fritta", "Dolce", "Crema", "Cioccolato", "Forno"] },
    { w: "RAME", f: ["Biscotti", "Napoli", "Morti", "Cioccolato", "Novembre"] },
    { w: "VASTASO", f: ["Maleducato", "Zaurdo", "Comportamento", "Rispetto", "Parolacce"] },
    { w: "MAFALDA", f: ["Pezzo", "Tavola Calda", "Wurstel", "Sesamo", "Pane"] },
    { w: "PIZZETTA", f: ["Tavola Calda", "Pomodoro", "Formaggio", "Forno", "Tonda"] },
    { w: "PATÈ", f: ["Pezzo", "Tavola Calda", "Formaggio", "Prosciutto", "Sfoglia"] },
    { w: "RAVIOLA", f: ["Fritta", "Ricotta", "Tavola Calda", "Calda", "Sfoglia"] },
    { w: "BOLOGNESE", f: ["Pezzo", "Tavola Calda", "Carne", "Uovo", "Sfoglia"] },
    { w: "FOCACCIA", f: ["Pane", "Farcita", "Calda", "Forno", "Pezzo"] },
    { w: "MARE", f: ["Acqua", "Sale", "Bagno", "Estate", "Playa"] },
    { w: "SOLE", f: ["Caldo", "Estate", "Cielo", "Sudare", "Giallo"] },
    { w: "SCOGLIERA", f: ["Mare", "Pietre", "Nere", "Acitrezza", "Ognina"] },
    { w: "PISTACCHIO", f: ["Bronte", "Verde", "Dolce", "Salato", "Crema"] },
    { w: "BRONTE", f: ["Pistacchio", "Paese", "Etna", "Verde", "Oro"] },
    { w: "MANDORLA", f: ["Pasta", "Dolce", "Latte", "Bianca", "Frutto"] },
    { w: "LATTE DI MANDORLA", f: ["Bere", "Bianco", "Chiosco", "Dolce", "Fresco"] },
    { w: "SANGUINELLA", f: ["Arancia", "Rossa", "Succo", "Spremuta", "Frutto"] },
    { w: "LINGUA", f: ["Bocca", "Mangiare", "Parlare", "Carne", "Vitello"] },
    { w: "MUNTAGNA", f: ["Etna", "Vulcano", "Montagna", "Neve", "Catania"] }
];

let punteggioTaboo = 0;
let timerTaboo = null;
let tabooTimeLeft = 60;
let turnoAttivoTaboo = false;
let roomTaboo = "";
let myNameTaboo = "Tu";

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
    roomTaboo = typeof myRoom !== 'undefined' ? myRoom : "StanzaSconosciuta";
    myNameTaboo = document.getElementById("setup-name") ? document.getElementById("setup-name").value : "Avversario";
    
    punteggioTaboo = 0;
    document.getElementById("taboo-score").innerText = punteggioTaboo;
    resettaCartaTaboo();
    
    if (!document.getElementById("taboo-turn-status")) {
        let st = document.createElement("div");
        st.id = "taboo-turn-status";
        st.style = "color: white; font-weight: bold; font-size: 1.1rem; text-align: center; margin-bottom: 15px; padding: 0 10px;";
        let container = document.getElementById("taboo-card-container");
        container.parentNode.insertBefore(st, container);
    }
    document.getElementById("taboo-turn-status").innerHTML = "Siete pronti? Decidete a voce chi inizia!";
    document.getElementById("taboo-card-container").style.display = "flex";
    document.getElementById("btn-taboo-start").style.display = "block";
    document.getElementById("btn-taboo-start").innerText = "▶️ INIZIA IL MIO TURNO";

    let afkGrid = document.getElementById("afk-video-grid");
    let tabooVideoArea = document.getElementById("taboo-video-area");
    if(afkGrid && tabooVideoArea) {
        tabooVideoArea.appendChild(afkGrid);
    }
    
    if (typeof accendiMedia === 'function') setTimeout(() => { accendiMedia(true); }, 800); 

    if(typeof socket !== 'undefined' && socket) {
        socket.off("riceviTabooAzione");
        socket.on("riceviTabooAzione", (data) => {
            let statusText = document.getElementById("taboo-turn-status");
            let btnStart = document.getElementById("btn-taboo-start");
            let cardBox = document.getElementById("taboo-card-container");
            
            if (data.action === "start") {
                turnoAttivoTaboo = true; 
                btnStart.style.display = "none";
                cardBox.style.display = "none"; 
                statusText.innerHTML = `🗣️ Turno di <b style="color:#ffdf00;">${data.playerName}</b> in corso!<br>Ascolta la sua voce e indovina!`;
                
                tabooTimeLeft = 60;
                document.getElementById("taboo-timer").innerText = tabooTimeLeft;
                clearInterval(timerTaboo);
                timerTaboo = setInterval(() => {
                    tabooTimeLeft--;
                    document.getElementById("taboo-timer").innerText = tabooTimeLeft;
                    if(tabooTimeLeft <= 0) clearInterval(timerTaboo);
                }, 1000);

            } else if (data.action === "end") {
                turnoAttivoTaboo = false;
                clearInterval(timerTaboo);
                document.getElementById("taboo-timer").innerText = "SCADUTO";
                
                btnStart.style.display = "block";
                btnStart.innerText = "▶️ TOCCA A TE! INIZIA TURNO";
                cardBox.style.display = "flex";
                resettaCartaTaboo();
                
                statusText.innerHTML = `✅ Il turno di ${data.playerName} è finito!<br>Ha fatto <b style="color:#ffdf00;">${data.score}</b> punti! Ora tocca a te.`;
                if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_fine'); }catch(e){}
            }
        });
    }
};

window.esciDaTaboo = function() {
    if (typeof customConfirm !== 'undefined') {
        customConfirm("Vuoi abbandonare la stanza Taboo?", function() {
            if(typeof socket !== 'undefined' && socket) socket.disconnect(); 
            window.location.reload();
        });
    } else {
        if(confirm("Vuoi abbandonare la stanza Taboo?")) {
            if(typeof socket !== 'undefined' && socket) socket.disconnect(); 
            window.location.reload();
        }
    }
};

window.iniziaTurnoTaboo = function() {
    if(turnoAttivoTaboo) return;
    
    // NIENTE PIU' ALERT: USA IL NUOVO POPUP BELLISSIMO!
    if(typeof window.alert === 'function') {
        window.alert("ONESTÀ CATANESE:\nL'avversario non vede la tua carta.\n\nSe pronunci una delle parole vietate o una parola con la stessa radice, DEVI premere ❌ TABOO!");
    }
    
    turnoAttivoTaboo = true;
    punteggioTaboo = 0;
    document.getElementById("taboo-score").innerText = punteggioTaboo;
    tabooTimeLeft = 60;
    
    document.getElementById("taboo-timer").innerText = tabooTimeLeft;
    document.getElementById("btn-taboo-start").style.display = "none";
    document.getElementById("taboo-turn-status").innerHTML = "🗣️ È IL TUO TURNO! Fai indovinare le parole!";
    
    document.getElementById("btn-taboo-ok").disabled = false;
    document.getElementById("btn-taboo-err").disabled = false;

    if (typeof socket !== 'undefined' && socket) {
        socket.emit("tabooAzione", { room: roomTaboo, action: "start", playerName: myNameTaboo });
    }
    
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_start'); }catch(e){}

    pescaCartaTaboo();

    timerTaboo = setInterval(() => {
        tabooTimeLeft--;
        document.getElementById("taboo-timer").innerText = tabooTimeLeft;
        
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
    
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_fine'); }catch(e){}
    
    document.getElementById("btn-taboo-ok").disabled = true;
    document.getElementById("btn-taboo-err").disabled = true;
    document.getElementById("btn-taboo-start").style.display = "none"; 
    
    document.getElementById("taboo-turn-status").innerHTML = `Hai indovinato <b style="color:#ffdf00;">${punteggioTaboo}</b> carte!<br>Attendi che l'avversario inizi il suo turno.`;

    if (typeof socket !== 'undefined' && socket) {
        socket.emit("tabooAzione", { room: roomTaboo, action: "end", playerName: myNameTaboo, score: punteggioTaboo });
    }
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
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_esatto'); }catch(e){}
    pescaCartaTaboo(); 
};

window.tabooErrore = function() {
    if(!turnoAttivoTaboo) return;
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('taboo_errore'); }catch(e){}
    pescaCartaTaboo(); 
};
