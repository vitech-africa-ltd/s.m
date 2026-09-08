/**
 * Professional print function with optimized styles
 */
export function printProfessional(content: string, title: string = "Document") {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    alert("Please allow popups for printing");
    return;
  }

  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1a2c51;
        padding: 40px;
        line-height: 1.6;
      }
      .print-header {
        text-align: center;
        border-bottom: 3px solid #1e49c9;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .print-header h1 {
        color: #1e49c9;
        font-size: 28px;
        margin-bottom: 10px;
      }
      .print-header .school-info {
        color: #6f90c2;
        font-size: 14px;
      }
      .print-content {
        margin: 20px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      table th {
        background: #1e49c9;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: 600;
      }
      table td {
        padding: 10px;
        border-bottom: 1px solid #dee7f3;
      }
      table tr:nth-child(even) {
        background: #f8f9fc;
      }
      .print-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #dee7f3;
        text-align: center;
        color: #6f90c2;
        font-size: 12px;
      }
      .signature-section {
        margin-top: 60px;
        display: flex;
        justify-content: space-between;
      }
      .signature-box {
        width: 45%;
        text-align: center;
      }
      .signature-line {
        border-top: 2px solid #1a2c51;
        margin-top: 60px;
        padding-top: 10px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      .stat-card {
        background: #f8f9fc;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #1e49c9;
      }
      .stat-card h3 {
        color: #6f90c2;
        font-size: 14px;
        margin-bottom: 10px;
      }
      .stat-card .value {
        color: #1e49c9;
        font-size: 24px;
        font-weight: bold;
      }
      @media print {
        body { padding: 20px; }
        .no-print { display: none; }
      }
    </style>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      ${styles}
    </head>
    <body>
      ${content}
      <div class="print-footer no-print">
        <button onclick="window.print()" style="padding: 10px 30px; background: #1e49c9; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Print Document
        </button>
        <button onclick="window.close()" style="padding: 10px 30px; background: #6f90c2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin-left: 10px;">
          Close
        </button>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => window.print(), 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Generate print header
 */
export function generatePrintHeader(schoolName: string, schoolInfo: string): string {
  return `
    <div class="print-header">
      <h1>${schoolName}</h1>
      <div class="school-info">${schoolInfo}</div>
    </div>
  `;
}

/**
 * Generate print footer
 */
export function generatePrintFooter(): string {
  const date = new Date().toLocaleDateString();
  return `
    <div class="print-footer">
      <p>Generated on ${date}</p>
      <p>VITECH School Management System</p>
    </div>
  `;
}

/**
 * Generate signature section
 */
export function generateSignatureSection(): string {
  return `
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">
          <p>Authorized Signature</p>
        </div>
      </div>
      <div class="signature-box">
        <div class="signature-line">
          <p>Date & Stamp</p>
        </div>
      </div>
    </div>
  `;
}
