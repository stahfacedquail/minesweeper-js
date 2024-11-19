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
  /** How many mines should be placed in the grid? */
  export let numMines: number;

  const outcome$ = writable<GameOutcome>();

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

      const grid = generateGrid(rows, columns, numMines, [row, col]);
      $grid$.forEach((row, r) => {
        row.forEach((cell, c) => {
          $grid$[r][c].value = grid[r][c]
        })
      });
    }

    $grid$[row][col].open = true;

    const cell = $grid$[row][col];
    if (typeof cell.value === "number") {
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
    const neighbours = getAllNeighbours($grid$, row, col);
    const bombNeighbours = neighbours.filter((n) => n.value === "X");
    const hasSomeBombNeighbours = bombNeighbours.length > 0;
    if ($grid$[row][col].value === 0 && hasSomeBombNeighbours) {
      return;
    } else if (typeof $grid$[row][col].value === "number" && hasSomeBombNeighbours) {
      const numNeighboursFlagged = neighbours.filter((n) => n.flagged).length;
      const enoughFlagsForBombNeighbours = bombNeighbours.length === numNeighboursFlagged;
      if (!enoughFlagsForBombNeighbours) return;
    }

    NEIGHBOUR_POSITIONS.forEach((neighbourPos) => {
      if (getNeighbour(neighbourPos, $grid$, row, col) !== undefined) {
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

          if ($grid$[neighbourRow][neighbourCol].value === 0)
            openNeighbours(neighbourRow, neighbourCol);
        }
      }
    });
  }

  function checkGrid(rowClicked: number, colClicked: number) {
    // Check 1: Is the cell that just got clicked on a mine?  Immediate loss.
    const clickedCell = $grid$[rowClicked][colClicked];
    if (clickedCell.value === "X" && clickedCell.open) {
      outcome$.set(GRID_STATE.Lost);
      return;
    }

    // Check 2: Are any cells open that are mines?
    // (strictly not a necessary check as nothing should open a mine cell but the user, but hey...)
    const openMine = $grid$.some((row) => row.some((cell) => cell.value === "X" && cell.open));
    if (openMine) {
      outcome$.set(GRID_STATE.Lost);
      return;
    }

    // Check 3: Are all of the unopened cells mines?  Win :)
    const unopenedCells = $grid$.reduce((listOfCells, row) => {
      return listOfCells.concat(row.filter((cell) => !cell.open));
    }, [] as (typeof $grid$[number][number])[]);
    const unopenedCellsAreAllMines = unopenedCells.every((cell) => cell.value === "X");
    if (unopenedCellsAreAllMines) {
      outcome$.set(GRID_STATE.Won);
      return;
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
  stop={$outcome$ === GRID_STATE.Lost || $outcome$ === GRID_STATE.Won}
  reset={$outcome$ === GRID_STATE.PreStart}
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