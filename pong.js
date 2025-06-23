// Ocean Pong Game
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Bubble properties
const bubbles = Array.from({length: 40}, () => ({
  x: Math.random() * WIDTH,
  y: HEIGHT + Math.random() * HEIGHT,
  r: 5 + Math.random() * 15,
  speed: 0.5 + Math.random() * 1.5,
  opacity: 0.2 + Math.random() * 0.4
}));

// Light rays
function drawLightRays() {
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2 + Math.sin(i) * WIDTH, HEIGHT);
    ctx.lineTo(WIDTH / 2 + Math.sin(i + 0.5) * WIDTH, HEIGHT);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
  }
}

function drawBubbles() {
  for (const b of bubbles) {
    ctx.save();
    ctx.globalAlpha = b.opacity;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = '#b3e6ff';
    ctx.fill();
    ctx.restore();
    b.y -= b.speed;
    if (b.y + b.r < 0) {
      b.x = Math.random() * WIDTH;
      b.y = HEIGHT + b.r;
      b.r = 5 + Math.random() * 15;
      b.speed = 0.5 + Math.random() * 1.5;
      b.opacity = 0.2 + Math.random() * 0.4;
    }
  }
}

// Coral reef
function drawCoralReef() {
  ctx.save();
  ctx.globalAlpha = 0.95;
  for (let i = 0; i < WIDTH; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, HEIGHT);
    ctx.bezierCurveTo(i + 10, HEIGHT - 30, i + 30, HEIGHT - 30, i + 40, HEIGHT);
    ctx.lineTo(i + 40, HEIGHT);
    ctx.closePath();
    ctx.fillStyle = i % 80 === 0 ? '#ffb347' : '#ff6961';
    ctx.fill();
  }
  ctx.restore();
}

// Seaweed paddle
function drawSeaweed(x, y, isLeft, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  let wave = Math.sin(t / 30) * 8; // Slower animation (was t / 10)
  ctx.moveTo(0, 0);
  for (let i = 0; i < 120; i += 10) { // Make seaweed longer
    let dx = Math.sin(t / 30 + i / 15) * (isLeft ? -1 : 1) * (14 - i / 12); // More pronounced wave, longer
    ctx.lineTo(dx, -i);
  }
  ctx.lineWidth = 32; // Thicker seaweed (was 18)
  ctx.strokeStyle = '#228B22';
  ctx.shadowColor = '#145214';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();
}

// Pong game objects
const paddleHeight = 160; // Larger paddle (was 60)
const paddleWidth = 32;   // Larger paddle (was 18)
const ballRadius = 12;
let leftPaddleY = HEIGHT / 2 - paddleHeight / 2;
let rightPaddleY = HEIGHT / 2 - paddleHeight / 2;
let leftPaddleSpeed = 0;
let rightPaddleSpeed = 0;
let ballX = WIDTH / 2;
let ballY = HEIGHT / 2;
let ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
let leftScore = 0;
let rightScore = 0;
let aiEnabled = false;

// AI logic
function aiMove() {
  // Simple AI: move paddle center toward ball
  const paddleCenter = rightPaddleY + paddleHeight / 2;
  if (ballY < paddleCenter - 10) {
    rightPaddleSpeed = -5;
  } else if (ballY > paddleCenter + 10) {
    rightPaddleSpeed = 5;
  } else {
    rightPaddleSpeed = 0;
  }
}

