import React from "react";
import { useQuery } from "react-query";

import { authenticate, getFarm } from "@/api";
import { FarmForm } from "@/components/entries";
import { useParams } from "react-router-dom";
import { queryClient } from "@/clients";
import { EditPageLoaderParams } from "@/pages";

// TODO move to entry page? unify entry pages with different outlets for each entry type (farm/depot/initiative)?
export const editFarmPageLoader = async ({ params }: EditPageLoaderParams) => {
  // TODO redirect if not authenticated
  await queryClient.fetchQuery(["authenticate"], authenticate, {
    staleTime: 10000,
  });
  return queryClient.fetchQuery(
    ["farms", params.id],
    () => getFarm(params.id),
    {
      staleTime: 10000,
    }
  );
};

export const EditFarmPage: React.FC = () => {
  const { id } = useParams();
  const { data, isSuccess } = useQuery(["farms", id], () =>
    getFarm(Number(id))
  );

  return (
    <div className="p-5">
      <h1 className="text-4xl font-extrabold dark:text-white mb-4">
        Depot editieren
      </h1>
      {isSuccess && <FarmForm entry={data} />}
    </div>
  );
};
