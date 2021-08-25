const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const liveText = document.querySelector(".liveText");
const scoreText = document.querySelector(".scoreText");

let score = 0;
let live = 3;

const brickRowCount = 9;
const brickColumnCount = 5;
const delay = 500;

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
  visible: true,
};

const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0,
  visible: true,
};

const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo }; // x, y는 새로, 나머지는 기존의 오브젝트 그대로
  }
}

console.log(bricks);

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2, true);
  // arc(x, y, radius, startAngle, endAngle, anticlockwise)
  // (x, y) 위치에 원점, 반지름 r,  startAngle 에서 시작하여 endAngle 에서 끝나며 주어진 anticlockwise 방향으로 향하는 (기본값은 시계방향 회전) 호

  ctx.fillStyle = ball.visible ? "white" : "transparent";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? "white" : "transparent";

      ctx.shadowColor = "green";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.closePath();
    });
  });
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = paddle.visible ? "white" : "transparent";

  ctx.fill();
}

function drawScore() {
  scoreText.innerHTML = `SCORE: ${score}`;
}

function draw() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  drawBricks();
}

function movePaddle() {
  paddle.x += paddle.dx; // paddle 위치를 업데이트

  if (paddle.x + paddle.w > canvas.width) {
    // 패들이 캔버스 오른쪽 끝에 있을 때
    paddle.x = canvas.width - paddle.w;
  }
  if (paddle.x < 0) {
    // 패들이 캔버스 왼쪽 끝에 있을 때
    paddle.x = 0;
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // 오른쪽, 왼쪽 벽 충돌
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
  }

  // 위쪽, 아래쪽 벽 충돌
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  // 패들과 충돌
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy *= -1;
  }

  // 벽돌과 충돌
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x &&
          ball.x + ball.size < brick.x + brick.w &&
          ball.y + ball.size > brick.y &&
          ball.y - ball.size < brick.y + brick.h
        ) {
          ball.dy *= -1;
          brick.visible = false;

          increaseScore();
        }
      }
    });
  });

  // 바닥과 부딪혔을 때 게임 짐
  if (ball.y + ball.size > canvas.height) {
    live--;
    drawLive();
  }

  if (live === 0) {
    showAllBricks();
    score = 0;
    live = 3;
    drawScore();
    drawLive();
  }
}

function drawLive() {
  liveText.innerHTML = `LIVE: ${live}`;
}
function increaseScore() {
  score++;
  drawScore();

  // 벽돌을 다 깼을 때
  if (score % (brickRowCount * brickColumnCount) === 0) {
    ball.visible = false;
    paddle.visible = false;

    // 0.5초 이후에 다시 게임 시작
    setTimeout(function () {
      showAllBricks();
      score = 0;
      paddle.x = canvas.width / 2 - 40;
      paddle.y = canvas.height - 20;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.visible = true;
      paddle.visible = true;
    }, delay);
  }
}

function showAllBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => (brick.visible = true));
  });
}

// 캔버스 업데이트하고 애니메이션 그리기
function update() {
  movePaddle();
  moveBall();

  draw();

  requestAnimationFrame(update);
  // 브라우저에게 원하는 애니메이션을 알리고
  // 다음 리페이트가 진행되기전까지 해당 애니메이션을 업데이트하는 함수를 호출
  // 다음 리페인트에서 그 다음 프레임을 애니메이트하려면 콜백 루틴이 반드시 스스로 requestAnimationFrame()을 호출해야함.
}

function keyDown(e) {
  if (e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
}

function keyUp(e) {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    paddle.dx = 0;
  }
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

rulesBtn.addEventListener("click", () => rules.classList.add("show"));
closeBtn.addEventListener("click", () => rules.classList.remove("show"));

function init() {
  update();
  drawLive();
  drawScore();
}

init();
