const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/inbox/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF for easy replacement
content = content.replace(/\r\n/g, '\n');

const targetStr = '</div>    </div>\n                      </div>\n\n                   </div>\n\n                </div>\n             ) : (';

if (content.indexOf(targetStr) !== -1) {
  console.log("LF Target found!");
  content = content.replace(targetStr, '</div>\n             ) : (');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("REPLACED SUCCESSFULLY!");
  process.exit(0);
} else {
  // Try simpler regex to find the duplicate divs before ) : (
  const targetText = "PROTEÇÃO DIGITAL EXTRAJUS";
  const idx = content.indexOf(targetText);
  if (idx !== -1) {
    const rest = content.substring(idx);
    const parenIdx = rest.indexOf(") : (");
    if (parenIdx !== -1) {
      const toReplace = rest.substring(0, parenIdx);
      console.log("To replace content:", JSON.stringify(toReplace));
      
      const cleanRest = `PROTEÇÃO DIGITAL EXTRAJUS
                               </div>
                            </div>
                         </div>

                      </div>
                   )}

                 </div>\n             `;
      
      content = content.substring(0, idx) + cleanRest + content.substring(idx + parenIdx);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log("REPLACED VIA INDEX METHOD!");
      process.exit(0);
    }
  }
}
console.error("All replacement attempts failed!");
process.exit(1);
