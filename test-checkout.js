async function testCheckout() {
  console.time('checkout-doc');
  try {
    const res = await fetch('http://localhost:3000/api/billing/checkout-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cliente Teste',
        email: 'test@extrajus.com',
        content: '<p>Test doc content</p>',
        doc_type: 'contrato',
        title: 'Test Title'
      })
    });
    const data = await res.json();
    console.timeEnd('checkout-doc');
    console.log(data);
  } catch(e) {
    console.timeEnd('checkout-doc');
    console.error(e);
  }
}

testCheckout();
