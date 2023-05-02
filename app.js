import express from "express";
import loadFileBasedRoutes from "./utils/load-file-based-routes.js";

const app = express();
app.use(express.json());

const routes = loadFileBasedRoutes(app, "api");
console.log(routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
