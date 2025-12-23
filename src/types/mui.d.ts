import "@mui/material/styles";

type SlatePalette = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

type GlassPalette = {
  main: string;
  light: string;
  dark: string;
  border: string;
  borderLight: string;
};

declare module "@mui/material/styles" {
  interface PaletteColor {
    lighter?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
  }

  interface Palette {
    slate: SlatePalette;
    glass: GlassPalette;
  }

  interface PaletteOptions {
    slate?: SlatePalette;
    glass?: GlassPalette;
  }
}
