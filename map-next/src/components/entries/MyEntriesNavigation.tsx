export const MyEntriesNavigation = () => (
  <div>
    <h1>Meine Einträge</h1>
    <div className="flex row">
      <a href="/depots/new" className="pr-2">
        Abholstelle hinzufügen
      </a>
      |
      <a href="/farms/new" className="px-2">
        Betrieb hinzufügen
      </a>
      |
      <a href="/initiatives/new" className="pl-2">
        Initiative hinzufügen
      </a>
    </div>
  </div>
);
