const app = new PIXI.Application({ antialias: true, transparent: false, resolution: 1 });
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.resize(window.innerWidth, window.innerHeight);
PIXI.AbstractRenderer.autoDensity;
document.body.appendChild(app.view);

// -----------------------------------------------------------objects

//ball
let circle = new PIXI.Graphics();
circle.beginFill(0xffffff);
circle.drawCircle(0, 0, 20);
circle.endFill();
circle.x = window.innerWidth / 2;
circle.y = window.innerHeight / 2;
circle.velocityX = random();
circle.velocityY = random();
circle.speed = 7;
circle.radius = 10;
app.stage.addChild(circle);

function random() {
     var randomNumber = Math.floor(Math.random() * 10) - 5;
     if (randomNumber === 0) {
          return random();
     } else {
          return randomNumber;
     }
}
const trailTexture = PIXI.Texture.from("./assets/img/trail.png");
const historyX = [];
const historyY = [];
// historySize determines how long the trail will be.
const historySize = 50;
// ropeSize determines how smooth the trail will be.
const ropeSize = 100;
const points = [];

// Create history array.
for (let i = 0; i < historySize; i++) {
     historyX.push(0);
     historyY.push(0);
}
// Create rope points.
for (let i = 0; i < ropeSize; i++) {
     points.push(new PIXI.Point(0, 0));
}
// Create the rope
const rope = new PIXI.SimpleRope(trailTexture, points);
// Set the blendmode
rope.blendmode = PIXI.BLEND_MODES.ADD;
app.stage.addChild(rope);

//line in the middle
let net = new PIXI.Graphics();
net.beginFill(0xffffff);
net.drawRoundedRect(0, 0, 10, 800, 5);
net.x = (window.innerWidth - net.width) / 2;
net.y = (window.innerHeight - net.height) / 2;
app.stage.addChild(net);

//player1
let roundBox1 = new PIXI.Graphics();
roundBox1.beginFill(0xffffff);
roundBox1.drawRoundedRect(0, 0, 40, 100, 10);
roundBox1.endFill();
roundBox1.x = 48;
roundBox1.y = window.innerHeight / 2;
roundBox1.vy = 0;
roundBox1.score = 0;
app.stage.addChild(roundBox1);

const style = new PIXI.TextStyle({
     fontFamily: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
     fontSize: 60,
     fontWeight: "bold",
     fill: "0xffffff"
});

const scoreP1 = new PIXI.Text(roundBox1.score, style);
scoreP1.x = window.innerWidth / 4;
scoreP1.y = 90;
app.stage.addChild(scoreP1);

//player2
let roundBox2 = new PIXI.Graphics();
roundBox2.beginFill(0xffffff);
roundBox2.drawRoundedRect(0, 0, 40, 100, 10);
roundBox2.endFill();
roundBox2.x = window.innerWidth - 88;
roundBox2.y = window.innerHeight / 2;
roundBox2.vy = 0;
roundBox2.score = 0;
app.stage.addChild(roundBox2);

const scoreP2 = new PIXI.Text(roundBox2.score, style);
scoreP2.x = (window.innerWidth / 4) * 3;
scoreP2.y = 90;
app.stage.addChild(scoreP2);

// ----------------------------------------------------------controls
function keyboard(value) {
     let key = {};
     key.value = value;
     key.isDown = false;
     key.isUp = true;
     key.press = undefined;
     key.release = undefined;
     //The `downHandler`
     key.downHandler = event => {
          if (event.key === key.value) {
               if (key.isUp && key.press) key.press();
               key.isDown = true;
               key.isUp = false;
               event.preventDefault();
          }
     };

     //The `upHandler`
     key.upHandler = event => {
          if (event.key === key.value) {
               if (key.isDown && key.release) key.release();
               key.isDown = false;
               key.isUp = true;
               event.preventDefault();
          }
     };

     //Attach event listeners
     const downListener = key.downHandler.bind(key);
     const upListener = key.upHandler.bind(key);

     window.addEventListener("keydown", downListener, false);
     window.addEventListener("keyup", upListener, false);

     // Detach event listeners
     key.unsubscribe = () => {
          window.removeEventListener("keydown", downListener);
          window.removeEventListener("keyup", upListener);
     };
     return key;
}

let upP1 = keyboard("q");
let downP1 = keyboard("w");
let upP2 = keyboard("ArrowUp");
let downP2 = keyboard("ArrowDown");

//control p1
//Up
upP1.press = () => {
     roundBox1.vy = -10;
};
upP1.release = () => {
     if (!downP1.isDown) {
          roundBox1.vy = 0;
     }
};

