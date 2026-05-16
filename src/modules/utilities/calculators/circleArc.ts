export interface CircleArcResult {
  circumference: number;
  area: number;
  arcLength: number | null;
  chordLength: number | null;
}

export function calculateCircleArc(radius: number, angle?: number): CircleArcResult {
  const circumference = 2 * Math.PI * radius;
  const area = Math.PI * radius * radius;

  let arcLength: number | null = null;
  let chordLength: number | null = null;

  if (angle !== undefined) {
    arcLength = (angle / 360) * circumference;
    chordLength = 2 * radius * Math.sin((angle / 2) * (Math.PI / 180));
  }

  return { circumference, area, arcLength, chordLength };
}
