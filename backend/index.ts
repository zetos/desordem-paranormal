import 'dotenv/config';
import express from 'express';
import { appRoutes } from './src/routes/routes.js';
import { DataSetService } from './src/services/data-set-service.js';
const app = express();
const port = process.env.ENV_PORT;

app.use(appRoutes);

app.listen(port, () => {
  console.log(`a porta ${port} ta abrida !`);
});

// await DataSetService.GetPageConnections('Rascunho');
// await DataSetService.GetAllPages();
await DataSetService.GetAllInfo();
