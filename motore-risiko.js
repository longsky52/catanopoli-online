// ==========================================
// MOTORE RISIKO CATANESE (TOTALITY GAMES) - V3.1
// Mappa Allargata, Fix Testi e Carte Speciali
// ==========================================

const styleRisiko = document.createElement('style');
styleRisiko.innerHTML = `
    #risiko-map-container {
        position: relative;
        background-color: #0a0e17;
        box-shadow: inset 0 0 50px rgba(0,0,0,0.9);
        overflow: hidden !important; 
    }
    #risiko-map-container::before {
        content: '';
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background-image: url('mappa-catania.jpg');
        background-size: cover;
        background-position: center;
        filter: brightness(0.3) contrast(1.2) grayscale(0.5); 
        pointer-events: none;
        z-index: 0;
    }
    #risiko-map {
        z-index: 1; 
    }
    
   .r-node {
        position: absolute;
        width: clamp(50px, 9vw, 65px); height: clamp(50px, 9vw, 65px); /* PIÙ PICCOLI! */
        border-radius: 50%;
        background: #222;
        border: 3px solid #fff; /* Bordo leggermente più fine */
        transform: translate(-50%, -50%);
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.9), inset 0 0 10px rgba(0,0,0,0.5);
        transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
        z-index: 2;
    }
    .r-node:hover { transform: translate(-50%, -50%) scale(1.1); z-index: 3; }
    .r-node.selected { border-color: #ffdf00; box-shadow: 0 0 30px #ffdf00; transform: translate(-50%, -50%) scale(1.15); z-index: 4; }
    .r-node.target { border-color: #ff4444; box-shadow: 0 0 30px #ff4444; animation: pulseTarget 1s infinite; cursor: crosshair; }
    
    .r-node-name {
        position: absolute; top: -22px; /* Etichetta più vicina al pallino */
        background: rgba(0,0,0,0.95); padding: 2px 6px;
        border-radius: 4px; color: white; font-size: 0.8rem; /* Font più piccolo */
        font-weight: bold;
        white-space: nowrap; pointer-events: none; border: 1px solid #555;
    }
.r-node-troops { 
        font-size: 1.4rem; /* Numeri e motoretti rimpiccioliti */
        font-weight: bold; color: white; text-shadow: 0 2px 4px black; 
        pointer-events: none; display: flex; align-items: center; gap: 3px; 
    }
    @keyframes pulseTarget { 0% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); } 50% { transform: translate(-50%, -50%) scale(1.15); filter: brightness(1.5); } 100% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); } }
    
    /* MODAL BATTAGLIA E CARTE */
    #risiko-battle-modal, #risiko-cards-modal { display: none; position: absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index: 1000; justify-content:center; align-items:center; flex-direction:column; }
    .r-dice-box { display: flex; gap: 10px; margin: 15px 0; }
    .r-dice { font-size: 4rem; width: 60px; height: 60px; display: flex; justify-content: center; align-items: center; background: white; border-radius: 12px; box-shadow: 0 5px 15px black; }
    .r-dice.red { color: #bd2a2a; border: 3px solid #7a1515; }
    .r-dice.blue { color: #2c4a8a; border: 3px solid #1a2a5a; }
    
    .r-card { background: #fdf5e6; border: 4px solid var(--border-color); border-radius: 8px; width: 70px; height: 100px; display: flex; flex-direction: column; justify-content: space-around; align-items: center; color: black; box-shadow: 0 5px 15px rgba(0,0,0,0.8); padding: 5px;}
    .r-card-icon { font-size: 2.5rem; }
    .r-card-name { font-size: 0.5rem; font-weight: bold; text-align: center; }
`;
document.head.appendChild(styleRisiko);

const TIPI_CARTA = ["🛵", "🛺", "🐘"]; 
let mazzoRisiko = [];

const R_OBIETTIVI = [
    "Conquista i 4 Quartieri del Sud (Zia Lisa, Playa, Goretti, Librino) e difendili.",
    "Conquista l'intero Centro Storico e almeno 2 Paesi Etnei.",
    "Conquista la Costa (Ognina, Li Cuti, Acicastello, Acitrezza) e 3 territori a scelta.",
    "Guerra Totale: Conquista 12 territori qualsiasi sulla mappa.",
    "Annienta completamente le armate di Zio Turi (Giallo)."
];
let mioObiettivo = "";

