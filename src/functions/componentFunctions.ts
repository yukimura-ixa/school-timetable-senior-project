// ฟังก์ชั่นแปลงค่าจาก hex color เป็นค่า rgb format
// ตัวอย่าง
// input : #000000
// return : rgb(0,0,0)

type RGBColor = {
  r: number;
  g: number;
  b: number;
};

export const hexToRGB = (hex: string): RGBColor => {
  if (typeof hex !== "string") {
    throw new Error("Invalid hex color format");
  }

  const normalizedHex = hex.trim();
  const shorthandRegex = /^#([0-9a-fA-F]{3})$/;
  const fullRegex = /^#([0-9a-fA-F]{6})$/;

  if (!shorthandRegex.test(normalizedHex) && !fullRegex.test(normalizedHex)) {
    throw new Error("Invalid hex color format");
  }

  const expandShorthand = (value: string): string => value + value;

  const [rHex, gHex, bHex] =
    normalizedHex.length === 4
      ? normalizedHex
          .slice(1)
          .split("")
          .map((char) => expandShorthand(char))
      : [
          normalizedHex.slice(1, 3),
          normalizedHex.slice(3, 5),
          normalizedHex.slice(5, 7),
        ];

  return {
    r: parseInt(rHex || "0", 16),
    g: parseInt(gHex || "0", 16),
    b: parseInt(bHex || "0", 16),
  };
};
