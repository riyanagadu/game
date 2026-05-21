const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 500;

// Game state
let gameRunning = true;

// Bird
let bird = {
    x: 80,
    y: 150,
    width: 20,
    height: 20,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    rotation: 0
};

// Pipes
let pipes = [];
let frame = 0;
let score = 0;

// Controls
document.addEventListener("keydown", () => {
    if (gameRunning) {
        bird.velocity = bird.jump;
    }
});

canvas.addEventListener("click", () => {
    if (gameRunning) {
        bird.velocity = bird.jump;
    }
});

// Pipe generator
function createPipe() {
    let gap = 130;
    let topHeight = Math.random() * 250 + 50;

    pipes.push({
        x: 400,
        top: topHeight,
        bottom: topHeight + gap,
        width: 50,
        passed: false
    });
}

// Draw bird (with rotation)
function drawBird() {
    ctx.save();

    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    ctx.fillStyle = "yellow";
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);

    ctx.restore();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = "green";

    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height);
    });
}

// Update game logic
function update() {
    frame++;

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Bird rotation effect
    bird.rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 1.2);

    // Create pipes
    if (frame % 90 === 0) {
        createPipe();
    }

    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= 2;

        // Score when passing pipe
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            score++;
            pipe.passed = true;
        }

        // Collision
        if (
            bird.x + bird.width / 2 > pipe.x &&
            bird.x - bird.width / 2 < pipe.x + pipe.width &&
            (bird.y - bird.height / 2 < pipe.top ||
             bird.y + bird.height / 2 > pipe.bottom)
        ) {
            endGame();
        }
    });

    // Ground / ceiling
    if (bird.y > canvas.height || bird.y < 0) {
        endGame();
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

// Game loop
function loop() {
    if (gameRunning) {
        update();
        draw();
        requestAnimationFrame(loop);
    }
}

// Game over
function endGame() {
    gameRunning = false;

    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = "Score: " + score;
}

// Restart game
function restartGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
    gameRunning = true;

    document.getElementById("gameOverScreen").style.display = "none";

    loop();
}

// Start game
loop();