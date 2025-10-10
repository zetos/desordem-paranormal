import { Router, type Response } from "express";
import { DataSetController } from "../controller/data-set-controller.js";

export const appRoutes = Router();

appRoutes.all("/", (req, res) => DataSetController(req, res));
