let VIDEO = null;
let CANVAS = null;
let CONTEXT = null;
let SCALER = 0.8;
let SIZE = { x: 0, y: 0, width: 0, height: 0, rows: 3, columns: 3 };
let PIECES = [];
let image = new Image();
let level1 =["C.jpg","A.jpg","T.jpg"];
image.src = `levels/level1/A.jpg`; // Make sure this is the correct path to your image
let SELECTED_PIECE = null;
let startTime; // When the game starts
let timerInterval; // To keep track of the interval function
let gameStarted = false; // Flag to indicate if the game has started
let gameCompleted = false; 
maxLevel = 15 ; 
i=0// Flag to indicate if the game has been completed

function main() {
    CANVAS = document.getElementById("myCanvas");
    CONTEXT = CANVAS.getContext("2d");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    addEventListener();

    let promise = navigator.mediaDevices.getUserMedia({ video: true });
    promise.then(function (signal) {
        VIDEO = document.createElement("video");
        VIDEO.srcObject = signal;
        VIDEO.play();
        VIDEO.onloadedmetadata = function () {
            handleResize();
            window.addEventListener('resize', handleResize);
            initializePieces(SIZE.rows, SIZE.columns);
            randomizePieces();
            updateCanvas();
        }
    }).catch(function (err) {
        console.log("camera error " + err);
    });
}

function addEventListener() {
    CANVAS.addEventListener("mousedown", onMouseDown);
    CANVAS.addEventListener("mousemove", onMouseMove);
    CANVAS.addEventListener("mouseup", onMouseUp);
}

function onMouseDown(evt) {
    SELECTED_PIECE = getPressedPiece(evt);
    if (SELECTED_PIECE) {
        if (!gameStarted) {
            gameStarted = true;
            startTimer();
        }
        SELECTED_PIECE.offset = {
            x: evt.clientX - SELECTED_PIECE.x,
            y: evt.clientY - SELECTED_PIECE.y
        };
    }
}

function onMouseMove(evt) {
    if (SELECTED_PIECE) {
        SELECTED_PIECE.x = evt.clientX - SELECTED_PIECE.offset.x;
        SELECTED_PIECE.y = evt.clientY - SELECTED_PIECE.offset.y;
        updateCanvas();
    }
}

function onMouseUp(evt) {
    if (SELECTED_PIECE && SELECTED_PIECE.isClose()) {
        SELECTED_PIECE.snap();
    }
    SELECTED_PIECE = null;
}

function getPressedPiece(evt) {
    let rect = CANVAS.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    for (let i = PIECES.length - 1; i >= 0; i--) {
        if (x >= PIECES[i].x && x <= PIECES[i].x + PIECES[i].width &&
            y >= PIECES[i].y && y <= PIECES[i].y + PIECES[i].height) {
            return PIECES[i];
        }
    }
    return null;
}

function handleResize() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    let resizer = SCALER * Math.min(window.innerWidth / VIDEO.videoWidth, window.innerHeight / VIDEO.videoHeight);
    SIZE.width = VIDEO.videoWidth * resizer;
    SIZE.height = VIDEO.videoHeight * resizer;
    SIZE.x = (window.innerWidth - SIZE.width) / 2;
    SIZE.y = (window.innerHeight - SIZE.height) / 2;
    updateCanvas();
}

function updateCanvas() {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);

    // Draw frames for original piece locations
    PIECES.forEach(piece => {
        CONTEXT.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Green, semi-transparent
        CONTEXT.strokeRect(piece.xCorrect, piece.yCorrect, piece.width, piece.height);
    });

    for (let i = 0; i < PIECES.length; i++) {
        PIECES[i].draw(CONTEXT);
    }
    if (gameStarted && !gameCompleted) {
        requestAnimationFrame(updateCanvas);
    }
}

function initializePieces(rows, columns) {
    SIZE.rows = rows;
    SIZE.columns = columns;
    PIECES = [];
    for (let i = 0; i < SIZE.rows; i++) {
        for (let j = 0; j < SIZE.columns; j++) {
            PIECES.push(new Piece(i, j));
        }
    }
}

