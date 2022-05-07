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

    const shouldRewritePrefix = isPrefixRoute && route.rewriteSourcePrefix;
    const shouldRewritePath = !isPrefixRoute && route.rewriteSourcePath;
    if (shouldRewritePrefix) {
      proxyConfig.pathRewrite = (path) =>
        path.replace(
          `^${route.sourcePrefix}`,
          route.rewriteSourcePrefix as string
        );
    } else if (shouldRewritePath) {
      proxyConfig.pathRewrite = (path) =>
        path.replace(
          `^${route.sourcePath}$`,
          route.rewriteSourcePath as string
        );
    }

    return createProxyMiddleware(proxyConfig);
  }
}
