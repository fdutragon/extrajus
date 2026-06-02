const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('felipedutra@outlook.com')) {
    content = content.replace(/felipedutra@outlook.com/g, 'felipe.dutragon@gmail.com');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    count++;
  }
});
console.log(`Successfully replaced in ${count} files.`);
