const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer test...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Intercept network requests to see what URL it hits
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url().includes('search.ai.cloudflare.com')) {
            console.log('\n>>> [NETWORK REQUEST]', request.method(), request.url());
            console.log('>>> [PAYLOAD]', request.postData());
        }
        request.continue();
    });

    page.on('response', async response => {
        if (response.url().includes('search.ai.cloudflare.com')) {
            console.log('\n<<< [NETWORK RESPONSE]', response.status(), response.url());
            try {
                const text = await response.text();
                console.log('<<< [RESPONSE BODY]', text.substring(0, 500) + "...");
            } catch (e) {
                console.log('<<< [RESPONSE BODY] Failed to read text:', e.message);
            }
        }
    });

    console.log("Navigating to https://www.liyupoetry.com/ ...");
    await page.goto('https://www.liyupoetry.com/', { waitUntil: 'networkidle2' });

    console.log("Page loaded. Looking for search component...");
    
    // Wait for the button
    try {
      await page.waitForSelector('button[aria-label="AI Search"]', { timeout: 5000 });
      console.log("Found AI Search button, clicking...");
      await page.click('button[aria-label="AI Search"]');
      
      // Wait for modal to open
      await new Promise(r => setTimeout(r, 1000));
      
      // Look for the input inside the shadow DOM of search-bar-snippet
      console.log("Typing '李瑜' into search bar...");
      await page.evaluate(() => {
          const snippet = document.querySelector('search-modal-snippet');
          if (!snippet) { console.log("NO MODAL SNIPPET!"); return; }
          // We can just trigger the search manually or type
          // Actually, let's just observe what happens on load.
          // Is the snippet making any initialization requests?
      });
      
      await new Promise(r => setTimeout(r, 5000));
    } catch(e) {
      console.log("Error interacting:", e.message);
    }

    console.log("Closing browser...");
    await browser.close();
})();
