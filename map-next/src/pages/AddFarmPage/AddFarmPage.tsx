import React from "react";
import DepotForm from "../../components/entries/DepotForm/DepotForm";
import FarmForm from "../../components/entries/FarmForm/FarmForm";

const AddFarmPage: React.FC = () => (
  <div className="prose p-5">
    <h1>Neuen Betrieb eintragen</h1>
    <FarmForm />
  </div>
);

export default AddFarmPage;
