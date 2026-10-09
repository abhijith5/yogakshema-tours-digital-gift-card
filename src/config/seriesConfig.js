import seriesConfigFile from './seriesConfig.json';

export const DEFAULT_SERIES_CONFIG = seriesConfigFile;

/**
 * Get initial list of series defined in the seriesConfig.json file.
 */
export function getFileSeriesList() {
  return seriesConfigFile.series || [];
}

/**
 * Find series config by key or prefix from file or provided list.
 */
export function findSeriesConfig(seriesKeyOrPrefix, seriesList = getFileSeriesList()) {
  if (!seriesKeyOrPrefix) return null;
  const target = String(seriesKeyOrPrefix).trim().toLowerCase();
  
  return seriesList.find(s => 
    (s.key && s.key.toLowerCase() === target) ||
    (s.prefix && s.prefix.toLowerCase() === target)
  ) || null;
}
