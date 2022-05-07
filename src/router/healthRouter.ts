import { Express } from "express";

export default class HealthRouter {
  registerRoutes(expressApp: Express) {
    HealthRouter.registerHealthCheck(expressApp);
  }

  private static registerHealthCheck(expressApp: Express) {
    expressApp.get("/health", (_, response) => {
      response.status(200).json({ status: "pass" });
    });
  }
}
