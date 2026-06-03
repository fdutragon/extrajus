import HTMLtoDOCX from 'html-to-docx';

function compileWordHtml(title, rawHtml) {
  let styledHtml = rawHtml.replace(/^(<p><\/p>|<p><br><\/p>|\s|<br>)+/gi, '').trim();
  let c1 = 0; let c2 = 0; let c3 = 0; let c4 = 0;
  function toRoman(num) {
    const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (const i of Object.keys(roman)) {
      const q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }
    return str;
  }
  function toAlpha(num) { return String.fromCharCode(96 + num); }

  styledHtml = styledHtml.replace(/<div([^>]*class="[^"]*legal-node-level-(\d)[^"]*"[^>]*)>[\s\S]*?<span class="legal-node-counter"[^>]*><\/span>[\s\S]*?<div class="legal-node-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi, (match, divAttrs, levelStr, innerContent) => {
    const level = parseInt(levelStr, 10);
    let counterText = '';
    let style = "font-family: 'Cambria', serif; text-align: justify; line-height: 1.15; ";
    if (level === 1) { c1++; c2 = 0; c3 = 0; c4 = 0; counterText = `Cláusula ${c1} — `; style += "margin-top: 12.0pt; margin-bottom: 6.0pt; font-weight: bold; text-transform: uppercase;"; }
    else if (level === 2) { c2++; c3 = 0; c4 = 0; counterText = `§ ${c2}º — `; style += "margin-top: 0; margin-bottom: 3.0pt; margin-left: 24.0pt;"; }
    return `<p style="${style}"><span style="font-weight: bold;">${counterText}</span>${innerContent}</p>`;
  });
  return styledHtml;
}

async function test() {
  const html = '<div class="legal-node-level-1"><span class="legal-node-counter"></span><div class="legal-node-content">' + 'x'.repeat(100) + '</div></div>'.repeat(50);
  console.time('regex+docx');
  const cleanHtml = compileWordHtml('Test', html);
  const buffer = await HTMLtoDOCX(cleanHtml, null, {
    title: 'Test',
    font: 'Cambria',
    margins: { top: 720, right: 1440, bottom: 1440, left: 1440 }
  });
  console.timeEnd('regex+docx');
}
test();
