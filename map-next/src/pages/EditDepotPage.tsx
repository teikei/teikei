import React from "react";
import { useQuery } from "react-query";

import { authenticate, getDepot } from "@/api";
import { DepotForm } from "@/components/entries";
import { useParams } from "react-router-dom";
import { queryClient } from "@/clients";

// TODO move to entry page? unify entry pages with different outlets for each entry type (farm/depot/initiative)?
export const editEntryPageLoader = async ({ params }) => {
  // TODO redirect if not authenticated
  await queryClient.fetchQuery(["authenticate"], authenticate, {
    staleTime: 10000,
  });
  return queryClient.fetchQuery(
    ["depots", params.id],
    () => getDepot(params.id),
    {
      staleTime: 10000,
    }
  );
};

export const EditDepotPage: React.FC = () => {
  const { id } = useParams();
  const { data, isSuccess } = useQuery(["depots", id], () =>
    getDepot(Number(id))
  );

  return (
    <div className="p-5">
      <h1 className="text-4xl font-extrabold dark:text-white mb-4">
        Depot editieren
      </h1>
      {isSuccess && <DepotForm entry={data} />}
    </div>
  );
};
