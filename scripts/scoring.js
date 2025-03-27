const scoring = {
    wordsSubmitted: [],
    scores: {},

    // Function to validate words
    validateWord: function(word) {
        // Check if the word is valid (e.g., length, dictionary check)
        return word.length >= 3; // Example rule: words must be at least 3 letters
    },

    // Function to add a word and calculate score
    addWord: function(player, word) {
        if (this.validateWord(word)) {
            if (!this.wordsSubmitted.includes(word)) {
                this.wordsSubmitted.push(word);
                this.scores[player] = (this.scores[player] || 0) + word.length; // Score based on word length
            }
        }
    },

    // Function to get the final scores
    getFinalScores: function() {
        return this.scores;
    },

    // Function to reset scoring for a new game
    resetScores: function() {
        this.wordsSubmitted = [];
        this.scores = {};
    }
};

export default scoring;