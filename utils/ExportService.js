import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

class ExportService {
  static exportToExcel(data, filename = "report.xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filename);
  }

  static exportToPdf(data, headers, filename = "report.pdf") {
    const doc = new jsPDF();

    const tableData = data.map((item, index) => [
      index + 1,
      item.ArticalNo,
      item.BalanceQty1,
    ]);

    doc.autoTable({
      head: [headers],
      body: tableData,
    });

    doc.save(filename);
  }
}

export default ExportService;
