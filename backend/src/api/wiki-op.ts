import wiki from 'wikijs';

export class WikiOp {
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
      console.error(
        `[ERROR] getPage ${pageName}:, ${(error as Error).message}`
      );
    }
  }
}
