import * as XLSX from "xlsx";

export function downloadExcel(
  headers: string[],
  rows: (string | number)[][],
  filename: string,
  sheetName: string = "Report"
) {
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  const colWidths = headers.map((h, i) => {
    let max = h.length;
    for (const row of rows) {
      const cellLen = String(row[i] || "").length;
      if (cellLen > max) max = cellLen;
    }
    return { wch: Math.min(max + 2, 40) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function downloadMultiSheetExcel(
  sheets: { name: string; headers: string[]; rows: (string | number)[][] }[],
  filename: string
) {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const data = [sheet.headers, ...sheet.rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const colWidths = sheet.headers.map((h, i) => {
      let max = h.length;
      for (const row of sheet.rows) {
        const cellLen = String(row[i] || "").length;
        if (cellLen > max) max = cellLen;
      }
      return { wch: Math.min(max + 2, 40) };
    });
    ws["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  }
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
