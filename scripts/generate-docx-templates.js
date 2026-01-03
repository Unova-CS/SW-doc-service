// scripts/generate-docx-templates.js
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");

// Ensure templates-docx directory exists
const outputDir = path.join(__dirname, "../src/templates-docx");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper: Create a .docx file from text content
function createDocx(filename, content) {
  // Create a minimal XML-based DOCX in memory
  const doc = new Docxtemplater();
  doc.loadDoc(content, { raw: true });
  const buffer = doc.getZip().generate({ type: "nodebuffer" });
  fs.writeFileSync(path.join(outputDir, filename), buffer);
  console.log(`✅ Created: ${filename}`);
}

// Invoice Template
const invoiceContent = `
<p><strong>SMART-WAYS SOLUTIONS</strong><br>
Plot 9812/15a, Godfrey Chitalu Road, Nyumba Yanga, Lusaka<br>
Email: {{company_email}} | Phone: {{company_phone}}<br>
PACRA Registration No. {{pacra_number}}</p>

<h1 style="color:#F59A23;">INVOICE</h1>
<p><strong>Invoice No:</strong> {{number}}<br>
<strong>Date:</strong> {{invoice_date}}</p>

<h2>Bill To:</h2>
<p>{{client_name}}<br>{{client_phone}}</p>

{#items}
<p>{{description}} — ZMW {{price}}</p>
{/items}

<p><strong>Subtotal:</strong> ZMW {{subtotal}}<br>
<strong>Tax (20%):</strong> ZMW {{tax}}<br>
<strong>Grand Total:</strong> ZMW {{final_price}}</p>
`;

// Quotation Template
const quotationContent = `
<p><strong>SMART-WAYS SOLUTIONS</strong><br>
Plot 9812/15a, Godfrey Chitalu Road, Nyumba Yanga, Lusaka<br>
Email: {{company_email}} | Phone: {{company_phone}}<br>
PACRA Registration No. {{pacra_number}}</p>

<h1 style="color:#F59A23;">QUOTATION</h1>
<p><strong>Quotation No:</strong> {{number}}<br>
<strong>Date:</strong> {{date}}<br>
<strong>Valid Until:</strong> {{valid_until}}</p>

<h2>Prepared For:</h2>
<p>{{client_name}}<br>{{client_address}}</p>

{#items}
<p>{{description}} — ZMW {{price}}</p>
{/items}

<p><strong>Total:</strong> ZMW {{total_price}}</p>

<p><em>Acceptance: Please sign and return to confirm.</em></p>
`;

// Letterhead Template
const letterheadContent = `
<p><strong>SMART-WAYS SOLUTIONS</strong><br>
Plot 9812/15a, Godfrey Chitalu Road, Nyumba Yanga, Lusaka<br>
Email: {{company_email}} | Phone: {{company_phone}}<br>
PACRA Registration No. {{pacra_number}}</p>

<hr style="border:0; border-top:2px solid #F59A23; margin:20px 0;">

<p>{{date}}</p>

<p>To: {{to_name}}<br>{{to_address}}</p>

<p>{{content}}</p>

<p>Best Regards,<br>{{sender_name}}</p>
`;

// Generate files
try {
  // Note: docxtemplater requires XML, but we can inject HTML-like content as fallback
  // For true DOCX, manual creation in Word is better — this is a fallback
  fs.writeFileSync(path.join(outputDir, "invoice.txt"), invoiceContent);
  fs.writeFileSync(path.join(outputDir, "quotation.txt"), quotationContent);
  fs.writeFileSync(path.join(outputDir, "letterhead.txt"), letterheadContent);
  
  console.log("\n⚠️  DOCX files require manual creation in Microsoft Word or LibreOffice.");
  console.log("📝 Use the .txt files above as reference to create real .docx templates:");
  console.log("   - Open Word");
  console.log("   - Paste content");
  console.log("   - Save as .docx in src/templates-docx/");
  console.log("\n📁 Templates directory:", outputDir);
} catch (err) {
  console.error("Error generating templates:", err);
}