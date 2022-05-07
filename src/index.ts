import { createServer } from "./server";
import { configFromEnvVar } from "./config";

function init() {
  const config = configFromEnvVar();
  if (config === undefined) {
    throw new Error(
      "Config is missing or invalid. Please set '$CHECKPOINT_CONFIG' correctly."
    );
  }
  const server = createServer(config);
  const port = process.env["PORT"] ?? 8080;
  server.listen(port);
}

init();
