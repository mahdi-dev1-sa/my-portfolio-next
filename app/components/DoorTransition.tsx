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

// Leaving a specialization's page for another one: the page walks back OUT of its door first (DoorExit),
// then the home page opens, scrolls to the doors and walks in through the new door (DoorRush).
// This note tells the home page which door to walk into. It is only valid for a few seconds.
const QUEUE_KEY = "door:queued";

export function queueDoor(id: string) {
  try {
    sessionStorage.setItem(QUEUE_KEY, `${id}|${Date.now()}`);
  } catch {
    /* private mode: the home page will simply open normally */
  }
}

export function queuedDoor(): string | null {
  try {
    const [id, at] = (sessionStorage.getItem(QUEUE_KEY) ?? "").split("|");
    return id && Date.now() - Number(at) < 10000 ? id : null;
  } catch {
    return null;
  }
}

export function clearQueuedDoor() {
  try {
    sessionStorage.removeItem(QUEUE_KEY);
  } catch {
    /* nothing to clear */
  }
}
