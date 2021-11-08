let canvas;
let brush;
let bgImage;
let bgX = 0;
let bgY = 0;
let countdownObj;
let obstacles = [];
let sadmonkeyObj;
let monkeyObj;
let bananaObj;
let counter = 1000;
let intervalObj;
let startTime;
let endTime;
let nowTime;
let levelUpTime;
let intervalobstacle;

function GetRandomInteger(a, b) {
  // returns a random integer x such that a <= x <= b
  //
  // @params
  // a: integer
  // b: integer
  // @returns
  // a random integer x such that a <= x <= b

  // switch the large and small if out of order
  if (a > b) {
    small = b;
    large = a;
  } else {
    small = a;
    large = b;
  }

  let x = parseInt(Math.random() * (large - small + 1)) + small;
  return x;
}

let myKeys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

let bodyElem = document.getElementById("body");
bodyElem.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    myKeys.up = true;
  }
  if (event.key === "ArrowDown") {
    myKeys.down = true;
  }
  if (event.key === "ArrowLeft") {
    myKeys.left = true;
  }
  if (event.key === "ArrowRight") {
    myKeys.right = true;
  }
});

class Monkey {
  constructor(x, y, dX, dY, imageFile) {
    this.x = x;
    this.y = y;
    this.dX = dX;
    this.dY = dY;
    this.image = new Image();
    this.image.src = imageFile;
    this.width = this.image.width;
    this.height = this.image.height;
  }
  MoveRight() {
    let newX = this.x + this.dX;
    if (newX + this.image.width < canvas.width) {
      this.x = newX;
    }
  }
  MoveLeft() {
    let newX = this.x - this.dX;
    if (newX >= 0) {
      this.x = newX;
    }
  }
  MoveDown() {
    let newY = this.y + this.dY;
    if (newY + this.image.height < canvas.height) {
      this.y = newY;
    }
  }
  MoveUp() {
    let newY = this.y - this.dY;
    if (newY >= 0) {
      this.y = newY;
    }
  }
  Draw() {
    brush.drawImage(this.image, this.x, this.y);
  }
}

class Obstacles {
  constructor(x, y, dX, dY, imageFile) {
    this.image = new Image();
    this.image.src = imageFile;
    this.width = this.image.width;
    this.height = this.image.height;
    this.x = x;
    this.y = y;
    this.dX = dX;
    this.dY = dY;
  }
  Move() {
    let newX = this.x + this.dX;
    if (newX + (this.width - 1) >= canvas.width || newX < 0) {
      this.dX = -this.dX;
    } else {
      this.x = newX;
    }
    let newY = this.y + this.dY;
    if (newY + (this.height - 1) >= canvas.height || newY < 0) {
      this.dY = -this.dY;
    } else {
      this.y = newY;
    }
  }
  Overlaps(x, y, width, height) {
    let cir1Left = this.x;
    let cir1Right = this.x + this.width;
    let cir1Top = this.y;
    let cir1Bottom = this.y + this.height;
    let rect2Left = x;
    let rect2Right = x + width - 1;
    let rect2Top = y;
    let rect2Bottom = y + height - 1;

    if (
      rect2Right < cir1Left ||
      rect2Left > cir1Right ||
      rect2Bottom < cir1Top ||
      rect2Top > cir1Bottom
    ) {
      return false;
    } else {
      return true;
    }
  }
  Draw() {
    brush.drawImage(this.image, this.x, this.y);
  }
}

class Banana {
  constructor(x, y, imageFile) {
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = imageFile;
    this.width = this.image.width;
    this.height = this.image.height;
  }
  // x, y - top left corner of some rectangle
  Overlaps(x, y, width, height) {
    let rect1Left = this.x + this.width;
    let rect1Right = this.x + this.width - 1;
    let rect1Top = this.y + this.width;
    let rect1Bottom = this.y + this.height - 1;
    let rect2Left = x;
    let rect2Right = x + width - 1;
    let rect2Top = y;
    let rect2Bottom = y + height - 1;

    if (
      rect2Right < rect1Left ||
      rect2Left > rect1Right ||
      rect2Bottom < rect1Top ||
      rect2Top > rect1Bottom
    ) {
      return false;
    } else {
      return true;
    }
  }
  Draw() {
    brush.drawImage(this.image, this.x, this.y);
  }
}

function OnLoad() {
  countdownObj = setInterval(CountDown, 1000);
}

function CountDown() {
  let seconds = document.getElementById("countdown").textContent;
  seconds--;
  document.getElementById("countdown").innerHTML = seconds;
  if (seconds === 0) {
    clearInterval(countdownObj);
    document.getElementById("countdown-wrapper").remove();
    document.getElementById("counter").style.display = "initial";
    document.getElementById("body").style.textAlign = "center";
    Setup();
  }
}

