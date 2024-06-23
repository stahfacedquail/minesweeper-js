<script lang="ts">
  import Cell from "$lib/components/Cell.svelte";
    import { NEIGHBOUR_POSITIONS } from "$lib/services/constants";
  import { generateGrid, getAllNeighbours, getNeighbour } from "$lib/services/grid";
    import { writable } from "svelte/store";

  export let rows: number;
  export let columns: number;
  export let numMines: number;

  let outcome: string;

  const grid = generateGrid(rows, columns, numMines);
  const grid$ = writable(grid.map((row) => row.map((cell) => ({
    value: cell,
    open: false
  }))));

  function onCellClicked(row: number, col: number) {
    $grid$[row][col].open = true;

    const cell = $grid$[row][col];
    if (cell.value === "X") {
      $grid$[row][col].value = "💥";
    } else if (cell.value === 0) {
      openNeighbours(row, col);
    }

    checkGrid(row, col);
  }

  function openNeighbours(row: number, col: number) {
    if (getAllNeighbours(grid, row, col).some((n: any) => n === "X")) {
      return; // TODO: Fix typing
    }

    NEIGHBOUR_POSITIONS.forEach((neighbourPos) => {
      if (getNeighbour(neighbourPos, grid, row, col) !== undefined) {
        let neighbourRow: number;
        let neighbourCol: number;

        if (neighbourPos === "TL") {
          neighbourRow = row - 1;
          neighbourCol = col - 1;
        } else if (neighbourPos === "TC") {
          neighbourRow = row - 1;
          neighbourCol = col;
        } else if (neighbourPos === "TR") {
          neighbourRow = row - 1;
          neighbourCol = col + 1;
        } else if (neighbourPos === "ML") {
          neighbourRow = row;
          neighbourCol = col - 1;
        } else if (neighbourPos === "MR") {
          neighbourRow = row;
          neighbourCol = col + 1;
        } else if (neighbourPos === "BL") {
          neighbourRow = row + 1;
          neighbourCol = col - 1;
        } else if (neighbourPos === "BC") {
          neighbourRow = row + 1;
          neighbourCol = col;
        } else { // neighbourPos === "BR"
          neighbourRow = row + 1;
          neighbourCol = col + 1;
        }

        if (!$grid$[neighbourRow][neighbourCol].open) {
          $grid$[neighbourRow][neighbourCol].open = true;
          openNeighbours(neighbourRow, neighbourCol);
        }
      }
    });
  }

  function checkGrid(rowClicked: number, colClicked: number) {
    const clickedCell = $grid$[rowClicked][colClicked];
    if (clickedCell.value === "💥" && clickedCell.open) {
      outcome = "Game over";
      return;
    }

    let hasWon = true;
    for (let r = 0; r < $grid$.length && hasWon; r++) {
      for (let c = 0; c < $grid$[r].length && hasWon; c++) {
        const cell = $grid$[r][c];
        if (cell.value !== "X" && !cell.open) {
          hasWon = false;
        }
      }
    }

    if (hasWon) outcome = "Yay!  You won :)";
  }
</script>

<h1
  style:visibility={ outcome ? "visible" : "hidden" }
>{ outcome }</h1>

<table>
  {#each Array(rows) as _, r}
    <tr>
    {#each Array(columns) as __, c}
      {@const cellData = $grid$[r][c]}
      <td>
        <Cell
          value={cellData.value}
          open={cellData.open}
          on:clicked={() => { onCellClicked(r, c); }}
        />
      </td>
    {/each}
    </tr>
  {/each}
</table>

<style lang="scss">
  table, td {
    border: 2px solid black;
  }

  table {
    border-collapse: collapse;
  }

  td {
    height: 2rem;
    width: 2rem;
  }
</style>