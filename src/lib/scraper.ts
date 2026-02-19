import * as cheerio from "cheerio";

export interface ScrapedContent {
  title: string;
  description?: string;
  text: string;
}

export const scrapeUrl = async (url: string): Promise<ScrapedContent> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Basic scraping logic
    const title = $("title").text().trim();
    const description = $('meta[name="description"]').attr("content")?.trim();

    // Remove scripts, styles, and non-content elements
    $("script, style, nav, footer, header, aside").remove();

    // Add spaces/newlines around block elements to prevent text merging
    $("p, div, br, h1, h2, h3, h4, h5, h6, li").each((_, el) => {
      $(el).prepend(" ").append("\n");
    });

    const text = $("body")
      .text()
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    return {
      title,
      description,
      text,
    };
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  }
};
