// Constants and variables
const spaceship = document.getElementById('spaceship');
const lasersContainer = document.getElementById('lasers');
const enemiesContainer = document.getElementById('enemies'); // This will now hold obstacles
const scoreDisplay = document.getElementById('score');
const healthDisplay = document.getElementById('healthValue');
const startScreen = document.getElementById('startScreen');
const gameArea = document.getElementById('gameArea');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const bgMusic = document.getElementById('bgMusic');
const laserSound = document.getElementById('laserSound');
const explosionSound = document.getElementById('explosionSound');
const enemyLaserSound = document.getElementById('enemyLaserSound');

let score = 0;
let health = 100;
let lasers = [];
let obstacles = []; 
const laserSpeed = 8;
const obstacleSpeed = 2;
const obstacleInterval = 2000; 
let isGameOver = false;
let isGameStarted = false;
let obstacleIntervalId;

// Initialize game
function initGame() {
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    document.addEventListener('keydown', handleKeyPress);
    bgMusic.loop = true;
    bgMusic.volume = 0.3; 
    bgMusic.play();
}


function moveSpaceship(dx) {
    if (isGameOver || !isGameStarted) return;
    let left = parseInt(window.getComputedStyle(spaceship).left, 10);
    left += dx;
    left = Math.max(0, Math.min(window.innerWidth - spaceship.offsetWidth, left));
    spaceship.style.left = `${left}px`;
}


function shootLaser() {
    if (isGameOver || !isGameStarted) return;
    laserSound.play();
    const laser = document.createElement('div');
    laser.className = 'laser';
    const spaceshipLeft = parseInt(window.getComputedStyle(spaceship).left, 10);
    laser.style.left = `${spaceshipLeft + spaceship.offsetWidth / 2 - 2.5}px`;
    laser.style.bottom = `${spaceship.offsetHeight}px`;
    lasersContainer.appendChild(laser);
    lasers.push(laser);
    console.log('Laser created at:', laser.style.left, laser.style.bottom); 
}


function generateObstacles() {
    if (isGameOver || !isGameStarted) return;

    const obstacle = document.createElement('div');
    obstacle.className = 'enemy'; 
    obstacle.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
    obstacle.style.top = `0px`;
    enemiesContainer.appendChild(obstacle);
    obstacles.push(obstacle);
}


function updateGame() {
    if (isGameOver || !isGameStarted) return;

   
    lasers.forEach((laser, index) => {
        let laserBottom = parseInt(laser.style.bottom, 10);
        laserBottom += laserSpeed;
        laser.style.bottom = `${laserBottom}px`;

        if (laserBottom > window.innerHeight) {
            lasersContainer.removeChild(laser);
            lasers.splice(index, 1);
            console.log('Laser removed due to reaching the bottom'); // Debugging
        }
    });

    obstacles.forEach((obstacle, index) => {
        let obstacleTop = parseInt(obstacle.style.top, 10);
        obstacleTop += obstacleSpeed;
        obstacle.style.top = `${obstacleTop}px`;

        if (obstacleTop > window.innerHeight) {
            enemiesContainer.removeChild(obstacle);
            obstacles.splice(index, 1);
            console.log('Obstacle removed due to reaching the bottom'); // Debugging
            return;
        }

        const obstacleRect = obstacle.getBoundingClientRect();
        const spaceshipRect = spaceship.getBoundingClientRect();

        if (checkCollision(obstacleRect, spaceshipRect)) {
            health -= 10;
            healthDisplay.textContent = health;
            enemiesContainer.removeChild(obstacle);
            obstacles.splice(index, 1);
            if (health <= 0) {
                endGame();
            }
        }

        // Check for collision with lasers
        lasers.forEach((laser, laserIndex) => {
            const laserRect = laser.getBoundingClientRect();
            if (checkCollision(laserRect, obstacleRect)) {
                score += 10;
                updateScore();
                enemiesContainer.removeChild(obstacle);
                obstacles.splice(index, 1);
                lasersContainer.removeChild(laser);
                lasers.splice(laserIndex, 1);
                explosionSound.play();
                console.log('Laser hit obstacle'); // Debugging
            }
        });
    });

    requestAnimationFrame(updateGame);
}

// Check collision
function checkCollision(rect1, rect2) {
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

// Start game
function startGame() {
    startScreen.style.display = 'none';
    gameArea.style.display = 'block';
    isGameStarted = true;
    score = 0;
    health = 100;
    updateScore();
    healthDisplay.textContent = health;
    clearInterval(obstacleIntervalId);
    enemiesContainer.innerHTML = '';
    obstacles = [];
    startNextWave();
}

// Restart game
function restartGame() {
    score = 0;
    health = 100;
    updateScore();
    healthDisplay.textContent = health;
    isGameOver = false;
    isGameStarted = true;
    gameOverScreen.style.display = 'none';
    gameArea.style.display = 'block';
    clearInterval(obstacleIntervalId);
    enemiesContainer.innerHTML = '';
    obstacles = [];
    startNextWave();
}

// End game
function endGame() {
    isGameOver = true;
    bgMusic.pause();
    clearInterval(obstacleIntervalId);
    gameArea.style.display = 'none';
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
}

// Handle key presses
function handleKeyPress(e) {
    if (e.key === 'ArrowLeft') {
        moveSpaceship(-10); // Move left
    } else if (e.key === 'ArrowRight') {
        moveSpaceship(10); // Move right
    } else if (e.key === ' ') {
        shootLaser(); // Shoot laser
    }
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function startNextWave() {
    generateObstacles();
    obstacleIntervalId = setInterval(generateObstacles, obstacleInterval);
}

window.onload = initGame;
