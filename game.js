const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// GAME STATE
let gameRunning = true;
let frame = 0;
let score = 0;

// BIRD (now looks like a bird using shapes)
let bird = {
    x: 80,
    y: 200,
    velocity: 0,
    gravity: 0.5,
    jump: -8
};

// PIPES
let pipes = [];

// CLOUDS (background animation)
let clouds = [
    { x: 50, y: 80 },
    { x: 200, y: 120 },
    { x: 350, y: 60 }
];

// CONTROLS
document.addEventListener("keydown", jump);
canvas.addEventListener("click", jump);

function jump() {
    if (gameRunning) bird.velocity = bird.jump;
}

// PIPE CREATION
function createPipe() {
    let gap = 140;
    let topHeight = Math.random() * 250 + 50;

    pipes.push({
        x: 400,
        top: topHeight,
        bottom: topHeight + gap,
        width: 60,
        passed: false
    });
}

// DRAW CLOUDS (background animation)
function drawClouds() {
    ctx.fillStyle = "rgba(255,255,255,0.8)";

    clouds.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
        ctx.arc(c.x + 20, c.y + 10, 25, 0, Math.PI * 2);
        ctx.arc(c.x - 20, c.y + 10, 25, 0, Math.PI * 2);
        ctx.fill();

        c.x -= 0.5;

        if (c.x < -50) {
            c.x = 450;
        }
    });
}

// DRAW BIRD (now looks like Flappy Bird style shape)
function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);

    // tilt effect
    let angle = Math.min(Math.max(bird.velocity * 0.1, -0.5), 1.2);
    ctx.rotate(angle);

    // body
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // wing
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(-5, 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(5, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(6, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// DRAW PIPES (better visual style)
function drawPipes() {
    pipes.forEach(pipe => {
        // top pipe
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);

        // bottom pipe
        ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height);
    });
}

// UPDATE GAME LOGIC
function update() {
    frame++;

    // physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // pipes spawn
    if (frame % 90 === 0) createPipe();

    pipes.forEach(pipe => {
        pipe.x -= 2;

        // score
        if (!pipe.passed && pipe.x < bird.x) {
            score++;
            pipe.passed = true;
        }

        // collision
        if (
            bird.x > pipe.x &&
            bird.x < pipe.x + pipe.width &&
            (bird.y < pipe.top || bird.y > pipe.bottom)
        ) {
            endGame();
        }
    });

    // boundaries
    if (bird.y > canvas.height || bird.y < 0) {
        endGame();
    }
}

// DRAW EVERYTHING
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawClouds();
    drawPipes();
    drawBird();

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

// GAME LOOP
function loop() {
    if (gameRunning) {
        update();
        draw();
        requestAnimationFrame(loop);
    }
}

// GAME OVER
function endGame() {
    gameRunning = false;

    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = "Score: " + score;
}

// RESTART
function restartGame() {
    bird.y = 200;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
    gameRunning = true;

    document.getElementById("gameOverScreen").style.display = "none";

    loop();
}

// START GAME
loop();