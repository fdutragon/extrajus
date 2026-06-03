import HTMLtoDOCX from 'html-to-docx';

async function test() {
  const html = '<div class="legal-node-level-1"><span class="legal-node-counter"></span><div class="legal-node-content">' + 'x'.repeat(100) + '</div></div>'.repeat(50);
  console.time('docx');
  const buffer = await HTMLtoDOCX(html, null, {
    title: 'Test',
    font: 'Cambria',
    margins: { top: 720, right: 1440, bottom: 1440, left: 1440 }
  });
  console.timeEnd('docx');
}
test();
