import { NEIGHBOUR_POSITIONS } from "$lib/services/constants";
import type { CellValue, NeighbourPositions } from "$lib/services/types";

export function generateGrid(
  rows: number,
  cols: number,
  numMines: number,
  mandatoryEmptyCell?: [number, number],
): CellValue[][] {
  let untouchablePositions: number[] = [];
  if (mandatoryEmptyCell) {
    const mainCellPosition = mandatoryEmptyCell[0] * cols + mandatoryEmptyCell[1];

    untouchablePositions = [
      mainCellPosition - cols - 1,
      mainCellPosition - cols,
      mainCellPosition - cols + 1,
      mainCellPosition - 1,
      mainCellPosition,
      mainCellPosition + 1,
      mainCellPosition + cols - 1,
      mainCellPosition + cols,
      mainCellPosition + cols + 1,
    ].filter((position) => position >= 0 && position < (rows * cols));
  }

  const minePositions = new Set<number>();
  const numCells = rows * cols;
  if (untouchablePositions.length > 0) {
    while (minePositions.size < numMines) {
      const i = Math.floor(Math.random() * numCells);
      if (untouchablePositions.includes(i))
        continue;
      minePositions.add(i);
    }
  } else {
    while (minePositions.size < numMines) {
      const i = Math.floor(Math.random() * numCells);
      minePositions.add(i);
    }
  }

  const grid: CellValue[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  minePositions.forEach((pos) => {
    const row = Math.floor(pos / cols);
    const col = pos % cols;
    grid[row][col] = "X";
  });

  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== "X") {
        const neighbours = getAllNeighbours(grid, rowIndex, colIndex);
        const countMines = neighbours.filter((n: any) => n === "X").length;  // TODO: Fix typing
        grid[rowIndex][colIndex] = countMines;
      }
    });
  });

  return grid;
}

export function getAllNeighbours(
  grid: any[][],
  row: number,
  col: number,
) {
  const neighbours: (typeof grid[number][number])[] = [];
  NEIGHBOUR_POSITIONS.forEach((neighbourPos) => {
    const neighbour = getNeighbour(neighbourPos, grid, row, col);
    if (neighbour !== undefined)
      neighbours.push(neighbour);
  });

  return neighbours;
}

export function getNeighbour(
  position: NeighbourPositions,
  grid: any[][],
  row: number,
  col: number,
) {
  switch (position) {
    case "TL":
      if (row - 1 >= 0 && col - 1 >= 0)
        return grid[row - 1][col - 1];
      break;

    case "TC":
      if (row - 1 >= 0)
        return grid[row - 1][col];
      break;

    case "TR":
      if (row - 1 >= 0 && col + 1 < grid[row].length)
        return grid[row - 1][col + 1];
      break;

    case "ML":
      if (col - 1 >= 0)
        return grid[row][col - 1];
      break;

    case "MR":
      if (col + 1 < grid[row].length)
        return grid[row][col + 1];
      break;

    case "BL":
      if (row + 1 < grid.length && col - 1 >= 0)
        return grid[row + 1][col - 1];
      break;

    case "BC":
      if (row + 1 < grid.length)
        return grid[row + 1][col];
      break;
    
    case "BR":
      if (row + 1 < grid.length && col + 1 < grid[row].length)
        return grid[row + 1][col + 1];
      break;
  }
}