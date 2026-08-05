// Box Escape
// Added third obstacle.
// Best Score updates only after Game Over.

const gameContainer = document.getElementById("game-container");

const player = document.getElementById("player");

const obstacle = document.getElementById("obstacle");
const obstacleTwo = document.getElementById("obstacle-two");
const obstacleThree = document.getElementById("obstacle-three");

const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

const scoreDisplay = document.getElementById("score");
const bestScoreDisplay = document.getElementById("best-score");

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");

const gameOverScreen = document.getElementById("game-over-screen");
const restartBtn = document.getElementById("restart-btn");

const MOVE_SPEED = 220;
const BASE_OBSTACLE_SPEED = 180;

const backgroundColors = [
    "#ffffff",
    "#ffd6e0",
    "#d6ecff",
    "#e6ddff",
    "#dcf8dc"
];

let obstacleSpeed = BASE_OBSTACLE_SPEED;

let playerX;
let obstacles = [];

let score = 0;

let bestScore =
    Number(localStorage.getItem("boxEscapeBestScore")) || 0;

let moveDirection = 0;
let gameStarted = false;
let gameOver = false;

let lastTime = performance.now();

updateBestScoreDisplay();

function resetGame() {
    playerX = (gameContainer.clientWidth - player.offsetWidth) / 2;

    score = 0;
    obstacleSpeed = BASE_OBSTACLE_SPEED;

    updateScore();
    updateBackground();

    obstacles = createObstacleSet();

    moveDirection = 0;
    gameOver = false;

    gameOverScreen.hidden = true;

    updatePlayerPosition();
    updateObstacles();
}

function startGame() {
    resetGame();

    startScreen.hidden = true;
    gameStarted = true;
}

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
    resetGame();
    gameStarted = true;
});

// Controls

leftBtn.addEventListener("mousedown", () => startMoving(-1));
rightBtn.addEventListener("mousedown", () => startMoving(1));

leftBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    startMoving(-1);
}, { passive: false });

rightBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    startMoving(1);
}, { passive: false });

leftBtn.addEventListener("mouseup", stopMoving);
rightBtn.addEventListener("mouseup", stopMoving);

leftBtn.addEventListener("touchend", stopMoving);
rightBtn.addEventListener("touchend", stopMoving);

document.addEventListener("mouseup", stopMoving);
document.addEventListener("touchend", stopMoving);

function startMoving(direction) {
    if (!gameStarted || gameOver) return;
    moveDirection = direction;
}

function stopMoving() {
    moveDirection = 0;
}

function createObstacleSet() {
    let positions = [];

    while (positions.length < 3) {
        let x = randomObstacleX();

        if (!positions.some(pos => Math.abs(pos - x) < 60)) {
            positions.push(x);
        }
    }

    return [
        {
            element: obstacle,
            x: positions[0],
            y: -40
        },
        {
            element: obstacleTwo,
            x: positions[1],
            y: -180
        },
        {
            element: obstacleThree,
            x: positions[2],
            y: -320
        }
    ];
}

function randomObstacleX() {
    return Math.random() *
        (gameContainer.clientWidth - obstacle.offsetWidth);
}

function recycleObstacle(item, otherObstacles) {
    let newX = randomObstacleX();

    while (
        otherObstacles.some(other =>
            Math.abs(newX - other.x) < 60
        )
    ) {
        newX = randomObstacleX();
    }

    item.x = newX;
    item.y = -40 - Math.random() * 200;
}

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (gameStarted && !gameOver) {

        if (moveDirection !== 0) {
            playerX += moveDirection * MOVE_SPEED * deltaTime;

            const maxX =
                gameContainer.clientWidth - player.offsetWidth;

            playerX = Math.max(0, Math.min(playerX, maxX));

            updatePlayerPosition();
        }

        obstacles.forEach(item => {
            item.y += obstacleSpeed * deltaTime;

            if (item.y > gameContainer.clientHeight) {

                score++;

                updateScore();
                updateBackground();

                if (score % 5 === 0) {
                    obstacleSpeed += 15;
                }

                const others = obstacles.filter(
                    other => other !== item
                );

                recycleObstacle(item, others);
            }
        });

        updateObstacles();

        if (checkCollision()) {
            endGame();
        }
    }

    requestAnimationFrame(gameLoop);
}

function checkCollision() {
    const playerRect = player.getBoundingClientRect();

    return obstacles.some(item => {
        const obstacleRect =
            item.element.getBoundingClientRect();

        return (
            playerRect.left < obstacleRect.right &&
            playerRect.right > obstacleRect.left &&
            playerRect.top < obstacleRect.bottom &&
            playerRect.bottom > obstacleRect.top
        );
    });
}

function endGame() {
    gameOver = true;
    moveDirection = 0;

    updateBestScore();

    gameOverScreen.hidden = false;
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;

        localStorage.setItem(
            "boxEscapeBestScore",
            bestScore
        );

        updateBestScoreDisplay();
    }
}

function updateBestScoreDisplay() {
    bestScoreDisplay.innerHTML =
        `<strong>Best Score</strong>: ${bestScore}`;
}

function updateBackground() {
    const colorIndex =
        Math.floor(score / 5) % backgroundColors.length;

    gameContainer.style.backgroundColor =
        backgroundColors[colorIndex];
}

function updatePlayerPosition() {
    player.style.left = playerX + "px";
    player.style.transform = "none";
}

function updateObstacles() {
    obstacles.forEach(item => {
        item.element.style.left = item.x + "px";
        item.element.style.top = item.y + "px";
    });
}

resetGame();
requestAnimationFrame(gameLoop);