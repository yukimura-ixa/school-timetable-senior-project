// ฟังก์ชั่นแปลงค่าจาก hex color เป็นค่า rgb format
// ตัวอย่าง
// input : #000000
// return : rgb(0,0,0)
export const hexToRGB: Function = (hex: string) => {
    let r: number;
    let g: number;
    let b: number;
    // ถ้าหากมีการใส่รูปย่อเช่น #000 จะให้ใช้สีเดียวกันตลอดทาง
    if (hex.length === 4) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(1, 3), 16);
        b = parseInt(hex.slice(1, 3), 16);
    } else { 
        // ทำการ String slice แบ่งเป็น 2 ตัว 3 ชุด
        // ตัวอย่าง #2F80ED จะได้ r = 2F g = 80 b = ED พวกนี้คือเลขฐาน 16
        // นำเหล่านี้มาแปลงเป็นเลขฐาน 10 แล้วเก็บใส่ตัวแปร
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    //จากนั้น Return ค่าออกไปเป็น object
    return { r: r, g: g, b: b };
};