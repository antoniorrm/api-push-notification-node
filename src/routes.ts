import { Router } from "express";
import NotificationController from "./controllers/NotificationController";
import PushController from "./controllers/PushController";

const routes = Router();

routes.post("/notification/send", NotificationController.send);
routes.post("/notification/valid", NotificationController.validToken);
routes.post("/pushNotification/:token", PushController.sendPushToToken);
routes.post("/pushNotification", PushController.sendPushToAllTokens);
routes.post("/pushNotification/:token", PushController.sendPushToToken);

export default routes;
