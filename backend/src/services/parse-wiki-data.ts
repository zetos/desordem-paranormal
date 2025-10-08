import * as cheerio from "cheerio";
import { WikiOp } from "../api/wiki-op.js";

interface allPagesInterface {
  name: string;
  link: string;
}

export async function ParseLinks() {
  const htmlPage = await WikiOp.GetHTMLPage("Rascunho");
  const page = cheerio.load(htmlPage?.htmlPage ?? "");
  const links = page("a").toArray();
  const pageId = htmlPage?.pageId;
  const allPagesRecord: Record<string, string> = {};

  for (const element of links) {
    const attr = element.attribs;
    if (!attr.href?.startsWith("/") || attr.href.startsWith("/wiki/Arquivo:")) {
      continue;
    }
    allPagesRecord[attr.href] = attr.title!;
  }

  const allPagesEntries = Object.entries(allPagesRecord);

  const allPages = allPagesEntries.map((entrie) => {
    return {
      id: pageId,
      name: entrie[1],
      link: entrie[0],
    };
  });

  return allPages;
}
