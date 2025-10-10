import * as cheerio from "cheerio";
import { WikiOp } from "../api/wiki-op.js";
import { get } from "http";

interface pagesObjInterface {
  id: number;
  name: string;
  link: string;
}

export class DataSetService {
  public static async GetAllPages() {
    const pageNames = await WikiOp.GetPageNames();
    const array: pagesObjInterface[] = [];

    if (!pageNames) {
      return console.log("não tem pageNames");
    }
    for (const name of pageNames) {
      const getPage = await WikiOp.getPage(name);

      if (!getPage) {
        return console.log("não tem getPage");
      }

      const pageObj: pagesObjInterface = {
        id: getPage.raw.pageid,
        name: getPage.raw.title,
        link: getPage.raw.fullurl,
      };
      array.push(pageObj);
    }
    return array;
  }

  public static async GetPageConnections(pageName: string) {
    const getPage = await WikiOp.getPage(pageName);
    const htmlPage = await getPage?.html();
    const page = cheerio.load(htmlPage ?? "");
    const links = page("a").toArray();
    const connections: number[] = [];

    const allPagesRecord: Record<string, string> = {};

    for (const element of links) {
      const attr = element.attribs;
      if (
        !attr.href?.startsWith("/") ||
        attr.href.startsWith("/wiki/Arquivo:")
      ) {
        continue;
      }
      allPagesRecord[attr.href] = attr.title!;
    }

    const allPagesEntries = Object.entries(allPagesRecord);

    for (const entrie of allPagesEntries) {
      const page = await WikiOp.getPage(entrie[1]);
      if (!page) {
        continue;
      }
      connections.push(page.raw.pageid);
    }

    return connections;
  }

  public static async GetAllInfo() {}
}
