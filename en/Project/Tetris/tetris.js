let grille = [];

let Piece = function (X, Y, nb) {
  this.X = X;
  this.Y = Y;
  this.nb = nb;
  this.typeRot = 0;
  this.bas = function () {
    return testDeplacement(
      this,
      this.X,
      this.Y.map((x) => x + 1)
    );
  };
  this.gauche = function () {
    return testDeplacement(
      this,
      this.X.map((x) => x - 1),
      this.Y
    );
  };
  this.droite = function () {
    return testDeplacement(
      this,
      this.X.map((x) => x + 1),
      this.Y
    );
  };
  this.down = function () {
    afficherPiece(this.X, this.Y, 0);
    this.Y = this.Y.map((x) => x + 1);
    afficherPiece(this.X, this.Y, this.nb);
  };
  this.left = function () {
    afficherPiece(this.X, this.Y, 0);
    this.X = this.X.map((x) => x - 1);
    afficherPiece(this.X, this.Y, this.nb);
  };
  this.right = function () {
    afficherPiece(this.X, this.Y, 0);
    this.X = this.X.map((x) => x + 1);
    afficherPiece(this.X, this.Y, this.nb);
  };
};

let PieceRotate = function (X, Y, nb, coordRot) {
  Piece.call(this, X, Y, nb);
  this.typeRot = 1;
  this.coordRot = coordRot;
  this.rotate = function () {
    let X = [].concat(this.X);
    let Y = [].concat(this.Y);
    const chgt = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
      [-1, -1],
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];
    for (let i = 0; i < X.length; i++) {
      if (X[i] == this.coordRot[0] && Y[i] == this.coordRot[1]) continue;
      else {
        for (let j = 0; j < chgt.length; j++) {
          if (
            chgt[j][0] == X[i] - this.coordRot[0] &&
            chgt[j][1] == Y[i] - this.coordRot[1]
          ) {
            X[i] = chgt[j + 1][0] + this.coordRot[0];
            Y[i] = chgt[j + 1][1] + this.coordRot[1];
            break;
          }
        }
      }
    }
    if (testDeplacement(this, X, Y)) chargerDeplacement(X, Y);
  };
};

let PieceBleuC = function (X, Y, nb) {
  Piece.call(this, X, Y, nb);
  this.rotate = function () {
    let X = [].concat(this.X);
    let Y = [].concat(this.Y);
    const horizontale = Y[0] == Y[1];
    if (horizontale) {
      Y = [Y[0], Y[0] + 1, Y[0] + 2, Y[0] + 3];
      if (Math.min(...X) >= 3) {
        X = [Math.max(...X), Math.max(...X), Math.max(...X), Math.max(...X)];
      } else {
        X = [Math.min(...X), Math.min(...X), Math.min(...X), Math.min(...X)];
      }
      if (testDeplacement(this, X, Y) == false)
        Y = [Y[0] - 3, Y[0] - 2, Y[0] - 1, Y[0]];
    } else {
      Y = [Y[0], Y[0], Y[0], Y[0]];
      if (X[0] >= 5) {
        X = [X[0], X[0] - 1, X[0] - 2, X[0] - 3];
      } else {
        X = [X[0], X[0] + 1, X[0] + 2, X[0] + 3];
      }
    }
    if (testDeplacement(this, X, Y)) chargerDeplacement(X, Y);
  };
};

let PieceFantome = function (X, Y, nb) {
  Piece.call(this, X, Y, nb);
  this.affiche = function (piece) {
    afficherPiece(this.X, this.Y, 0);
    this.X = [].concat(piece.X);
    this.Y = [].concat(piece.Y);
    while (this.bas()) {
      this.Y = this.Y.map((x) => x + 1);
    }
    afficherPiece(this.X, this.Y, this.nb);
    afficherPiece(piece.X, piece.Y, piece.nb);
  };
  this.reset = function () {
    this.X = [0, 0, 0, 0];
    this.Y = [0, 0, 0, 0];
  };
};

