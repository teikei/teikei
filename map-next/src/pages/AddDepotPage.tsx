import React from "react";
import DepotForm from "../components/entries/DepotForm";

const AddDepotPage: React.FC = () => (
  <div className="prose p-5">
    <h1>Neues Depot eintragen</h1>
    <DepotForm />
  </div>
);

export default AddDepotPage;
