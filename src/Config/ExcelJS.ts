import { Workbook } from "exceljs"
import { Response } from "express"


export const ExportToExcel = async(record: {}[], fileName: string, res: Response) => {
    if(record.length === 0){
        throw new Error("ExportToExcel Error: No Data to Parse")
    }

    const workBook = new Workbook()
    const sheet = workBook.addWorksheet(fileName)

    const headers = Object.keys(record[0]) // Add Header
    sheet.addRow(headers)
    record.forEach(element => {
        sheet.addRow(Object.values(element))
    })

    const headerRow = sheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
        cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E88E5" }, // blue background
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
        };
    });
    
    sheet.eachRow((row, rowNumber) => {
        row.eachCell(cell => {
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
        cell.alignment = { horizontal: "left", vertical: "middle" };
        });

        // Optional: Add alternate background color for even rows
        if (rowNumber % 2 === 0 && rowNumber !== 1) {
        row.eachCell(cell => {
            cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F3F3" }, // light gray background
            };
        });
        }
    });

    sheet.columns?.forEach(col => {
        const column = col as any;
        let maxLength = 0;

        column.eachCell?.({ includeEmpty: true }, (cell: any) => {
            const cellValue = cell.value ? cell.value.toString() : "";
            maxLength = Math.max(maxLength, cellValue.length);
        });

        column.width = maxLength < 15 ? 15 : maxLength + 2;
    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}.xlsx"`
    )
    await workBook.xlsx.write(res)
    res.end()
}