const R_ZONES = {
    "centro": { color: "#8a2be2" }, 
    "sud": { color: "#bd2a2a" },    
    "costa": { color: "#00bfff" },  
    "etnei": { color: "#3b7a3b" }   
};

// 🔥 NODI ABBASSATI E DISTANZIATI PER NON COPRIRSI 🔥
const R_NODES = {
    // CENTRO
    "duomo": { nome: "P.zza Duomo", zona: "centro", x: 50, y: 70, links: ["stesicoro", "playa", "licuti"] },
    "stesicoro": { nome: "Stesicoro", zona: "centro", x: 50, y: 50, links: ["duomo", "borgo", "cibali", "ognina"] },
    "borgo": { nome: "Il Borgo", zona: "centro", x: 45, y: 30, links: ["stesicoro", "cibali", "misterbianco", "trecastagni"] },
    "cibali": { nome: "Cibali", zona: "centro", x: 30, y: 45, links: ["stesicoro", "borgo", "zialisa", "misterbianco"] },
    
    // SUD
    "playa": { nome: "La Playa", zona: "sud", x: 50, y: 88, links: ["duomo", "zialisa", "goretti"] },
    "zialisa": { nome: "Zia Lisa", zona: "sud", x: 30, y: 78, links: ["playa", "librino", "cibali"] },
    "librino": { nome: "Librino", zona: "sud", x: 10, y: 75, links: ["zialisa", "goretti", "misterbianco"] },
    "goretti": { nome: "Vill. Goretti", zona: "sud", x: 25, y: 92, links: ["playa", "librino"] },

    // COSTA
    "licuti": { nome: "S.G. Li Cuti", zona: "costa", x: 70, y: 72, links: ["duomo", "ognina"] },
    "ognina": { nome: "Ognina", zona: "costa", x: 85, y: 55, links: ["licuti", "acicastello", "stesicoro"] },
    "acicastello": { nome: "Acicastello", zona: "costa", x: 95, y: 40, links: ["ognina", "acitrezza", "trecastagni"] },
    "acitrezza": { nome: "Acitrezza", zona: "costa", x: 95, y: 20, links: ["acicastello", "zafferana"] },

    // ETNEI
    "misterbianco": { nome: "Misterbianco", zona: "etnei", x: 10, y: 40, links: ["cibali", "borgo", "librino", "paterno"] },
    "paterno": { nome: "Paternò", zona: "etnei", x: 15, y: 15, links: ["misterbianco"] },
    "trecastagni": { nome: "Trecastagni", zona: "etnei", x: 65, y: 20, links: ["borgo", "acicastello", "zafferana"] },
    "zafferana": { nome: "Zafferana", zona: "etnei", x: 80, y: 10, links: ["trecastagni", "acitrezza"] }
};

let rPlayers = [];
let rTurnoIndex = 0;
let rFase = 0; 
let rTruppeDaPiazzare = 0;
let rNodeSelected = null;
let isMultiplayerRisiko = false;
let haConquistatoTerritorio = false;

window.avviaPartitaDaMenuRisiko = function() {
    let numBots = parseInt(document.getElementById("risiko-setup-bots").value);
    document.getElementById("risiko-setup-menu").style.display = "none";
    document.getElementById("risiko-ui").style.display = "flex";
    avviaPartitaRisiko(false, { bots: numBots });
};

