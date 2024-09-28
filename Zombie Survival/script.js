const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const healthElement = document.getElementById('health');
const gameOverPrompt = document.getElementById('gameOverPrompt');

let playerPosX = 280;
let playerPosY = 280;
let score = 0;
let highScore = 0;
let health = 100;
let zombies = [];
let bullets = [];
let zombieSpawnRate = 3000; 
let gameActive = true;
let canShoot = true;
let spawnRateIncreaseInterval = 10000; 

// Load high score from localStorage if available
if (localStorage.getItem('highScore')) {
    highScore = parseInt(localStorage.getItem('highScore'));
    highScoreElement.textContent = highScore;
}

// Extended colors and shapes based on zombie health
const zombieStyles = [

    { health: 1, color: 'purple', shape: '50%' },   
    { health: 2, color: 'orange', shape: '0%' },    
    { health: 3, color: 'cyan', shape: '50% 50% 0 0' },
    { health: 4, color: 'pink', shape: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
    { health: 5, color: 'red', shape: 'polygon(50% 0%, 100% 25%, 75% 100%, 25% 100%, 0% 25%)' }, 
    { health: 6, color: 'blue', shape: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
];

// Player movement
document.addEventListener('keydown', function (e) {
    if (gameActive) {
        if (e.key === 'ArrowLeft' && playerPosX > 0) {
            playerPosX -= 20;
        } else if (e.key === 'ArrowRight' && playerPosX < 560) {
            playerPosX += 20;
        } else if (e.key === 'ArrowUp' && playerPosY > 0) {
            playerPosY -= 20;
        } else if (e.key === 'ArrowDown' && playerPosY < 560) {
            playerPosY += 20;
        } else if (e.key === ' ' && canShoot) {
            shootBullet();
            canShoot = false;
            setTimeout(() => canShoot = true, 100);  // Add delay between bullets
        }
        player.style.left = playerPosX + 'px';
        player.style.top = playerPosY + 'px';
    } else if (e.key === ' ') {
        restartGame();
    }
});

// Ensure zombies don’t spawn too close to the player
function safeSpawnPosition() {
    let safeDistance = 150;
    let posX, posY;

    do {
        posX = Math.random() * 580;
        posY = Math.random() * 580;
    } while (Math.sqrt((playerPosX - posX) ** 2 + (playerPosY - posY) ** 2) < safeDistance);

    return { x: posX, y: posY };
}

// Spawn zombies with health and different shapes/colors
function spawnZombie() {
    const zombie = document.createElement('div');
    const style = zombieStyles[Math.floor(Math.random() * zombieStyles.length)];
    zombie.classList.add('zombie');
    
    const size = Math.random() * 20 + 30;  
    zombie.style.width = size + 'px';
    zombie.style.height = size + 'px';
    zombie.style.backgroundColor = style.color;
    zombie.style.clipPath = style.shape;
    
    const spawnPos = safeSpawnPosition();
    zombie.posX = spawnPos.x;
    zombie.posY = spawnPos.y;
    zombie.speed = Math.random() * 1 + 1;
    zombie.health = style.health; 
    zombie.style.left = zombie.posX + 'px';
    zombie.style.top = zombie.posY + 'px';
    
    gameArea.appendChild(zombie);
    zombies.push(zombie);

    if (gameActive) {
        setTimeout(spawnZombie, zombieSpawnRate); 
    }
}

// Move zombies towards player
function moveZombies() {
    zombies.forEach((zombie, index) => {
        if (zombie.health <= 0) return; 
        let angle = Math.atan2(playerPosY - zombie.posY, playerPosX - zombie.posX);
        zombie.posX += Math.cos(angle) * zombie.speed;
        zombie.posY += Math.sin(angle) * zombie.speed;
        zombie.style.left = zombie.posX + 'px';
        zombie.style.top = zombie.posY + 'px';

        if (detectCollision(player, zombie)) {
            takeDamage(10);
        }
    });
}

// Collision detection between player/zombies or bullets/zombies
function detectCollision(obj1, obj2) {
    const dx = (parseInt(obj1.style.left) + obj1.offsetWidth / 2) - (parseInt(obj2.style.left) + obj2.offsetWidth / 2);
    const dy = (parseInt(obj1.style.top) + obj1.offsetHeight / 2) - (parseInt(obj2.style.top) + obj2.offsetHeight / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.offsetWidth / 2 + obj2.offsetWidth / 2);
}

// Player takes damage
function takeDamage(amount) {
    if (gameActive) {
        health -= amount;
        healthElement.textContent = health;
        if (health <= 0) {
            gameOver();
        }
    }
}

// Shoot bullet towards the nearest zombie
function shootBullet() {
    if (zombies.length === 0) return;

    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.posX = playerPosX + 15;
    bullet.posY = playerPosY + 15;
    bullet.style.left = bullet.posX + 'px';
    bullet.style.top = bullet.posY + 'px';
    gameArea.appendChild(bullet);

    const nearestZombie = findNearestZombie();
    const angle = Math.atan2(nearestZombie.posY - bullet.posY, nearestZombie.posX - bullet.posX);

    bullets.push({ element: bullet, angle: angle });
}

// Find the nearest zombie to the player
function findNearestZombie() {
    let nearestZombie = zombies[0];
    let minDistance = Infinity;

    zombies.forEach(zombie => {
        if (zombie.health <= 0) return;  
        const dx = zombie.posX - playerPosX;
        const dy = zombie.posY - playerPosY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
            minDistance = distance;
            nearestZombie = zombie;
        }
    });

    return nearestZombie;
}

// Move bullets and detect collisions with zombies
function moveBullets() {
    bullets.forEach((bulletData, bulletIndex) => {
        const bullet = bulletData.element;
        const angle = bulletData.angle;

        bullet.posX += Math.cos(angle) * 5;
        bullet.posY += Math.sin(angle) * 5;
        bullet.style.left = bullet.posX + 'px';
        bullet.style.top = bullet.posY + 'px';

        zombies.forEach((zombie, zombieIndex) => {
            if (zombie.health > 0 && detectCollision(bullet, zombie)) {
                zombie.health--;
                if (zombie.health <= 0) {
                    gameArea.removeChild(zombie);
                    zombies.splice(zombieIndex, 1);
                    score++;
                    updateScore();
                }
                gameArea.removeChild(bullet);
                bullets.splice(bulletIndex, 1);
            }
        });

        if (bullet.posX < 0 || bullet.posX > 600 || bullet.posY < 0 || bullet.posY > 600) {
            gameArea.removeChild(bullet);
            bullets.splice(bulletIndex, 1);
        }
    });
}

// Update score
function updateScore() {
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('highScore', highScore);
    }
}

// Game over
function gameOver() {
    gameActive = false;
    gameOverPrompt.style.display = 'block';
}

// Restart game
function restartGame() {
    gameOverPrompt.style.display = 'none';
    playerPosX = 280;
    playerPosY = 280;
    player.style.left = playerPosX + 'px';
    player.style.top = playerPosY + 'px';
    health = 100;
    score = 0;
    healthElement.textContent = health;
    scoreElement.textContent = score;
    gameActive = true;
    zombies.forEach(zombie => gameArea.removeChild(zombie));
    zombies = [];
    bullets.forEach(bullet => gameArea.removeChild(bullet.element));
    bullets = [];
    spawnZombie();
    moveZombies();
}

// Increase zombie spawn rate over time
function increaseSpawnRate() {
    if (zombieSpawnRate > 1000) {
        zombieSpawnRate -= 200; 
    }
    if (gameActive) {
        setTimeout(increaseSpawnRate, spawnRateIncreaseInterval);
    }
}

// Start game
spawnZombie();
setInterval(moveZombies, 100);
setInterval(moveBullets, 50);
setTimeout(increaseSpawnRate, spawnRateIncreaseInterval);

