// ===================================================================
// DANE
// ===================================================================
let pojazdy = JSON.parse(localStorage.getItem("translog_pojazdy")) || [
    { id: 1, tablica: "BI 4521A", kierowca: "Tomasz Wiśniewski", status: "w_trasie", lat: 53.1325, lng: 23.1688, miasto: "Białystok", przebieg: 182400 },
    { id: 2, tablica: "WA 8832K", kierowca: "Piotr Kaczmarek", status: "wolny", lat: 52.2297, lng: 21.0122, miasto: "Warszawa", przebieg: 95200 },
    { id: 3, tablica: "KR 1290Z", kierowca: "Adam Lewandowski", status: "serwis", lat: 50.0647, lng: 19.9450, miasto: "Kraków", przebieg: 241000 },
    { id: 4, tablica: "GD 5567P", kierowca: "Marcin Zając", status: "w_trasie", lat: 54.3520, lng: 18.6466, miasto: "Gdańsk", przebieg: 133700 }
];

let kierowcy = JSON.parse(localStorage.getItem("translog_kierowcy")) || [
    { id: 1, imie: "Tomasz Wiśniewski", telefon: "600 111 222", status: "aktywny" },
    { id: 2, imie: "Piotr Kaczmarek", telefon: "600 333 444", status: "wolny" },
    { id: 3, imie: "Adam Lewandowski", telefon: "600 555 666", status: "urlop" },
    { id: 4, imie: "Marcin Zając", telefon: "600 777 888", status: "aktywny" }
];

let zlecenia = JSON.parse(localStorage.getItem("translog_zlecenia")) || [
    { id: 1, klient: "BudMax Sp. z o.o.", trasa: "Białystok → Warszawa", status: "w_realizacji" },
    { id: 2, klient: "AgroTrans", trasa: "Kraków → Gdańsk", status: "nowe" },
    { id: 3, klient: "Elektro-Pol", trasa: "Warszawa → Poznań", status: "dostarczone" },
    { id: 4, klient: "Meble24", trasa: "Gdańsk → Wrocław", status: "nowe" }
];

let faktury = JSON.parse(localStorage.getItem("translog_faktury")) || [
    { id: "FV/2026/091", klient: "BudMax Sp. z o.o.", kwota: 12400, status: "oplacona" },
    { id: "FV/2026/092", klient: "AgroTrans", kwota: 8600, status: "oczekuje" },
    { id: "FV/2026/093", klient: "Elektro-Pol", kwota: 15200, status: "oplacona" },
    { id: "FV/2026/094", klient: "Meble24", kwota: 6100, status: "oczekuje" }
];

function zapiszDane() {
    localStorage.setItem("translog_pojazdy", JSON.stringify(pojazdy));
    localStorage.setItem("translog_kierowcy", JSON.stringify(kierowcy));
    localStorage.setItem("translog_zlecenia", JSON.stringify(zlecenia));
    localStorage.setItem("translog_faktury", JSON.stringify(faktury));
}

// ===================================================================
// TOASTY
// ===================================================================
function pokazToast(tresc) {
    const kontener = document.getElementById("powiadomieniaToast");
    const el = document.createElement("div");
    el.className = "toast-el";
    el.textContent = tresc;
    kontener.appendChild(el);
    setTimeout(function() { el.remove(); }, 4000);
}

// ===================================================================
// POWIADOMIENIA (DZWONEK)
// ===================================================================
function pobierzPowiadomienia() {
    const lista = [];
    pojazdy.forEach(function(p) {
        if (p.status === "serwis") lista.push("⚠️ Pojazd " + p.tablica + " jest w serwisie.");
        if (p.przebieg > 200000) lista.push("🔧 Pojazd " + p.tablica + " zbliża się do dużego przeglądu (" + p.przebieg.toLocaleString("pl-PL") + " km).");
    });
    zlecenia.filter(function(z) { return z.status === "nowe"; }).forEach(function(z) {
        lista.push("📦 Nowe zlecenie oczekuje: " + z.klient);
    });
    faktury.filter(function(f) { return f.status === "oczekuje"; }).forEach(function(f) {
        lista.push("💰 Oczekująca płatność: " + f.id + " (" + f.kwota.toLocaleString("pl-PL") + " zł)");
    });
    return lista;
}

