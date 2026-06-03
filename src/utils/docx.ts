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

  // Parse the HTML safely without catastrophic backtracking regex
  let result = '';
  let currentIndex = 0;
  
  const startRegex = /<div([^>]*class="[^"]*legal-node-level-(\d)[^"]*"[^>]*)>([\s\S]*?)<span class="legal-node-counter"[^>]*><\/span>([\s\S]*?)<div class="legal-node-content"[^>]*>/i;

  while (currentIndex < styledHtml.length) {
    const remaining = styledHtml.slice(currentIndex);
    const match = startRegex.exec(remaining);
    
    if (!match) {
      result += remaining;
      break;
    }

    const startIndex = match.index;
    const level = parseInt(match[2], 10);
    const fullMatchLength = match[0].length;
    
    result += remaining.slice(0, startIndex);
    
    // Find the matching closing </div></div> pair manually to avoid ReDoS
    let contentStart = startIndex + fullMatchLength;
    let contentEnd = contentStart;
    let openDivs = 1; // We are inside <div class="legal-node-content">
    
    while (contentEnd < remaining.length && openDivs > 0) {
      const nextOpen = remaining.indexOf('<div', contentEnd);
      const nextClose = remaining.indexOf('</div', contentEnd);
      
      if (nextClose === -1) break; // Invalid HTML
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        openDivs++;
        contentEnd = nextOpen + 4;
      } else {
        openDivs--;
        if (openDivs === 0) {
          // We found the end of legal-node-content
          contentEnd = nextClose;
          break;
        }
        contentEnd = nextClose + 6;
      }
    }
    
    const innerContent = remaining.slice(contentStart, contentEnd);
    
    // The outer div also needs to be closed. So we skip the next </div>
    let endOfOuterDiv = contentEnd;
    if (openDivs === 0) {
       const finalClose = remaining.indexOf('</div', contentEnd + 6);
       if (finalClose !== -1) {
           endOfOuterDiv = finalClose + 6; // include > (usually </div>)
           // handle potential trailing >
           const trailingClose = remaining.indexOf('>', endOfOuterDiv);
           if (trailingClose !== -1 && trailingClose - endOfOuterDiv < 5) {
               endOfOuterDiv = trailingClose + 1;
           }
       }
    }

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

    result += `<p style="${style}"><span style="font-weight: bold;">${counterText}</span>${innerContent}</p>`;
    currentIndex += endOfOuterDiv;
  }
  
  styledHtml = result;

  // Force inline styles for Headings because html-to-docx sometimes ignores CSS classes for alignment
  styledHtml = styledHtml.replace(/<h1/gi, '<h1 align="center" style="text-align: center; font-size: 18.0pt; text-transform: uppercase; margin-top: 0pt; margin-bottom: 24pt;"');
  styledHtml = styledHtml.replace(/<h2/gi, '<h2 style="font-size: 16.5pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt;"');

  // Forçar alinhamento justificado em TODO o documento (parágrafos e listas)
  styledHtml = styledHtml.replace(/<(p|li)([^>]*)>/gi, (match, tag, attrs) => {
    // Se o parágrafo tiver alinhamento explícito centralizado ou à direita, preserva.
    if (attrs.includes('text-align: center') || attrs.includes('text-align: right') || attrs.includes('align="center"') || attrs.includes('align="right"')) {
      return match;
    }
    // Caso contrário, injeta text-align: justify inline para forçar o Word a respeitar.
    if (attrs.includes('style="')) {
      return `<${tag}${attrs.replace('style="', 'align="justify" style="text-align: justify; ')}>`;
    }
    return `<${tag}${attrs} align="justify" style="text-align: justify;">`;
  });

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
