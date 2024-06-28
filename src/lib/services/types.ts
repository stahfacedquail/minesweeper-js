import type { GAME_OUTCOME } from "$lib/services/constants";

export type NeighbourPositions = `${"T" | "B"}${"L" | "C" | "R"}` | `M${"L" | "R"}`;
export type GameOutcome = keyof typeof GAME_OUTCOME;
export type CellValue = "X" | number;