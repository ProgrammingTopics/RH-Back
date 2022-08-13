import express from "express";
import bodyParser from "body-parser";
import router from "./routes/functionary";

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(router);

app.listen(port);