window.avviaPartitaRisiko = function(isMulti, dati) {
    isMultiplayerRisiko = isMulti;
    haConquistatoTerritorio = false;
    creaMazzo();
    
    let mapDiv = document.getElementById("risiko-map");
    mapDiv.style.transform = "scale(0.9)"; 
    mapDiv.innerHTML = '<svg id="risiko-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></svg>';
    
    // MODAL BATTAGLIA E CARTE
    let containerModals = document.createElement("div");
    containerModals.innerHTML = `
        <div id="risiko-battle-modal">
            <h2 id="r-battle-title" style="color:#ffdf00; font-size: 2rem; margin-bottom: 20px;">BATTAGLIA!</h2>
            <div style="display:flex; gap:40px; align-items:center;">
                <div style="text-align:center;"><h3 style="color:#ff4444;">ATTACCO</h3><div class="r-dice-box" id="r-att-dice"></div></div>
                <h1 style="color:white;">VS</h1>
                <div style="text-align:center;"><h3 style="color:#44ff44;">DIFESA</h3><div class="r-dice-box" id="r-def-dice"></div></div>
            </div>
            <h3 id="r-battle-result" style="color:white; font-size:1.8rem; margin-top:20px; min-height:40px;"></h3>
            <button id="btn-close-battle" class="btn" style="margin-top:20px; display:none;" onclick="chiudiBattaglia()">CONTINUA</button>
        </div>
        
        <div id="risiko-cards-modal">
            <h2 style="color:#00bfff; font-size: 2rem; margin-bottom: 10px;">LE TUE CARTE</h2>
            <p style="color: white; margin-bottom: 20px;">Tris uguale o Tris misto per ottenere truppe extra!</p>
            <div id="r-cards-list" style="display:flex; flex-wrap:wrap; justify-content:center; gap:10px; max-width: 90%;"></div>
            <button id="btn-scambia-carte" class="btn" style="background:#c99c51; color:black; margin-top:30px; display:none;" onclick="scambiaCarte()">GIOCA COMBO E PRENDI TRUPPE!</button>
            <button class="btn secondary" style="margin-top:20px;" onclick="chiudiCarteRisiko()">CHIUDI INVENTARIO</button>
        </div>
    `;
    document.getElementById("risiko-ui").appendChild(containerModals);

    // Disegna Linee Mappa
    let svg = document.getElementById("risiko-svg");
    let disegnati = [];
    Object.keys(R_NODES).forEach(id1 => {
        let n1 = R_NODES[id1];
        n1.links.forEach(id2 => {
            let coppia = [id1, id2].sort().join("-");
            if(!disegnati.includes(coppia)) {
                disegnati.push(coppia);
                let n2 = R_NODES[id2];
                let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", n1.x + "%"); line.setAttribute("y1", n1.y + "%");
                line.setAttribute("x2", n2.x + "%"); line.setAttribute("y2", n2.y + "%");
                line.setAttribute("stroke", "rgba(255,255,255,0.4)");
                line.setAttribute("stroke-width", "6");
                line.setAttribute("stroke-dasharray", "8,8");
                svg.appendChild(line);
            }
        });
    });

    // Disegna Nodi Mappa
    Object.keys(R_NODES).forEach(id => {
        let n = R_NODES[id];
        let div = document.createElement("div");
        div.className = "r-node";
        div.id = "rn-" + id;
        div.style.left = n.x + "%";
        div.style.top = n.y + "%";
        div.style.borderColor = R_ZONES[n.zona].color;
        
        div.innerHTML = `
            <div class="r-node-name" style="background:${R_ZONES[n.zona].color}">${n.nome}</div>
            <div class="r-node-troops" id="rnt-${id}">0 🛵</div>
        `;
        div.onclick = () => clickNodoRisiko(id);
        mapDiv.appendChild(div);
        n.owner = null;
        n.troops = 0;
    });

    let myName = document.getElementById("setup-name") ? document.getElementById("setup-name").value : "Tu";
    if(!myName) myName = "Tu";
    
    const rColors = ["#bd2a2a", "#d1b438", "#2c4a8a", "#8a2be2"];
    rPlayers = [];
    mioObiettivo = R_OBIETTIVI[Math.floor(Math.random() * R_OBIETTIVI.length)];
    
    if(!isMulti) {
        rPlayers.push({ id: "p0", name: myName, color: rColors[0], isBot: false, cards: [] });
        let nomiBot = ["Zio Turi", "Alfio", "Cettina"];
        for(let i=0; i<dati.bots; i++) {
            rPlayers.push({ id: "b"+i, name: nomiBot[i], color: rColors[i+1], isBot: true, cards: [] });
        }
        
        // 🔥 FIX TESTO: USIAMO <br> PER I RITORNI A CAPO NEL POPUP! 🔥
        if(typeof window.alert === 'function') setTimeout(() => window.alert("IL TUO OBIETTIVO SEGRETO:<br><br>" + mioObiettivo), 500);
        
        distribuisciTerritoriIniziali();
        iniziaTurnoRisiko(0);
    }
};

function creaMazzo() {
    mazzoRisiko = [];
    Object.keys(R_NODES).forEach((k, index) => {
        mazzoRisiko.push({ tipo: TIPI_CARTA[index % 3], terr: R_NODES[k].nome });
    });
    mazzoRisiko.push({ tipo: "🃏", terr: "JOLLY" });
    mazzoRisiko.push({ tipo: "🃏", terr: "JOLLY" });
    mazzoRisiko.sort(() => Math.random() - 0.5); 
}

