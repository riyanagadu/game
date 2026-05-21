const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------- SAFE RESIZE ----------
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function updatePhysicsScale() {
    bird.gravity = window.innerHeight * 0.0009;
    bird.jump = -window.innerHeight * 0.018;
}

window.addEventListener("resize", () => {
    resize();
    updatePhysicsScale();
});

updatePhysicsScale();

// ---------- GAME STATE ----------
let state = "start"; // start | play | over

let score = 0;
let frame = 0;

// ---------- BIRD ----------
let bird = {
    x: 80,
    y: 200,
    v: 0,

    // 🔥 scale physics to screen height
    gravity: window.innerHeight * 0.0009,
    jump: -window.innerHeight * 0.018,

    r: 18
};

// ---------- PIPES ----------
let pipes = [];

// ---------- INPUT (ONLY ONE SYSTEM) ----------
function flap() {
    if (state === "start") {
        state = "play";
        loop();
    }

    if (state === "play") {
        bird.v = bird.jump;
    }
}

// BEST MOBILE INPUT (NO BUGS)
document.addEventListener("pointerdown", flap);
document.addEventListener("keydown", e => {
    if (e.code === "Space") flap();
});

// ---------- PIPE ----------
function spawnPipe() {
    let gap = 170;
    let top = Math.random() * (canvas.height / 2) + 60;

    pipes.push({
        x: canvas.width,
        top,
        bottom: top + gap,
        w: 60,
        passed: false
    });
}

// ---------- RESET ----------
function resetGame() {
    bird.y = 200;
    bird.v = 0;
    pipes = [];
    score = 0;
    frame = 0;
    state = "start";
}

// ---------- UPDATE ----------
function update() {
    frame++;

    bird.v += bird.g;
    bird.y += bird.v;

    if (frame % 100 === 0) spawnPipe();

    pipes.forEach(p => {
        p.x -= 2.5;

        if (!p.passed && p.x + p.w < bird.x) {
            score++;
            p.passed = true;
        }

        if (
            bird.x + bird.r > p.x &&
            bird.x - bird.r < p.x + p.w &&
            (bird.y - bird.r < p.top || bird.y + bird.r > p.bottom)
        ) {
            state = "over";
        }
    });

    pipes = pipes.filter(p => p.x + p.w > 0);

    if (bird.y > canvas.height || bird.y < 0) {
        state = "over";
    }

    bird.v += bird.g;

// 🔥 LIMIT FALL SPEED (VERY IMPORTANT)
if (bird.v > 10) bird.v = 10;

bird.y += bird.v;
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

    // score
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(score, canvas.width / 2, 50);

    // start screen
    if (state === "start") {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Tap or Press Space to Start", canvas.width / 2 - 120, canvas.height / 2);
    }

    // game over screen
    if (state === "over") {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
        ctx.fillText("Score: " + score, canvas.width / 2 - 60, canvas.height / 2 + 40);
        ctx.fillText("Tap to Restart", canvas.width / 2 - 90, canvas.height / 2 + 80);
    }
}

// ---------- LOOP ----------
function loop() {
    if (state !== "play") {
        draw();
        requestAnimationFrame(loop);
        return;
    }

    update();
    draw();

    requestAnimationFrame(loop);
}

// ---------- RESTART ON TAP ----------
document.addEventListener("pointerdown", () => {
    if (state === "over") {
        resetGame();
        state = "play";
    }
});

// ---------- START ----------
loop();