function odswiezDzwonek() {
    const lista = pobierzPowiadomienia();
    document.getElementById("licznikPowiadomien").textContent = lista.length;
    const kontener = document.getElementById("listaPowiadomien");
    kontener.innerHTML = lista.length === 0
        ? "<div class='pozycja-powiadomienia'>Brak nowych powiadomień 🎉</div>"
        : lista.map(function(t) { return "<div class='pozycja-powiadomienia'>" + t + "</div>"; }).join("");
}

document.getElementById("dzwonekPowiadomien").addEventListener("click", function(e) {
    document.getElementById("listaPowiadomien").classList.toggle("ukryty");
    e.stopPropagation();
});
document.addEventListener("click", function() {
    document.getElementById("listaPowiadomien").classList.add("ukryty");
});

// ===================================================================
// NAWIGACJA (SPA routing)
// ===================================================================
const linkiBoczne = document.querySelectorAll(".link-boczny");
const strony = document.querySelectorAll(".strona");
const tytulStrony = document.getElementById("tytulStrony");
let mapaZainicjowana = false;
let wykresyZainicjowane = false;
let wykresFinansowyZainicjowany = false;

const nazwyStron = { dashboard: "Dashboard", pojazdy: "Pojazdy", kierowcy: "Kierowcy", zlecenia: "Zlecenia", mapa: "Mapa floty", finanse: "Finanse", raporty: "Raporty" };

function przejdzDoStrony(id) {
    strony.forEach(function(s) { s.classList.remove("aktywna-strona"); });
    document.getElementById(id).classList.add("aktywna-strona");
    linkiBoczne.forEach(function(l) { l.classList.toggle("aktywny", l.dataset.strona === id); });
    tytulStrony.textContent = nazwyStron[id];

    if (id === "mapa") {
        setTimeout(function() {
            if (!mapaZainicjowana) { inicjujMape(); mapaZainicjowana = true; }
            mapaObiekt.invalidateSize();
        }, 60);
    }
    if (id === "dashboard" && !wykresyZainicjowane) {
        setTimeout(function() { inicjujWykresy(); wykresyZainicjowane = true; }, 60);
    }
    if (id === "finanse" && !wykresFinansowyZainicjowany) {
        setTimeout(function() { inicjujWykresFinansowy(); wykresFinansowyZainicjowany = true; }, 60);
    }
}

linkiBoczne.forEach(function(link) { link.addEventListener("click", function() { przejdzDoStrony(link.dataset.strona); }); });

// ===================================================================
// MOTYW
// ===================================================================
const przyciskMotyw = document.getElementById("przyciskMotyw");
function wczytajMotyw() {
    if (localStorage.getItem("translog_motyw") === "ciemny") {
        document.body.classList.add("ciemny");
        przyciskMotyw.textContent = "☀️ Jasny motyw";
    }
}
przyciskMotyw.addEventListener("click", function() {
    document.body.classList.toggle("ciemny");
    const c = document.body.classList.contains("ciemny");
    localStorage.setItem("translog_motyw", c ? "ciemny" : "jasny");
    przyciskMotyw.textContent = c ? "☀️ Jasny motyw" : "🌙 Ciemny motyw";
    if (mapaZainicjowana) setTimeout(function() { mapaObiekt.invalidateSize(); }, 50);
});

document.getElementById("dataDzis").textContent = new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// ===================================================================
// PALETA POLECEŃ (Ctrl+K)
// ===================================================================
const paletaPolecen = document.getElementById("paletaPolecen");
const wejsciePalety = document.getElementById("wejsciePalety");
const wynikiPalety = document.getElementById("wynikiPalety");

function otworzPalete() {
    paletaPolecen.classList.remove("ukryty");
    wejsciePalety.value = "";
    wejsciePalety.focus();
    renderujWynikiPalety("");
}
function zamknijPalete() { paletaPolecen.classList.add("ukryty"); }

