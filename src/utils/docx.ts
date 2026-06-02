import HTMLtoDOCX from 'html-to-docx';

export function compileWordHtml(title: string, rawHtml: string): string {
  // Inject Legal Node Counters (Word HTML engine doesn't support CSS counters well)
  let styledHtml = rawHtml.replace(/^(<p><\/p>|<p><br><\/p>|\s|<br>)+/gi, '').trim();
  let c1 = 0;
  let c2 = 0;
  let c3 = 0;
  let c4 = 0;

  function toRoman(num: number) {
    const roman: Record<string, number> = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (const i of Object.keys(roman)) {
      const q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }
    return str;
  }
  
  function toAlpha(num: number) {
    return String.fromCharCode(96 + num); // 1->a, 2->b
  }

  styledHtml = styledHtml.replace(/<div([^>]*class="[^"]*legal-node-level-(\d)[^"]*"[^>]*)>[\s\S]*?<span class="legal-node-counter"[^>]*><\/span>[\s\S]*?<div class="legal-node-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi, (match, divAttrs, levelStr, innerContent) => {
    const level = parseInt(levelStr, 10);
    let counterText = '';
    let style = "font-family: 'Cambria', serif; text-align: justify; line-height: 1.15; ";
    
    if (level === 1) {
      c1++; c2 = 0; c3 = 0; c4 = 0;
      counterText = `Cláusula ${c1} — `;
      style += "margin-top: 12.0pt; margin-bottom: 6.0pt; font-weight: bold; text-transform: uppercase;";
    } else if (level === 2) {
      c2++; c3 = 0; c4 = 0;
      counterText = `§ ${c2}º — `;
      style += "margin-top: 0; margin-bottom: 3.0pt; margin-left: 24.0pt;";
    } else if (level === 3) {
      c3++; c4 = 0;
      counterText = `${toRoman(c3)} — `;
      style += "margin-top: 0; margin-bottom: 3.0pt; margin-left: 48.0pt;"; 
    } else if (level === 4) {
      c4++;
      counterText = `${toAlpha(c4)}) `;
      style += "margin-top: 0; margin-bottom: 3.0pt; margin-left: 72.0pt;"; 
    }

    return `<p style="${style}"><span style="font-weight: bold;">${counterText}</span>${innerContent}</p>`;
  });

  // Force inline styles for Headings because html-to-docx sometimes ignores CSS classes for alignment
  styledHtml = styledHtml.replace(/<h1/gi, '<h1 align="center" style="text-align: center; font-size: 18.0pt; text-transform: uppercase; margin-top: 0pt; margin-bottom: 24pt;"');
  styledHtml = styledHtml.replace(/<h2/gi, '<h2 style="font-size: 16.5pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt;"');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title || 'Documento ExtraJus'}</title>
      <style>
        body {
          font-family: 'Cambria', 'Georgia', 'Times New Roman', serif;
          font-size: 16.0pt;
          line-height: 1.15;
          color: #000000;
        }
        h1 {
          font-size: 18.0pt;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          margin-top: 12.0pt;
          margin-bottom: 24.0pt;
        }
        h2 {
          font-size: 16.5pt;
          font-weight: bold;
          margin-top: 18.0pt;
          margin-bottom: 6.0pt;
        }
        p {
          font-family: 'Cambria', serif;
          text-align: justify;
          margin-bottom: 6.0pt;
          line-height: 1.15;
          font-size: 16.0pt;
        }
        p:not([data-node-text-align="center"]):not([data-node-text-align="right"]):not(.align-center):not(.align-right):not(.no-indent) {
          text-indent: 3.5em;
        }
        p.dense-metadata {
          margin-bottom: 2.0pt;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12.0pt;
          margin-bottom: 12.0pt;
        }
        td, th {
          border: 1.0pt solid #000000;
          padding: 8.0pt 10.0pt;
          text-align: left;
          vertical-align: top;
        }
      </style>
    </head>
    <body>
      ${styledHtml}
    </body>
    </html>
  `;
}

export async function getWordBuffer(title: string, rawHtml: string): Promise<Buffer> {
  const cleanHtml = compileWordHtml(title, rawHtml);
  
  const fileBuffer = await HTMLtoDOCX(cleanHtml, null, {
    title: title || 'Documento ExtraJus',
    font: 'Cambria',
    margins: {
      top: 720,
      right: 1440,
      bottom: 1440,
      left: 1440
    }
  });
  
  return fileBuffer as unknown as Buffer;
}

export async function generateDocxBase64(title: string, rawHtml: string): Promise<string> {
  const buffer = await getWordBuffer(title, rawHtml);
  return buffer.toString('base64');
}
