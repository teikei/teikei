import React, { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClientProvider } from "react-query";

import { queryClient } from "../api";

export const renderWithQueryProvider = (component: ReactNode) =>
  render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );

export const findSingleElementByClassName = (
  container: Element,
  className: string
): Element => {
  const classSet = container.getElementsByClassName(className);
  if (classSet.length !== 1) {
    throw Error(`expected to find exactly 1 element, found ${classSet.length}`);
  }
  return classSet[0];
};
