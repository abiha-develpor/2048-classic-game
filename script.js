const SIZE = 4;

let grid = [];
let score = 0;
let gameEnded = false;

const board = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const newGameButton = document.getElementById("new-game");

const messageOverlay = document.getElementById("message-overlay");
const messageTitle = document.getElementById("message-title");
const messageText = document.getElementById("message-text");
const restartButton = document.getElementById("restart-game");


// ==============================
// INITIALIZE GAME
// ==============================

function initGrid() {
    grid = Array.from(
        { length: SIZE },
        () => Array(SIZE).fill(0)
    );

    score = 0;
    gameEnded = false;

    hideMessage();

    addRandomTile();
    addRandomTile();

    renderGrid();
}


// ==============================
// ADD RANDOM TILE
// Same as C code:
// 10% chance = 4
// 90% chance = 2
// ==============================

function addRandomTile() {
    const emptyCells = [];

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (grid[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }

    if (emptyCells.length === 0) {
        return;
    }

    const randomIndex = Math.floor(
        Math.random() * emptyCells.length
    );

    const cell = emptyCells[randomIndex];

    const value = Math.random() < 0.1 ? 4 : 2;

    grid[cell.row][cell.col] = value;
}


// ==============================
// RENDER GRID
// ==============================

function renderGrid() {
    board.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            const tile = document.createElement("div");
            const value = grid[row][col];

            tile.classList.add("tile");

            if (value === 0) {
                tile.classList.add("empty");
            } else {
                tile.classList.add(`tile-${value}`);
                tile.textContent = value;
            }

            board.appendChild(tile);
        }
    }

    scoreElement.textContent = score;
}


// ==============================
// SLIDE AND MERGE
// Equivalent to C slideAndMerge()
// ==============================

function slideAndMerge(line) {

    // Remove all zeroes
    const numbers = line.filter(value => value !== 0);

    const result = [];
    let i = 0;

    while (i < numbers.length) {

        // If current and next values are equal,
        // merge them.
        if (
            i < numbers.length - 1 &&
            numbers[i] === numbers[i + 1]
        ) {
            const mergedValue = numbers[i] * 2;

            result.push(mergedValue);

            // Same as:
            // score += temp[index];
            score += mergedValue;

            i += 2;
        } else {
            result.push(numbers[i]);
            i++;
        }
    }

    // Fill remaining spaces with zero
    while (result.length < SIZE) {
        result.push(0);
    }

    return result;
}


// ==============================
// MOVE LEFT
// ==============================

function moveLeft() {

    let moved = false;

    for (let row = 0; row < SIZE; row++) {

        const oldRow = [...grid[row]];
        const newRow = slideAndMerge(oldRow);

        grid[row] = newRow;

        if (!arraysEqual(oldRow, newRow)) {
            moved = true;
        }
    }

    return moved;
}


// ==============================
// MOVE RIGHT
// ==============================

function moveRight() {

    let moved = false;

    for (let row = 0; row < SIZE; row++) {

        const oldRow = [...grid[row]];

        // Reverse
        const reversed = [...oldRow].reverse();

        // Slide and merge
        const merged = slideAndMerge(reversed);

        // Reverse back
        const newRow = merged.reverse();

        grid[row] = newRow;

        if (!arraysEqual(oldRow, newRow)) {
            moved = true;
        }
    }

    return moved;
}


// ==============================
// MOVE UP
// ==============================

function moveUp() {

    let moved = false;

    for (let col = 0; col < SIZE; col++) {

        const oldColumn = [];

        for (let row = 0; row < SIZE; row++) {
            oldColumn.push(grid[row][col]);
        }

        const newColumn = slideAndMerge(oldColumn);

        for (let row = 0; row < SIZE; row++) {
            grid[row][col] = newColumn[row];
        }

        if (!arraysEqual(oldColumn, newColumn)) {
            moved = true;
        }
    }

    return moved;
}


// ==============================
// MOVE DOWN
// ==============================

