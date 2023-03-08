import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ComponentMeta } from "@storybook/react";

import { LocationSearchCombobox } from "@/components/ui";

export default {
  component: LocationSearchCombobox,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient();
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} as ComponentMeta<typeof LocationSearchCombobox>;

// TODO implement story with mock API data

// export const Default: ComponentStory<typeof LocationSearchCombobox> = () => {
//   const methods = useForm();
//   return (
//     <FormProvider {...methods}>
//       <LocationSearchCombobox id="value" label="Standort" />
//     </FormProvider>
//   );
// };
// Default.storyName = "Locations only";
//
// export const WithEntries: ComponentStory<
//   typeof LocationSearchCombobox
// > = () => {
//   const methods = useForm();
//   return (
//     <FormProvider {...methods}>
//       <LocationSearchCombobox id="value" label="Standort" withEntries />{" "}
//     </FormProvider>
//   );
// };
// WithEntries.storyName = "Locations and Entries";
