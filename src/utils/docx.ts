export function compileWordHtml(title: string, rawHtml: string): string {
  // Inject Legal Node Counters (Word HTML engine doesn't support CSS counters well)
  let styledHtml = rawHtml;
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

  // Regex to find legal nodes and replace the entire <div> structure with a <p>
  // TipTap structure: <div class="legal-node..."><span class="legal-node-counter"></span><div class="legal-node-content">TEXT</div></div>
  // Since content is "inline*", TEXT will not contain </div>.
  styledHtml = styledHtml.replace(/<div([^>]*class="[^"]*legal-node-level-(\d)[^"]*"[^>]*)>[\s\S]*?<span class="legal-node-counter"[^>]*><\/span>[\s\S]*?<div class="legal-node-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi, (match, divAttrs, levelStr, innerContent) => {
    const level = parseInt(levelStr, 10);
    let counterText = '';
    let style = "font-family: 'Cambria', serif; text-align: justify; line-height: 1.6; ";
    
    if (level === 1) {
      c1++; c2 = 0; c3 = 0; c4 = 0;
      counterText = `Cláusula ${c1} — `;
      style += "margin-top: 12.0pt; margin-bottom: 6.0pt; font-weight: bold; text-transform: uppercase;";
    } else if (level === 2) {
      c2++; c3 = 0; c4 = 0;
      counterText = `§ ${c2}º`;
      style += "margin-top: 0; margin-bottom: 3.0pt; margin-left: 24.0pt;";
    } else if (level === 3) {
      c3++; c4 = 0;
      counterText = `${toRoman(c3)} -`;
      style += "margin-top: 0; margin-bottom: 3.0pt; margin-left: 48.0pt;"; // Espaço de ~2 tabs
    } else if (level === 4) {
      c4++;
      counterText = `${toAlpha(c4)})`;
      style += "margin-top: 0; margin-bottom: 3.0pt; margin-left: 72.0pt;"; // Espaço de ~3 tabs
    }

    return `<p style="${style}"><span style="font-weight: bold; margin-right: 8px;">${counterText}</span>${innerContent}</p>`;
  });

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>\${title || 'Documento ExtraJus'}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 72.0pt 72.0pt 72.0pt 72.0pt; /* Margens de 2.54cm (padrão) */
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Cambria', 'Georgia', 'Times New Roman', serif;
          font-size: 12.0pt;
          line-height: 1.6;
          color: #000000;
        }
        h1 {
          font-size: 16.0pt;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          margin-top: 12.0pt;
          margin-bottom: 24.0pt;
          color: #000000;
        }
        h2 {
          font-size: 13.0pt;
          font-weight: bold;
          margin-top: 18.0pt;
          margin-bottom: 6.0pt;
          color: #000000;
        }
        p {
          font-family: 'Cambria', serif;
          text-align: justify;
          margin-bottom: 6.0pt;
          line-height: 1.6;
        }
        p:not([data-node-text-align="center"]):not([data-node-text-align="right"]):not(.align-center):not(.align-right):not(.no-indent) {
          text-indent: 3.5em;
        }
        p.dense-metadata {
          margin-bottom: 2.0pt;
        }
        /* Suporte completo à estrutura de Legal Nodes do ExtraJus */
        .legal-node {
          margin-bottom: 12.0pt;
          text-align: justify;
        }
        .legal-node-level-1 {
          font-weight: bold;
          font-size: 13.0pt;
          margin-top: 18.0pt;
          color: #000000;
        }
        .legal-node-level-2 {
          margin-left: 24.0pt;
        }
        .legal-node-level-3 {
          margin-left: 48.0pt;
        }
        .legal-node-level-4 {
          margin-left: 72.0pt;
        }
        .legal-node-counter {
          font-weight: bold;
          margin-right: 8.0pt;
          display: inline-block;
        }
        .legal-node-content {
          display: inline;
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
        strong, b {
          font-weight: bold;
        }
        em, i {
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${styledHtml}
      </div>
    </body>
    </html>
  `;
}

export function generateDocxBase64(title: string, rawHtml: string): string {
  const wordHtml = compileWordHtml(title, rawHtml);
  return Buffer.from('\ufeff' + wordHtml, 'utf-8').toString('base64');
}

export function getWordBuffer(title: string, rawHtml: string): Buffer {
  const wordHtml = compileWordHtml(title, rawHtml);
  return Buffer.from('\ufeff' + wordHtml, 'utf-8');
}
