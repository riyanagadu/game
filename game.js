const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------- MOBILE + RESPONSIVE SETUP ----------
function resizeGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeGame);
resizeGame();

// ---------- GAME STATE ----------
let gameStarted = false;
let gameOver = false;

let score = 0;
let frame = 0;

// ---------- SOUND (no files needed) ----------
function sound(freq, duration) {
    try {
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.frequency.value = freq;
        osc.type = "square";

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function flapSound() { sound(300, 0.1); }
function scoreSound() { sound(600, 0.12); }
function hitSound() { sound(120, 0.2); }

// ---------- BIRD ----------
let bird = {
    x: 100,
    y: 200,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    size: 20,
    rotation: 0
};

// ---------- PIPES ----------
let pipes = [];

function createPipe() {
    let gap = 160;
    let top = Math.random() * (canvas.height / 2) + 50;

    pipes.push({
        x: canvas.width,
        top: top,
        bottom: top + gap,
        width: 70,
        passed: false
    });
}

// ---------- INPUT ----------
function jump() {
    if (!gameStarted) {
        gameStarted = true;
        loop();
    }

    if (!gameOver) {
        bird.velocity = bird.jump;
        flapSound();
    }
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
});

document.addEventListener("touchstart", (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

canvas.addEventListener("click", jump);

// ---------- GAME OVER ----------
function endGame() {
    if (gameOver) return;

    gameOver = true;
    hitSound();

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

    gameOver = false;
    gameStarted = false;

    document.getElementById("gameOverScreen").style.display = "none";

    drawStartScreen();
}

// ---------- DRAW BIRD ----------
function drawBird() {
    ctx.save();

    ctx.translate(bird.x, bird.y);

    bird.rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 1.2);
    ctx.rotate(bird.rotation);

    // body
    ctx.fillStyle = "#FFD84D";
    ctx.beginPath();
    ctx.arc(0, 0, bird.size, 0, Math.PI * 2);
    ctx.fill();

    // wing animation
    let wing = Math.sin(frame * 0.2) * 5;
    ctx.fillStyle = "#FFB300";
    ctx.beginPath();
    ctx.arc(-5, wing, 10, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(6, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(7, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ---------- DRAW PIPES ----------
function drawPipes() {
    pipes.forEach(p => {
        // top pipe
        let gradient = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
        gradient.addColorStop(0, "#2ecc71");
        gradient.addColorStop(1, "#27ae60");

        ctx.fillStyle = gradient;
        ctx.fillRect(p.x, 0, p.width, p.top);

        // bottom pipe
        ctx.fillRect(p.x, p.bottom, p.width, canvas.height);
    });
}

// ---------- BACKGROUND ----------
function drawBackground() {
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#70c5ce");
    gradient.addColorStop(1, "#cfefff");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ---------- UPDATE ----------
function update() {
    frame++;

    // physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // pipes spawn
    if (frame % 100 === 0) createPipe();

    pipes.forEach(p => {
        p.x -= 3;

        // score
        if (!p.passed && p.x < bird.x) {
            score++;
            p.passed = true;
            scoreSound();
        }

        // collision
        if (
            bird.x + bird.size > p.x &&
            bird.x - bird.size < p.x + p.width &&
            (bird.y - bird.size < p.top || bird.y + bird.size > p.bottom)
        ) {
            endGame();
        }
    });

    // remove off-screen pipes
    pipes = pipes.filter(p => p.x + p.width > 0);

    // ground / ceiling
    if (bird.y > canvas.height || bird.y < 0) {
        endGame();
    }
}

// ---------- DRAW ----------
function draw() {
    drawBackground();
    drawPipes();
    drawBird();

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(score, canvas.width / 2, 80);
}

// ---------- LOOP ----------
function loop() {
    if (gameOver) return;

    update();
    draw();

    requestAnimationFrame(loop);
}

// ---------- START SCREEN ----------
function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Click or Press Space", canvas.width / 2, canvas.height / 2);
}

// show start screen initially
drawStartScreen();