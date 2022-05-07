import { Express } from "express";

export default class NotFoundRouter {
  registerRoutes(expressApp: Express) {
    expressApp.all("*", (request, response) => {
      response.status(404).send("404 Not Found");
    });
  }
}
