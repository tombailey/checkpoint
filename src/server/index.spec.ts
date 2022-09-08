import { createServer } from "./index";
import request from "supertest";
import express from "express";
import http from "http";

describe("Test checkpoint health", () => {
  let checkpointExpressApp: express.Application;

  beforeAll(async () => {
    checkpointExpressApp = await createServer({ routes: [] });
  });

  it("should respond with healthy", async () => {
    const healthResponse = await request(checkpointExpressApp).get("/health");
    expect(healthResponse.status).toEqual(200);
    expect(healthResponse.body).toEqual({ status: "pass" });
  });
});

describe("Test checkpoint proxying", () => {
  let checkpointExpressApp: express.Application;
  let testServer: http.Server;

  beforeAll(async () => {
    checkpointExpressApp = await createServer({
      routes: [
        {
          destinationHost: "http://localhost:8081",
          sourceMethods: ["get"],
          sourcePath: "/source/exact",
          rewriteSourcePath: "/exact",
        },
        {
          destinationHost: "http://localhost:8081",
          sourceMethods: ["get"],
          sourcePrefix: "/source/prefix",
          rewriteSourcePrefix: "/prefix",
        },
        {
          destinationHost: "http://localhost:8081",
          sourceMethods: ["post"],
          sourcePath: "/source/exact",
          rewriteSourcePath: "/exact",
        },
        {
          destinationHost: "http://localhost:8081",
          sourceMethods: ["post"],
          sourcePrefix: "/source/prefix",
          rewriteSourcePrefix: "/prefix",
        },
      ],
    });

    const testExpressApp = express();
    testExpressApp.get("/exact", (req, res) =>
      res.status(200).send({ message: req.query.echo ?? "exact" })
    );
    testExpressApp.post("/exact", (req, res) =>
      res.status(200).send({ message: req.query.echo ?? "exact" })
    );
    testExpressApp.get("/prefix/:thing", (req, res) =>
      res.status(200).send({ message: req.query.echo ?? "prefix" })
    );
    testExpressApp.post("/prefix/:thing", (req, res) =>
      res.status(200).send({ message: req.query.echo ?? "prefix" })
    );
    testExpressApp.all("*", (req, res) => res.status(501).send());
    testServer = testExpressApp.listen(8081);
  });

  afterAll(() => {
    testServer.close();
  });

  it("should proxy GET exact path", async () => {
    const exactResponse = await request(checkpointExpressApp).get(
      "/source/exact"
    );
    expect(exactResponse.status).toEqual(200);
    expect(exactResponse.body).toEqual({ message: "exact" });
  });

  it("should proxy GET exact path with query parameters", async () => {
    const exactResponse = await request(checkpointExpressApp).get(
      "/source/exact?echo=query"
    );
    expect(exactResponse.status).toEqual(200);
    expect(exactResponse.body).toEqual({ message: "query" });
  });

  it("should proxy GET prefix path", async () => {
    const prefixResponse = await request(checkpointExpressApp).get(
      "/source/prefix/123"
    );
    expect(prefixResponse.status).toEqual(200);
    expect(prefixResponse.body).toEqual({ message: "prefix" });
  });

  it("should proxy GET prefix path with query parameters", async () => {
    const prefixResponse = await request(checkpointExpressApp).get(
      "/source/prefix/456?echo=query"
    );
    expect(prefixResponse.status).toEqual(200);
    expect(prefixResponse.body).toEqual({ message: "query" });
  });

  it("should proxy POST exact path", async () => {
    const exactResponse = await request(checkpointExpressApp).post(
      "/source/exact"
    );
    expect(exactResponse.status).toEqual(200);
    expect(exactResponse.body).toEqual({ message: "exact" });
  });

  it("should proxy POST exact path with query parameters", async () => {
    const exactResponse = await request(checkpointExpressApp).post(
      "/source/exact?echo=query"
    );
    expect(exactResponse.status).toEqual(200);
    expect(exactResponse.body).toEqual({ message: "query" });
  });

  it("should proxy POST prefix path", async () => {
    const prefixResponse = await request(checkpointExpressApp).post(
      "/source/prefix/123"
    );
    expect(prefixResponse.status).toEqual(200);
    expect(prefixResponse.body).toEqual({ message: "prefix" });
  });

  it("should proxy POST prefix path with query parameters", async () => {
    const prefixResponse = await request(checkpointExpressApp).post(
      "/source/prefix/456?echo=query"
    );
    expect(prefixResponse.status).toEqual(200);
    expect(prefixResponse.body).toEqual({ message: "query" });
  });
});
