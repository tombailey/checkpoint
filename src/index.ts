import { createServer } from "./server";
import { configFromEnvVar } from "./config";

function init() {
  const config = configFromEnvVar();
  if (config === undefined) {
    throw new Error(
      "Config is missing or invalid. Please set '$CHECKPOINT_CONFIG' correctly."
    );
  }

  if (process.env["SHOULD_LOG_CONFIG_ON_START"]?.toLowerCase() === "true") {
    console.log("Loaded config", JSON.stringify(config));
  }

  const server = createServer(config);
  const port = process.env["PORT"] ?? 8080;
  server.listen(port);
}

init();
