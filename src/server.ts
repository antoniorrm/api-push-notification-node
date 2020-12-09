import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();

export let savedPushTokens = new Set();

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(process.env.PORT || 3333, () => {
  console.log(`Application listening on port ${process.env.PORT || 3333}!`);
});
