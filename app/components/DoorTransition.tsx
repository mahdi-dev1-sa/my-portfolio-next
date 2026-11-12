import "../doors.css";

// How long the door scene plays before the new page opens (matches the timeline in doors.css)
export const DOOR_MS = 2900;

// "Magic happens...": two doors, the left one swings open, and we walk through it.
// It sits on top of the page while a specialization page is being opened.
export default function DoorTransition() {
  return (
    <div className="door-scene" aria-hidden="true">
      <div className="door-sky" />
      <p className="door-text">
        <span>Magic happens…</span>
      </p>

      <div className="door-stage">
        {/* the door that opens */}
        <div className="door">
          <div className="door-frame">
            <div className="door-room" />
            <div className="door-leaf door-leaf-left">
              <i className="door-panel" />
              <i className="door-knob" />
            </div>
          </div>
        </div>
        {/* the door that stays closed */}
        <div className="door">
          <div className="door-frame">
            <div className="door-leaf">
              <i className="door-panel" />
              <i className="door-knob door-knob-left" />
            </div>
          </div>
        </div>
      </div>

      <div className="door-light" />
      <div className="door-cover" />
    </div>
  );
}
