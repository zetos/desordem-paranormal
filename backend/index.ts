import "dotenv/config";
import express from "express";
import { WikiOp } from "./src/api/wiki-op.js";
const app = express();
const port = process.env.ENV_PORT;
export const Router = express.Router();

app.listen(port, () => {
  console.log(`a porta ${port} ta abrida !`);
});

WikiOp.GetHTMLPage("Anfitrião");
