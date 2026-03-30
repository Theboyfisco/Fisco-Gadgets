import { CategoryFilters } from "@/components/ui/CategoryFilters";

export function CategoryFiltersServer({
  min,
  max,
}: {
  min?: number;
  max?: number;
}) {
  return <CategoryFilters initialMin={min} initialMax={max} />;
}
