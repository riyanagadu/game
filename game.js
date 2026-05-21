const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// GAME STATE
let gameStarted = false;
let gameOver = false;

// SCORE
let score = 0;

// SOUND ENGINE (no files needed)
function playFlap() {
    let ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    let osc = ctxAudio.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(300, ctxAudio.currentTime);
    osc.connect(ctxAudio.destination);
    osc.start();
    osc.stop(ctxAudio.currentTime + 0.1);
}

function playScore() {
    let ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    let osc = ctxAudio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctxAudio.currentTime);
    osc.connect(ctxAudio.destination);
    osc.start();
    osc.stop(ctxAudio.currentTime + 0.15);
}

// BIRD (animated)
let bird = {
    x: 80,
    y: 200,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    frame: 0
};

// PIPES
let pipes = [];
let frame = 0;

// GROUND
let groundX = 0;

// INPUT
document.addEventListener("keydown", startOrJump);
canvas.addEventListener("click", startOrJump);

function startOrJump() {
    if (!gameStarted) {
        gameStarted = true;
        document.getElementById("startText").style.display = "none";
        loop();
    }

    if (!gameOver) {
        bird.velocity = bird.jump;
        playFlap();
    }
}

// PIPE GENERATION
function createPipe() {
    let gap = 140;
    let top = Math.random() * 250 + 50;

    pipes.push({
        x: 400,
        top: top,
        bottom: top + gap,
        passed: false
    });
}

// DRAW BIRD (sprite animation illusion)
function drawBird() {
    bird.frame += 0.2;

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.velocity * 0.1);

    // body
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // wing animation
    let wingOffset = Math.sin(bird.frame) * 5;

    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(-5, wingOffset, 8, 0, Math.PI * 2);
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

// DRAW PIPES (Flappy Bird style)
function drawPipes() {
    pipes.forEach(p => {
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(p.x, 0, 60, p.top);
        ctx.fillRect(p.x, p.bottom, 60, canvas.height);
    });
}

// DRAW GROUND (scrolling)
function drawGround() {
    groundX -= 2;
    if (groundX <= -40) groundX = 0;

    ctx.fillStyle = "#d9a066";
    ctx.fillRect(groundX, 550, 400, 50);
    ctx.fillRect(groundX + 400, 550, 400, 50);
}

// UPDATE GAME
function update() {
    frame++;

    // gravity
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // pipes spawn
    if (frame % 90 === 0) createPipe();

    pipes.forEach(p => {
        p.x -= 2;

        // score
        if (!p.passed && p.x < bird.x) {
            score++;
            p.passed = true;
            playScore();
        }

        // collision
        if (
            bird.x > p.x &&
            bird.x < p.x + 60 &&
            (bird.y < p.top || bird.y > p.bottom)
        ) {
            endGame();
        }
    });

    // bounds
    if (bird.y > 550 || bird.y < 0) {
        endGame();
    }
}

// DRAW
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPipes();
    drawGround();
    drawBird();

    document.getElementById("scoreText").innerText = score;
}

// LOOP
function loop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(loop);
    }
}

// GAME OVER
function endGame() {
    gameOver = true;

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
    gameOver = false;
    gameStarted = false;

    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("startText").style.display = "block";
}