const afficherPiece = (X, Y, nb) => {
  for (let i = 0; i < 4; i++) {
    if (Y[i] !== -2 && Y[i] !== -1) grille[Y[i]][X[i]] = nb;
  }
  afficher_grille();
};

const testDeplacement = (piece, X, Y) => {
  if (X.includes(-1) || X.includes(10) || Y.includes(20)) return false;
  for (let i = 0; i < X.length; i++) {
    if (Y[i] == -2 || Y[i] == -1) continue;
    s = true;
    for (let j = 0; j < X.length; j++) {
      if (X[i] == piece.X[j] && Y[i] == piece.Y[j]) s = false;
    }
    if (s && grille[Y[i]][X[i]] !== 0 && grille[Y[i]][X[i]] !== 8) return false;
  }
  return true;
};

const chargerDeplacement = (X, Y) => {
  afficherPiece(piece.X, piece.Y, 0);
  for (let i = 0; i < X.length; i++) {
    piece.X[i] = X[i];
    piece.Y[i] = Y[i];
  }
  afficherPiece(piece.X, piece.Y, piece.nb);
};

let bleu_c = new PieceBleuC([3, 4, 5, 6], [-1, -1, -1, -1], 1);
let violet = new PieceRotate([4, 3, 4, 5], [-2, -1, -1, -1], 2, [4, -1]);
let jaune = new Piece([4, 5, 4, 5], [-2, -2, -1, -1], 3);
let orange = new PieceRotate([5, 3, 4, 5], [-2, -1, -1, -1], 4, [4, -2]);
let bleu_f = new PieceRotate([3, 3, 4, 5], [-2, -1, -1, -1], 5, [4, -2]);
let rouge = new PieceRotate([3, 4, 4, 5], [-2, -2, -1, -1], 6, [4, -1]);
let vert = new PieceRotate([4, 5, 3, 4], [-2, -2, -1, -1], 7, [4, -1]);

let pieceFantome = new PieceFantome([0, 0, 0, 0], [0, 0, 0, 0], 8);

const creation_grille = () => {
  for (let line = 0; line < grille.length; line++) {
    document.getElementById("grille").innerHTML += "<div></div>";
    for (let col = 0; col < grille[line].length; col++) {
      let allDiv = document.getElementById("grille").querySelectorAll("div");
      allDiv[line].innerHTML += "<span></span>";
    }
  }
};

const modifier_case = (l, c, n) => {
  const couleur = [
    "#130E0A",
    "#00bfff",
    "#EE82EE",
    "#FFD700",
    "#D2691E",
    "#0000CD",
    "#FF4500",
    "#7FFF00",
    "#DCDCDC",
  ];
  let col = document
    .getElementById("grille")
    .querySelector("div:nth-of-type(" + l + ") span:nth-of-type(" + c + ")");
  col.style.backgroundColor = couleur[n];
};

const afficher_grille = () => {
  for (let line = 0; line < grille.length; line++) {
    for (let col = 0; col < grille[line].length; col++) {
      modifier_case(line + 1, col + 1, grille[line][col]);
    }
  }
};

const keyCode = (event) => {
  var x = event.keyCode;
  if (x == 40 && piece.bas() && !end) {
    piece.down();
    pieceFantome.affiche(piece);
    if (piece.typeRot == 1 && piece.coordRot[1] !== 18) {
      piece.coordRot = [piece.coordRot[0], piece.coordRot[1] + 1];
    }
  } else if (x == 37 && piece.gauche() && !end) {
    piece.left();
    pieceFantome.affiche(piece);
    if (piece.typeRot == 1 && piece.coordRot[0] !== 1) {
      piece.coordRot = [piece.coordRot[0] - 1, piece.coordRot[1]];
    }
  } else if (x == 39 && piece.droite() && !end) {
    piece.right();
    pieceFantome.affiche(piece);
    if (piece.typeRot == 1 && piece.coordRot[0] !== 8) {
      piece.coordRot = [piece.coordRot[0] + 1, piece.coordRot[1]];
    }
  } else if (x == 38 && piece.nb !== 3 && !end) {
    piece.rotate();
    pieceFantome.affiche(piece);
  } else if (x == 32 && !end) {
    afficherPiece(piece.X, piece.Y, 0);
    afficherPiece(pieceFantome.X, pieceFantome.Y, piece.nb);
    start();
  }
};

