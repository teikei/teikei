import React from "react";
import { useMutation } from "react-query";

import { Entry } from "@/types";
import { deleteEntry } from "@/api";
import { queryClient } from "@/clients";
import { ModalDialog } from "@/components/ui";

interface Props {
  entry: Entry | null;
  setEntry: (entry: Entry | null) => void;
}

export const DeleteEntryDialog: React.FC<Props> = ({ entry, setEntry }) => {
  const mutation = useMutation(
    async (entry: Entry | null) => {
      if (entry !== null) {
        const { id, type } = entry.properties;
        return deleteEntry({ id, type });
      }
    },
    {
      onSuccess: () => {
        setEntry(null);
        return queryClient.invalidateQueries("entries");
      },
    }
  );

  return (
    <ModalDialog
      title="Eintrag löschen"
      text="Soll der Eintrag wirklich gelöscht werden?"
      isOpen={entry !== null}
      onConfirm={() => mutation.mutate(entry)}
      onCancel={() => setEntry(null)}
      confirmationButtonText="Löschen"
    />
  );
};