//Down
downP1.press = () => {
     roundBox1.vy = 10;
};
downP1.release = () => {
     if (!upP1.isDown) {
          roundBox1.vy = 0;
     }
};

//control p2
//Up
upP2.press = () => {
     roundBox2.vy = -10;
};
upP2.release = () => {
     if (!downP2.isDown) {
          roundBox2.vy = 0;
     }
};

//Down
downP2.press = () => {
     roundBox2.vy = 10;
};
downP2.release = () => {
     if (!upP2.isDown) {
          roundBox2.vy = 0;
     }
};

//-----------------------------------------------------setup
//Set the game state
state = play;
//Start the game loop
app.ticker.add(delta => gameLoop(delta));

function gameLoop(delta) {
     let player = "";
     if (circle.x > window.innerWidth / 2) {
          player = roundBox2;
     } else {
          player = roundBox1;
     }

     state(delta);
     if (circle.y < 0 || circle.y > window.innerHeight) {
          circle.velocityY = -circle.velocityY;
     }
     if (collision(circle, player)) {
          // we check where the circle hits the paddle
          let collidePoint = circle.y - (player.y + player.height / 2);
          // normalize the value of collidePoint, we need to get numbers between -1 and 1.
          // -player.height/2 < collide Point < player.height/2
          collidePoint = collidePoint / (player.height / 2);

          // when the circle hits the top of a paddle we want the circle, to take a -45degees angle
          // when the circle hits the center of the paddle we want the circle to take a 0degrees angle
          // when the circle hits the bottom of the paddle we want the circle to take a 45degrees
          // Math.PI/4 = 45degrees
          let angleRad = (Math.PI / 4) * collidePoint;

          // change the X and Y velocity direction
          let direction = circle.x + circle.radius < window.innerWidth / 2 ? 1 : -1;
          circle.velocityX = direction * circle.speed * Math.cos(angleRad);
          circle.velocityY = circle.speed * Math.sin(angleRad);

          // speed up the circle everytime a paddle hits it.
          circle.speed += 2;
     }
     if (circle.x - circle.radius < 0) {
          roundBox2.score++;
          scoreP2.text = roundBox2.score;
          resetcircle();
     } else if (circle.x + circle.radius > window.innerWidth) {
          roundBox1.score++;
          scoreP1.text = roundBox1.score;
          resetcircle();
     }

     circle.x += circle.velocityX;
     circle.y += circle.velocityY;

     historyX.pop();
     historyX.unshift(circle.x);
     historyY.pop();
     historyY.unshift(circle.y);
     // Update the points to correspond with history.
     for (let i = 0; i < ropeSize; i++) {
          const p = points[i];

          // Smooth the curve with cubic interpolation to prevent sharp edges.
          const ix = cubicInterpolation(historyX, (i / ropeSize) * historySize);
          const iy = cubicInterpolation(historyY, (i / ropeSize) * historySize);

          p.x = ix;
          p.y = iy;
     }
     console.log("x: ", circle.velocityX);
     console.log("y; ", circle.velocityY);
}

function clipInput(k, arr) {
     if (k < 0) k = 0;
     if (k > arr.length - 1) k = arr.length - 1;
     return arr[k];
}

function getTangent(k, factor, array) {
     return (factor * (clipInput(k + 1, array) - clipInput(k - 1, array))) / 2;
}

function cubicInterpolation(array, t, tangentFactor) {
     if (tangentFactor == null) tangentFactor = 1;

     const k = Math.floor(t);
     const m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
     const p = [clipInput(k, array), clipInput(k + 1, array)];
     t -= k;
     const t2 = t * t;
     const t3 = t * t2;
     return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}

function play() {
     roundBox1.y += roundBox1.vy;
     roundBox2.y += roundBox2.vy;
}

function resetcircle() {
     circle.x = window.innerWidth / 2;
     circle.y = window.innerHeight / 2;
     circle.velocityX = random();
     circle.velocityY = random();
     // circle.velocityX = -circle.velocityX;
     circle.speed = 7;
}

function collision(circle, player) {
     circle.top = circle.y - circle.radius;
     circle.bottom = circle.y + circle.radius;
     circle.left = circle.x - circle.radius;
     circle.right = circle.x + circle.radius;

     player.top = player.y;
     player.bottom = player.y + player.height;
     player.left = player.x;
     player.right = player.x + player.width;
     return player.left < circle.right && player.top < circle.bottom && player.right > circle.left && player.bottom > circle.top;
}

//------------------------------------------------socket io
var socket = io("http://localhost");
socket.on("news", function(data) {
     console.log(data);
     socket.emit("my other event", { my: "data" });
});
