/**
 * Household-basket filter options — persona display strings with a leading
 * "All". Kept in its own module (not the FilterBar component file) so React
 * Fast Refresh isn't broken by a component file also exporting a constant.
 */
export const BASKET_OPTIONS: readonly string[] = [
  'All',
  'South Asian',
  'Chinese',
  'Filipino',
  'Korean',
  'European',
  'Indigenous',
  'Others',
];