function resetBall() {
  ballX = WIDTH / 2;
  ballY = HEIGHT / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function drawBall() {
  ctx.save();
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#b3e6ff';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.restore();
}

function drawScores() {
  ctx.save();
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(leftScore, WIDTH / 4, 60);
  ctx.fillText(rightScore, WIDTH * 3 / 4, 60);
  ctx.restore();
}

// Ball bounce effects
const bounceEffects = [];
function spawnBounceEffect(x, y) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 2;
    bounceEffects.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      r: 3 + Math.random() * 2
    });
  }
}
function updateBounceEffects() {
  for (const p of bounceEffects) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.alpha -= 0.04;
  }
  // Remove faded
  while (bounceEffects.length && bounceEffects[0].alpha <= 0) bounceEffects.shift();
}
function drawBounceEffects() {
  for (const p of bounceEffects) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = '#b3e6ff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

// Animated fish
const fishList = Array.from({length: 7}, () => ({
  x: Math.random() * WIDTH,
  y: 80 + Math.random() * (HEIGHT - 220),
  speed: 0.7 + Math.random() * 1.2,
  dir: Math.random() > 0.5 ? 1 : -1,
  color: `hsl(${180 + Math.random()*60},70%,60%)`,
  t: Math.random() * 1000
}));

function drawFish(t) {
  for (const f of fishList) {
    f.x += f.speed * f.dir;
    f.t += 0.1;
    if (f.dir === 1 && f.x > WIDTH + 40) {
      f.x = -40; f.y = 80 + Math.random() * (HEIGHT - 220);
    } else if (f.dir === -1 && f.x < -40) {
      f.x = WIDTH + 40; f.y = 80 + Math.random() * (HEIGHT - 220);
    }
    ctx.save();
    ctx.translate(f.x, f.y + Math.sin(f.t) * 4);
    ctx.scale(f.dir, 1);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = f.color;
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-28, -7);
    ctx.lineTo(-28, 7);
    ctx.closePath();
    ctx.fillStyle = '#fff8';
    ctx.fill();
    // Eye
    ctx.beginPath();
    ctx.arc(8, -2, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8.7, -2, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.restore();
  }
}

// Sound effects
const bounceSound = new Audio('https://cdn.jsdelivr.net/gh/terkelg/awesome-creative-coding-assets@main/audio/bubble-pop.ogg');
bounceSound.volume = 0.3;
const scoreSound = new Audio('https://cdn.jsdelivr.net/gh/terkelg/awesome-creative-coding-assets@main/audio/water-plop.ogg');
scoreSound.volume = 0.3;

function update() {
  // Move paddles
  leftPaddleY += leftPaddleSpeed;
  if (aiEnabled) {
    aiMove();
  }
  rightPaddleY += rightPaddleSpeed;
  // Clamp paddles so they stay within the game area
  leftPaddleY = Math.max(0, Math.min(HEIGHT - paddleHeight, leftPaddleY));
  rightPaddleY = Math.max(0, Math.min(HEIGHT - paddleHeight, rightPaddleY));

  // Move ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with top/bottom
  if (ballY - ballRadius < 0 || ballY + ballRadius > HEIGHT) {
    ballSpeedY *= -1;
    spawnBounceEffect(ballX, ballY < HEIGHT / 2 ? ballX : ballX, ballY < HEIGHT / 2 ? ballRadius : HEIGHT - ballRadius);
    bounceSound.currentTime = 0; bounceSound.play();
  }
  // Ball collision with paddles
  if (
    ballX - ballRadius < paddleWidth &&
    ballY > leftPaddleY &&
    ballY < leftPaddleY + paddleHeight
  ) {
    ballSpeedX *= -1.1;
    ballX = paddleWidth + ballRadius;
    spawnBounceEffect(ballX, ballY);
    bounceSound.currentTime = 0; bounceSound.play();
  }
  if (
    ballX + ballRadius > WIDTH - paddleWidth &&
    ballY > rightPaddleY &&
    ballY < rightPaddleY + paddleHeight
  ) {
    ballSpeedX *= -1.1;
    ballX = WIDTH - paddleWidth - ballRadius;
    spawnBounceEffect(ballX, ballY);
    bounceSound.currentTime = 0; bounceSound.play();
  }
  // Score
  if (ballX < 0) {
    rightScore++;
    resetBall();
    scoreSound.currentTime = 0; scoreSound.play();
  }
  if (ballX > WIDTH) {
    leftScore++;
    resetBall();
    scoreSound.currentTime = 0; scoreSound.play();
  }

  updateBounceEffects();
}

function draw(t) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawLightRays();
  drawBubbles();
  drawFish(t);
  drawCoralReef();
  // Draw seaweed so that the base is always at the paddle's bottom
  drawSeaweed(10, leftPaddleY + paddleHeight, true, t);
  drawSeaweed(WIDTH - 10, rightPaddleY + paddleHeight, false, t);
  drawBall();
  drawBounceEffects();
  drawScores();
}

function gameLoop(t) {
  update();
  draw(t);
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'w') leftPaddleSpeed = -6;
  if (e.key === 's') leftPaddleSpeed = 6;
  if (!aiEnabled) {
    if (e.key === 'ArrowUp') rightPaddleSpeed = -6;
    if (e.key === 'ArrowDown') rightPaddleSpeed = 6;
  }
});
document.addEventListener('keyup', e => {
  if (e.key === 'w' || e.key === 's') leftPaddleSpeed = 0;
  if (!aiEnabled && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) rightPaddleSpeed = 0;
});

// Button to enable AI
window.addEventListener('DOMContentLoaded', () => {
  const aiBtn = document.getElementById('ai-btn');
  if (aiBtn) {
    aiBtn.addEventListener('click', () => {
      aiEnabled = !aiEnabled;
      aiBtn.textContent = aiEnabled ? 'Play 2 Player' : 'Play Against AI';
      rightPaddleSpeed = 0;
    });
  }
});

gameLoop(0);
