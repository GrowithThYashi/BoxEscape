// Box Escape
// Added fourth obstacle.
// Best Score updates only after Game Over.
// Target progression: 30 → 50 → 70 → 90 → ...

const gameContainer = document.getElementById("game-container");

const player = document.getElementById("player");

const obstacle = document.getElementById("obstacle");
const obstacleTwo = document.getElementById("obstacle-two");
const obstacleThree = document.getElementById("obstacle-three");
const obstacleFour = document.getElementById("obstacle-four");

const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

const scoreDisplay = document.getElementById("score");
const bestScoreDisplay = document.getElementById("best-score");

const overlay = document.getElementById("overlay");
const popup = document.getElementById("popup");

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");

const gameOverScreen =
    document.getElementById("game-over-screen");

const restartBtn =
    document.getElementById("restart-btn");

const finalScoreDisplay =
    document.getElementById("final-score");

const countdown =
    document.getElementById("countdown");

const winScreen =
    document.getElementById("win-screen");

const winScoreDisplay =
    document.getElementById("win-score");

const winRestartBtn =
    document.getElementById("win-restart-btn");

const winTitle =
    document.getElementById("win-title");

const playerOptions =
    document.querySelectorAll(".player-option");

const playerScreen =
    document.getElementById("player-screen");

const playerNextBtn =
    document.getElementById("player-next-btn");

const challengeBtn =
    document.getElementById("challenge-btn");

const challengeModal =
    document.getElementById("challenge-modal");



/* -----------------------------
   CHALLENGE SCREEN
----------------------------- */

challengeBtn.addEventListener("click", function () {

    challengeModal.style.display = "none";

    document
        .querySelector("#start-screen > p")
        .style.display = "block";

    document
        .getElementById("player-choice")
        .style.display = "flex";

});



/* -----------------------------
   GAME SETTINGS
----------------------------- */

const MOVE_SPEED = 220;

const BASE_OBSTACLE_SPEED = 180;


/*
    First target = 30

    Every time the player wins:
    30 → 50 → 70 → 90 → 110...
*/

let TARGET_SCORE = 30;

let winCount = 0;



const backgroundColors = [

    "#ffffff",

    "#ffd6e0",

    "#d6ecff",

    "#e6ddff",

    "#dcf8dc"

];



const obstacleShapes = [

    "obstacle-diamond",

    "obstacle-rectangle",

    "obstacle-pentagon",

    "obstacle-circle",

    "obstacle-star",

    "obstacle-heart",

    "obstacle-raindrop"

];



const obstacleColors = [

    "obstacle-red",

    "obstacle-purple",

    "obstacle-dark-blue",

    "obstacle-green",

    "obstacle-pink",

    "obstacle-violet",

    "obstacle-sky-blue"

];



/* -----------------------------
   GAME STATE
----------------------------- */

let obstacleSpeed =
    BASE_OBSTACLE_SPEED;

let playerX;

let obstacles = [];

let score = 0;

let bestScore =
    Number(
        localStorage.getItem(
            "boxEscapeBestScore"
        )
    ) || 0;

let moveDirection = 0;

let gameStarted = false;

let countdownActive = false;

let gameOver = false;

let gameWon = false;

let lastTime =
    performance.now();



updateBestScoreDisplay();



/* -----------------------------
   POPUP
----------------------------- */

function showPopup(type){

    overlay.style.display = "block";

    popup.classList.remove("hidden");

    startScreen.hidden =
        type !== "start";

    gameOverScreen.hidden =
        type !== "gameover";

    winScreen.hidden =
        type !== "win";

}



function hidePopup(){

    overlay.style.display = "none";

    popup.classList.add("hidden");

}



/* -----------------------------
   RESET GAME
----------------------------- */

