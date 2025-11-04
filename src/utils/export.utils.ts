/**
 * Export Utilities
 * Functions for exporting data to CSV, Excel, and PDF formats
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: Record<keyof T, string>
): string {
  if (data.length === 0) return "";

  const keys = Object.keys(data[0] || {}) as Array<keyof T>;
  const headerRow = headers
    ? keys.map((key) => headers[key] || String(key))
    : keys.map(String);

  const csvRows = [
    headerRow.join(","),
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          // Handle values that might contain commas or quotes
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(
  data: string,
  filename: string = "export.csv"
): void {
  const blob = new Blob(["\uFEFF" + data], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Download JSON file
 */
export function downloadJSON(
  data: any,
  filename: string = "export.json"
): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Format Thai date for exports
 */
export function formatThaiDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format semester display
 */
export function formatSemester(semester: string | number, year: number): string {
  const semesterNum = typeof semester === "number" 
    ? semester.toString() 
    : semester.replace("SEMESTER_", "");
  return `${semesterNum}/${year}`;
}

/**
 * Format status in Thai
 */
export function formatStatusThai(
  status: "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED"
): string {
  const statusMap = {
    DRAFT: "แบบร่าง",
    PUBLISHED: "เผยแพร่",
    LOCKED: "ล็อก",
    ARCHIVED: "เก็บถาวร",
  };
  return statusMap[status] || status;
}

/**
 * Convert array of objects to Excel-compatible format
 * Uses HTML table that Excel can parse
 */
export function arrayToExcelHTML<T extends Record<string, any>>(
  data: T[],
  headers?: Record<keyof T, string>,
  title?: string
): string {
  if (data.length === 0) return "";

  const keys = Object.keys(data[0] || {}) as Array<keyof T>;
  const headerRow = headers
    ? keys.map((key) => headers[key] || String(key))
    : keys.map(String);

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; font-weight: bold; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    h1 { color: #333; }
  </style>
</head>
<body>
`;

  if (title) {
    html += `  <h1>${title}</h1>\n`;
  }

  html += `  <table>\n    <thead>\n      <tr>\n`;

  headerRow.forEach((header) => {
    html += `        <th>${header}</th>\n`;
  });

  html += `      </tr>\n    </thead>\n    <tbody>\n`;

  data.forEach((row) => {
    html += `      <tr>\n`;
    keys.forEach((key) => {
      const value = row[key];
      html += `        <td>${value !== null && value !== undefined ? value : ""}</td>\n`;
    });
    html += `      </tr>\n`;
  });

  html += `    </tbody>\n  </table>\n</body>\n</html>`;

  return html;
}

/**
 * Download Excel file (HTML format that Excel can open)
 */
export function downloadExcel(
  data: string,
  filename: string = "export.xls"
): void {
  const blob = new Blob([data], {
    type: "application/vnd.ms-excel",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Print element as PDF
 * Opens print dialog with element content
 */
export function printElementAsPDF(
  elementId: string,
  title: string = "Export"
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Failed to open print window");
    return;
  }

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body {
      font-family: 'Sarabun', Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #4CAF50;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    @media print {
      body {
        margin: 0;
      }
      button {
        display: none;
      }
    }
  </style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
