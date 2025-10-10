import "dotenv/config";
import express from "express";
import { appRoutes } from "./src/routes/routes.js";
import { DataSetService } from "./src/services/data-set-service.js";
import { WikiOp } from "./src/api/wiki-op.js";
const app = express();
const port = process.env.ENV_PORT;

app.use(appRoutes);

app.listen(port, () => {
  console.log(`a porta ${port} ta abrida !`);
});

DataSetService.GetPageConnections("Rascunho");
