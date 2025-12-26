"use client";

/**
 * SemesterExportButton Component
 * Export semester data to CSV/Excel with filters
 */

import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  FileDownload as DownloadIcon,
  TableChart as ExcelIcon,
  Description as CSVIcon,
  PictureAsPdf as PDFIcon,
} from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { type SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";
import {
  arrayToCSV,
  arrayToExcelHTML,
  downloadCSV,
  downloadExcel,
  formatThaiDate,
  formatSemester,
  formatStatusThai,
} from "@/utils/export.utils";

type Props = {
  semesters: SemesterDTO[];
  title?: string;
};

export function SemesterExportButton({
  semesters,
  title: _title = "Semester Export",
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const prepareExportData = () => {
    return semesters.map((semester) => ({
      ภาคเรียน: formatSemester(semester.semester, semester.academicYear),
      ปีการศึกษา: semester.academicYear,
      สถานะ: formatStatusThai(semester.status),
      "ความสมบูรณ์ (%)": semester.configCompleteness,
      ห้องเรียน: semester.classCount || 0,
      ครู: semester.teacherCount || 0,
      วิชา: semester.subjectCount || 0,
      ห้อง: semester.roomCount || 0,
      ปักหมุด: semester.isPinned ? "ใช่" : "ไม่",
      เข้าถึงล่าสุด: semester.lastAccessedAt
        ? formatThaiDate(semester.lastAccessedAt)
        : "-",
      สร้างเมื่อ: formatThaiDate(semester.createdAt),
      อัปเดตเมื่อ: formatThaiDate(semester.updatedAt),
    }));
  };

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      const data = prepareExportData();
      const csv = arrayToCSV(data);
      const timestamp = new Date().toISOString().split("T")[0];
      downloadCSV(csv, `semesters-${timestamp}.csv`);
      enqueueSnackbar(`ส่งออก CSV สำเร็จ (${semesters.length} รายการ)`, {
        variant: "success",
      });
    } catch (error) {
      console.error("Export CSV error:", error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการส่งออก CSV", { variant: "error" });
    } finally {
      setIsExporting(false);
      handleCloseMenu();
    }
  };

  const handleExportExcel = () => {
    try {
      setIsExporting(true);
      const data = prepareExportData();
      const timestamp = new Date().toISOString().split("T")[0];
      const html = arrayToExcelHTML(
        data,
        undefined,
        `รายการภาคเรียน - ${timestamp}`,
      );
      downloadExcel(html, `semesters-${timestamp}.xls`);
      enqueueSnackbar(`ส่งออก Excel สำเร็จ (${semesters.length} รายการ)`, {
        variant: "success",
      });
    } catch (error) {
      console.error("Export Excel error:", error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการส่งออก Excel", { variant: "error" });
    } finally {
      setIsExporting(false);
      handleCloseMenu();
    }
  };

  const handleExportSummary = () => {
    try {
      setIsExporting(true);

      // Create summary statistics
      const totalSemesters = semesters.length;
      const byStatus = semesters.reduce(
        (acc, s) => {
          acc[s.status] = (acc[s.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const avgCompleteness =
        semesters.reduce((sum, s) => sum + s.configCompleteness, 0) /
        totalSemesters;

      const summary = {
        ทั้งหมด: totalSemesters,
        แบบร่าง: byStatus.DRAFT || 0,
        เผยแพร่: byStatus.PUBLISHED || 0,
        ล็อก: byStatus.LOCKED || 0,
        เก็บถาวร: byStatus.ARCHIVED || 0,
        ความสมบูรณ์เฉลี่ย: `${avgCompleteness.toFixed(1)}%`,
        สร้างเมื่อ: formatThaiDate(new Date()),
      };

      const timestamp = new Date().toISOString().split("T")[0];
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>สรุปภาคเรียน - ${timestamp}</title>
  <style>
    body {
      font-family: 'Sarabun', Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 { color: #2c3e50; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
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
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .summary-card {
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #7f8c8d;
      font-size: 14px;
    }
    .summary-card p {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      color: #2c3e50;
    }
    @media print {
      body { margin: 20px; }
    }
  </style>
</head>
<body>
  <h1>สรุปข้อมูลภาคเรียน</h1>
  <p><strong>วันที่สร้างรายงาน:</strong> ${formatThaiDate(new Date())}</p>
  
  <h2>สรุปภาพรวม</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <h3>ทั้งหมด</h3>
      <p>${summary.ทั้งหมด}</p>
    </div>
    <div class="summary-card">
      <h3>เผยแพร่</h3>
      <p>${summary.เผยแพร่}</p>
    </div>
    <div class="summary-card">
      <h3>ความสมบูรณ์เฉลี่ย</h3>
      <p>${summary.ความสมบูรณ์เฉลี่ย}</p>
    </div>
  </div>

  <h2>จำนวนตามสถานะ</h2>
  <table>
    <tr><th>สถานะ</th><th>จำนวน</th></tr>
    <tr><td>แบบร่าง</td><td>${summary.แบบร่าง}</td></tr>
    <tr><td>เผยแพร่</td><td>${summary.เผยแพร่}</td></tr>
    <tr><td>ล็อก</td><td>${summary.ล็อก}</td></tr>
    <tr><td>เก็บถาวร</td><td>${summary.เก็บถาวร}</td></tr>
  </table>

  <h2>รายละเอียดทั้งหมด</h2>
  ${arrayToExcelHTML(prepareExportData())}
</body>
</html>
      `;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");

      if (printWindow) {
        printWindow.addEventListener("load", () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        });
      }

      enqueueSnackbar("เปิดหน้าต่างพิมพ์สำหรับส่งออก PDF", {
        variant: "info",
      });
    } catch (error) {
      console.error("Export summary error:", error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการสร้างสรุป", { variant: "error" });
    } finally {
      setIsExporting(false);
      handleCloseMenu();
    }
  };

  if (semesters.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={
          isExporting ? <CircularProgress size={20} /> : <DownloadIcon />
        }
        onClick={handleOpenMenu}
        disabled={isExporting}
      >
        ส่งออกข้อมูล
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <CSVIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ส่งออก CSV</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ส่งออก Excel</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleExportSummary}>
          <ListItemIcon>
            <PDFIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>พิมพ์สรุป (PDF)</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
