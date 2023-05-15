import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const loadFileBasedRoutes = (app, directory) => {
  const routes = new Set();
  loadRoutesFromDirectory(app, directory, routes);
  return routes;
};

const loadRoutesFromDirectory = (app, directory, routes) => {
  fs.readdirSync(directory)
    .sort(sortFiles)
    .forEach((file) => {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isDirectory()) {
        loadRoutesFromDirectory(app, filePath, routes);
      } else {
        const route = createRouteFromFilePath(filePath);
        if (routes.has(route)) {
          throw new Error(`Multiple route handlers defined for path: ${route}`);
        }
        routes.add(route);
        const fileURL = pathToFileURL(filePath).href;
        import(fileURL).then((module) => {
          app.all(route, module.default);
        });
      }
    });
};

const sortFiles = (a, b) => {
  const aIsDynamic = a.includes("[") && a.includes("]");
  const bIsDynamic = b.includes("[") && b.includes("]");
  if (aIsDynamic && !bIsDynamic) {
    return 1;
  } else if (!aIsDynamic && bIsDynamic) {
    return -1;
  } else {
    return 0;
  }
};

const createRouteFromFilePath = (filePath) => {
  let route = "/" + filePath.replace(/\.js$/, "").split(path.sep).join("/");

  if (route.endsWith("/index")) {
    route = route.replace("/index", "");
  }
  route = convertDynamicSegments(route);
  return route;
};

const convertDynamicSegments = (route) => {
  return route.replace(/\/\[([^/]+)\]/g, "/:$1");
};

export default loadFileBasedRoutes;
