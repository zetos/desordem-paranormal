import * as cheerio from 'cheerio';
import { WikiOp } from '../api/wiki-op.js';
import { DataSetRepository } from '../repository/data-set-repository.js';
import type { WikiPage } from 'wikijs';

interface pagesObjInterface {
  id: number;
  name: string;
  link: string;
}

interface pagesObjInterfaceConnected extends pagesObjInterface {
  connections: string[];
}

export class DataSetService {
  private static readonly blackList: string[] = [
    'Categoria:',
    'Este personagem ',
    'Esta criatura ',
    'Predefinição:',
    'Desconhecid',
    '(desambiguação)',
    'Wiki:',
    'Especial:',
  ];

  private static filterBlacklisted<T>(
    items: T[],
    getValue: (item: T) => string
  ): T[] {
    return items.filter(
      (item) =>
        item && !this.blackList.some((str) => getValue(item).includes(str))
    );
  }

  public static async GetAllPages(): Promise<Map<string, WikiPage>> {
    const pageNames = await WikiOp.GetPageNames();
    const pageMap = new Map<string, WikiPage>();

    if (!pageNames) {
      throw new Error('pageNames not found.');
    }

    const everyPagePromise = pageNames.map(
      (name) => () => WikiOp.getPage(name)
    );

    const everyPageResolved = await Promise.all(
      everyPagePromise.map((f) => f())
    );

    const filteredPages = this.filterBlacklisted(
      everyPageResolved,
      (page) => page!.raw.title
    );

    for (const pageObj of filteredPages) {
      if (pageObj && !pageMap.has(pageObj.raw.title)) {
        pageMap.set(pageObj.raw.title, pageObj);
      }
    }

    return pageMap;
  }

  public static async GetPageConnections(
    page: WikiPage,
    pageName: string,
    allPagesMap: Map<string, WikiPage>
  ) {
    const htmlPage = await page.html();
    const $ = cheerio.load(htmlPage ?? '');
    const links = $('a').toArray();
    const connections: number[] = [];

    const allPagesRecord: Record<string, string> = {};

    for (const element of links) {
      const attr = element.attribs;
      if (
        !attr.href?.startsWith('/') ||
        attr.href.startsWith('/wiki/Arquivo:')
      ) {
        continue;
      }
      allPagesRecord[attr.href] = attr.title!;
    }

    const filteredEntries = this.filterBlacklisted(
      Object.entries(allPagesRecord),
      (entry) => entry[1]
    );

    for (const [_, title] of filteredEntries) {
      const linkedPage = allPagesMap.get(title);
      if (linkedPage) {
        connections.push(linkedPage.raw.pageid);
      }
    }

    return { pageName, connections: connections.map(String) };
  }

  public static async GetAllInfo() {
    const pageMap = await this.GetAllPages();

    const pageConnectionsFun = Array.from(pageMap.entries()).map(
      ([pageName, wikiPage]) => () =>
        this.GetPageConnections(wikiPage, pageName, pageMap)
    );
    const pageConnectionsResolved = await Promise.all(
      pageConnectionsFun.map((f) => f())
    );

    const connectedPageData: pagesObjInterfaceConnected[] =
      pageConnectionsResolved.map((pg) => {
        const wikiPage = pageMap.get(pg.pageName);
        if (!wikiPage) {
          throw new Error(`WikiPage not found for: ${pg.pageName}`);
        }
        return {
          id: wikiPage.raw.pageid,
          name: wikiPage.raw.title,
          link: wikiPage.raw.fullurl,
          connections: pg.connections,
        };
      });

    const filepath = await DataSetRepository.writeDataSet(connectedPageData);
    console.info(`[INFO] Dataset written to: ${filepath}`);
    return filepath;
  }
}
