export type MovePlan = "noop" | "conflict" | "move-keep-room" | "move-pick-room";

/**
 * Decide what dropping a placed class onto a target timeslot should do.
 * Pure: the caller supplies validateDropAction's verdict + available room ids.
 */
export function planPlacementMove(args: {
  fromTimeslot: string;
  targetTimeslot: string;
  allowed: boolean;
  currentRoomId: number;
  availableRoomIds: number[];
}): MovePlan {
  if (args.targetTimeslot === args.fromTimeslot) return "noop";
  if (!args.allowed) return "conflict";
  return args.availableRoomIds.includes(args.currentRoomId)
    ? "move-keep-room"
    : "move-pick-room";
}
