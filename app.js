import express from "express";
import loadFileBasedRoutes from "./utils/load-file-based-routes.js";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  morgan(
    ":date :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
  )
);

const routes = loadFileBasedRoutes(app, "api");
console.log(routes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
