// ฟังก์ชั่นแปลงค่าจาก hex color เป็นค่า rgb format
// ตัวอย่าง
// input : #000000
// return : rgb(0,0,0)
export const hexToRGB: Function = (hex: string) => {
    let r: number;
    let g: number;
    let b: number;
    if (hex.length === 4) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(1, 3), 16);
        b = parseInt(hex.slice(1, 3), 16);
    } else {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return { r: r, g: g, b: b };
};