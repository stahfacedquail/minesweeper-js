<script lang="ts">
  import Cell from "$lib/components/Cell.svelte";
  import Timer from "$lib/components/Timer.svelte";
  import { NEIGHBOUR_POSITIONS, GRID_STATE } from "$lib/services/constants";
  import { generateGrid, getAllNeighbours, getNeighbour } from "$lib/services/grid";
  import type { CellValue, GameOutcome } from "$lib/services/types";
  import { onMount } from "svelte";
  import { derived, writable } from "svelte/store";

  export let rows: number;
  export let columns: number;
  export let numMines: number;

  const outcome$ = writable<GameOutcome>();

  let grid: ReturnType<typeof generateGrid>;
  const grid$ = writable<{
    value?: CellValue,
    open: boolean,
    flagged: boolean,
  }[][]>();

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

  function createNewGame() {
    outcome$.set(GRID_STATE.PreStart);
    grid$.set(Array.from({ length: rows },
      () => new Array(columns)
        .fill(null)
        .map(() => ({ value: undefined, open: false, flagged: false }))
    ));
  }

  function onCellClicked(row: number, col: number) {
    if ($outcome$ === GRID_STATE.PreStart || $outcome$ === GRID_STATE.Uninitialised) {
      outcome$.set(GRID_STATE.Ongoing);

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
    if ($outcome$ === GRID_STATE.PreStart) {
      outcome$.set(GRID_STATE.Uninitialised);
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
      outcome$.set(GRID_STATE.Lost);
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
      outcome$.set(GRID_STATE.Won);
    }
  }

  onMount(createNewGame);
</script>

<h1 style:visibility={ $outcome$ === GRID_STATE.Won || $outcome$ === GRID_STATE.Lost ? "visible" : "hidden" }>{
  $outcome$ === GRID_STATE.Won
    ? "Yay!  You won :)"
    : $outcome$ === GRID_STATE.Lost
      ? "Game over"
      : "New game"
}</h1>

<Timer
  start={$outcome$ === GRID_STATE.Ongoing || $outcome$ === GRID_STATE.Uninitialised}
  stop={$outcome$ === GRID_STATE.Lost || $outcome$ === GRID_STATE.Won || $outcome$ === GRID_STATE.PreStart}
/>

<h2>{$numFlagsLeftToPlace$} flags to go</h2>

<button on:click={createNewGame}>New game</button>

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
          disabled={$outcome$ === GRID_STATE.Lost}
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