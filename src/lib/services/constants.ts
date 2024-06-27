import type { NeighbourPositions } from "$lib/services/types";

export const NEIGHBOUR_POSITIONS: NeighbourPositions[] = ["TL", "TC", "TR", "ML", "MR", "BL", "BC", "BR"];

export const GAME_OUTCOME = {
  Won: "Won",
  Lost: "Lost",
  PreStart: "PreStart",
  Ongoing: "Ongoing",
} as const;