function moveDown() {

    let moved = false;

    for (let col = 0; col < SIZE; col++) {

        const oldColumn = [];

        for (let row = 0; row < SIZE; row++) {
            oldColumn.push(grid[row][col]);
        }

        // Reverse column
        const reversed = [...oldColumn].reverse();

        // Slide and merge
        const merged = slideAndMerge(reversed);

        // Reverse back
        const newColumn = merged.reverse();

        for (let row = 0; row < SIZE; row++) {
            grid[row][col] = newColumn[row];
        }

        if (!arraysEqual(oldColumn, newColumn)) {
            moved = true;
        }
    }

    return moved;
}


// ==============================
// MAIN MOVE FUNCTION
// Equivalent to C move()
// ==============================

function move(direction) {

    if (gameEnded) {
        return;
    }

    let moved = false;

    switch (direction) {

        case "left":
            moved = moveLeft();
            break;

        case "right":
            moved = moveRight();
            break;

        case "up":
            moved = moveUp();
            break;

        case "down":
            moved = moveDown();
            break;
    }

    // IMPORTANT:
    // A new tile is added ONLY when
    // the board actually changed.
    if (moved) {

        addRandomTile();
        renderGrid();

        if (checkWin()) {
            gameEnded = true;

            showMessage(
                "You Win!",
                `You reached 2048! Score: ${score}`
            );

            return;
        }

        if (!canMove()) {
            gameEnded = true;

            showMessage(
                "Game Over!",
                `No more moves. Score: ${score}`
            );

            return;
        }
    }
}


// ==============================
// CHECK IF TWO ARRAYS ARE SAME
// ==============================

function arraysEqual(a, b) {

    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}


// ==============================
// CHECK WIN
// Equivalent to C checkWin()
// ==============================

function checkWin() {

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            if (grid[row][col] === 2048) {
                return true;
            }
        }
    }

    return false;
}


// ==============================
// CHECK WHETHER PLAYER CAN MOVE
// Equivalent to C canMove()
// ==============================

function canMove() {

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            // Empty cell exists
            if (grid[row][col] === 0) {
                return true;
            }

            // Check right neighbor
            if (
                col < SIZE - 1 &&
                grid[row][col] === grid[row][col + 1]
            ) {
                return true;
            }

            // Check bottom neighbor
            if (
                row < SIZE - 1 &&
                grid[row][col] === grid[row + 1][col]
            ) {
                return true;
            }
        }
    }

    return false;
}


// ==============================
// KEYBOARD CONTROLS
// W/A/S/D + ARROW KEYS
// ==============================

document.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    let direction = null;

    switch (key) {

        case "a":
        case "arrowleft":
            direction = "left";
            break;

        case "d":
        case "arrowright":
            direction = "right";
            break;

        case "w":
        case "arrowup":
            direction = "up";
            break;

        case "s":
        case "arrowdown":
            direction = "down";
            break;

        case "q":
            gameEnded = true;
            return;
    }

    if (direction) {
        event.preventDefault();
        move(direction);
    }
});


// ==============================
// NEW GAME
// ==============================

newGameButton.addEventListener("click", initGrid);

restartButton.addEventListener("click", initGrid);


// ==============================
// TOUCH / SWIPE CONTROLS
// ==============================

let touchStartX = 0;
let touchStartY = 0;

board.addEventListener("touchstart", function(event) {

    const touch = event.changedTouches[0];

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

}, { passive: true });


board.addEventListener("touchend", function(event) {

    const touch = event.changedTouches[0];

    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minimumSwipe = 30;

    if (
        Math.abs(deltaX) < minimumSwipe &&
        Math.abs(deltaY) < minimumSwipe
    ) {
        return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {

        if (deltaX > 0) {
            move("right");
        } else {
            move("left");
        }

    } else {

        if (deltaY > 0) {
            move("down");
        } else {
            move("up");
        }
    }

}, { passive: true });


// ==============================
// MESSAGE FUNCTIONS
// ==============================

function showMessage(title, text) {

    messageTitle.textContent = title;
    messageText.textContent = text;

    messageOverlay.classList.remove("hidden");
}

function hideMessage() {
    messageOverlay.classList.add("hidden");
}


// ==============================
// START GAME
// ==============================

initGrid();