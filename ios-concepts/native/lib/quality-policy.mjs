export const FACTORY_MINIMUM_QUALITY_FLOOR = 8.5;
export const PRODUCT_QUALITY_MAX_ATTEMPTS = 3;

export function effectiveQualityFloor(configuredFloor) {
  return Math.max(
    FACTORY_MINIMUM_QUALITY_FLOOR,
    Number.isFinite(configuredFloor) ? configuredFloor : FACTORY_MINIMUM_QUALITY_FLOOR,
  );
}