document.getElementById("przyciskPaleta").addEventListener("click", otworzPalete);
document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); otworzPalete(); }
    if (e.key === "Escape") zamknijPalete();
});
paletaPolecen.addEventListener("click", function(e) { if (e.target === paletaPolecen) zamknijPalete(); });

function renderujWynikiPalety(fraza) {
    const f = fraza.toLowerCase();
    const wyniki = [];

    Object.keys(nazwyStron).forEach(function(id) {
        if (nazwyStron[id].toLowerCase().includes(f)) wyniki.push({ etykieta: "📍 Idź do: " + nazwyStron[id], akcja: function() { przejdzDoStrony(id); } });
    });
    pojazdy.forEach(function(p) {
        if (p.tablica.toLowerCase().includes(f) || p.kierowca.toLowerCase().includes(f)) {
            wyniki.push({ etykieta: "🚚 " + p.tablica + " — " + p.kierowca, akcja: function() { przejdzDoStrony("pojazdy"); } });
        }
    });
    kierowcy.forEach(function(k) {
        if (k.imie.toLowerCase().includes(f)) wyniki.push({ etykieta: "👤 " + k.imie, akcja: function() { przejdzDoStrony("kierowcy"); } });
    });

    wynikiPalety.innerHTML = "";
    wyniki.slice(0, 8).forEach(function(w) {
        const el = document.createElement("div");
        el.className = "wynik-palety";
        el.textContent = w.etykieta;
        el.addEventListener("click", function() { w.akcja(); zamknijPalete(); });
        wynikiPalety.appendChild(el);
    });
}
wejsciePalety.addEventListener("input", function() { renderujWynikiPalety(wejsciePalety.value); });

// ===================================================================
// DASHBOARD — STATYSTYKI + WYKRESY
// ===================================================================
function aktualizujStatystyki() {
    document.getElementById("statPojazdy").textContent = pojazdy.length;
    document.getElementById("statWTrasie").textContent = pojazdy.filter(function(p) { return p.status === "w_trasie"; }).length;
    document.getElementById("statZlecenia").textContent = zlecenia.length;
    document.getElementById("statSerwis").textContent = pojazdy.filter(function(p) { return p.status === "serwis"; }).length;
}

let wykresZlecenObiekt, wykresStatusowObiekt, wykresPrzychodowObiekt;

