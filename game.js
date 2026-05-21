window.onload = () => {

// ---------- CANVAS ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ---------- GAME STATE ----------
let started = false;
let gameOver = false;

let score = 0;
let frame = 0;

// ---------- BIRD ----------
let bird = {
    x: 80,
    y: 200,
    v: 0,
    g: 0.5,
    jump: -8,
    r: 18
};

// ---------- PIPES ----------
let pipes = [];

// ---------- INPUT (100% MOBILE SAFE) ----------
function flap() {
    if (gameOver) return;

    if (!started) {
        started = true;
        document.getElementById("startText").style.display = "none";
        loop();
    }

    bird.v = bird.jump;
}

// ONLY ONE INPUT SYSTEM
document.addEventListener("pointerdown", flap);
document.addEventListener("keydown", e => {
    if (e.code === "Space") flap();
});

// ---------- PIPE ----------
function addPipe() {
    let gap = 170;
    let top = Math.random() * (canvas.height / 2) + 50;

    pipes.push({
        x: canvas.width,
        top: top,
        bottom: top + gap,
        w: 60,
        passed: false
    });
}

// ---------- UPDATE ----------
function update() {
    frame++;

    bird.v += bird.g;
    bird.y += bird.v;

    if (frame % 110 === 0) addPipe();

    pipes.forEach(p => {
        p.x -= 2.5;

        if (!p.passed && p.x + p.w < bird.x) {
            score++;
            p.passed = true;
        }

        // collision
        if (
            bird.x + bird.r > p.x &&
            bird.x - bird.r < p.x + p.w &&
            (bird.y - bird.r < p.top || bird.y + bird.r > p.bottom)
        ) {
            end();
        }
    });

    pipes = pipes.filter(p => p.x + p.w > 0);

    if (bird.y > canvas.height || bird.y < 0) {
        end();
    }
}

// ---------- DRAW ----------
function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // pipes
    ctx.fillStyle = "#2ecc71";
    pipes.forEach(p => {
        ctx.fillRect(p.x, 0, p.w, p.top);
        ctx.fillRect(p.x, p.bottom, p.w, canvas.height);
    });

    // bird
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
    ctx.fill();

    document.getElementById("scoreText").innerText = score;
}

// ---------- GAME LOOP ----------
function loop() {
    if (!started || gameOver) return;

    update();
    draw();

    requestAnimationFrame(loop);
}

// ---------- END GAME ----------
function end() {
    if (gameOver) return;

    gameOver = true;

    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = score;
}

// ---------- RESTART ----------
window.restartGame = function () {
    bird.y = 200;
    bird.v = 0;

    pipes = [];
    score = 0;
    frame = 0;

    started = false;
    gameOver = false;

    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("startText").style.display = "block";

    draw();
};

draw(); // initial frame
};