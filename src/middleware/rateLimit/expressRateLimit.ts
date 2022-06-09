import RateLimitMiddleware from "./index";
import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

export default class ExpressRateLimitMiddleware implements RateLimitMiddleware {
  createRateLimit(requestsPerMinute: number): RequestHandler {
    return rateLimit({
      windowMs: 60 * 1000,
      max: requestsPerMinute,
      standardHeaders: true,
      message: "429 Too Many Requests",
    });
  }
}
