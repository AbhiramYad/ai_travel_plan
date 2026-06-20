const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const htmlFile = process.argv[2];
    const pdfFile = process.argv[3];

    if (!htmlFile || !pdfFile) {
      console.error('Usage: node convert.js <input.html> <output.pdf>');
      process.exit(1);
    }

    const absoluteHtmlPath = path.resolve(htmlFile);
    if (!fs.existsSync(absoluteHtmlPath)) {
      console.error(`Error: File does not exist at ${absoluteHtmlPath}`);
      process.exit(1);
    }

    console.log(`Launching browser to convert ${absoluteHtmlPath}...`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Navigate to the file URL
    const fileUrl = `file://${absoluteHtmlPath.replace(/\\/g, '/')}`;
    console.log(`Navigating to URL: ${fileUrl}`);
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0'
    });

    console.log('Generating PDF...');
    await page.pdf({
      path: pdfFile,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    console.log(`Success! PDF saved to ${pdfFile}`);
    await browser.close();
  } catch (error) {
    console.error('Error during PDF conversion:', error);
    process.exit(1);
  }
})();