function inicjujWykresy() {
    wykresZlecenObiekt = new Chart(document.getElementById("wykresZlecen").getContext("2d"), {
        type: "bar",
        data: { labels: ["Pon","Wt","Śr","Czw","Pt","Sob","Nie"], datasets: [{ label: "Zlecenia", data: [8,12,9,14,11,5,3], backgroundColor: "#2563eb", borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    wykresStatusowObiekt = new Chart(document.getElementById("wykresStatusow").getContext("2d"), {
        type: "doughnut",
        data: { labels: ["W trasie","Wolne","Serwis"], datasets: [{ data: [0,0,0], backgroundColor: ["#2563eb","#16a34a","#ea580c"] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function inicjujWykresFinansowy() {
    wykresPrzychodowObiekt = new Chart(document.getElementById("wykresPrzychodow").getContext("2d"), {
        type: "line",
        data: {
            labels: ["Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień"],
            datasets: [{ label: "Przychód (zł)", data: [38000, 42500, 39800, 47200, 51000, 55600], borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.15)", fill: true, tension: 0.35 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function aktualizujFinanse() {
    const przychod = faktury.filter(function(f) { return f.status === "oplacona"; }).reduce(function(s, f) { return s + f.kwota; }, 0);
    const oczekujace = faktury.filter(function(f) { return f.status === "oczekuje"; }).reduce(function(s, f) { return s + f.kwota; }, 0);

    document.getElementById("statPrzychod").textContent = przychod.toLocaleString("pl-PL") + " zł";
    document.getElementById("statFaktury").textContent = faktury.length;
    document.getElementById("statOczekujace").textContent = oczekujace.toLocaleString("pl-PL") + " zł";

    const tbody = document.getElementById("tabelaFaktur");
    tbody.innerHTML = "";
    faktury.forEach(function(f) {
        const wiersz = document.createElement("tr");
        wiersz.innerHTML = "<td>" + f.id + "</td><td>" + f.klient + "</td><td>" + f.kwota.toLocaleString("pl-PL") + " zł</td><td><span class='znacznik-status " + f.status + "'>" + (f.status === "oplacona" ? "Opłacona" : "Oczekuje") + "</span></td>";
        tbody.appendChild(wiersz);
    });
}

// ===================================================================
// POJAZDY
// ===================================================================
let aktualnyFiltr = "wszystkie";

function wyrenderujPojazdy() {
    const ciaoTabeli = document.getElementById("tabelaPojazdow");
    ciaoTabeli.innerHTML = "";
    const przefiltrowane = pojazdy.filter(function(p) { return aktualnyFiltr === "wszystkie" || p.status === aktualnyFiltr; });

    przefiltrowane.forEach(function(p) {
        const etykiety = { w_trasie: "W trasie", wolny: "Wolny", serwis: "Serwis" };
        const wiersz = document.createElement("tr");
        wiersz.innerHTML =
            "<td>" + p.tablica + "</td><td>" + p.kierowca + "</td>" +
            "<td><span class='znacznik-status " + p.status + "'>" + etykiety[p.status] + "</span></td>" +
            "<td>" + p.miasto + "</td><td>" + p.przebieg.toLocaleString("pl-PL") + " km</td>" +
            "<td><button class='btn-tabela edytuj-pojazd' data-id='" + p.id + "'>✏️</button><button class='btn-tabela usun usun-pojazd' data-id='" + p.id + "'>🗑</button></td>";
        ciaoTabeli.appendChild(wiersz);
    });

    document.querySelectorAll(".usun-pojazd").forEach(function(btn) {
        btn.addEventListener("click", function() {
            pojazdy = pojazdy.filter(function(p) { return p.id != btn.dataset.id; });
            zapiszDane(); wyrenderujWszystko();
            pokazToast("Pojazd usunięty.");
        });
    });
    document.querySelectorAll(".edytuj-pojazd").forEach(function(btn) { btn.addEventListener("click", function() { otworzModalPojazdu(btn.dataset.id); }); });
}

document.querySelectorAll(".filtr-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        aktualnyFiltr = btn.dataset.filtr;
        document.querySelectorAll(".filtr-btn").forEach(function(b) { b.classList.remove("aktywny-filtr"); });
        btn.classList.add("aktywny-filtr");
        wyrenderujPojazdy();
    });
});

const wspolrzedneMiast = { "Białystok": [53.1325, 23.1688], "Warszawa": [52.2297, 21.0122], "Kraków": [50.0647, 19.9450], "Gdańsk": [54.3520, 18.6466], "Poznań": [52.4064, 16.9252], "Wrocław": [51.1079, 17.0385], "Łódź": [51.7592, 19.4560], "Szczecin": [53.4285, 14.5528] };

function otworzModalPojazdu(id) {
    const pojazd = id ? pojazdy.find(function(p) { return p.id == id; }) : null;
    const zawartosc = document.getElementById("zawartoscModalu");
    const opcjeMiast = Object.keys(wspolrzedneMiast).map(function(m) { return "<option value='" + m + "'" + (pojazd && pojazd.miasto === m ? " selected" : "") + ">" + m + "</option>"; }).join("");

    zawartosc.innerHTML =
        "<h3>" + (pojazd ? "Edytuj pojazd" : "Nowy pojazd") + "</h3>" +
        "<input type='text' id='mTablica' placeholder='Numer rejestracyjny' value='" + (pojazd ? pojazd.tablica : "") + "'>" +
        "<input type='text' id='mKierowca' placeholder='Kierowca' value='" + (pojazd ? pojazd.kierowca : "") + "'>" +
        "<select id='mStatus'><option value='w_trasie'" + (pojazd && pojazd.status === "w_trasie" ? " selected" : "") + ">W trasie</option><option value='wolny'" + (pojazd && pojazd.status === "wolny" ? " selected" : "") + ">Wolny</option><option value='serwis'" + (pojazd && pojazd.status === "serwis" ? " selected" : "") + ">Serwis</option></select>" +
        "<select id='mMiasto'>" + opcjeMiast + "</select>" +
        "<input type='number' id='mPrzebieg' placeholder='Przebieg (km)' value='" + (pojazd ? pojazd.przebieg : "") + "'>" +
        "<div class='przyciski-modalu'><button class='btn-modal-anuluj' id='btnAnulujModal'>Anuluj</button><button class='btn-modal-zapisz' id='btnZapiszModal'>Zapisz</button></div>";

    document.getElementById("modalUniwersalny").classList.remove("ukryty");
    document.getElementById("btnAnulujModal").addEventListener("click", zamknijModal);

    document.getElementById("btnZapiszModal").addEventListener("click", function() {
        const tablica = document.getElementById("mTablica").value.trim();
        const kierowca = document.getElementById("mKierowca").value.trim();
        const status = document.getElementById("mStatus").value;
        const miasto = document.getElementById("mMiasto").value;
        const przebieg = parseInt(document.getElementById("mPrzebieg").value) || 0;
        if (!tablica || !kierowca) { alert("Wypełnij wszystkie pola!"); return; }

        const wsp = wspolrzedneMiast[miasto];
        if (pojazd) {
            pojazd.tablica = tablica; pojazd.kierowca = kierowca; pojazd.status = status; pojazd.miasto = miasto; pojazd.przebieg = przebieg; pojazd.lat = wsp[0]; pojazd.lng = wsp[1];
        } else {
            pojazdy.push({ id: Date.now(), tablica: tablica, kierowca: kierowca, status: status, miasto: miasto, przebieg: przebieg, lat: wsp[0], lng: wsp[1] });
        }
        zapiszDane(); zamknijModal(); wyrenderujWszystko();
        pokazToast("Pojazd zapisany pomyślnie ✅");
    });
}
document.getElementById("przyciskDodajPojazd").addEventListener("click", function() { otworzModalPojazdu(null); });
function zamknijModal() { document.getElementById("modalUniwersalny").classList.add("ukryty"); }

// ===================================================================
// KIEROWCY
// ===================================================================
function wyrenderujKierowcow() {
    const siatka = document.getElementById("siatkaKierowcow");
    siatka.innerHTML = "";
    const etykiety = { aktywny: "🟢 Aktywny", wolny: "⚪ Wolny", urlop: "🟡 Urlop" };

    kierowcy.forEach(function(k) {
        const inicjaly = k.imie.split(" ").map(function(s) { return s[0]; }).join("");
        const karta = document.createElement("div");
        karta.className = "karta-kierowcy";
        karta.innerHTML = "<div class='awatar-kierowcy'>" + inicjaly + "</div><h4>" + k.imie + "</h4><p>📞 " + k.telefon + "</p><p>" + etykiety[k.status] + "</p><button class='btn-tabela usun usun-kierowce' data-id='" + k.id + "'>🗑 Usuń</button>";
        siatka.appendChild(karta);
    });

    document.querySelectorAll(".usun-kierowce").forEach(function(btn) {
        btn.addEventListener("click", function() {
            kierowcy = kierowcy.filter(function(k) { return k.id != btn.dataset.id; });
            zapiszDane(); wyrenderujKierowcow();
        });
    });
}

document.getElementById("przyciskDodajKierowce").addEventListener("click", function() {
    const zawartosc = document.getElementById("zawartoscModalu");
    zawartosc.innerHTML = "<h3>Nowy kierowca</h3><input type='text' id='mImie' placeholder='Imię i nazwisko'><input type='text' id='mTelefon' placeholder='Telefon'><select id='mStatusKierowcy'><option value='aktywny'>Aktywny</option><option value='wolny'>Wolny</option><option value='urlop'>Urlop</option></select><div class='przyciski-modalu'><button class='btn-modal-anuluj' id='btnAnulujModal'>Anuluj</button><button class='btn-modal-zapisz' id='btnZapiszModal'>Zapisz</button></div>";
    document.getElementById("modalUniwersalny").classList.remove("ukryty");
    document.getElementById("btnAnulujModal").addEventListener("click", zamknijModal);
    document.getElementById("btnZapiszModal").addEventListener("click", function() {
        const imie = document.getElementById("mImie").value.trim();
        const telefon = document.getElementById("mTelefon").value.trim();
        const status = document.getElementById("mStatusKierowcy").value;
        if (!imie || !telefon) { alert("Wypełnij wszystkie pola!"); return; }
        kierowcy.push({ id: Date.now(), imie: imie, telefon: telefon, status: status });
        zapiszDane(); zamknijModal(); wyrenderujKierowcow();
    });
});

// ===================================================================
// ZLECENIA — KANBAN
// ===================================================================
function wyrenderujKanban() {
    const kolumny = { nowe: document.getElementById("kolumnaNowe"), w_realizacji: document.getElementById("kolumnaWRealizacji"), dostarczone: document.getElementById("kolumnaDostarczone") };
    Object.values(kolumny).forEach(function(k) { k.innerHTML = ""; });

    zlecenia.forEach(function(z) {
        const karta = document.createElement("div");
        karta.className = "karta-zlecenia";
        karta.draggable = true;
        karta.dataset.id = z.id;
        karta.innerHTML = "<h4>" + z.klient + "</h4><p>" + z.trasa + "</p>";
        karta.addEventListener("dragstart", function() { karta.classList.add("przeciagana"); });
        karta.addEventListener("dragend", function() { karta.classList.remove("przeciagana"); });
        kolumny[z.status].appendChild(karta);
    });
}

document.querySelectorAll(".kolumna-kanban").forEach(function(kolumna) {
    kolumna.addEventListener("dragover", function(e) { e.preventDefault(); kolumna.classList.add("podswietlona"); });
    kolumna.addEventListener("dragleave", function() { kolumna.classList.remove("podswietlona"); });
    kolumna.addEventListener("drop", function(e) {
        e.preventDefault(); kolumna.classList.remove("podswietlona");
        const karta = document.querySelector(".przeciagana");
        if (!karta) return;
        const zlecenie = zlecenia.find(function(z) { return z.id == karta.dataset.id; });
        zlecenie.status = kolumna.dataset.status;
        zapiszDane(); wyrenderujKanban();
        pokazToast("Status zlecenia zaktualizowany.");
    });
});

document.getElementById("przyciskDodajZlecenie").addEventListener("click", function() {
    const zawartosc = document.getElementById("zawartoscModalu");
    zawartosc.innerHTML = "<h3>Nowe zlecenie</h3><input type='text' id='mKlient' placeholder='Nazwa klienta'><input type='text' id='mTrasa' placeholder='Trasa, np. Warszawa → Gdańsk'><div class='przyciski-modalu'><button class='btn-modal-anuluj' id='btnAnulujModal'>Anuluj</button><button class='btn-modal-zapisz' id='btnZapiszModal'>Zapisz</button></div>";
    document.getElementById("modalUniwersalny").classList.remove("ukryty");
    document.getElementById("btnAnulujModal").addEventListener("click", zamknijModal);
    document.getElementById("btnZapiszModal").addEventListener("click", function() {
        const klient = document.getElementById("mKlient").value.trim();
        const trasa = document.getElementById("mTrasa").value.trim();
        if (!klient || !trasa) { alert("Wypełnij wszystkie pola!"); return; }
        zlecenia.push({ id: Date.now(), klient: klient, trasa: trasa, status: "nowe" });
        zapiszDane(); zamknijModal(); wyrenderujKanban();
    });
});

// ===================================================================
// MAPA — NAPRAWIONA + TRASY + POGODA NA ŻYWO
// ===================================================================
let mapaObiekt;
const BAZA_GLOWNA = { lat: 52.2297, lng: 21.0122, nazwa: "Warszawa (Baza)" };

function inicjujMape() {
    mapaObiekt = L.map("mapaFloty", { zoomControl: true }).setView([52.0, 19.5], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap", maxZoom: 18
    }).addTo(mapaObiekt);

    // znacznik bazy głównej
    L.marker([BAZA_GLOWNA.lat, BAZA_GLOWNA.lng], {
        icon: L.divIcon({ html: "🏠", className: "", iconSize: [30, 30] })
    }).addTo(mapaObiekt).bindPopup("<b>Baza główna</b><br>" + BAZA_GLOWNA.nazwa);

    const koloryStatusow = { w_trasie: "#2563eb", wolny: "#16a34a", serwis: "#ea580c" };

    pojazdy.forEach(function(p) {
        // trasa z bazy do pojazdu w trasie (animowana przerywana linia)
        if (p.status === "w_trasie") {
            const linia = L.polyline([[BAZA_GLOWNA.lat, BAZA_GLOWNA.lng], [p.lat, p.lng]], {
                color: koloryStatusow.w_trasie, weight: 2, dashArray: "6,8", opacity: 0.6
            }).addTo(mapaObiekt);
        }

        const znacznik = L.circleMarker([p.lat, p.lng], {
            radius: 10, fillColor: koloryStatusow[p.status], color: "white", weight: 2, fillOpacity: 0.9
        }).addTo(mapaObiekt);

        const tresc = "<b>" + p.tablica + "</b><br>Kierowca: " + p.kierowca + "<br>Miasto: " + p.miasto + "<br><span id='pogoda-" + p.id + "'>Ładowanie pogody...</span>";
        znacznik.bindPopup(tresc);

        znacznik.on("popupopen", function() { pobierzPogodeDlaPojazdu(p); });
    });

    // upewnij się, że mapa poprawnie liczy rozmiar (naprawia "mapa nie działa")
    setTimeout(function() { mapaObiekt.invalidateSize(); }, 100);
    new ResizeObserver(function() { mapaObiekt.invalidateSize(); }).observe(document.getElementById("mapaFloty"));
}

function pobierzPogodeDlaPojazdu(p) {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + p.lat + "&longitude=" + p.lng + "&current_weather=true")
        .then(function(r) { return r.json(); })
        .then(function(dane) {
            const el = document.getElementById("pogoda-" + p.id);
            if (el && dane.current_weather) {
                el.textContent = "🌡️ " + dane.current_weather.temperature + "°C, wiatr " + dane.current_weather.windspeed + " km/h";
            }
        })
        .catch(function() {
            const el = document.getElementById("pogoda-" + p.id);
            if (el) el.textContent = "Nie udało się pobrać pogody.";
        });
}

// ===================================================================
// EKSPORT CSV + DRUK
// ===================================================================
document.getElementById("przyciskEksportuj").addEventListener("click", function() {
    let csv = "Numer rejestracyjny,Kierowca,Status,Lokalizacja,Przebieg\n";
    pojazdy.forEach(function(p) { csv += p.tablica + "," + p.kierowca + "," + p.status + "," + p.miasto + "," + p.przebieg + "\n"; });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "pojazdy_translog.csv"; link.click();
    pokazToast("Plik CSV pobrany.");
});

document.getElementById("przyciskDrukuj").addEventListener("click", function() {
    przejdzDoStrony("pojazdy");
    setTimeout(function() { window.print(); }, 200);
});

// ===================================================================
// URUCHOMIENIE
// ===================================================================
function wyrenderujWszystko() {
    aktualizujStatystyki();
    wyrenderujPojazdy();
    wyrenderujKierowcow();
    wyrenderujKanban();
    aktualizujFinanse();
    odswiezDzwonek();
    if (wykresyZainicjowane) {
        wykresZlecenObiekt.update();
        wykresStatusowObiekt.data.datasets[0].data = [
            pojazdy.filter(function(p) { return p.status === "w_trasie"; }).length,
            pojazdy.filter(function(p) { return p.status === "wolny"; }).length,
            pojazdy.filter(function(p) { return p.status === "serwis"; }).length
        ];
        wykresStatusowObiekt.update();
    }
}

wczytajMotyw();
wyrenderujWszystko();