// A small bridge between the nav and the doors section (DoorRush).
// The nav asks for a door by its id; DoorRush answers by playing the whole scene.
export const DOOR_EVENT = "door:enter";

export type DoorRequest = { id: string; handled: boolean };

// Returns true when the doors section took the request (the nav must then NOT open the page itself).
export function requestDoor(id: string): boolean {
  const detail: DoorRequest = { id, handled: false };
  window.dispatchEvent(new CustomEvent<DoorRequest>(DOOR_EVENT, { detail }));
  return detail.handled;
}
