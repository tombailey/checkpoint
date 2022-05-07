type RequestMethod =
  | "get"
  | "head"
  | "post"
  | "patch"
  | "put"
  | "delete"
  | "options";

type BaseConfig = {
  destinationHost: string;
  requestsPerMinute?: number;
  sourceMethods?: RequestMethod[];
};

type ExactRouteConfig = {
  sourcePath: string;
  rewriteSourcePath?: string;
};

type PrefixRouteConfig = {
  sourcePrefix: string;
  rewriteSourcePrefix?: string;
};

type RouteConfig = (ExactRouteConfig | PrefixRouteConfig) & BaseConfig;

export default RouteConfig;
