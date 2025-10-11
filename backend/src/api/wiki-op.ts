import type { WikiPage } from 'wikijs';
import wiki from 'wikijs';

interface IPageCache {
  get(key: string): WikiPage | undefined;
  set(key: string, value: WikiPage): void;
  clear(): void;
}

class SimplePageCache implements IPageCache {
  private cache = new Map<string, WikiPage>();

  get(key: string): WikiPage | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: WikiPage): void {
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export class WikiOp {
  private static pageCache: IPageCache = new SimplePageCache();

  public static async GetPageNames() {
    try {
      const pageNames = await wiki({
        apiUrl: 'https://ordemparanormal.fandom.com/api.php',
      }).allPages();

      return pageNames;
    } catch (error) {
      console.log(error, ' na GetPageNames');
    }
  }

  public static async getPage(pageName: string) {
    try {
      const page = await wiki({
        apiUrl: 'https://ordemparanormal.fandom.com/api.php',
      }).page(pageName);

      return page;
    } catch (error) {
      console.error('[ERROR] getPage:', (error as Error).message);
    }
  }

  // TODO: Use a real cache.
  public static async getPageCached(pageName: string) {
    const cached = this.pageCache.get(pageName);
    if (cached) {
      // console.info('[INFO] Cache hit !!');
      return cached;
    }
    // console.info('[INFO] Cache miss for:', pageName);

    const page = await this.getPage(pageName);
    if (page) {
      this.pageCache.set(pageName, page);
    }

    return page;
  }

  public static clearCache(): void {
    this.pageCache.clear();
  }

  public static setCache(cache: IPageCache): void {
    this.pageCache = cache;
  }
}
