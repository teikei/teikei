export const MyEntriesNavigation = () => (
  <ul className="flex flex-wrap mb-6 text-gray-900 dark:text-white">
    <li className="pr-2">
      <a
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline "
        href="/depots/new"
      >
        Abholstelle hinzufügen
      </a>
    </li>
    |
    <li className="px-2">
      <a
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="/farms/new"
      >
        Betrieb hinzufügen
      </a>
    </li>
    |
    <li className="pl-2">
      <a
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="/initiatives/new"
      >
        Initiative hinzufügen
      </a>
    </li>
  </ul>
);
