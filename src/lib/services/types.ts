import type { GRID_STATE } from "$lib/services/constants";

export type NeighbourPositions = `${"T" | "B"}${"L" | "C" | "R"}` | `M${"L" | "R"}`;
export type GameOutcome = keyof typeof GRID_STATE;
export type CellValue = "X" | number;