function pescaCartaRisiko(player) {
    if(mazzoRisiko.length > 0) {
        let carta = mazzoRisiko.pop();
        player.cards.push(carta);
        if(!player.isBot) {
            document.getElementById("risiko-carte-count").innerText = player.cards.length;
            // 🔥 FIX TESTO
            if(typeof window.alert === 'function') window.alert(`🎴 Hai conquistato un territorio e hai pescato una carta!<br><br>${carta.terr} - ${carta.tipo}`);
        }
    }
}

window.apriCarteRisiko = function() {
    let p = rPlayers[0];
    let listDiv = document.getElementById("r-cards-list");
    let modal = document.getElementById("risiko-cards-modal");
    
    if(p.cards.length === 0) {
        listDiv.innerHTML = "<p style='color:#aaa;'>Non hai nessuna carta. Conquista territori per ottenerle!</p>";
        document.getElementById("btn-scambia-carte").style.display = "none";
    } else {
        listDiv.innerHTML = p.cards.map(c => `
            <div class="r-card">
                <div class="r-card-icon">${c.tipo}</div>
                <div class="r-card-name">${c.terr}</div>
            </div>
        `).join("");
        
        if(p.cards.length >= 3 && rFase === 0 && rTurnoIndex === 0) {
            document.getElementById("btn-scambia-carte").style.display = "block";
        } else {
            document.getElementById("btn-scambia-carte").style.display = "none";
        }
    }
    modal.style.display = "flex";
};

window.chiudiCarteRisiko = function() {
    document.getElementById("risiko-cards-modal").style.display = "none";
};

window.scambiaCarte = function() {
    let p = rPlayers[0];
    p.cards.splice(0, 3); 
    rTruppeDaPiazzare += 8;
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('cassa'); }catch(e){}
    document.getElementById("risiko-carte-count").innerText = p.cards.length;
    document.getElementById("risiko-truppe-disp").innerText = rTruppeDaPiazzare;
    chiudiCarteRisiko();
    if(typeof window.alert === 'function') window.alert("🎴 Hai scambiato 3 carte per 8 ARMATE EXTRA!");
};


function distribuisciTerritoriIniziali() {
    let keys = Object.keys(R_NODES);
    keys.sort(() => Math.random() - 0.5); 
    
    let pIdx = 0;
    keys.forEach(k => {
        R_NODES[k].owner = rPlayers[pIdx].id;
        R_NODES[k].troops = 3; 
        pIdx = (pIdx + 1) % rPlayers.length;
    });
    aggiornaMappaRisiko();
}

function ottieniIconaArmata(numero) {
    if (numero >= 10) return "🐘"; 
    if (numero >= 5) return "🛺";  
    return "🛵";                   
}

function aggiornaMappaRisiko() {
    Object.keys(R_NODES).forEach(id => {
        let n = R_NODES[id];
        let p = rPlayers.find(pl => pl.id === n.owner);
        let nodeDiv = document.getElementById("rn-" + id);
        let textDiv = document.getElementById("rnt-" + id);
        if(p && nodeDiv && textDiv) {
            nodeDiv.style.background = p.color;
            textDiv.innerHTML = `${n.troops} <span style="font-size:1.2rem;">${ottieniIconaArmata(n.troops)}</span>`;
        }
        nodeDiv.classList.remove("selected", "target");
    });
    
    if (rNodeSelected) {
        document.getElementById("rn-" + rNodeSelected).classList.add("selected");
        R_NODES[rNodeSelected].links.forEach(lId => {
            if(R_NODES[lId].owner !== R_NODES[rNodeSelected].owner && rFase === 1) {
                document.getElementById("rn-" + lId).classList.add("target");
            }
        });
    }
    
    let mioP = rPlayers[0];
    let mieZone = Object.values(R_NODES).filter(n => n.owner === mioP.id).length;
    document.getElementById("risiko-zone-tue").innerText = mieZone;
    document.getElementById("risiko-truppe-disp").innerText = rTruppeDaPiazzare;
}

function iniziaTurnoRisiko(idx) {
    rTurnoIndex = idx;
    let p = rPlayers[idx];
    rNodeSelected = null;
    haConquistatoTerritorio = false;
    
    let territoriPosseduti = Object.values(R_NODES).filter(n => n.owner === p.id).length;
    if(territoriPosseduti === 0) {
        iniziaTurnoRisiko((idx + 1) % rPlayers.length);
        return;
    }
    
    rTruppeDaPiazzare = Math.max(3, Math.floor(territoriPosseduti / 3));
    impostaFaseRisiko(0); 
    
    if(p.isBot) {
        setTimeout(() => eseguiTurnoBot(p), 1000);
    }
}

