import * as cheerio from 'cheerio';
import { WikiOp } from '../api/wiki-op.js';
import { DataSetRepository } from '../repository/data-set-repository.js';

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

  public static async GetAllPages(): Promise<
    Record<string, pagesObjInterface>
  > {
    const pageNames = await WikiOp.GetPageNames();
    const pageData: Record<string, pagesObjInterface> = {};

    if (!pageNames) {
      throw new Error('pageNames not found.');
    }

    const everyPagePromise = pageNames.map(
      (name) => () => WikiOp.getPageCached(name)
    );

    // TODO: instead of making every request at once, separating it into smaller chunks would be a better etiquette.
    const everyPageResolved = await Promise.all(
      everyPagePromise.map((f) => f())
    );

    const filteredPages = this.filterBlacklisted(
      everyPageResolved,
      (page) => page!.raw.title
    );

    let i = 0;
    for (const pageObj of filteredPages) {
      if (pageObj && pageData[pageObj.raw.title] === undefined) {
        // console.info(
        //   `[INFO] Building title: ${pageObj.raw.title} - [${i} / ${filteredPages.length}]`
        // );

        pageData[pageObj.raw.title] = {
          id: pageObj.raw.pageid,
          name: pageObj.raw.title,
          link: pageObj.raw.fullurl,
        };
      }
      i++;
    }

    return pageData;
  }

  public static async GetPageConnections(pageName: string) {
    const getPage = await WikiOp.getPageCached(pageName);
    const htmlPage = await getPage?.html();
    const page = cheerio.load(htmlPage ?? '');
    const links = page('a').toArray();
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

    const allPagesEntries = filteredEntries.map(
      (entry) => () => WikiOp.getPageCached(entry[1])
    );
    const allPagesEntriesResolved = await Promise.all(
      allPagesEntries.map((fun) => fun())
    );

    for (const page of allPagesEntriesResolved) {
      if (!page) {
        continue;
      }
      connections.push(page.raw.pageid);
    }

    return { pageName, connections: connections.map(String) };
  }

  public static async GetAllInfo() {
    const pagesData = await this.GetAllPages();

    const pageConnectionsFun = Object.values(pagesData).map(
      (page) => () => this.GetPageConnections(page.name)
    );
    const pageConnectionsResolved = await Promise.all(
      pageConnectionsFun.map((f) => f())
    );

    const connectedPageData: pagesObjInterfaceConnected[] =
      pageConnectionsResolved.map((pg) => ({
        ...pagesData[pg.pageName]!,
        connections: pg.connections,
      }));

    // Save to json file
    const filepath = await DataSetRepository.writeDataSet(connectedPageData);
    console.info(`[INFO] Dataset written to: ${filepath}`);
    return filepath;
  }
}
