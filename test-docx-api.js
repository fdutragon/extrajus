async function testDocx() {
  console.time('generate-docx');
  const html = '<div class="legal-node-level-1"><span class="legal-node-counter"></span><div class="legal-node-content">' + 'x'.repeat(100) + '</div></div>'.repeat(50);
  try {
    const res = await fetch('http://localhost:3000/api/billing/generate-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test',
        content: html
      })
    });
    const blob = await res.blob();
    console.timeEnd('generate-docx');
    console.log('Size:', blob.size);
  } catch(e) {
    console.timeEnd('generate-docx');
    console.error(e);
  }
}

testDocx();
