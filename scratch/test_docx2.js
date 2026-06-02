const HTMLtoDOCX = require('html-to-docx');
const fs = require('fs');

async function test() {
  const html = `
    <h1>Hello World</h1>
    <p>This is a test document generated with <b>html-to-docx</b>.</p>
  `;
  const fileBuffer = await HTMLtoDOCX(html, null, {
    title: 'Test Document',
    margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch
  });
  fs.writeFileSync('test.docx', fileBuffer);
  console.log('Success! Saved to test.docx');
}

test();
