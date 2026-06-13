import * as cheerio from "cheerio";

export async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch page content. Status code: ${response.status}`
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $(
      "script, style, noscript, iframe, svg, nav, footer, header, link, meta, head"
    ).remove();

    const cleanText = $("body").text().replace(/\s+/g, " ").trim();

    if (!cleanText) {
      throw new Error("The scraped page content is empty.");
    }

    return cleanText;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Scraping failed: ${error.message}`
        : "Scraping failed with an unknown error."
    );
  }
}
