// Variables to keep track of the current level and score
let currentLevel = 1;
let score = 0;

// Function to initialize the game
function initializeGame() {
    // Load the first level
    loadLevel(currentLevel);
}

// Function to load a level
function loadLevel(level) {
    // Construct the path to the level folder
    let levelFolder = `levels/level${level}/`;

    // Load the images from the level folder
    // This is a simplified example, you might need to adjust this based on your actual folder structure and file names
    image.src = levelFolder + "image1.png";
    // ... load more images as needed

    // Reset the game state for the new level
    resetGameState();
}

// Function to reset the game state for a new level
function resetGameState() {
    // Reset the game variables
    gameStarted = false;
    gameCompleted = false;

    // Reset the pieces
    PIECES = [];
    initializePieces(SIZE.rows, SIZE.columns);
    randomizePieces();

    // Reset the timer
    stopTimer();
    document.getElementById('timer').textContent = '0';
}

// Function to check if the current level is completed
function checkCompletion() {
    gameCompleted = PIECES.every(piece => piece.x === piece.xCorrect && piece.y === piece.yCorrect);
    if (gameCompleted) {
        // Stop the timer
        stopTimer();

        // Calculate the score for this level
        score = calculateScore();

        // Display the score
        document.getElementById('score').textContent = score;

        // Advance to the next level
        currentLevel++;
        loadLevel(currentLevel);
    }
}

// Call the initializeGame function to start the game
initializeGame();