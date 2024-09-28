const player = document.getElementById('player');
const block = document.getElementById('block');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverPrompt = document.getElementById('gameOverPrompt');

let playerPosX = 180;
let blockPosY = -50;
let blockPosX = Math.floor(Math.random() * 360);
let blockSpeed = 5;
let score = 0;
let highScore = 0;
let gameActive = true;

// Load high score from localStorage if available
if (localStorage.getItem('highScore')) {
    highScore = parseInt(localStorage.getItem('highScore'));
    highScoreElement.textContent = highScore;
}

// Move the player left and right
document.addEventListener('keydown', function (e) {
    if (gameActive) {
        if (e.key === 'ArrowLeft' && playerPosX > 0) {
            playerPosX -= 20;
        } else if (e.key === 'ArrowRight' && playerPosX < 360) {
            playerPosX += 20;
        }
        player.style.left = playerPosX + 'px';
    } else if (e.key === ' ') {
        restartGame();
    }
});

// Move the falling block
function moveBlock() {
    if (!gameActive) return;

    blockPosY += blockSpeed;
    block.style.top = blockPosY + 'px';
    block.style.left = blockPosX + 'px';

    // If the block goes off the screen, reset it
    if (blockPosY > 600) {
        blockPosY = -50;
        blockPosX = Math.floor(Math.random() * 360);
        score++;
        blockSpeed += 0.5; 
        updateScore();
    }

    // Check for collision
    if (blockPosY + 40 >= 560 && blockPosX >= playerPosX && blockPosX <= playerPosX + 40) {
        gameOver();
    }

    requestAnimationFrame(moveBlock);
}

function updateScore() {
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('highScore', highScore);
    }
}

function gameOver() {
    gameActive = false;
    gameOverPrompt.style.display = 'block';
}

function restartGame() {
    gameOverPrompt.style.display = 'none';
    blockPosY = -50;
    blockPosX = Math.floor(Math.random() * 360);
    blockSpeed = 5;
    score = 0;
    playerPosX = 180;
    player.style.left = playerPosX + 'px';
    scoreElement.textContent = score;
    gameActive = true;
    moveBlock();
}

// Start the game loop
moveBlock();

