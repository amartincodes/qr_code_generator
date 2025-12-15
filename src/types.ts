export enum EncodingMode {
  NUMERIC = "NUMERIC",
  ALPHANUMERIC = "ALPHANUMERIC",
  BYTE = "BYTE",
  KANJI = "KANJI"
}

export enum EncodingModeIndicator {
  NUMERIC = 0b0001,
  ALPHANUMERIC = 0b0010,
  BYTE = 0b0100,
  KANJI = 0b1000
}

// Character count indicator bit lengths for different version ranges
// Format: [versions 1-9, versions 10-26, versions 27-40]
const CHARACTER_COUNT_BITS: {
  [key in EncodingMode]: [number, number, number];
} = {
  NUMERIC: [10, 12, 14],
  ALPHANUMERIC: [9, 11, 13],
  BYTE: [8, 16, 16],
  KANJI: [8, 10, 12]
};

export function getCharacterCountBits(
  mode: EncodingMode,
  version: number
): number {
  if (version < 1 || version > 40) {
    throw new Error(`Invalid QR code version: ${version}`);
  }
  const rangeIndex = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  return CHARACTER_COUNT_BITS[mode][rangeIndex];
}

// Deprecated: Use getCharacterCountBits() instead
export enum CharacterCountIndicator {
  NUMERIC = 10, // for version 1-9
  ALPHANUMERIC = 9, // for version 1-9
  BYTE = 8, // for version 1-9
  KANJI = 8 // for version 1-9
}

export enum ErrorCorrectionLevel {
  L = "L", // 7%
  M = "M", // 15%
  Q = "Q", // 25%
  H = "H" // 30%
}

// Data capacity (in codewords) for all versions and error correction levels
export const DATA_CAPACITY: {
  [version: number]: { [level in ErrorCorrectionLevel]: number };
} = {
  1: { L: 19, M: 16, Q: 13, H: 9 },
  2: { L: 34, M: 28, Q: 22, H: 16 },
  3: { L: 55, M: 44, Q: 34, H: 26 },
  4: { L: 80, M: 64, Q: 48, H: 36 },
  5: { L: 108, M: 86, Q: 62, H: 46 },
  6: { L: 136, M: 108, Q: 76, H: 60 },
  7: { L: 156, M: 124, Q: 88, H: 66 },
  8: { L: 194, M: 154, Q: 110, H: 86 },
  9: { L: 232, M: 182, Q: 132, H: 100 },
  10: { L: 274, M: 216, Q: 154, H: 122 },
  11: { L: 324, M: 254, Q: 180, H: 140 },
  12: { L: 370, M: 290, Q: 206, H: 158 },
  13: { L: 428, M: 334, Q: 244, H: 180 },
  14: { L: 461, M: 365, Q: 261, H: 197 },
  15: { L: 523, M: 415, Q: 295, H: 223 },
  16: { L: 589, M: 453, Q: 325, H: 253 },
  17: { L: 647, M: 507, Q: 367, H: 283 },
  18: { L: 721, M: 563, Q: 397, H: 313 },
  19: { L: 795, M: 627, Q: 445, H: 341 },
  20: { L: 861, M: 669, Q: 485, H: 385 },
  21: { L: 932, M: 714, Q: 512, H: 406 },
  22: { L: 1006, M: 782, Q: 568, H: 442 },
  23: { L: 1094, M: 860, Q: 614, H: 464 },
  24: { L: 1174, M: 914, Q: 664, H: 514 },
  25: { L: 1276, M: 1000, Q: 718, H: 538 },
  26: { L: 1370, M: 1062, Q: 754, H: 596 },
  27: { L: 1468, M: 1128, Q: 808, H: 628 },
  28: { L: 1531, M: 1193, Q: 871, H: 661 },
  29: { L: 1631, M: 1267, Q: 911, H: 701 },
  30: { L: 1735, M: 1373, Q: 985, H: 745 },
  31: { L: 1843, M: 1455, Q: 1033, H: 793 },
  32: { L: 1955, M: 1541, Q: 1115, H: 845 },
  33: { L: 2071, M: 1631, Q: 1171, H: 901 },
  34: { L: 2191, M: 1725, Q: 1231, H: 961 },
  35: { L: 2306, M: 1812, Q: 1286, H: 986 },
  36: { L: 2434, M: 1914, Q: 1354, H: 1054 },
  37: { L: 2566, M: 1992, Q: 1426, H: 1096 },
  38: { L: 2702, M: 2102, Q: 1502, H: 1142 },
  39: { L: 2812, M: 2216, Q: 1582, H: 1222 },
  40: { L: 2956, M: 2334, Q: 1666, H: 1276 }
};

export function getDataCapacity(
  version: number,
  level: ErrorCorrectionLevel
): number {
  const capacity = DATA_CAPACITY[version]?.[level];
  if (capacity === undefined) {
    throw new Error(`Invalid version/level: ${version}/${level}`);
  }
  return capacity;
}

// Deprecated: Use getDataCapacity() instead
export enum NumberOfDataCodewordsLvl4 {
  L = 80,
  M = 64,
  Q = 48,
  H = 36
}

// QR Code size calculation: size = 21 + (version - 1) * 4
export function getQRCodeSize(version: number): number {
  if (version < 1 || version > 40) {
    throw new Error(`Invalid QR code version: ${version}`);
  }
  return 21 + (version - 1) * 4;
}

// Deprecated: Use getQRCodeSize() instead
export enum QRCodeSizeByVersion {
  VERSION_1 = 21,
  VERSION_2 = 25,
  VERSION_3 = 29,
  VERSION_4 = 33
  // ... up to 40
}

export interface QRCodeOptions {
  encodingMode: EncodingMode;
  errorCorrectionLevel: ErrorCorrectionLevel;
  version: number; // 1 to 40
}
