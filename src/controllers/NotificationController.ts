import axios from "axios";
import {
  Expo,
  ExpoPushMessage,
  ExpoPushTicket,
  ExpoPushToken,
} from "expo-server-sdk";
import { Request, Response } from "express";

let expo = new Expo();

const handlePushTokens = async (
  tokens: Array<ExpoPushToken>,
  title: string,
  body: string
): Promise<ExpoPushTicket[] | Error> => {
  let notifications: Array<ExpoPushMessage> = [];
  for (let pushToken of tokens) {
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

  for (let chunk of chunks) {
    try {
      setTimeout(async () => {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts, chunk);
        return receipts;
      }, 3000);
    } catch (error) {
      console.error(error);
      return new Error(error);
    }
  }
  return new Error();
};

const handlePushToken = async (
  token: ExpoPushToken,
  title: string,
  body: string
): Promise<ExpoPushTicket[]> => {
  let chunk = expo.chunkPushNotifications([
    {
      to: token,
      sound: "default",
      title: title,
      body: body,
      data: { body },
    },
  ]);

  try {
    let receipts = await expo.sendPushNotificationsAsync(chunk[0]);
    console.log(receipts, chunk);
    return receipts;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const handleDeleteTokenCallback = async (url: URL, token: ExpoPushToken) => {
  return await axios.delete(`${url}${token}`);
};

type requestBodyProps = {
  to: ExpoPushToken[];
  title: string;
  message: string;
  url_callback: URL;
};

export default {
  async send(request: Request, response: Response) {
    const { to, title, message, url_callback }: requestBodyProps = request.body;

    if (to.length === 1) {
      if (!Expo.isExpoPushToken(to[0])) {
        console.error(`Push token ${to[0]} is not a valid Expo push token`);
        // try {
        //   await handleDeleteTokenCallback(url_callback, to);
        // } catch (error) {
        return response.status(400).json(new Error("error"));
        // }
      }
      try {
        let result: Array<ExpoPushTicket> = await handlePushToken(
          to[0],
          title,
          message
        );
        return response
          .status(201)
          .json({ deviceTokens: `${to}`, results: result });
      } catch (error) {
        return response.status(201).json({ result: error });
      }
    }
    try {
      let results: Array<ExpoPushTicket> | Error = await handlePushTokens(
        to,
        title,
        message
      );
      return response
        .status(201)
        .json({ deviceTokens: `${to}`, results: results });
    } catch (error) {}
  },

  async validToken(request: Request, response: Response) {
    const { deviceToken, url_callback } = request.body;

    if (!Expo.isExpoPushToken(deviceToken)) {
      console.error(`Push token ${deviceToken} is not a valid Expo push token`);
      // try {
      //   await handleDeleteTokenCallback(url_callback, deviceToken);
      // } catch (error) {
      return response.status(400).json(new Error("error"));
      // }
    }

    return response.status(200).json({ message: `${deviceToken} Valid!` });
  },
};
