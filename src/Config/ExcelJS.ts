import { Workbook } from "exceljs";
import { Response } from "express";

export const ExportToExcel = async (
  record: any[],
  fileName: string,
  res: Response
) => {
  if (record.length === 0) {
    throw new Error("ExportToExcel Error: No Data to Parse");
  }

  const workbook = new Workbook();
  const sheet = workbook.addWorksheet("Scholarship Grantees");

  // === HEADER TITLES (top text area) ===
  sheet.mergeCells("A1", "E1");
  sheet.mergeCells("A2", "E2");
  sheet.mergeCells("A3", "E3");
  sheet.mergeCells("A4", "E4");

  const title1 = sheet.getCell("A1");
  title1.value = "Republic of the Philippines";
  title1.font = { bold: true, size: 12 };
  title1.alignment = { horizontal: "center" };

  const title2 = sheet.getCell("A2");
  title2.value = "BULACAN AGRICULTURAL STATE COLLEGE";
  title2.font = { bold: true, size: 14 };
  title2.alignment = { horizontal: "center" };

  const title3 = sheet.getCell("A3");
  title3.value = "Office of Student Affairs and Services";
  title3.font = { italic: true, size: 11 };
  title3.alignment = { horizontal: "center" };

  const title4 = sheet.getCell("A4");
  title4.value = "Senator Win Gatchalian Scholarship Program Grantees";
  title4.font = { bold: true, size: 13 };
  title4.alignment = { horizontal: "center" };

  // Add an extra line for semester and range (e.g., “FIRST SEMESTER A.Y. 2025–2026 (M–Z)”)
  sheet.mergeCells("A5", "E5");
  const subtitle = sheet.getCell("A5");
  subtitle.value = "FIRST SEMESTER A.Y. 2025–2026 (M–Z)";
  subtitle.font = { bold: true, size: 12 };
  subtitle.alignment = { horizontal: "center" };

  // Add spacing
  sheet.addRow([]);

  // === COLUMN HEADERS ===
  const headers = ["No.", "Last Name", "First Name", "Middle Initial", "Course"];
  const headerRow = sheet.addRow(headers);
  headerRow.height = 20;

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4A4A4A" }, // dark gray background
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // === ADD DATA ROWS ===
  record.forEach((item, index) => {
    const rowValues = [
      index + 1,
      item.lastName || "",
      item.firstName || "",
      item.middleInitial || "",
      item.course || "",
    ];
    const row = sheet.addRow(rowValues);

    row.eachCell((cell) => {
      cell.font = { size: 11 };
      cell.alignment = { vertical: "middle", horizontal: "left" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // === AUTO SIZE COLUMNS ===
  sheet.columns?.forEach((col) => {
    let maxLength = 0;
    if (col.eachCell) {
        col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
        });
    }
    col.width = maxLength < 12 ? 12 : maxLength + 2;
  });

  // === SAVE AS EXCEL DOWNLOAD ===
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
};