function Setup() {
  canvas = document.getElementById("drawingSurface");
  brush = canvas.getContext("2d");
  // set canvas width as viewport width
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 100;
  bgImage = new Image();
  bgImage.src = "spaceImg.png";
  StartGame();
}

function StartGame() {
  if (intervalObj !== undefined || intervalObj !== null) {
    clearInterval(intervalObj);
    clearInterval(intervalobstacle);
    monkeyObj = null;
    obstacles = [];
    bananaObj = null;
  }

  CreateObstacles();
  CreateMonkey();
  CreateBanana();
  CreateSadMonkey();

  // record game's start time
  let time = new Date();
  startTime = time.getTime();
  intervalObj = setInterval(DrawGameScreen, 10);
  intervalobstacle = setInterval(AddObstacle, 10000);
}

function DrawGameScreen() {
  brush.clearRect(0, 0, canvas.width, canvas.height);
  // animate background image
  brush.drawImage(bgImage, bgX, bgY);
  bgX--;
  if (bgX < -bgImage.width) {
    bgX = 0;
  }
  brush.drawImage(bgImage, bgX + bgImage.width, bgY);

  // collide with banana
  if (bananaObj !== undefined || bananaObj !== null) {
    bananaObj.Draw();
    let isOverlap = Overlap(bananaObj);
    console.log(isOverlap);
    if (isOverlap === true) {
      counter += 100;
      CreateBanana();
      OutputCounter();
    }
  }

  // collide with obstacle objects
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].Draw();
    obstacles[i].Move();
    let isOverlap = Overlap(obstacles[i]);
    if (isOverlap === true) {
      counter--;
      OutputCounter();
    }
  }

  // draw monkey
  if (counter >= 0) {
    monkeyObj.Draw();
  }
  if (myKeys.up) {
    monkeyObj.MoveUp();
  }
  if (myKeys.down) {
    monkeyObj.MoveDown();
  }
  if (myKeys.left) {
    monkeyObj.MoveLeft();
  }
  if (myKeys.right) {
    monkeyObj.MoveRight();
  }
  myKeys.up = false;
  myKeys.down = false;
  myKeys.left = false;
  myKeys.right = false;

  EndGame();
}

function Overlap(characterObj) {
  if (
    characterObj.Overlaps(
      monkeyObj.x,
      monkeyObj.y,
      monkeyObj.width,
      monkeyObj.height
    )
  )
    return true;
}

function CreateMonkey() {
  monkeyObj = new Monkey(0, 0, 50, 50, "spaceMonkey.png");
}

function CreateSadMonkey() {
  sadmonkeyObj = new Monkey(
    canvas.width / 2.25,
    canvas.height / 4,
    0,
    0,
    "sadSpaceMonkey.png"
  );
}

function CreateObstacle(x, y, dX, dY, imageFile) {
  let obstaclesObj = new Obstacles(x, y, dX, dY, imageFile);
  obstacles.push(obstaclesObj);
}

function CreateObstacles() {
  CreateObstacle(
    GetRandomInteger(100, canvas.width - 100),
    GetRandomInteger(100, canvas.height - 100),
    2,
    2,
    "obstacle1.png"
  );
  CreateObstacle(
    GetRandomInteger(200, canvas.width - 200),
    GetRandomInteger(200, canvas.height - 200),
    1,
    1,
    "obstacle2.png"
  );
  CreateObstacle(
    GetRandomInteger(300, canvas.width - 500),
    GetRandomInteger(300, canvas.height - 500),
    0.5,
    0.5,
    "obstacle3.png"
  );
}

function AddObstacle() {
  CreateObstacle(
    GetRandomInteger(100, canvas.width - 100),
    GetRandomInteger(100, canvas.height - 100),
    3,
    3,
    "obstacle1.png"
  );
}

function CreateBanana() {
  bananaObj = new Banana(
    GetRandomInteger(100, canvas.width - 200),
    GetRandomInteger(100, canvas.height - 200),
    "banana.png"
  );
}

function OutputCounter() {
  let counterID = document.getElementById("counter");
  counterID.innerHTML = counter;
}

function OutputEndGame() {
  let counterID = document.getElementById("counter");
  counterID.innerHTML = `Monkey Survived ${(
    (endTime - startTime) /
    1000
  ).toFixed(2)} seconds`;
}

function EndGame() {
  if (intervalObj !== undefined && counter < 0) {
    clearInterval(intervalObj);
    sadmonkeyObj.Draw();
    // record game's start time
    let time = new Date();
    endTime = time.getTime();
    OutputEndGame();
  }
}
