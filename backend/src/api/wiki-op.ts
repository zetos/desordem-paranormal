import wiki from "wikijs";

export class WikiOp {
  public static async GetPageNames() {
    try {
      const pageNames = await wiki({
        apiUrl: "https://ordemparanormal.fandom.com/api.php",
      }).allPages();

      return pageNames;
    } catch (error) {
      console.log(error, " na GetPageNames");
    }
  }
  public static async GetHTMLPage(pageName: string) {
    try {
      const page = await wiki({
        apiUrl: "https://ordemparanormal.fandom.com/api.php",
      }).page(pageName);

      const htmlPage = await page.html();
      const pageId = page.raw.pageid;

      return { htmlPage, pageId };
    } catch (error) {
      console.log(error, " na GetHTMLPage");
    }
  }
}
