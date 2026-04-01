/**
 * Energy unit conversion utilities
 * Supports: W, kW, MW, GW, Wh, kWh, MWh, GWh
 */

// Unit scales for power and energy
const POWER_SCALES: Record<string, number> = {
  W: 1,
  kW: 1000,
  KW: 1000,
  MW: 1000000,
  GW: 1000000000
};

const ENERGY_SCALES: Record<string, number> = {
  Wh: 1,
  kWh: 1000,
  KWh: 1000,
  MWh: 1000000,
  GWh: 1000000000
};

// Water/Gas units
const VOLUME_SCALES: Record<string, number> = {
  L: 1,
  m3: 1000,
  'm³': 1000,
  t: 1000 // ton (for water)
};

// Heat units
const HEAT_SCALES: Record<string, number> = {
  J: 1,
  kJ: 1000,
  MJ: 1000000,
  GJ: 1000000000
};

type UnitCategory = 'power' | 'energy' | 'volume' | 'heat';

function getUnitCategory(unit: string): UnitCategory | null {
  const powerUnits = Object.keys(POWER_SCALES);
  const energyUnits = Object.keys(ENERGY_SCALES);
  const volumeUnits = Object.keys(VOLUME_SCALES);
  const heatUnits = Object.keys(HEAT_SCALES);

  if (powerUnits.includes(unit)) return 'power';
  if (energyUnits.includes(unit)) return 'energy';
  if (volumeUnits.includes(unit)) return 'volume';
  if (heatUnits.includes(unit)) return 'heat';
  return null;
}

function getScales(category: UnitCategory): Record<string, number> {
  switch (category) {
    case 'power':
      return POWER_SCALES;
    case 'energy':
      return ENERGY_SCALES;
    case 'volume':
      return VOLUME_SCALES;
    case 'heat':
      return HEAT_SCALES;
    default:
      return {};
  }
}

/**
 * Convert energy/power value to base unit
 */
export function toBaseUnit(value: number, unit: string): number {
  const category = getUnitCategory(unit);
  if (!category) return value;

  const scales = getScales(category);
  const scale = scales[unit] || 1;
  return value * scale;
}

/**
 * Convert from base unit to target unit
 */
export function fromBaseUnit(value: number, targetUnit: string): number {
  const category = getUnitCategory(targetUnit);
  if (!category) return value;

  const scales = getScales(category);
  const scale = scales[targetUnit] || 1;
  return value / scale;
}

/**
 * Get optimal unit for display based on value magnitude
 */
export function getOptimalUnit(value: number, baseUnit: string): string {
  const category = getUnitCategory(baseUnit);
  if (!category) return baseUnit;

  const scales = getScales(category);
  const sortedUnits = Object.entries(scales).sort((a, b) => b[1] - a[1]);

  // Find unit that gives value between 1 and 1000
  for (const [unit, scale] of sortedUnits) {
    const convertedValue = value / scale;
    if (convertedValue >= 1 && convertedValue < 1000) {
      return unit;
    }
    if (convertedValue >= 1000 && unit === sortedUnits[sortedUnits.length - 1][0]) {
      // If value is >= 1000 in smallest unit, use next larger unit
      const idx = sortedUnits.findIndex(([u]) => u === unit);
      if (idx > 0) {
        return sortedUnits[idx - 1][0];
      }
    }
  }

  return baseUnit;
}

/**
 * Convert value to optimal display unit
 */
export function convertEnergyUnit(
  value: number,
  fromUnit: string,
  toUnit?: string
): { value: number; unit: string; displayValue: string } {
  // Convert to base unit first
  const baseValue = toBaseUnit(value, fromUnit);

  // Determine target unit
  const targetUnit = toUnit || getOptimalUnit(baseValue, fromUnit);

  // Convert to target unit
  const convertedValue = fromBaseUnit(baseValue, targetUnit);

  // Format for display
  const displayValue = formatEnergyValue(convertedValue);

  return {
    value: convertedValue,
    unit: targetUnit,
    displayValue
  };
}

/**
 * Format energy value with appropriate precision
 */
export function formatEnergyValue(value: number, precision: number = 2): string {
  if (value === 0) return '0';

  const absValue = Math.abs(value);

  if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(precision)}M`;
  }
  if (absValue >= 1000) {
    return `${(value / 1000).toFixed(precision)}K`;
  }
  if (absValue >= 100) {
    return value.toFixed(1);
  }
  if (absValue >= 10) {
    return value.toFixed(2);
  }
  return value.toFixed(3);
}

/**
 * Format with thousand separators
 */
export function formatWithCommas(value: number, precision: number = 0): string {
  return value.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage change with sign
 */
export function formatPercentageChange(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
