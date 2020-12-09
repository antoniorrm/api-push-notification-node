import { Router } from "express";
import PushController from "./controllers/PushController";

const routes = Router();

routes.post("/pushNotification", PushController.sendPushToAllTokens);
routes.post("/pushNotification/:token", PushController.sendPushToToken);

export default routes;
