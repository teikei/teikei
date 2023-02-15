import React from "react";
import { screen } from "@testing-library/react";

import {
  findSingleElementByClassName,
  renderWithQueryProvider,
} from "../../../common/testHelpers";

import Map from "./Map";

describe("Map", () => {
  it("renders the map", async () => {
    const { container } = renderWithQueryProvider(<Map />);

    expect(
      findSingleElementByClassName(container, "leaflet-container")
    ).toBeVisible();
    expect(
      findSingleElementByClassName(container, "leaflet-layer")
    ).toBeVisible();
    expect(
      findSingleElementByClassName(container, "leaflet-tile")
    ).toBeVisible();
    expect(
      findSingleElementByClassName(container, "leaflet-control-zoom")
    ).toBeVisible();
  });

  it("renders the map controls", async () => {
    renderWithQueryProvider(<Map />);

    expect(screen.getByTitle("Zoom in")).toBeVisible();
    expect(screen.getByTitle("Zoom out")).toBeVisible();
  });
});
