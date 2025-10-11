import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DataSetItem {
  id: string;
  name: string;
  link: string;
  connections: string[];
}

export class DataSetRepository {
  public static async writeDataSet(data: Record<string, any>): Promise<string> {
    const timestamp = Date.now();
    const filename = `wikiOP_${timestamp}.json`;
    const filepath = path.join(__dirname, '../dataset', filename);

    const arrayData: DataSetItem[] = Object.values(data).map((item) => ({
      id: String(item.id),
      name: item.name,
      link: item.link,
      connections: item.connections,
    }));

    await writeFile(filepath, JSON.stringify(arrayData, null, 2), 'utf-8');
    return filepath;
  }
}
