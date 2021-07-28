let sudoku = [];
let wrong = false;
let valide = false;
let end = false;

const creer_grille = () => {
  for (let line = 0; line < sudoku.length; line++) {
    document.getElementById("grille").innerHTML += "<div></div>";
    for (let col = 0; col < sudoku[line].length; col++) {
      let allDiv = document.getElementById("grille").querySelectorAll("div");
      allDiv[line].innerHTML += '<input type="text" maxlength="1" />';
    }
  }
};

const recup_input = () => {
  let input_items = document.getElementById("grille").querySelectorAll("input");
  for (let i = 0; i < input_items.length; i++) {
    let x = Math.trunc(i / 9);
    let y = i % 9;
    let n = input_items[i].value;
    input_items[i].className = "";
    if (!isNaN(n) && n !== "0") {
      sudoku[x][y] = Number(n);
    } else {
      input_items[i].className += "text-danger";
      wrong = true;
    }
  }
};

const afficher_grille = (grille, nb) => {
  let input_items = document.getElementById("grille").querySelectorAll("input");
  for (let i = 0; i < input_items.length; i++) {
    let x = Math.trunc(i / 9);
    let y = i % 9;
    if (nb == 0 && grille[x][y] !== 0) {
      input_items[i].value = grille[x][y];
      input_items[i].className += "font-weight-bold";
    } else if (nb == 1 && input_items[i].value == "") {
      input_items[i].value = grille[x][y];
      input_items[i].className += "text-muted";
    } else if (nb == 2) {
      input_items[i].value = "";
      input_items[i].className = "";
    }
  }
};

const check_grille = (grille) => {
  const check_ligne = (ligne) => {
    let filter = grille[ligne].filter(function (el) {
      return el !== 0;
    });
    if ([...new Set(filter)].length < filter.length) {
      return false;
    }
    return true;
  };
  const check_col = (col) => {
    let filter = [];
    for (let i = 0; i < 9; i++) {
      if (grille[i][col] !== 0) filter.push(grille[i][col]);
    }
    if ([...new Set(filter)].length < filter.length) {
      return false;
    }
    return true;
  };
  const check_bloc = (bloc) => {
    let x = Math.trunc(bloc / 9);
    let y = bloc % 9;
    let filter = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grille[x + i][y + j] !== 0) filter.push(grille[x + i][y + j]);
      }
    }
    if ([...new Set(filter)].length < filter.length) {
      return false;
    }
    return true;
  };
  test_block = [0, 3, 6, 27, 30, 33, 54, 57, 60];
  for (let k = 0; k < 9; k++) {
    if (!check_ligne(k) || !check_col(k) || !check_bloc(test_block[k]))
      return false;
  }
  return true;
};

const absent_ligne = (grille, ligne, chiffre) => {
  for (let i = 0; i < 9; i++) {
    if (grille[ligne][i] == chiffre) {
      return false;
    }
  }
  return true;
};

const absent_colonne = (grille, colonne, chiffre) => {
  for (let i = 0; i < 9; i++) {
    if (grille[i][colonne] == chiffre) {
      return false;
    }
  }
  return true;
};

const absent_bloc = (grille, x, y, chiffre) => {
  const _x = x - (x % 3);
  const _y = y - (y % 3);
  for (let i = _x; i < _x + 3; i++) {
    for (let j = _y; j < _y + 3; j++) {
      if (grille[i][j] == chiffre) {
        return false;
      }
    }
  }
  return true;
};

const estValide = (grille, position) => {
  if (position == 9 * 9) return true;

  const i = Math.trunc(position / 9);
  const j = position % 9;
  if (grille[i][j] !== 0) {
    return estValide(grille, position + 1);
  }
  for (let k = 1; k <= 9; k++) {
    if (
      absent_ligne(grille, i, k) &&
      absent_colonne(grille, j, k) &&
      absent_bloc(grille, i, j, k)
    ) {
      grille[i][j] = k;
      if (estValide(grille, position + 1)) {
        return true;
      }
    }
  }
  grille[i][j] = 0;
  return false;
};

const main = () => {
  for (var i = 0; i < 9; i++) {
    sudoku.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  creer_grille();
};

const resoudre = () => {
  document.getElementById("info-sol").innerText = "";
  recup_input();
  if (wrong || !check_grille(sudoku)) {
    document.getElementById("info-sol").innerText =
      "Votre grille est incorrecte !";
      wrong = false;
  } else {
    afficher_grille(sudoku, 0);
    valide = estValide(sudoku, 0);
    if (valide) {
      afficher_grille(sudoku, 1);
      end = true;
    } else {
      document.getElementById("info-sol").innerText =
        "Votre grille n'a pas de solution !";
    }
  }
};

const restart = () => {
  wrong = false;
  end = false;
  valide = false;
  document.getElementById("info-sol").innerText = "";
  sudoku = [];
  for (var i = 0; i < 9; i++) {
    sudoku.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  afficher_grille(sudoku, 2);
};

document.getElementById("resoudre").addEventListener("click", function () {
  if (!end) resoudre();
});

document.getElementById("restart").addEventListener("click", function () {
  restart();
});
main();
