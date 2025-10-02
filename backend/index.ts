import "dotenv/config";
import express from "express";
const app = express();
const port = process.env.ENV_PORT;

app.listen(port, () => {
  console.log(`a porta ${port} ta abrida !`);
});
