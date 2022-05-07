import RouteConfig from "./route";

type Config = {
  routes: RouteConfig[];
};

export function configFromEnvVar(): Config | undefined {
  if (process.env["CHECKPOINT_CONFIG"] === undefined) {
    return undefined;
  }
  const config = JSON.parse(process.env["CHECKPOINT_CONFIG"]);

  if (!("routes" in config)) {
    throw new Error("Config is missing 'routes'.");
  } else if (!Array.isArray(config.routes)) {
    throw new Error("'routes' should be an array.");
  } else {
    config.routes.forEach(validateRoute);
    return config;
  }
}

export function validateRoute(route: any) {
  if (typeof route !== "object" || Array.isArray(route) || route === null) {
    throw new Error("Each route of 'routes' should be a JavaScript object.");
  }

  validateDestinationHost(route.destinationHost);
  validateRequestsPerMinute(route.requestsPerMinute);
  validateSourceMethods(route.sourceMethods);

  if ("sourcePath" in route) {
    validateSourcePathRoute(route);
  } else if ("sourcePrefix" in route) {
    validateSourcePrefixRoute(route);
  } else {
    throw new Error(
      "Each route of 'routes' should have a 'sourcePath' or 'sourcePrefix'."
    );
  }
}

export function validateDestinationHost(destinationHost: any) {
  if (destinationHost === undefined || typeof destinationHost !== "string") {
    throw new Error("'destinationHost' is invalid.");
  }
}

export function validateRequestsPerMinute(requestsPerMinute: any) {
  if (
    requestsPerMinute !== undefined &&
    typeof requestsPerMinute !== "number"
  ) {
    throw new Error(
      `'${requestsPerMinute}' is not valid for 'requestsPerMinute'.`
    );
  }
}

export function validateSourceMethods(sourceMethods: any) {
  if (sourceMethods === undefined) {
    return;
  }

  const validMethodsRegex =
    /^(get)|(head)|(post)|(patch)|(put)|(delete)|(options)$/;
  if (sourceMethods === null || !Array.isArray(sourceMethods)) {
    throw new Error("'sourceMethods' should be an array.");
  } else {
    const invalidMethod = sourceMethods.find(
      (sourceMethod) => !validMethodsRegex.test(sourceMethod)
    );
    if (invalidMethod !== undefined) {
      throw new Error(`'${invalidMethod}' is not a valid for 'sourceMethods'.`);
    }
  }
}

export function validateSourcePathRoute(route: any) {
  if (typeof route.sourcePath !== "string") {
    throw new Error(`'${route.sourcePath}' is not a valid 'sourcePath'.`);
  }
  if (
    route.rewriteSourcePath !== undefined &&
    typeof route.rewriteSourcePath !== "string"
  ) {
    throw new Error(
      `'${route.rewriteSourcePath}' is not a valid 'rewriteSourcePath'.`
    );
  }
}

export function validateSourcePrefixRoute(route: any) {
  if (typeof route.sourcePrefix !== "string") {
    throw new Error(`'${route.sourcePrefix}' is not a valid 'sourcePrefix'.`);
  }
  if (
    route.rewriteSourcePrefix !== undefined &&
    typeof route.rewriteSourcePrefix !== "string"
  ) {
    throw new Error(
      `'${route.rewriteSourcePrefix}' is not a valid 'rewriteSourcePrefix'.`
    );
  }
}

export default Config;
