const puppeteer = require('puppeteer');
const http = require('http');

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script type="module" src="https://unpkg.com/@cloudflare/ai-search-snippet"></script>
<style>
  body { font-family: sans-serif; padding: 2rem; background: #222; }
  search-modal-snippet { --search-snippet-primary-color: #00ff00; }
</style>
</head>
<body>
  <h1>Test</h1>
  <search-modal-snippet api-url="https://5afe09db-57da-4ebd-8606-b604c307afe5.search.ai.cloudflare.com/"></search-modal-snippet>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(3000, async () => {
  console.log("Server running on port 3000");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000');
  
  // Wait for component to mount
  await new Promise(r => setTimeout(r, 2000));
  
  // The component is a shadow DOM. We need to find the input inside it
  const result = await page.evaluate(async () => {
    const el = document.querySelector('search-modal-snippet');
    if (!el) return "NO SNIPPET";
    const shadow = el.shadowRoot;
    if (!shadow) return "NO SHADOW ROOT";
    const button = shadow.querySelector('button'); // usually there is a button to open modal
    if (button) button.click();
    
    await new Promise(r => setTimeout(r, 500));
    
    const input = shadow.querySelector('input');
    if (input) {
      input.value = "李瑜";
      input.dispatchEvent(new Event('input', { bubbles: true }));
      // press enter
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    }
    
    await new Promise(r => setTimeout(r, 2000));
    return shadow.innerHTML;
  });
  
  console.log("Shadow DOM after search:");
  console.log(result.substring(0, 1000));
  
  await browser.close();
  server.close();
});