function resetGame(){

    playerX =
        (gameContainer.clientWidth -
        player.offsetWidth) / 2;


    score = 0;


    obstacleSpeed =
        BASE_OBSTACLE_SPEED;


    updateScore();

    updateBackground();


    obstacles =
        createObstacleSet();


    moveDirection = 0;

    gameStarted = false;

    gameOver = false;

    gameWon = false;


    hidePopup();


    updatePlayerPosition();

    updateObstacles();

}



/* -----------------------------
   COUNTDOWN
----------------------------- */

async function startCountdown(){

    countdownActive = true;


    const steps = [

        {
            text: "3",
            time: 650
        },

        {
            text: "2",
            time: 650
        },

        {
            text: "1",
            time: 650
        },

        {
            text: "GO!",
            time: 500
        }

    ];


    countdown.hidden = false;


    for(const step of steps){

        countdown.classList.remove(
            "animate"
        );


        void countdown.offsetWidth;


        countdown.textContent =
            step.text;


        countdown.classList.add(
            "animate"
        );


        await new Promise(resolve =>
            setTimeout(
                resolve,
                step.time
            )
        );

    }


    countdown.hidden = true;

    countdownActive = false;

    gameStarted = true;

}



/* -----------------------------
   START GAME
----------------------------- */

function startGame(){

    resetGame();

    startCountdown();

}



startBtn.addEventListener(
    "click",
    startGame
);



/* -----------------------------
   GAME OVER RESTART
----------------------------- */

restartBtn.addEventListener(
    "click",
    () => {

        resetGame();

        startCountdown();

    }
);



/* -----------------------------
   PLAYER SELECTION
----------------------------- */

let selectedPlayer = "🐱";



playerOptions.forEach(option => {

    option.addEventListener(
        "click",
        () => {

            selectedPlayer =
                option.dataset.player;


            playerOptions.forEach(btn =>
                btn.classList.remove(
                    "selected"
                )
            );


            option.classList.add(
                "selected"
            );


            document
                .getElementById(
                    "start-content-hidden"
                )
                .classList.add("show");

        }
    );

});



/* -----------------------------
   CONTROLS
----------------------------- */

leftBtn.addEventListener(
    "mousedown",
    () => startMoving(-1)
);


rightBtn.addEventListener(
    "mousedown",
    () => startMoving(1)
);



leftBtn.addEventListener(
    "touchstart",
    e => {

        e.preventDefault();

        startMoving(-1);

    },
    {
        passive: false
    }
);



rightBtn.addEventListener(
    "touchstart",
    e => {

        e.preventDefault();

        startMoving(1);

    },
    {
        passive: false
    }
);



leftBtn.addEventListener(
    "mouseup",
    stopMoving
);


rightBtn.addEventListener(
    "mouseup",
    stopMoving
);



leftBtn.addEventListener(
    "touchend",
    stopMoving
);


rightBtn.addEventListener(
    "touchend",
    stopMoving
);



document.addEventListener(
    "mouseup",
    stopMoving
);


document.addEventListener(
    "touchend",
    stopMoving
);



function startMoving(direction){

    if(
        !gameStarted ||
        gameOver ||
        countdownActive
    ){

        return;

    }


    moveDirection =
        direction;

}



function stopMoving(){

    moveDirection = 0;

}



/* -----------------------------
   CREATE OBSTACLES
   SAFE VERSION
----------------------------- */

