document.addEventListener('DOMContentLoaded', () => {
    
    // Globaler Zustand
    let currentItems = []; // Array für {name: 'Volt Prime', price: '150'}
    let primeItemNames = []; // Hält die ["Volt Prime", "Gauss Prime", ...]

    // DOM-Elemente
    const loadingStatus = document.getElementById('loading-status');
    const inputSection = document.getElementById('input-section');
    const smartInput = document.getElementById('smart-input');
    const searchResults = document.getElementById('search-results');
    const addItemBtn = document.getElementById('add-item-btn');
    const listDisplay = document.getElementById('current-list-display');
    const previewArea = document.getElementById('message-preview');
    const copyBtn = document.getElementById('copy-btn');
    const resetBtn = document.getElementById('reset-btn');

    /**
     * Lädt die Datenbank und speichert sie in der globalen Variable.
     */
    async function initDatabase() {
        try {
            const response = await fetch('./database.json'); // oder '/vk/database.json'
            if (!response.ok) throw new Error('database.json nicht gefunden');
            
            // Speichere die saubere Liste
            primeItemNames = await response.json();

            loadingStatus.style.display = 'none';
            inputSection.style.display = 'block';

        } catch (error) {
            loadingStatus.textContent = 'Fehler: "database.json" konnte nicht geladen werden.';
            loadingStatus.style.color = 'var(--color-reset)';
            console.error(error);
        }
    }

    /**
     * NEU: Wird aufgerufen, wenn der Benutzer in das Suchfeld tippt.
     */
    function onSearchInput() {
        const query = smartInput.value.toLowerCase();
        
        if (query.length < 2) {
            searchResults.innerHTML = ''; // Nicht suchen, wenn zu kurz
            return;
        }

        // Finde Übereinstimmungen (max. 5 anzeigen)
        const matches = primeItemNames.filter(item => 
            item.toLowerCase().includes(query)
        ).slice(0, 5);

        // Baue HTML für die Ergebnisse
        if (matches.length > 0) {
            const html = matches.map(item => 
                `<div class="result-item" data-name="${item}">${item}</div>`
            ).join('');
            searchResults.innerHTML = html;
        } else {
            searchResults.innerHTML = '';
        }
    }

    /**
     * NEU: Wird aufgerufen, wenn ein Item in den Suchergebnissen angeklickt wird.
     */
    function onResultClick(e) {
        // Stelle sicher, dass wir auf ein .result-item geklickt haben
        if (e.target.classList.contains('result-item')) {
            const itemName = e.target.dataset.name;
            
            smartInput.value = itemName + ' '; // Setze Text + Leerzeichen
            smartInput.focus(); // Setze den Fokus zurück ins Feld
            searchResults.innerHTML = ''; // Verstecke Ergebnisse
        }
    }

    /**
     * Parst die Eingabe und fügt sie der Liste hinzu.
     * (Diese Funktion bleibt fast gleich)
     */
    function addItemToList() {
        const rawInput = smartInput.value.trim();
        if (rawInput === "") return;

        const words = rawInput.split(' ');
        const lastWord = words[words.length - 1];
        
        let price = '';
        let itemName = '';

        if (!isNaN(parseInt(lastWord)) && parseInt(lastWord) > 0) {
            price = words.pop();
            itemName = words.join(' ').trim();
        } else {
            itemName = rawInput;
        }

        currentItems.push({ name: itemName, price: price });

        updateCurrentListDisplay();
        updateFinalPreview();
        smartInput.value = ''; // Feld leeren
        searchResults.innerHTML = ''; // Auch Ergebnisse leeren
    }

    /**
     * Zeigt die "Pills" der hinzugefügten Items an.
     * (Unverändert)
     */
    function updateCurrentListDisplay() {
        listDisplay.innerHTML = ''; 
        if (currentItems.length === 0) {
            listDisplay.innerHTML = '<p class="empty-list-msg">Noch keine Items hinzugefügt.</p>';
            return;
        }
        currentItems.forEach((item, index) => {
            const pill = document.createElement('div');
            pill.className = 'item-pill';
            const priceTag = item.price ? `<span class="item-price">${item.price}p</span>` : '';
            pill.innerHTML = `
                <span class="item-name">${item.name}</span>
                ${priceTag}
                <span class="remove-item" data-index="${index}">✖</span>
            `;
            listDisplay.appendChild(pill);
        });
    }

    /**
     * Aktualisiert die finale "VK..." Nachricht.
     * (Unverändert)
     */
    function updateFinalPreview() {
        if (currentItems.length === 0) {
            previewArea.value = '';
            return;
        }
        const messageParts = currentItems.map(item => {
            const itemFormatted = `[${item.name}]`;
            const priceFormatted = item.price ? `${item.price}p` : '';
            return `${itemFormatted} ${priceFormatted}`.trim();
        });
        previewArea.value = `VK ${messageParts.join(' ')}`;
    }

    /**
     * Entfernt ein Item aus der Liste (wenn 'x' geklickt wird).
     * (Unverändert)
     */
    function handleListClick(e) {
        if (e.target.classList.contains('remove-item')) {
            const indexToRemove = parseInt(e.target.dataset.index);
            currentItems.splice(indexToRemove, 1);
            updateCurrentListDisplay();
            updateFinalPreview();
        }
    }

    /**
     * Kopiert die finale Nachricht.
     * (Unverändert)
     */
    function copyMessage() {
        if (!previewArea.value) return; 
        navigator.clipboard.writeText(previewArea.value)
            .then(() => {
                copyBtn.textContent = 'Kopiert!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = 'Nachricht Kopieren';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
    }

    /**
     * Setzt die gesamte App zurück.
     * (Unverändert)
     */
    function resetAll() {
        currentItems = [];
        smartInput.value = '';
        searchResults.innerHTML = '';
        updateCurrentListDisplay();
        updateFinalPreview();
    }

    // --- Event Listeners (Aktualisiert) ---
    
    // NEU: Live-Suche beim Tippen
    smartInput.addEventListener('input', onSearchInput);
    
    // NEU: Klicks auf die Suchergebnisse
    searchResults.addEventListener('click', onResultClick);
    
    // Alt: Item per "+" Button hinzufügen
    addItemBtn.addEventListener('click', addItemToList);
    
    // Alt: Item per "Enter" hinzufügen
    smartInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            addItemToList();
        }
    });
    
    // (Restliche Listener sind unverändert)
    listDisplay.addEventListener('click', handleListClick);
    copyBtn.addEventListener('click', copyMessage);
    resetBtn.addEventListener('click', resetAll);

    // App starten
    initDatabase();
});
