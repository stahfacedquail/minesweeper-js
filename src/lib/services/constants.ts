import type { NeighbourPositions } from "$lib/services/types";

export const NEIGHBOUR_POSITIONS: NeighbourPositions[] = ["TL", "TC", "TR", "ML", "MR", "BL", "BC", "BR"];

export const GRID_STATE = {
  Won: "Won",
  Lost: "Lost",
  PreStart: "PreStart",
  Ongoing: "Ongoing",
  Uninitialised: "Uninitialised",
} as const;