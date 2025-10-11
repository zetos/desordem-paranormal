declare module 'wikijs' {
  export default function wiki(config?: { apiUrl?: string }): WikiJS;
  
  interface WikiJS {
    allPages(): Promise<string[]>;
    allCategories(): Promise<string[]>;
    page(title: string): Promise<WikiPage>;
    find(search: string, predicate?: (result: any) => boolean): Promise<WikiPage>;
    findById(pageid: number): Promise<WikiPage>;
    search(query: string, limit?: number, all?: boolean): Promise<{ results: string[]; next: () => Promise<any> }>;
    prefixSearch(query: string, limit?: number): Promise<{ results: string[]; next: () => Promise<any> }>;
    random(limit?: number): Promise<string[]>;
    geoSearch(lat: number, lon: number, radius?: number, limit?: number): Promise<string[]>;
    mostViewed(): Promise<Array<{ title: string; count: number }>>;
    pagesInCategory(category: string): Promise<string[]>;
    exportXml(pageName: string): Promise<string>;
    api(params: Record<string, any>): Promise<any>;
    chain(): any;
  }
  
  interface RawPageInfo {
    pageid: number;
    title: string;
    fullurl: string;
    canonicalurl: string;
    [key: string]: any;
  }
  
  interface WikiPage extends RawPageInfo {
    raw: RawPageInfo;
    html(): Promise<string>;
    content(): Promise<any>;
    sections(): Promise<any>;
    rawContent(): Promise<string>;
    summary(): Promise<string>;
    images(): Promise<string[]>;
    rawImages(): Promise<any[]>;
    mainImage(): Promise<string | undefined>;
    pageImage(): Promise<string | undefined>;
    references(): Promise<string[]>;
    links(aggregated?: boolean, limit?: number): Promise<string[]>;
    externalLinks(): Promise<string[]>;
    categories(aggregated?: boolean, limit?: number): Promise<string[]>;
    coordinates(): Promise<{ lat: number; lon: number } | null>;
    info(key?: string): Promise<any>;
    fullInfo(): Promise<any>;
    rawInfo(title?: string): Promise<string>;
    backlinks(aggregated?: boolean, limit?: number): Promise<string[]>;
    langlinks(): Promise<Array<{ lang: string; title: string; url: string }>>;
    tables(): Promise<any[]>;
    url(): string;
    chain(): any;
  }
}