// This file contains the gameplay mechanics for the LETTERUN game.

let letters = [];
let timer;
let timeLimit = 60; // default time limit in seconds
let wordsSubmitted = [];
let gameActive = false;

function startGame(duration) {
    timeLimit = duration;
    letters = generateRandomLetters(9);
    wordsSubmitted = [];
    gameActive = true;
    startTimer();
    displayLetters();
}

function generateRandomLetters(count) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        randomLetters.push(alphabet[randomIndex]);
    }
    return randomLetters;
}

function displayLetters() {
    const lettersContainer = document.getElementById('letters');
    lettersContainer.innerHTML = letters.join(' ');
}

function startTimer() {
    let timeRemaining = timeLimit;
    timer = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(timer);
            endGame();
        } else {
            timeRemaining--;
            updateTimerDisplay(timeRemaining);
        }
    }, 1000);
}

function updateTimerDisplay(time) {
    const timerDisplay = document.getElementById('timer');
    timerDisplay.innerText = `Time Remaining: ${time} seconds`;
}

function endGame() {
    gameActive = false;
    // Transition to scoring phase
    calculateScores();
}

function submitWord(word) {
    if (gameActive && isValidWord(word) && !wordsSubmitted.includes(word)) {
        wordsSubmitted.push(word);
    }
}

function isValidWord(word) {
    // Implement word validation logic (e.g., check against a dictionary)
    return true; // Placeholder for actual validation
}

function calculateScores() {
    // Implement scoring logic based on wordsSubmitted
}

// Export functions for use in other scripts
export { startGame, submitWord };