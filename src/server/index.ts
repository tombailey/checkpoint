import express from "express";
import morgan from "morgan";
import Config from "../config";
import HealthRouter from "../router/healthRouter";
import ConfigRouter from "../router/configRouter";
import HttpProxyMiddleware from "../middleware/proxy/httpProxy";
import ProxyMiddleware from "../middleware/proxy";
import RateLimitMiddleware from "../middleware/rateLimit";
import NotFoundRouter from "../router/notFoundRouter";
import ExpressRateLimitMiddleware from "../middleware/rateLimit/expressRateLimit";

export function createServer(config: Config) {
  const expressApp = express();
  expressApp.disable("x-powered-by");
  expressApp.use(morgan("combined"));

  expressApp.set(
    "trust proxy",
    process.env["SHOULD_TRUST_REVERSE_PROXY"]?.toLowerCase() === "true"
  );

  const proxyMiddleware: ProxyMiddleware = new HttpProxyMiddleware();
  const rateLimitMiddleware: RateLimitMiddleware =
    new ExpressRateLimitMiddleware();

  new HealthRouter().registerRoutes(expressApp);
  new ConfigRouter(config, proxyMiddleware, rateLimitMiddleware).registerRoutes(
    expressApp
  );
  new NotFoundRouter().registerRoutes(expressApp);

  return expressApp;
}
