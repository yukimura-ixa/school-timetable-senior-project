// Render the same slot content as page.tsx. Without this, a hard navigation
// or refresh that doesn't match this parallel-route slot (e.g. returning to
// /arrange after a room-select sub-route) falls back to default and the grid
// goes blank. default must mirror page so the slot content persists.
export { default } from "./page";
