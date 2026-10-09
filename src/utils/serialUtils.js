/**
 * Utility functions for calculating sequential series and voucher numbers across devices.
 */

/**
 * Calculate the next available counter and formatted serial number for any prefix
 * based on existing vouchers stored in the database and stored DB series counters.
 * 
 * @param {string} prefixStr - The prefix (e.g. 'YTT-D-', 'YYT-D-', 'YGT-26-A-', 'YGT-26-B-', etc.)
 * @param {Array} vouchersList - List of voucher objects from DB/state
 * @param {number} fallbackCounter - Fallback counter if no vouchers exist in DB
 * @param {Object} seriesCountersMap - Map of stored series counters from DB (e.g. { 'YGT-26-A-': 5 })
 * @returns {{ nextCounter: number, nextVoucherNo: string, padLength: number, prefix: string }}
 */
export function getNextSerialForPrefix(
  prefixStr = 'YYT-D-', 
  vouchersList = [], 
  fallbackCounter = 1,
  seriesCountersMap = {}
) {
  const cleanPrefix = (prefixStr || 'YYT-D-').trim();
  const lowerPrefix = cleanPrefix.toLowerCase();
  
  let maxNum = 0;
  let maxPadLength = 4; // Default padding to 4 digits (e.g., 0001)
  let foundAny = false;

  if (Array.isArray(vouchersList) && vouchersList.length > 0) {
    for (const v of vouchersList) {
      if (!v) continue;
      const vNo = (v.voucherNo || '').trim();
      if (!vNo) continue;

      if (vNo.toLowerCase().startsWith(lowerPrefix)) {
        const suffix = vNo.substring(cleanPrefix.length);
        const match = suffix.match(/^(\d+)/);
        if (match) {
          const numStr = match[1];
          const numVal = parseInt(numStr, 10);
          if (!isNaN(numVal) && numVal > maxNum) {
            maxNum = numVal;
            maxPadLength = Math.max(numStr.length, 3); // Preserve 3 or 4 digit padding
            foundAny = true;
          }
        }
      }
    }
  }

  let nextCounter = 1;
  if (foundAny) {
    nextCounter = maxNum + 1;
  } else {
    nextCounter = Math.max(1, parseInt(fallbackCounter, 10) || 1);
  }

  // If DB config stores a specific counter for this series prefix, merge it
  if (seriesCountersMap && typeof seriesCountersMap === 'object') {
    const dbCounter = seriesCountersMap[cleanPrefix];
    if (typeof dbCounter === 'number' && dbCounter > nextCounter) {
      nextCounter = dbCounter;
    }
  }

  const paddedNum = String(nextCounter).padStart(maxPadLength, '0');
  const nextVoucherNo = `${cleanPrefix}${paddedNum}`;

  return {
    nextCounter,
    nextVoucherNo,
    padLength: maxPadLength,
    prefix: cleanPrefix
  };
}