function randomizePieces() {
    for (let i = 0; i < PIECES.length; i++) {
        let loc = {
            x: Math.floor(Math.random() * (CANVAS.width - PIECES[i].width)),
            y: Math.floor(Math.random() * (CANVAS.height - PIECES[i].height))
        };
        PIECES[i].x = loc.x;
        PIECES[i].y = loc.y;
    }
}

class Piece {
    constructor(rowIndex, colIndex) {
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.x = SIZE.x + this.colIndex * SIZE.width / SIZE.columns;
        this.y = SIZE.y + this.rowIndex * SIZE.height / SIZE.rows;
        this.width = SIZE.width / SIZE.columns;
        this.height = SIZE.height / SIZE.rows;
        this.xCorrect = this.x;
        this.yCorrect = this.y;
        this.animating = false;
    }

    draw(CONTEXT) {
        CONTEXT.beginPath();
        CONTEXT.drawImage(
            VIDEO,
            this.colIndex * VIDEO.videoWidth / SIZE.columns,
            this.rowIndex * VIDEO.videoHeight / SIZE.rows,
            VIDEO.videoWidth / SIZE.columns,
            VIDEO.videoHeight / SIZE.rows,
            this.x,
            this.y,
            this.width,
            this.height
        );

        CONTEXT.drawImage(
            image,
            this.colIndex * image.width / SIZE.columns,
            this.rowIndex * image.height / SIZE.rows,
            image.width / SIZE.columns,
            image.height / SIZE.rows,
            this.x,
            this.y,
            this.width,
            this.height
        );

        CONTEXT.rect(this.x, this.y, this.width, this.height);
        CONTEXT.stroke();
    }
    
    isClose() {
        const snapDistance = Math.sqrt(Math.pow(this.x - this.xCorrect, 2) + Math.pow(this.y - this.yCorrect, 2));
        return snapDistance < this.width / 3; // Snap if within 1/3 of the width
    }

    snap() {
        this.x = this.xCorrect;
        this.y = this.yCorrect;
        // Once a piece snaps, check if the game is completed
        checkCompletion();
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000); // Update every second
}

function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    document.getElementById('timer').textContent = (elapsedTime / 1000).toFixed(1);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function calculateScore() {
    const timeTaken = Date.now() - startTime;
    const timeScore = Math.max(0, 1000 - timeTaken / 100); // Decreases score by time
    return Math.round(timeScore);
}
let currentLevel = 1;
function checkCompletion() {
    gameCompleted = PIECES.every(piece => piece.x === piece.xCorrect && piece.y === piece.yCorrect);
    if (gameCompleted) {
        stopTimer();
        const score = calculateScore();
        document.getElementById('score').textContent = score;

        if (currentLevel < maxLevel) {
            
            nextLevel();
        } else {
           
            // Handle game completion, maybe redirect to a different page or show a summary.
        }
    }
}


function nextLevel() {
    currentLevel++;
    document.getElementById('level').textContent = currentLevel;

    // Convertit le numéro du niveau en une lettre
    

    // Change l'image en fonction du niveau
    image.src = level1[i];

    // Attendez que l'image soit chargée avant de réinitialiser le jeu
    image.onload = function() {
        console.log("Image loaded successfully");
        i++;
        resetGame();
    };
    image.onerror = function() {
        console.error("Error loading image:", image.src);
    };
}
function resetGame() {
    // Reset necessary game state variables and start a new game
    // For example, you may want to reset the timer, shuffle puzzle pieces, etc.
    // Add any additional logic you need for resetting the game state.

    // Example: Reset timer
    startTime = Date.now();
    updateTimer();

    // Example: Reset puzzle pieces for a new level
    initializePieces(SIZE.rows, SIZE.columns);
    randomizePieces();

    // Example: Clear canvas and redraw
    updateCanvas();
}


// Call the main function to start the application
main();
