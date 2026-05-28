export function subjectHue(code: string): number {
  if (!code) return 0;
  let h = 0;
  for (let i = 0; i < code.length; i++) {
    h = (h * 131 + code.charCodeAt(i) * 17) % 360;
  }
  return h;
}

export type SubjectColors = { bg: string; stripe: string; text: string };

export function subjectColors(code: string): SubjectColors {
  const h = subjectHue(code);
  return {
    bg: `hsl(${h}, 70%, 95%)`,
    stripe: `hsl(${h}, 60%, 35%)`,
    text: `hsl(${h}, 55%, 20%)`,
  };
}