function passaFaseManuale() {
    if (rFase === 0) {
        if(rTruppeDaPiazzare > 0 && typeof window.alert === 'function') {
            window.alert("Devi piazzare tutte le truppe prima di attaccare!");
            return;
        }
        impostaFaseRisiko(1);
    } else if (rFase === 1) {
        impostaFaseRisiko(2);
    } else if (rFase === 2) {
        chiudiTurno();
    }
}

function chiudiTurno() {
    let p = rPlayers[rTurnoIndex];
    if(haConquistatoTerritorio) {
        pescaCartaRisiko(p);
    }
    iniziaTurnoRisiko((rTurnoIndex + 1) % rPlayers.length);
}

function impostaFaseRisiko(fase) {
    rFase = fase;
    let p = rPlayers[rTurnoIndex];
    let isMyTurn = (!p.isBot && rTurnoIndex === 0);
    
    let titolo = document.getElementById("risiko-fase-titolo");
    let info = document.getElementById("risiko-info-turno");
    let btn1 = document.getElementById("btn-risiko-azione1");
    let btn2 = document.getElementById("btn-risiko-azione2");
    
    info.innerHTML = isMyTurn ? "<b style='color:#44ff44;'>Tocca a te! Clicca sulla mappa.</b>" : `Turno di <b style='color:${p.color};'>${p.name}</b>`;
    
    btn2.onclick = passaFaseManuale;

    if(fase === 0) {
        titolo.innerText = "FASE 1: RINFORZI";
        btn1.innerText = isMyTurn ? `PIAZZA ${rTruppeDaPiazzare} 🛵` : "ATTENDI";
        btn2.disabled = !isMyTurn;
        btn2.innerText = "VAI ALL'ATTACCO";
    } else if (fase === 1) {
        titolo.innerText = "FASE 2: ATTACCO";
        btn1.innerText = isMyTurn ? "SELEZIONA BERSAGLIO 🎯" : "ATTENDI";
        btn2.disabled = !isMyTurn;
        btn2.innerText = "FINE ATTACCO";
    } else if (fase === 2) {
        titolo.innerText = "FASE 3: SPOSTAMENTO";
        btn1.innerText = isMyTurn ? "SPOSTA TRUPPE (IN SVILUPPO)" : "ATTENDI";
        btn2.disabled = !isMyTurn;
        btn2.innerText = "PASSA IL TURNO";
    }
    aggiornaMappaRisiko();
}

window.clickNodoRisiko = function(id) {
    let p = rPlayers[rTurnoIndex];
    if(p.isBot || rTurnoIndex !== 0) return; 
    let n = R_NODES[id];
    
    if (rFase === 0) {
        if (n.owner === p.id && rTruppeDaPiazzare > 0) {
            n.troops++;
            rTruppeDaPiazzare--;
            if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('cassa'); }catch(e){}
            aggiornaMappaRisiko();
            if(rTruppeDaPiazzare === 0) {
                document.getElementById("btn-risiko-azione1").innerText = "PRONTO PER ATTACCARE";
            } else {
                document.getElementById("btn-risiko-azione1").innerText = `PIAZZA ${rTruppeDaPiazzare} 🛵`;
            }
        }
    } else if (rFase === 1) {
        if (n.owner === p.id) {
            if (n.troops > 1) { rNodeSelected = id; aggiornaMappaRisiko(); }
        } else if (rNodeSelected && R_NODES[rNodeSelected].links.includes(id)) {
            avviaBattagliaAnimata(rNodeSelected, id);
        }
    }
};

const dadiFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function avviaBattagliaAnimata(attId, defId) {
    let nAtt = R_NODES[attId];
    let nDef = R_NODES[defId];
    
    let modal = document.getElementById("risiko-battle-modal");
    let attBox = document.getElementById("r-att-dice");
    let defBox = document.getElementById("r-def-dice");
    let resText = document.getElementById("r-battle-result");
    let btnClose = document.getElementById("btn-close-battle");
    
    modal.style.display = "flex";
    resText.innerText = "LANCIO IN CORSO...";
    btnClose.style.display = "none";
    attBox.innerHTML = ""; defBox.innerHTML = "";
    
    let numDadiAtt = Math.min(3, nAtt.troops - 1);
    let numDadiDef = Math.min(3, nDef.troops);
    
    if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('dadi'); }catch(e){}
    
    let rollCount = 0;
    let anim = setInterval(() => {
        attBox.innerHTML = Array(numDadiAtt).fill(0).map(() => `<div class="r-dice red">${dadiFaces[Math.floor(Math.random()*6)]}</div>`).join("");
        defBox.innerHTML = Array(numDadiDef).fill(0).map(() => `<div class="r-dice blue">${dadiFaces[Math.floor(Math.random()*6)]}</div>`).join("");
        rollCount++;
        
        if (rollCount >= 15) {
            clearInterval(anim);
            let resAtt = Array(numDadiAtt).fill(0).map(() => Math.floor(Math.random()*6)+1).sort((a,b)=>b-a);
            let resDef = Array(numDadiDef).fill(0).map(() => Math.floor(Math.random()*6)+1).sort((a,b)=>b-a);
            
            attBox.innerHTML = resAtt.map(v => `<div class="r-dice red">${dadiFaces[v-1]}</div>`).join("");
            defBox.innerHTML = resDef.map(v => `<div class="r-dice blue">${dadiFaces[v-1]}</div>`).join("");
            
            let armatePerseAtt = 0;
            let armatePerseDef = 0;
            let confronti = Math.min(numDadiAtt, numDadiDef);
            for(let i=0; i<confronti; i++) {
                if (resAtt[i] > resDef[i]) armatePerseDef++;
                else armatePerseAtt++;
            }
            
            nAtt.troops -= armatePerseAtt;
            nDef.troops -= armatePerseDef;
            
            if (nDef.troops <= 0) {
                nDef.owner = nAtt.owner;
                nDef.troops = numDadiAtt - armatePerseAtt;
                nAtt.troops -= (numDadiAtt - armatePerseAtt);
                resText.innerHTML = "<span style='color:#44ff44;'>🎯 TERRITORIO CONQUISTATO!</span>";
                if(typeof window.suonaEffetto === 'function') try{ window.suonaEffetto('vittoria'); }catch(e){}
                rNodeSelected = null;
                
                haConquistatoTerritorio = true; 
            } else {
                // 🔥 FIX TESTO
                resText.innerHTML = `L'Attaccante perde ${armatePerseAtt} 🛵<br>La Difesa perde ${armatePerseDef} 🛵`;
                if(nAtt.troops === 1) rNodeSelected = null; 
            }
            
            aggiornaMappaRisiko();
            btnClose.style.display = "block";
        }
    }, 60);
}

window.chiudiBattaglia = function() {
    document.getElementById("risiko-battle-modal").style.display = "none";
}

function eseguiTurnoBot(bot) {
    haConquistatoTerritorio = false;
    let mieZone = Object.keys(R_NODES).filter(k => R_NODES[k].owner === bot.id);
    
    if(bot.cards.length >= 3) {
        bot.cards.splice(0, 3);
        rTruppeDaPiazzare += 8;
    }

    while(rTruppeDaPiazzare > 0) {
        let z = mieZone[Math.floor(Math.random() * mieZone.length)];
        R_NODES[z].troops++;
        rTruppeDaPiazzare--;
    }
    aggiornaMappaRisiko();
    
    setTimeout(() => {
        impostaFaseRisiko(1);
        let attaccanti = mieZone.filter(k => R_NODES[k].troops > 3);
        if(attaccanti.length > 0) {
            let attId = attaccanti[0];
            let bersagli = R_NODES[attId].links.filter(k => R_NODES[k].owner !== bot.id);
            if(bersagli.length > 0) {
                let nAtt = R_NODES[attId];
                let nDef = R_NODES[bersagli[0]];
                let dadoAtt = Math.floor(Math.random()*6)+1;
                let dadoDef = Math.floor(Math.random()*6)+1;
                if(dadoAtt > dadoDef) {
                    nDef.troops--;
                    if(nDef.troops <= 0) { nDef.owner = bot.id; nDef.troops = 1; nAtt.troops--; haConquistatoTerritorio = true;}
                } else { nAtt.troops--; }
                aggiornaMappaRisiko();
            }
        }
        
        setTimeout(() => { chiudiTurno(); }, 1500);
    }, 1500);
}
