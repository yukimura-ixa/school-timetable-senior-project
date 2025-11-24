// jest.polyfills.ts
import { TextEncoder, TextDecoder } from "util";

// Text encoding (required by Prisma and other libs)
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
