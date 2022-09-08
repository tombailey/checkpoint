import RouteConfig from "../../config/route";
import { Options as ProxyConfig } from "http-proxy-middleware/dist/types";
import { createProxyMiddleware } from "http-proxy-middleware";
import ProxyMiddleware from "./index";
import { RequestHandler } from "express";
import { Socket } from "net";

export default class HttpProxyMiddleware implements ProxyMiddleware {
  createProxy(route: RouteConfig): RequestHandler {
    const isPrefixRoute = "sourcePrefix" in route;
    const proxyConfig: ProxyConfig = {
      target: route.destinationHost,
      on: {
        error: (error, request, response) => {
          if (response instanceof Socket) {
            response.end();
          } else {
            response.writeHead(504);
            response.end("504 Gateway Timeout");
          }
        },
      },
    };

    const shouldRewritePrefix = isPrefixRoute && "rewriteSourcePrefix" in route;
    const shouldRewritePath = !isPrefixRoute && "rewriteSourcePath" in route;
    if (shouldRewritePrefix) {
      proxyConfig.pathRewrite = (path) =>
        path.replace(
          new RegExp(`^${route.sourcePrefix}`),
          route.rewriteSourcePrefix as string
        );
    } else if (shouldRewritePath) {
      proxyConfig.pathRewrite = (path) =>
        path.replace(
          new RegExp(`^${route.sourcePath}`),
          route.rewriteSourcePath as string
        );
    }

    return createProxyMiddleware(proxyConfig);
  }
}
