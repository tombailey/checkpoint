import RouteConfig from "../../config/route";
import { RequestHandler } from "express";

type ProxyMiddleware = {
  createProxy(route: RouteConfig): RequestHandler;
};

export default ProxyMiddleware;