function createObstacleSet(){

    const positions = [];


    const maxX =
        gameContainer.clientWidth -
        obstacle.offsetWidth;


    const possiblePositions = [];


    for(
        let x = 0;
        x <= maxX;
        x += 10
    ){

        possiblePositions.push(x);

    }



    /*
        Shuffle positions.
        This gives us random obstacles
        without an infinite while loop.
    */

    for(
        let i =
            possiblePositions.length - 1;

        i > 0;

        i--
    ){

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            possiblePositions[i],
            possiblePositions[j]
        ] =
        [
            possiblePositions[j],
            possiblePositions[i]
        ];

    }



    /*
        Choose positions with enough
        space between obstacles.
    */

    for(
        const x of possiblePositions
    ){

        if(
            !positions.some(
                pos =>
                    Math.abs(pos - x) < 30
            )
        ){

            positions.push(x);

        }


        if(
            positions.length === 4
        ){

            break;

        }

    }



    /*
        Safety fallback.
    */

    if(
        positions.length < 4
    ){

        while(
            positions.length < 4
        ){

            positions.push(

                Math.max(

                    0,

                    Math.min(

                        maxX,

                        (
                            positions.length *
                            maxX
                        ) / 3

                    )

                )

            );

        }

    }



    const items = [

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
        },

        {
            element: obstacleFour,
            x: positions[3],
            y: -410
        }

    ];



    items.forEach(
        applyObstacleAppearance
    );


    return items;

}



/* -----------------------------
   RANDOM X
----------------------------- */

function randomObstacleX(){

    return Math.random() *
        (
            gameContainer.clientWidth -
            obstacle.offsetWidth
        );

}



/* -----------------------------
   RECYCLE OBSTACLE
   SAFE VERSION
----------------------------- */

function recycleObstacle(
    item,
    others
){

    const possiblePositions = [];


    const maxX =
        gameContainer.clientWidth -
        obstacle.offsetWidth;



    for(
        let x = 0;
        x <= maxX;
        x += 10
    ){

        if(

            !others.some(
                other =>
                    Math.abs(
                        x - other.x
                    ) < 60
            )

        ){

            possiblePositions.push(x);

        }

    }



    if(
        possiblePositions.length > 0
    ){

        item.x =
            possiblePositions[
                Math.floor(
                    Math.random() *
                    possiblePositions.length
                )
            ];

    }

    else{

        item.x =
            Math.max(
                0,
                Math.min(
                    maxX,
                    maxX / 2
                )
            );

    }



    item.y =
        -40 -
        Math.random() * 200;



    applyObstacleAppearance(item);

}



/* -----------------------------
   OBSTACLE APPEARANCE
----------------------------- */

function applyObstacleAppearance(
    item
){

    const element =
        item.element;



    element.classList.remove(

        "obstacle-square",

        "obstacle-diamond",

        "obstacle-rectangle",

        "obstacle-pentagon",

        "obstacle-circle",

        "obstacle-star",

        "obstacle-heart",

        "obstacle-raindrop",

        "obstacle-red",

        "obstacle-purple",

        "obstacle-dark-blue",

        "obstacle-green",

        "obstacle-pink",

        "obstacle-violet",

        "obstacle-sky-blue"

    );



    const shape =
        obstacleShapes[
            Math.floor(
                Math.random() *
                obstacleShapes.length
            )
        ];



    const color =
        obstacleColors[
            Math.floor(
                Math.random() *
                obstacleColors.length
            )
        ];



    element.style.background = "";

    element.style.height = "";



    element.classList.add(
        shape
    );


    element.classList.add(
        color
    );

}



/* -----------------------------
   MAIN GAME LOOP
----------------------------- */

function gameLoop(
    currentTime
){

    const deltaTime =
        (
            currentTime -
            lastTime
        ) / 1000;


    lastTime =
        currentTime;



    if(
        gameStarted &&
        !gameOver &&
        !gameWon
    ){


        /* PLAYER */

        if(
            moveDirection !== 0
        ){

            playerX +=
                moveDirection *
                MOVE_SPEED *
                deltaTime;


            const maxX =
                gameContainer.clientWidth -
                player.offsetWidth;


            playerX =
                Math.max(
                    0,
                    Math.min(
                        playerX,
                        maxX
                    )
                );


            updatePlayerPosition();

        }



        /* OBSTACLES */

        obstacles.forEach(
            item => {

                item.y +=
                    obstacleSpeed *
                    deltaTime;



                if(
                    item.y >
                    gameContainer.clientHeight
                ){

                    score++;


                    updateScore();

                    updateBackground();



                    /*
                        PLAYER WON
                    */

                    if(
                        score >=
                        TARGET_SCORE
                    ){

                        winGame();

                        return;

                    }



                    /*
                        SPEED UP
                        EVERY 5 POINTS
                    */

                    if(
                        score % 5 === 0
                    ){

                        obstacleSpeed += 15;

                    }



                    const others =
                        obstacles.filter(
                            other =>
                                other !== item
                        );



                    recycleObstacle(
                        item,
                        others
                    );

                }

            }
        );



        updateObstacles();



        /* COLLISION */

        if(
            checkCollision()
        ){

            endGame();

        }

    }



    requestAnimationFrame(
        gameLoop
    );

}



