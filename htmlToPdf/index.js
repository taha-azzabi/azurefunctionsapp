const puppeteer = require("puppeteer");

module.exports = async function (context, req) {
  try {
    // Check if the URL is passed as a query string
    if (!req.query.url) {
      context.res = {
        status: 400,
        body: "Please pass a URL on the query string",
      };
      return;
    }

    // Launch the browser instance with specified args
    /**
     *  IMPORTANT: Without these settings, the function will crash on production.
     *  Otherwise, you need to configure a Sandbox on Azure.
     *  See: https://pptr.dev/troubleshooting#setting-up-chrome-linux-sandbox
     */
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Create a new page
    const page = await browser.newPage();

    // Go to the specified URL
    await page.goto(req.query.url);

    // Generate the PDF
    const pdf = await page.pdf({ format: "A4" });

    // Set the response headers and body
    context.res = {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": "attachment; filename=mon-supper-pdf.pdf",
      },
      body: pdf,
    };

    // Close the browser instance
    await browser.close();

    // Call the context.done() method to indicate the completion of the function
    context.done();
  } catch (error) {
    context.log.error(error);

    context.res = {
      status: 500,
      body: "An error occurred while converting the page to a PDF.",
    };

    return context.done();
  }
};
