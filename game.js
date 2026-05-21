const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// FIXED RESPONSIVE CANVAS
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

let gameStarted = false;
let gameOver = false;

let score = 0;
let frame = 0;

let bird = {
    x: 100,
    y: 200,
    velocity: 0,
    gravity: 0.45,
    jump: -7,
    size: 18
};

let pipes = [];

function createPipe() {
    let gap = 180; // easier
    let top = Math.random() * 200 + 100;

    pipes.push({
        x: canvas.width,
        top: top,
        bottom: top + gap,
        width: 60,
        passed: false
    });
}

function jump() {
    if (gameOver) return;

    if (!gameStarted) {
        gameStarted = true;
        hideStartText(); // ✅ FIXED
        loop();
    }

    bird.velocity = bird.jump;
}


document.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
});

document.addEventListener("touchstart", () => {
    jump();
});

canvas.addEventListener("click", jump);

function endGame() {
    if (gameOver) return;

    gameOver = true;

    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = "Score: " + score;
}

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

function update() {
    frame++;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (frame % 110 === 0) {
        createPipe();
    }

    pipes.forEach(pipe => {
        pipe.x -= 2.5;

        // FIXED SCORE LOGIC
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            score++;
            pipe.passed = true;
        }

        // COLLISION
        if (
            bird.x + bird.size > pipe.x &&
            bird.x - bird.size < pipe.x + pipe.width &&
            (bird.y - bird.size < pipe.top ||
             bird.y + bird.size > pipe.bottom)
        ) {
            endGame();
        }
    });

    // REMOVE OLD PIPES
    pipes = pipes.filter(p => p.x + p.width > 0);

    // BOUNDS
    if (bird.y > canvas.height || bird.y < 0) {
        endGame();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // pipes
    ctx.fillStyle = "#2ecc71";
    pipes.forEach(p => {
        ctx.fillRect(p.x, 0, p.width, p.top);
        ctx.fillRect(p.x, p.bottom, p.width, canvas.height);
    });

    // bird
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.size, 0, Math.PI * 2);
    ctx.fill();

    // score (FIXED POSITION)
    document.getElementById("scoreText").innerText = score;
}

function loop() {
    if (gameOver) return;

    update();
    draw();

    requestAnimationFrame(loop);
}

ctx.font = "20px Arial";
ctx.fillStyle = "white";
ctx.fillText("Tap or Press Space to Start", canvas.width / 2 - 120, canvas.height / 2);

