import { queryClient } from "@/clients";
import { authenticate, findEntries } from "@/api";

export const myEntriesLoader = async () => {
  return queryClient.fetchQuery(
    ["places", "mine"],
    () => findEntries({ mine: true }),
    {
      staleTime: 10000,
    }
  );
};

export const mapPageLoader = async () => {
  return queryClient.fetchQuery(["places"], () => findEntries({}), {
    staleTime: 10000,
  });
};

// TODO move to entry page? unify entry pages with different outlets for each entry type (farm/depot/initiative)?
export const addEntryPageLoader = async () => {
  return queryClient.fetchQuery(["authenticate"], authenticate, {
    staleTime: 10000,
  });
};
