import {
  getTestDbConnectionString,
  setupIntegrationTestDb,
  truncateTestDb,
} from "../../../db/integrationTestSetup";
import appLauncher from "../../app";

describe("autocomplete service", () => {
  let app;
  beforeAll(async () => {
    await setupIntegrationTestDb();
    app = appLauncher.startApp({
      postgres: {
        client: "pg",
        connection: getTestDbConnectionString,
      },
    });
  });
  afterEach(async () => {
    await truncateTestDb();
  });

  it("gets registered", () => {
    expect(app.service("autocomplete")).toBeTruthy();
  });

  it("has no find method", () => {
    expect(app.service("autocomplete").find).toEqual(undefined);
  });

  it("has no get method", () => {
    expect(app.service("autocomplete").get).toEqual(undefined);
  });

  it("has no update method", () => {
    expect(app.service("autocomplete").update).toEqual(undefined);
  });

  it("has no patch method", () => {
    expect(app.service("autocomplete").patch).toEqual(undefined);
  });

  it("has no remove method", () => {
    expect(app.service("autocomplete").remove).toEqual(undefined);
  });

  it("creates autocomplete suggestions", () => {
    // TODO extract here maps to component/service and mock it
  });
});
