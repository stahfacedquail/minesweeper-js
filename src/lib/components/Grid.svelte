<script lang="ts">
  import Cell from "$lib/components/Cell.svelte";
  import Timer from "$lib/components/Timer.svelte";
  import { NEIGHBOUR_POSITIONS, GAME_OUTCOME } from "$lib/services/constants";
  import { generateGrid, getAllNeighbours, getNeighbour } from "$lib/services/grid";
  import type { CellValue, GameOutcome } from "$lib/services/types";
  import { derived, writable } from "svelte/store";

  export let rows: number;
  export let columns: number;
  export let numMines: number;

  const outcome$ = writable<GameOutcome>(GAME_OUTCOME.PreStart);

  let grid: ReturnType<typeof generateGrid>;
  const grid$ = writable<{
    value?: CellValue,
    open: boolean,
    flagged: boolean,
  }[][]>(Array.from({ length: rows },
    () => new Array(columns)
      .fill(null)
      .map(() => ({ value: undefined, open: false, flagged: false }))
  ));

  const numFlagsLeftToPlace$ = derived(
    grid$,
    (g) => {
      if (!g) return numMines;

      return numMines - g.reduce(
        (numFlags, row) => numFlags
          + row.filter((cell) => cell.flagged).length,
        0);
    }
  );

  function onCellClicked(row: number, col: number) {
    if ($outcome$ === GAME_OUTCOME.PreStart) {
      outcome$.set(GAME_OUTCOME.Ongoing);
    }

    if (!grid) {
      grid = generateGrid(rows, columns, numMines, [row, col]);
      $grid$.forEach((row, r) => {
        row.forEach((cell, c) => {
          $grid$[r][c].value = grid[r][c]
        })
      });
    }

    $grid$[row][col].open = true;

    const cell = $grid$[row][col];
    if (cell.value === 0) {
      openNeighbours(row, col);
    }

    checkGrid(row, col);
  }

  function onCellFlagToggled(row: number, col: number) {
    if ($outcome$ === GAME_OUTCOME.PreStart) {
      outcome$.set(GAME_OUTCOME.Ongoing);
    }
    $grid$[row][col].flagged = !$grid$[row][col].flagged;
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

        if (!$grid$[neighbourRow][neighbourCol].open && !$grid$[neighbourRow][neighbourCol].flagged) {
          $grid$[neighbourRow][neighbourCol].open = true;
          openNeighbours(neighbourRow, neighbourCol);
        }
      }
    });
  }

  function checkGrid(rowClicked: number, colClicked: number) {
    const clickedCell = $grid$[rowClicked][colClicked];
    if (clickedCell.value === "X" && clickedCell.open) {
      outcome$.set(GAME_OUTCOME.Lost);
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

    if (hasWon) {
      outcome$.set(GAME_OUTCOME.Won);
    }
  }
</script>

<h1 style:visibility={ $outcome$ === GAME_OUTCOME.Won || $outcome$ === GAME_OUTCOME.Lost ? "visible" : "hidden" }>{
  $outcome$ === GAME_OUTCOME.Won
    ? "Yay!  You won :)"
    : $outcome$ === GAME_OUTCOME.Lost
      ? "Game over"
      : "New game"
}</h1>

<Timer start={$outcome$ === GAME_OUTCOME.Ongoing} />

<h2>{$numFlagsLeftToPlace$} flags to go</h2>

<table>
  {#each Array(rows) as _, r}
    <tr>
    {#each Array(columns) as __, c}
      {@const cellData = $grid$?.[r]?.[c]}
      <td>
        <Cell
          value={cellData?.value}
          open={cellData?.open}
          flagged={cellData?.flagged}
          disabled={$outcome$ === GAME_OUTCOME.Lost}
          on:clicked={() => { onCellClicked(r, c); }}
          on:flagged={() => { onCellFlagToggled(r, c); }}
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