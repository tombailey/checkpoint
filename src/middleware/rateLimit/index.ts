import { RequestHandler } from "express";

type RateLimitMiddleware = {
  createRateLimit(requestsPerMinute: number): RequestHandler;
};

export default RateLimitMiddleware;
