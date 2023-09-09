import { Component, HostListener } from '@angular/core';
import { SudokuSolver } from '@jlguenego/sudoku-generator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  difficulty = 'easy';
  title = 'sudoku';
  selectedRow = -1;
  selectedCol = -1;
  puzzle: number[][] = [];
  // [[9, 1, 5, 2, 8, 7, 4, 6, 3],
  // [6, 4, 7, 3, 1, 5, 9, 2, 8],
  // [8, 2, 3, 6, 4, 9, 7, 1, 5],
  // [1, 3, 6, 7, 0, 4, 8, 5, 9],
  // [4, 7, 9, 5, 6, 8, 1, 3, 2],
  // [2, 5, 8, 9, 3, 1, 6, 4, 7],
  // [3, 6, 1, 8, 9, 2, 5, 7, 4],
  // [5, 8, 4, 1, 7, 3, 0, 9, 6],
  // [7, 9, 2, 4, 5, 6, 3, 8, 1]]

  current: number[][]=[];
  wrong: boolean[][]=[];
  won = false;

  constructor () {
    this.newGame(35);
  }

  selectCell (i:number, j:number) {
    if (this.won) {
      return;
    }
    this.selectedRow = i;
    this.selectedCol = j;
  }
  
  @HostListener('window:keypress', ['$event'])
  keyPress(event: KeyboardEvent) {
    if (this.won) {
      return;
    }
    const input = event.charCode - 48;
    if (input >= 1 && input <= 9) {   
      this.pickNumber(input);
    } else {
      event.preventDefault();
    }
  }

  pickNumber (n:number) {
    if (this.won) {
      return;
    }
    if (this.puzzle[this.selectedRow][this.selectedCol] == 0) {
      this.current[this.selectedRow][this.selectedCol] = n;
      for (let row = 0 ; row < 9 ; row++) {
        loop:
        for (let col = 0 ; col < 9 ; col++) {
          const num = this.current[row][col];
          if (this.puzzle[row][col] != 0 || num == 0) {
            this.wrong[row][col] = false;
            continue;
          }
          for (let i = 0 ; i < 9 ; i++) {
            if (i != col && this.current[row][i] == num || i != row && this.current[i][col] == num) {
              this.wrong[row][col] = true;
              continue loop;
            }
          }
          const top = row - row % 3;
          const left = col - col % 3;
          for (let i = top ; i < top + 3 ; i++) {
            for (let j = left ; j < left + 3 ; j++) {
              if ((i != row || j != col) && this.current[i][j] == num) {
                this.wrong[row][col] = true;
                continue loop;
              }
            }
          }
          this.wrong[row][col] = false;
        }
      }
    }
    for (let row = 0 ; row < 9 ; row++) {
      for (let col = 0 ; col < 9 ; col++) {
        if (this.current[row][col] == 0 || this.wrong[row][col]) {
          this.won = false;
          return;
        }
      }
    }
    this.won = true;
  }

  deleteNumber () {
    this.pickNumber(0);
  }

  askNewGame () {
    if (!this.won) {
      if (!confirm('Are you sure?')) {
        return;
      }
    }
    let count = 35;
    if (this.difficulty == "med") {
      count = 45;
    } else if (this.difficulty == "hard") {
      count = 55;
    }
    this.newGame(count); 
  }

  newGame (count: number) {
    const solution = SudokuSolver.generate();
    const masked = SudokuSolver.carve(solution, count);
    this.selectedRow = -1;
    this.selectedCol = -1;
    this.puzzle = masked;
    this.current = this.puzzle.map(function(arr) {
      return arr.slice();
    });
    this.wrong = new Array(9).fill(false).map(() => new Array(9));
    this.won = false;
  }
}
