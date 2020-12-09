import { savedPushTokens } from "./../server";
import { Request, Response } from "express";
import { Expo, ExpoPushMessage, ExpoPushToken } from "expo-server-sdk";

let expo = new Expo();
// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security

// Create the messages that you want to send to clients
const handlePushTokens = (title: string, body: string) => {
  let notifications: Array<ExpoPushMessage> = [];
  for (let pushToken of savedPushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    notifications.push({
      to: pushToken as string,
      sound: "default",
      title: title,
      body: body,
      data: { body },
    });
  }

  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    for (let chunk of chunks) {
      try {
        setTimeout(async () => {
          let receipts = await expo.sendPushNotificationsAsync(chunk);
          console.log(receipts, chunk);
        }, 3000);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

const handlePushToken = (token: ExpoPushToken, title: string, body: string) => {
  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    return;
  }

  let chunk = expo.chunkPushNotifications([
    {
      to: token,
      sound: "default",
      title: title,
      body: body,
      data: { body },
    },
  ]);

  (async () => {
    try {
      let receipts = await expo.sendPushNotificationsAsync(chunk[0]);
      console.log(receipts, chunk);
      return receipts;
    } catch (error) {
      console.error(error);
      return error;
    }
  })();
};

export default {
  async sendPushToAllTokens(request: Request, response: Response) {
    const { pushToken, title, body } = request.body;

    savedPushTokens.add(pushToken);
    await handlePushTokens(title, body);
    console.log(savedPushTokens);

    return response
      .status(201)
      .json({ result: "Notificação enviada com sucesso para todos!" });
  },

  async sendPushToToken(request: Request, response: Response) {
    const { title, body } = request.body;

    const { token } = request.params;
    try {
      await handlePushToken(token, title, body);
    } catch (error) {
      return response.status(201).json({ result: error });
    }
    return response
      .status(201)
      .json({ result: `Notificação enviada para  ${token} com sucesso!` });
  },
};
