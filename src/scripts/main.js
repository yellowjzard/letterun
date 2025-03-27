document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const calculateScoresButton = document.getElementById('calculate-scores-button');
    const restartButton = document.getElementById('restart-button');
    const playersSelect = document.getElementById('players-select');
    const timeSelect = document.getElementById('time-select');
    const lettersContainer = document.getElementById('letters-container');
    const playerWordsContainer = document.getElementById('player-words-container');
    const generatedLettersDisplayInput = document.getElementById('generated-letters-display-input');
    const generatedLettersDisplay = document.getElementById('generated-letters-display');
    const resultsContainer = document.getElementById('results-container');
    const gameScreen = document.getElementById('game-screen');
    const wordInputScreen = document.getElementById('word-input-screen');
    const resultsScreen = document.getElementById('results-screen');
    const timeLeftDisplay = document.getElementById('time-left');

    // Seleziona il pulsante e la sezione delle regole
    const toggleRulesButton = document.getElementById('toggle-rules-button');
    const rulesSection = document.getElementById('rules-section');

    // Aggiungi un evento click al pulsante
    toggleRulesButton.addEventListener('click', () => {
        // Mostra o nascondi la sezione delle regole
        rulesSection.classList.toggle('hidden');

        // Cambia il testo del pulsante in base allo stato
        if (rulesSection.classList.contains('hidden')) {
            toggleRulesButton.textContent = '🎮 Come si gioca?';
        } else {
            toggleRulesButton.textContent = '❌ Chiudi regole';
        }
    });

    let generatedLetters = [];
    let playerWords = [];
    let timerInterval;
    let italianVocabulary = new Set();
    let rareWords = new Set();

    // Carica il vocabolario locale dal file .txt
    fetch("data/60000_parole_italiane.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore HTTP! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            italianVocabulary = new Set(data.split("\n").map(word => word.trim().toUpperCase()));
            console.log("Vocabolario caricato:", italianVocabulary.size, "parole");
        })
        .catch(error => {
            console.error("Errore durante il caricamento del vocabolario:", error);
        });

    // Carica le parole rare dal file .txt
    fetch("data/rare_words.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore HTTP! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            rareWords = new Set(data.split("\n").map(word => word.trim().toUpperCase()));
            console.log("Parole rare caricate:", rareWords.size, "parole");
        })
        .catch(error => {
            console.error("Errore durante il caricamento delle parole rare:", error);
        });

    // Funzione per generare lettere casuali bilanciate
    function generateRandomLetters(count = 10) {
        // Frequenze delle lettere nella lingua italiana (approssimative)
        const vowels = ["A", "E", "I", "O", "U"];
        const consonants = [
            "B", "C", "D", "F", "G", "H", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "Z"
        ];

        // Frequenze relative (più comuni hanno più probabilità di essere scelte)
        const vowelFrequencies = [15, 20, 20, 15, 10]; // A, E, I, O, U
        const consonantFrequencies = [5, 10, 8, 4, 3, 2, 12, 6, 10, 4, 1, 15, 10, 10, 8, 3]; // B, C, ...

        // Funzione per scegliere una lettera in base alla frequenza
        function getRandomLetter(letters, frequencies) {
            const totalFrequency = frequencies.reduce((sum, freq) => sum + freq, 0);
            const random = Math.random() * totalFrequency;
            let cumulative = 0;

            for (let i = 0; i < letters.length; i++) {
                cumulative += frequencies[i];
                if (random < cumulative) {
                    return letters[i];
                }
            }
        }

        // Numero di vocali e consonanti
        const numVowels = Math.ceil(count / 3); // Circa 1/3 vocali
        const numConsonants = count - numVowels;

        const letters = [];

        // Genera vocali
        for (let i = 0; i < numVowels; i++) {
            letters.push(getRandomLetter(vowels, vowelFrequencies));
        }

        // Genera consonanti
        for (let i = 0; i < numConsonants; i++) {
            letters.push(getRandomLetter(consonants, consonantFrequencies));
        }

        // Mescola le lettere generate
        return letters.sort(() => Math.random() - 0.5);
    }

    // Funzione per calcolare i punti di una parola
    function calculateWordPoints(word) {
        let points = 0;

        // Calcolo punti in base alla lunghezza
        if (word.length === 3) {
            points += 1;
        } else if (word.length === 4) {
            points += 2;
        } else if (word.length === 5) {
            points += 3;
        } else if (word.length >= 6) {
            points += 5;
        }

        // Bonus: Parola che usa tutte le lettere generate
        if (word.length === generatedLetters.length && validateWord(word, generatedLetters)) {
            points += 10;
        }

        // Bonus: Parola rara
        if (rareWords.has(word.toUpperCase())) {
            points += 2; // Bonus per parola rara
            console.log(`Bonus parola rara per "${word}": +2 punti`);
        }

        console.log(`Punti calcolati per la parola "${word}": ${points}`);
        return points;
    }

    // Funzione per validare una parola rispetto alle lettere generate
    function validateWord(word, letters) {
        const lettersCopy = [...letters];
        for (const char of word.toUpperCase()) {
            const index = lettersCopy.indexOf(char);
            if (index === -1) {
                console.log(`Lettera non trovata: ${char} in ${letters}`);
                return false; // Lettera non trovata
            }
            lettersCopy.splice(index, 1); // Rimuovi la lettera usata
        }

        // Controlla se la parola esiste nel vocabolario locale
        const isValid = italianVocabulary.has(word.toUpperCase());
        console.log(`Validazione parola: ${word}, Risultato: ${isValid}`);
        return isValid;
    }

    // Funzione per calcolare i punteggi dei giocatori
    async function calculateScores(playersWords) {
        const allWords = {}; // Oggetto per tracciare quante volte ogni parola è stata usata
        const scores = [];
        const invalidWords = [];
        const duplicateWords = [];

        // Conta quante volte ogni parola è stata usata
        playersWords.forEach((words) => {
            words.forEach((word) => {
                const upperWord = word.toUpperCase();
                if (!allWords[upperWord]) {
                    allWords[upperWord] = 0;
                }
                allWords[upperWord]++;
            });
        });

        // Calcola i punteggi per ogni giocatore
        for (const [playerIndex, words] of playersWords.entries()) {
            let score = 0;
            const playerInvalidWords = [];
            const playerDuplicateWords = [];

            for (const word of words) {
                const upperWord = word.toUpperCase();

                // Validazione rispetto alle lettere generate
                const isValid = validateWord(upperWord, generatedLetters);

                if (!isValid) {
                    playerInvalidWords.push(word);
                } else if (allWords[upperWord] > 1) {
                    playerDuplicateWords.push(word);
                } else {
                    score += calculateWordPoints(upperWord);
                }
            }

            scores.push(score);
            invalidWords.push(playerInvalidWords);
            duplicateWords.push(playerDuplicateWords);
        }

        return { scores, invalidWords, duplicateWords };
    }

    // Funzione per avviare il timer
    function startTimer(duration, display, onComplete) {
        let timer = duration;
        display.textContent = formatTime(timer);

        timerInterval = setInterval(() => {
            timer--;
            display.textContent = formatTime(timer);

            if (timer <= 0) {
                clearInterval(timerInterval);
                onComplete();
            }
        }, 1000);
    }

    // Funzione per formattare il tempo
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    }

    // Funzione per mostrare la schermata di inserimento parole
    function showWordInputScreen(players) {
        gameScreen.classList.add("hidden");
        wordInputScreen.classList.remove("hidden");

        generatedLettersDisplayInput.textContent = generatedLetters.join(", ");
        playerWordsContainer.innerHTML = "";

        for (let i = 1; i <= players; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Parole del giocatore ${i} (separate da virgole)`;
            input.id = `player-${i}-words`;
            playerWordsContainer.appendChild(input);
        }
    }

    // Funzione per mostrare la schermata dei risultati
    function showResultsScreen(scores, invalidWords, duplicateWords) {
        wordInputScreen.classList.add("hidden");
        resultsScreen.classList.remove("hidden");

        generatedLettersDisplay.textContent = generatedLetters.join(", ");
        resultsContainer.innerHTML = "";

        scores.forEach((score, index) => {
            const result = document.createElement("div");
            result.innerHTML = `
                <h3>Giocatore ${index + 1}</h3>
                <p>Punteggio: ${score}</p>
                <p>Parole non valide: ${invalidWords[index].join(", ") || "Nessuna"}</p>
                <p>Parole duplicate: ${duplicateWords[index].join(", ") || "Nessuna"}</p>
            `;
            resultsContainer.appendChild(result);
        });
    }

    // Listener per il pulsante "Inizia il gioco"
    startButton.addEventListener('click', () => {
        const players = parseInt(playersSelect.value, 10);
        const time = parseInt(timeSelect.value, 10);

        if (!players || players < 2) {
            alert("Inserisci un numero valido di giocatori (minimo 2).");
            return;
        }

        document.querySelector(".settings").classList.add("hidden");
        gameScreen.classList.remove("hidden");

        // Genera lettere casuali bilanciate
        generatedLetters = generateRandomLetters();
        lettersContainer.textContent = generatedLetters.join(", ");

        startTimer(time, timeLeftDisplay, () => {
            alert("Tempo scaduto! Inserisci le parole trovate.");
            showWordInputScreen(players);
        });
    });

    // Listener per il pulsante "Calcola i punteggi"
    calculateScoresButton.addEventListener("click", async () => {
        const players = parseInt(playersSelect.value, 10);
        playerWords = [];

        for (let i = 1; i <= players; i++) {
            const input = document.getElementById(`player-${i}-words`);
            const words = input.value.split(",").map(word => word.trim().toUpperCase());
            playerWords.push(words);
        }

        const { scores, invalidWords, duplicateWords } = await calculateScores(playerWords);

        showResultsScreen(scores, invalidWords, duplicateWords);
    });

    // Listener per il pulsante "Ricomincia"
    restartButton.addEventListener("click", () => {
        resultsScreen.classList.add("hidden");
        document.querySelector(".settings").classList.remove("hidden");

        generatedLetters = [];
        playerWords = [];
    });

    async function validateWordWithAPI(word) {
        const url = "https://datasets-server.huggingface.co/rows";
        const params = new URLSearchParams({
            dataset: "mik3ml/italian-dictionary",
            config: "default",
            split: "train",
            offset: 0,
            length: 100, // Numero di righe da scaricare (puoi aumentarlo se necessario)
        });

        const headers = {
            Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
        };

        try {
            const response = await fetch(`${url}?${params.toString()}`, {
                method: "GET",
                headers: headers,
            });

            if (response.ok) {
                const data = await response.json();
                const rows = data.rows.map(row => row.row.word.toUpperCase()); // Estrai le parole dal dataset
                return rows.includes(word.toUpperCase()); // Controlla se la parola è presente
            } else {
                console.error("Errore API:", response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error("Errore durante la richiesta all'API:", error);
            return false;
        }
    }
});