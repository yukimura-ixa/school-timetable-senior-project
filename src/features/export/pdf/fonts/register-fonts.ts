// Server-only module. Imported indirectly by the PDF API route; never
// pulled into the client bundle. Uses node:path + the project cwd to
// resolve fonts that ship under public/fonts/.
import { Font } from "@react-pdf/renderer";
import path from "node:path";

// @react-pdf/font calls node:fs.readFile(src) with the registered string.
// A relative URL like "/fonts/Sarabun-Regular.ttf" gets resolved against
// process.cwd() drive root (e.g. "B:\fonts\..."), producing ENOENT. Pass
// the absolute path under public/fonts so it works in dev and on Vercel
// (process.cwd() is the project root in both).
const fontDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Sarabun",
  fonts: [
    {
      src: path.join(fontDir, "Sarabun-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: path.join(fontDir, "Sarabun-Bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

export const thaiTextStyle = {
  fontFamily: "Sarabun",
};

export const thaiBoldStyle = {
  fontFamily: "Sarabun",
  fontWeight: "bold" as const,
};