document.addEventListener("keydown", keyCode);
let timer = 300;
let piece;
let random;
let timeCount;
let timeChrono;
let mesPieces;
let debut = true;
let ligne = 0;
let score = -10;
let niveau = 1;
let timeStart;
let end = false;

function stopDown() {
  clearTimeout(timeCount);
}

const descente = () => {
  if (piece.bas()) {
    pieceFantome.affiche(piece);
    piece.down();
    if (piece.typeRot == 1 && piece.coordRot[1] !== 18) {
      piece.coordRot = [piece.coordRot[0], piece.coordRot[1] + 1];
    }
    timeCount = setTimeout(function () {
      descente();
    }, timer);
  } else start();
};

const clearLine = () => {
  for (let i = 0; i < grille.length; i++) {
    s = true;
    for (let j = 0; j < grille[i].length; j++) {
      if (grille[i][j] == 0 || grille[i][j] == 8) s = false;
    }
    if (s) {
      ligne = ligne + 1;
      grille.splice(i, 1);
      grille.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      score = score + 100;
      document.getElementById("ligne").innerText = "Lines : " + ligne;
      document.getElementById("score").innerText = "Score : " + score;
    }
  }
};

const start = () => {
  bleu_c = new PieceBleuC([3, 4, 5, 6], [-1, -1, -1, -1], 1);
  violet = new PieceRotate([4, 3, 4, 5], [-2, -1, -1, -1], 2, [4, -1]);
  jaune = new Piece([4, 5, 4, 5], [-2, -2, -1, -1], 3);
  orange = new PieceRotate([5, 3, 4, 5], [-2, -1, -1, -1], 4, [4, -2]);
  bleu_f = new PieceRotate([3, 3, 4, 5], [-2, -1, -1, -1], 5, [4, -2]);
  rouge = new PieceRotate([3, 4, 4, 5], [-2, -2, -1, -1], 6, [4, -1]);
  vert = new PieceRotate([4, 5, 3, 4], [-2, -2, -1, -1], 7, [4, -1]);

  mesPieces = [bleu_c, violet, jaune, orange, bleu_f, rouge, vert]; //, vert];
  random = Math.floor(Math.random() * 7);
  piece = Object.create(mesPieces[random]);
  score = score + 10;
  document.getElementById("score").innerText = "Score : " + score;
  if (score > niveau * 1000) {
    niveau += 1;
    timer = timer * 0.75;
    document.getElementById("niveau").innerText = "Level : " + niveau;
  }
  clearLine();
  pieceFantome.reset();
  stopDown();
  if (piece.bas()) descente();
  else {
    end = true;
    clearTimeout(timeChrono);
  }
};

const main = () => {
  for (var i = 0; i < 20; i++) {
    grille.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  creation_grille();
  afficher_grille();
};
main();

document.getElementById("start").addEventListener("click", function () {
  if (debut) {
    start();
    debut = false;
    timeStart = Date.now();
    chrono();
  }
});

document.getElementById("restart").addEventListener("click", function () {
  if (end) {
    end = false
    grille = []
    ligne = 0;
    score = -10;
    niveau = 1;
    document.getElementById("grille").innerText = "";
    main();
    start();
    debut = false;
    timeStart = Date.now();
    chrono();
  }
});

const chrono = () => {
  let s = Math.floor((Date.now() - timeStart) / 1000);
  let sec = Math.floor(s % 60) < 10 ? String("0" + Math.floor(s % 60)) : Math.floor(s % 60);
  document.getElementById("time").innerText = "Elapsed time : " + Math.floor(s / 60) + ":" + sec;
  timeChrono = setTimeout(function () {
    chrono();
  }, 999);
};
//start();
window.addEventListener("keydown", function(e) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
  }
}, false);