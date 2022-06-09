# checkpoint

## Introduction

This is a super simple and not very feature-complete API gateway. It focuses on routing and rate limiting.

## Getting started

```dockerfile
FROM tombailey256/checkpoint:0.1.1

# see below for config instructions
ENV CHECKPOINT_CONFIG = "..."

# if checkpoint is behind a reverse proxy and you want to trust headers like X-Forwarded-For
# this ensures rate limiting applies to the real client and not the reverse proxy
ENV SHOULD_TRUST_REVERSE_PROXY = "true"

ENV SHOULD_LOG_CONFIG_ON_START = "true"

ENV PORT = 8080
```

## Config

### Routing

Routing is used to map requests to a downstream host. This creates a facade so clients can interact with a single vanity domain like https://myapp.api and checkpoint handles the complexity of proxying requests to downstream hosts like https://auth.myapp.api and https://user.myapp.api depending on the request path, method, etc.

The following config has two routes. One matches requests to an exact path and the other matches requests to a path prefix.

```json
{
  "routes": [
    {
      "destinationHost": "https://internal.auth.api",
      "sourceMethods": ["post"],
      "sourcePath": "/api/login"
    },
    {
      "destinationHost": "https://internal.user.api",
      "sourceMethods": ["get"],
      "sourcePrefix": "/users",
      "rewriteSourcePrefix": "/api/users"
    }
  ]
}
```

This results in the following behavior:

| Request path      | Request method | Destination path                               |
|-------------------|----------------|------------------------------------------------|
| /api/login        | post           | https://internal.auth.api/api/login            |
| /api/login/       | post           | https://internal.auth.api/api/login/           |
| /api/login        | get            | 404 (no matching route)                        |
| /users            | get            | https://internal.user.api/api/users            |
| /users/           | get            | https://internal.user.api/api/users/           |
| /users/123        | get            | https://internal.user.api/api/users/123        |
| /users/123/photos | get            | https://internal.user.api/api/users/123/photos |
| /users/123/photos | post           | 404 (no matching route)                        |
| /orders           | get            | 404 (no matching route)                        |
| /orders/123       | put            | 404 (no matching route)                        |

### Rate limiting

Rate limiting is used to block clients that are making too many requests. It can be configured on a per route level to [prevent abuse](https://www.cloudflare.com/en-gb/learning/bots/what-is-rate-limiting/).

The following config limits login requests to a max of 6 requests per a minute.

```json
{
  "routes": [
    {
      "destinationHost": "https://internal.auth.api",
      "sourceMethods": ["post"],
      "sourcePath": "/api/login",
      "requestsPerMinute": 6
    }
  ]
}
```

Note that rate limiting currently relies on an in-memory store to track previous requests and remaining quotas. If you are running multiple instances of checkpoint (horizontal scaling) or if checkpoint is frequently restarted, rate limiting might not work as desired.

### Health check

Checkpoint has a built-in health check endpoint (`/health`) to confirm that it is working correctly. It does NOT confirm that upstream hosts are working correctly.

## Future work

1. Authentication
2. Metrics
