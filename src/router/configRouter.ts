import { Express } from "express";
import Config from "../config";
import ProxyMiddleware from "../middleware/proxy";
import RateLimitMiddleware from "../middleware/rateLimit";

export default class ConfigRouter {
  private readonly config: Config;
  private readonly proxyMiddleware: ProxyMiddleware;
  private readonly rateLimitMiddleware: RateLimitMiddleware;

  constructor(
    config: Config,
    proxyMiddleware: ProxyMiddleware,
    rateLimitMiddleware: RateLimitMiddleware
  ) {
    this.config = config;
    this.proxyMiddleware = proxyMiddleware;
    this.rateLimitMiddleware = rateLimitMiddleware;
  }

  registerRoutes(expressApp: Express) {
    this.config.routes.forEach((route) => {
      const isPrefixRoute = "sourcePrefix" in route;
      const path = isPrefixRoute
        ? [route.sourcePrefix, `${route.sourcePrefix}*`]
        : route.sourcePath;
      const methods = route.sourceMethods;

      const middleware = [this.proxyMiddleware.createProxy(route)];
      if (route.requestsPerMinute !== undefined) {
        middleware.unshift(
          this.rateLimitMiddleware.createRateLimit(route.requestsPerMinute)
        );
      }

      if (methods === undefined) {
        expressApp.all(path, middleware);
      } else {
        methods.forEach((method) => {
          expressApp[method](path, middleware);
        });
      }
    });
  }
}