/* -----------------------------
   WIN GAME
----------------------------- */

function winGame(){

    gameWon = true;

    gameStarted = false;

    moveDirection = 0;


    winCount++;



    /*
        First win:
        WOOHOO! YOU WON!!

        Every win after that:
        WOOHOO! YOU WON AGAIN!!
    */

    if(
        winCount === 1
    ){

        winTitle.textContent =
            "WOOHOO! YOU WON!!";

    }

    else{

        winTitle.textContent =
            "WOOHOO! YOU WON AGAIN!!";

    }



    winScoreDisplay.textContent =
        `Target reached! Score: ${score}`;



    showPopup("win");

}



/* -----------------------------
   NEXT TARGET
----------------------------- */

winRestartBtn.addEventListener(
    "click",
    () => {

        /*
            Increase target by 20.

            30 → 50
            50 → 70
            70 → 90
            90 → 110
        */

        TARGET_SCORE += 20;


        resetGame();


        startCountdown();

    }
);



/* -----------------------------
   COLLISION
----------------------------- */

function checkCollision(){

    const playerRect =
        player.getBoundingClientRect();



    return obstacles.some(
        item => {

            const obstacleRect =
                item.element
                    .getBoundingClientRect();



            return (

                playerRect.left <
                obstacleRect.right &&

                playerRect.right >
                obstacleRect.left &&

                playerRect.top <
                obstacleRect.bottom &&

                playerRect.bottom >
                obstacleRect.top

            );

        }
    );

}



/* -----------------------------
   GAME OVER
----------------------------- */

function endGame(){

    gameOver = true;

    moveDirection = 0;


    updateBestScore();



    finalScoreDisplay.textContent =
        `Final Score: ${score}`;



    showPopup("gameover");

}



/* -----------------------------
   SCORE
----------------------------- */

function updateScore(){

    scoreDisplay.textContent =
        `Score: ${score}`;

}



/* -----------------------------
   BEST SCORE
----------------------------- */

function updateBestScore(){

    if(
        score > bestScore
    ){

        bestScore =
            score;


        localStorage.setItem(
            "boxEscapeBestScore",
            bestScore
        );


        updateBestScoreDisplay();

    }

}



function updateBestScoreDisplay(){

    bestScoreDisplay.innerHTML =
        `<strong>Target Score</strong>: ${TARGET_SCORE}`;

}



/* -----------------------------
   BACKGROUND
----------------------------- */

function updateBackground(){

    const colorIndex =
        Math.floor(
            score / 5
        )
        %
        backgroundColors.length;



    gameContainer.style.backgroundColor =
        backgroundColors[
            colorIndex
        ];

}



/* -----------------------------
   PLAYER POSITION
----------------------------- */

function updatePlayerPosition(){

    player.style.left =
        playerX + "px";


    player.textContent =
        selectedPlayer;


    player.style.transform =
        "none";

}



/* -----------------------------
   OBSTACLE POSITION
----------------------------- */

function updateObstacles(){

    obstacles.forEach(
        item => {

            item.element.style.left =
                item.x + "px";


            item.element.style.top =
                item.y + "px";

        }
    );

}



/* -----------------------------
   INITIAL STATE
----------------------------- */

resetGame();

showPopup("start");

requestAnimationFrame(
    gameLoop
);