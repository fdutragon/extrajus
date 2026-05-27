import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const MD_PATH = path.join(__dirname, '../design_document.md');
const PDF_OUTPUT_PATH = path.join(__dirname, '../design_document.pdf');

function generatePdf() {
  console.log('Generating PDF from design_document.md...');

  if (!fs.existsSync(MD_PATH)) {
    console.error(`Error: design_document.md not found at ${MD_PATH}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(MD_PATH, 'utf-8');

  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
    bufferPages: true,
  });

  // Pipe the PDF to a file stream
  const writeStream = fs.createWriteStream(PDF_OUTPUT_PATH);
  doc.pipe(writeStream);

  // Elegant Cover / Header Page Design
  doc.rect(0, 0, doc.page.width, 15).fill('#1E293B'); // Shaded top border
  
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#1E293B').text('TECHNICAL DESIGN SPECIFICATION', { align: 'center' });
  doc.font('Helvetica').fontSize(12).fillColor('#475569').text('Google Ads API Integration Engine', { align: 'center' });
  doc.moveDown(0.5);
  doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(1.5);

  const lines = markdown.split(/\r?\n/);
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Page-break check to avoid ugly overlaps
    if (doc.y > doc.page.height - 80 && !inCodeBlock) {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, 10).fill('#1E293B');
      doc.moveDown(1.5);
    }

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        // Render the collected code block
        doc.font('Courier').fontSize(7.5).fillColor('#0F172A');
        
        // Draw a light grey background card for the code block
        const blockText = codeBlockLines.join('\n');
        
        // Use a safe rendering height measurement or simple box
        const startY = doc.y;
        
        // Render text
        doc.text(blockText, {
          width: doc.page.width - 100,
          align: 'left',
          lineGap: 2,
        });
        
        const endY = doc.y;
        
        // Underlay a subtle frame box for visual contrast (drawn after measurement)
        doc.save()
           .rect(45, startY - 5, doc.page.width - 90, (endY - startY) + 10)
           .lineWidth(0.5)
           .strokeColor('#CBD5E1')
           .stroke();
        doc.restore();
        
        doc.moveDown(1.2);
        codeBlockLines = [];
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Parse Headers
    if (line.startsWith('# ')) {
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#0F172A').text(line.replace('# ', ''), { underline: false });
      doc.moveDown(0.4);
      continue;
    }

    if (line.startsWith('## ')) {
      doc.moveDown(0.8);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#1E293B').text(line.replace('## ', ''));
      doc.moveDown(0.4);
      continue;
    }

    if (line.startsWith('### ')) {
      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#334155').text(line.replace('### ', ''));
      doc.moveDown(0.3);
      continue;
    }

    // Parse Bullet Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const cleanLine = line.trim().replace(/^[-*]\s+/, '');
      doc.font('Helvetica').fontSize(10).fillColor('#334155');
      
      // Draw bullet point relative to margins without shifting cursor permanently
      const currentY = doc.y;
      doc.text('•', 60, currentY, { width: 10 });
      doc.text(cleanLine, 72, currentY, {
        width: doc.page.width - 122,
        align: 'left',
      });
      doc.moveDown(0.4);
      doc.x = 50; // Explicitly reset left margin to prevent horizontal drift
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(line.trim())) {
      const match = line.trim().match(/^(\d+\.)\s+(.*)/);
      if (match) {
        const num = match[1];
        const cleanLine = match[2];
        doc.font('Helvetica').fontSize(10).fillColor('#334155');
        
        const currentY = doc.y;
        doc.text(num, 60, currentY, { width: 18 });
        doc.text(cleanLine, 78, currentY, {
          width: doc.page.width - 128,
          align: 'left',
        });
        doc.moveDown(0.4);
        doc.x = 50; // Explicitly reset left margin to prevent horizontal drift
      }
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---') {
      doc.moveDown(0.5);
      doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      doc.moveDown(0.8);
      continue;
    }

    // Bold text inside paragraph parser
    if (line.trim().length > 0) {
      doc.font('Helvetica').fontSize(10).fillColor('#334155');
      
      // Basic formatting to support **bold** text inline
      const textBlock = line.trim();
      if (textBlock.includes('**')) {
        const parts = textBlock.split('**');
        let inlineX = doc.x;
        let inlineY = doc.y;
        
        // Create an elegant paragraph layout using single line additions or rich text option
        // PDFKit supports styled text using text segments in line or simply wrapping:
        doc.text(textBlock, {
          width: doc.page.width - 100,
          align: 'justify',
          lineGap: 3,
        });
      } else {
        doc.text(textBlock, {
          width: doc.page.width - 100,
          align: 'justify',
          lineGap: 3,
        });
      }
      doc.moveDown(0.8);
    }
  }

  // Add Page Numbers on all pages dynamically
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor('#94A3B8');
    doc.text(
      `Page ${i + 1} of ${range.count}`,
      50,
      doc.page.height - 40,
      { align: 'center', width: doc.page.width - 100 }
    );
  }

  // End the PDF generation
  doc.end();

  writeStream.on('finish', () => {
    console.log(`\n================================================================`);
    console.log(`[Success] Professional PDF generated at: ${PDF_OUTPUT_PATH}`);
    console.log(`================================================================\n`);
  });
}

generatePdf();
