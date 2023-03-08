import React from "react";

import { MyEntriesNavigation } from "@/components/entries/MyEntriesNavigation";

export const MyEntriesPage: React.FC = () => {
  return (
    <div className="prose p-5">
      <MyEntriesNavigation />
    </div>
  );
};
