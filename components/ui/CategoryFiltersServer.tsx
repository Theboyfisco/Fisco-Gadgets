import { CategoryFilters } from "@/components/ui/CategoryFilters";

export function CategoryFiltersServer({
  min,
  max,
  brandOptions,
  ramOptions,
  storageOptions,
}: {
  min?: number;
  max?: number;
  brandOptions?: Array<{ id: string; name: string }>;
  ramOptions?: string[];
  storageOptions?: string[];
}) {
  return (
    <CategoryFilters
      initialMin={min}
      initialMax={max}
      brandOptions={brandOptions}
      ramOptions={ramOptions}
      storageOptions={storageOptions}
    />
  );
}
