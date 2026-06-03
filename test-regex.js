const html = '<div class="legal-node-level-1">' + '<span class="legal-node-counter"></span>' + '<div class="legal-node-content">' + 'x'.repeat(1000) + '</div></div>'.repeat(50);
console.time('regex');
html.replace(/<div([^>]*class="[^"]*legal-node-level-(\d)[^"]*"[^>]*)>[\s\S]*?<span class="legal-node-counter"[^>]*><\/span>[\s\S]*?<div class="legal-node-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi, () => '');
console.timeEnd('regex');
