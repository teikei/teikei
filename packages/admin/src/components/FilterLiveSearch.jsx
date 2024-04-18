import * as React from "react";
import { memo, useMemo } from "react";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Form, useListFilterContext, TextInput } from "react-admin";

/**
 * Form and search input for doing a full-text search filter.
 *
 * Triggers a search on change (with debounce).
 *
 * @example
 *
 * const FilterPanel = () => (
 *     <Card>
 *         <CardContent>
 *             <FilterLiveSearch source="title" />
 *         </CardContent>
 *     </Card>
 * );
 */
export const FilterLiveSearch = memo((props) => {
  const { filterValues, setFilters } = useListFilterContext();

  const { source = "q", variant, ...rest } = props;

  const handleChange = (event) => {
    if (event.target) {
      setFilters({ ...filterValues, [source]: event.target.value }, null);
    } else {
      const { [source]: _, ...filters } = filterValues;
      setFilters(filters, null);
    }
  };

  const initialValues = useMemo(
    () => ({
      [source]: filterValues[source],
    }),
    [filterValues, source],
  );

  const onSubmit = () => undefined;
  return (
    <Form defaultValues={initialValues} onSubmit={onSubmit}>
      <TextInput
        resettable
        helperText={false}
        source={source}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon color="disabled" />
            </InputAdornment>
          ),
        }}
        onChange={handleChange}
        size="small"
        variant={variant}
        {...rest}
      />
    </Form>
  );
});
