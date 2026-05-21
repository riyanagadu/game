const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------- RESPONSIVE CANVAS ----------
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
resize();

// ---------- GAME STATE ----------
let gameStarted = false;
let gameOver = false;

let score = 0;
let frame = 0;

// ---------- BIRD ----------
let bird = {
    x: 100,
    y: 200,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    size: 18
};

// ---------- PIPES ----------
let pipes = [];

// ---------- PIPE CREATION ----------
function createPipe() {
    let gap = 170; // easier start
    let top = Math.random() * (canvas.height / 2) + 50;

    pipes.push({
        x: canvas.width,
        top: top,
        bottom: top + gap,
        width: 60,
        passed: false
    });
}

// ---------- INPUT (FIXED FOR MOBILE + DESKTOP) ----------
function jump() {
    if (gameOver) return;

    if (!gameStarted) {
        gameStarted = true;
        document.getElementById("startText").classList.add("hidden");
    }

    bird.velocity = bird.jump;
}

// ONE INPUT SYSTEM (NO BUGS)
document.addEventListener("pointerdown", jump);

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
});

// ---------- GAME OVER ----------
function endGame() {
    if (gameOver) return;

    gameOver = true;

    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = "Score: " + score;
}

// ---------- RESTART ----------
function restartGame() {
    bird.y = 200;
    bird.velocity = 0;

    pipes = [];
    score = 0;
    frame = 0;

    gameStarted = false;
    gameOver = false;

    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("startText").classList.remove("hidden");
}

// ---------- UPDATE ----------
function update() {
    frame++;

    // bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // pipes spawn
    if (frame % 100 === 0) {
        createPipe();
    }

    // move pipes
    pipes.forEach(pipe => {
        pipe.x -= 3;

        // score fix (only once)
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            score++;
            pipe.passed = true;
        }

        // collision
        if (
            bird.x + bird.size > pipe.x &&
            bird.x - bird.size < pipe.x + pipe.width &&
            (bird.y - bird.size < pipe.top ||
             bird.y + bird.size > pipe.bottom)
        ) {
            endGame();
        }
    });

    // remove old pipes
    pipes = pipes.filter(p => p.x + p.width > 0);

    // bounds
    if (bird.y > canvas.height || bird.y < 0) {
        endGame();
    }
}

// ---------- DRAW ----------
function draw() {
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

    // score UI
    document.getElementById("scoreText").innerText = score;
}

// ---------- MAIN LOOP (MOBILE SAFE) ----------
function loop() {
    requestAnimationFrame(loop);

    if (!gameStarted || gameOver) return;

    update();
    draw();
}

// ---------- START ----------
draw(); // show initial frame
loop();