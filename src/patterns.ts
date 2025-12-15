import { ErrorCorrectionLevel } from "./types";

export const VERSION_INFO: { [version: number]: number } = {
  7: 0x07c94,
  8: 0x085bc,
  9: 0x09a99,
  10: 0x0a4d3,
  11: 0x0b08e,
  12: 0x0b67e,
  13: 0x0c762,
  14: 0x0d847,
  15: 0x0e60d,
  16: 0x0f928,
  17: 0x10b78,
  18: 0x1145d,
  19: 0x12a17,
  20: 0x13532,
  21: 0x149a6,
  22: 0x15683,
  23: 0x168c9,
  24: 0x177ec,
  25: 0x18ec4,
  26: 0x191e1,
  27: 0x1afab,
  28: 0x1b08e,
  29: 0x1cc1a,
  30: 0x1d33f,
  31: 0x1ed75,
  32: 0x1f250,
  33: 0x209d5,
  34: 0x216f0,
  35: 0x228ba,
  36: 0x2379f,
  37: 0x24b0b,
  38: 0x2542e,
  39: 0x26a64,
  40: 0x27541
};

// Alignment pattern center module positions for each QR code version
// Version 1 has no alignment patterns. Versions 2-40 have varying numbers.
// These coordinates are used as BOTH row and column positions (grid intersections)
export const ALIGNMENT_PATTERN_POSITIONS: number[][] = [
  [], // Version 0 (placeholder)
  [], // Version 1: no alignment patterns
  [6, 18], // Version 2
  [6, 22], // Version 3
  [6, 26], // Version 4
  [6, 30], // Version 5
  [6, 34], // Version 6
  [6, 22, 38], // Version 7
  [6, 24, 42], // Version 8
  [6, 26, 46], // Version 9
  [6, 28, 50], // Version 10
  [6, 30, 54], // Version 11
  [6, 32, 58], // Version 12
  [6, 34, 62], // Version 13
  [6, 26, 46, 66], // Version 14
  [6, 26, 48, 70], // Version 15
  [6, 26, 50, 74], // Version 16
  [6, 30, 54, 78], // Version 17
  [6, 30, 56, 82], // Version 18
  [6, 30, 58, 86], // Version 19
  [6, 34, 62, 90], // Version 20
  [6, 28, 50, 72, 94], // Version 21
  [6, 26, 50, 74, 98], // Version 22
  [6, 30, 54, 78, 102], // Version 23
  [6, 28, 54, 80, 106], // Version 24
  [6, 32, 58, 84, 110], // Version 25
  [6, 30, 58, 86, 114], // Version 26
  [6, 34, 62, 90, 118], // Version 27
  [6, 26, 50, 74, 98, 122], // Version 28
  [6, 30, 54, 78, 102, 126], // Version 29
  [6, 26, 52, 78, 104, 130], // Version 30
  [6, 30, 56, 82, 108, 134], // Version 31
  [6, 34, 60, 86, 112, 138], // Version 32
  [6, 30, 58, 86, 114, 142], // Version 33
  [6, 34, 62, 90, 118, 146], // Version 34
  [6, 30, 54, 78, 102, 126, 150], // Version 35
  [6, 24, 50, 76, 102, 128, 154], // Version 36
  [6, 28, 54, 80, 106, 132, 158], // Version 37
  [6, 32, 58, 84, 110, 136, 162], // Version 38
  [6, 26, 54, 82, 110, 138, 166], // Version 39
  [6, 30, 58, 86, 114, 142, 170] // Version 40
];

function placeFinderPattern(matrix: number[][], row: number, col: number) {
  // Finder pattern (7x7)
  // TODO: Generalise for other versions
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (
        i === 0 ||
        i === 6 ||
        j === 0 ||
        j === 6 ||
        (i >= 2 && i <= 4 && j >= 2 && j <= 4)
      ) {
        // @ts-ignore
        matrix[row + i][col + j] = 1;
      }
    }
  }
  // Separator (8x8)
  for (let i = 0; i < 8; i++) {
    if (row + i < matrix.length && col + 7 < matrix.length) {
      matrix[row + i]![col + 7] = 0;
    }
    if (row + 7 < matrix.length && col + i < matrix.length) {
      matrix[row + 7]![col + i] = 0;
    }
  }
}

function placeTimingPatterns(matrix: number[][], size: number): number[][] {
  // add timing patterns
  // Horizontal
  for (let i = 8; i < size - 8; i++) {
    matrix[6]![i] = i % 2 === 0 ? 1 : 0;
  }
  // Vertical
  for (let i = 8; i < size - 8; i++) {
    matrix[i]![6] = i % 2 === 0 ? 1 : 0;
  }
  return matrix;
}

// Helper function to place a single 5x5 alignment pattern centered at (row, col)
function placeAlignmentPatternAt(
  matrix: number[][],
  row: number,
  col: number
): void {
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const r = row + i;
      const c = col + j;
      if (i === -2 || i === 2 || j === -2 || j === 2 || (i === 0 && j === 0)) {
        matrix[r]![c] = 1; // black border and center
      } else {
        matrix[r]![c] = 0; // white center
      }
    }
  }
}

function placeAlignmentPattern(
  matrix: number[][],
  version: number
): number[][] {
  // Get alignment pattern positions for this version
  const positions = ALIGNMENT_PATTERN_POSITIONS[version];
  if (!positions || positions.length === 0) {
    return matrix; // Version 1 has no alignment patterns
  }

  const size = matrix.length;

  // Place patterns at all grid intersections of the position coordinates
  // Avoid placing where it would overlap with finder patterns (corners)
  for (const row of positions) {
    for (const col of positions) {
      // Check if this position would overlap with finder patterns
      // Top-left finder: rows 0-8, cols 0-8
      // Top-right finder: rows 0-8, cols (size-9) to (size-1)
      // Bottom-left finder: rows (size-9) to (size-1), cols 0-8
      const overlapsTopLeft = row <= 8 && col <= 8;
      const overlapsTopRight = row <= 8 && col >= size - 9;
      const overlapsBottomLeft = row >= size - 9 && col <= 8;

      if (overlapsTopLeft || overlapsTopRight || overlapsBottomLeft) {
        continue; // Skip this position
      }

      // Place the 5x5 alignment pattern centered at (row, col)
      placeAlignmentPatternAt(matrix, row, col);
    }
  }

  return matrix;
}

function placeVersionInformation(
  matrix: number[][],
  version: number
): number[][] {
  if (version < 7) return matrix; // Only for version 7+

  const versionInfoBits = createVersionInformationEncoding(version);
  const size = matrix.length;

  // Place version info in top-right
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const bit = Number(versionInfoBits[i * 3 + j]);
      matrix[i]![size - 11 + j] = bit;
    }
  }

  // Place version info in bottom-left
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 6; j++) {
      const bit = Number(versionInfoBits[i * 6 + j]);
      matrix[size - 11 + j]![i] = bit;
    }
  }

  return matrix;
}

function placeDarkModule(matrix: number[][], size: number): number[][] {
  // Add dark module
  // For version 4, at (8, size-8)
  // TODO: Generalise for other versions
  matrix[size - 8]![8] = 1;
  return matrix;
}

function createFormatInformationEncoding(
  errorCorrectionLevel: ErrorCorrectionLevel,
  maskPattern: number
): string {
  // Pre-computed format information strings (15 bits after BCH encoding and masking)
  // These are defined in the QR code specification ISO/IEC 18004
  // Format: [EC Level][Mask Pattern]
  const formatInfoTable: { [key in ErrorCorrectionLevel]: string[] } = {
    L: [
      "111011111000100", // Mask 0
      "111001011110011", // Mask 1
      "111110110101010", // Mask 2
      "111100010011101", // Mask 3
      "110011000101111", // Mask 4
      "110001100011000", // Mask 5
      "110110001000001", // Mask 6
      "110100101110110" // Mask 7
    ],
    M: [
      "101010000010010", // Mask 0
      "101000100100101", // Mask 1
      "101111001111100", // Mask 2
      "101101101001011", // Mask 3
      "100010111111001", // Mask 4
      "100000011001110", // Mask 5
      "100111110010111", // Mask 6
      "100101010100000" // Mask 7
    ],
    Q: [
      "011010101011111", // Mask 0
      "011000001101000", // Mask 1
      "011111100110001", // Mask 2
      "011101000000110", // Mask 3
      "010010010110100", // Mask 4
      "010000110000011", // Mask 5
      "010111011011010", // Mask 6
      "010101111101101" // Mask 7
    ],
    H: [
      "001011010001001", // Mask 0
      "001001110111110", // Mask 1
      "001110011100111", // Mask 2
      "001100111010000", // Mask 3
      "000011101100010", // Mask 4
      "000001001010101", // Mask 5
      "000110100001100", // Mask 6
      "000100000111011" // Mask 7
    ]
  };

  return formatInfoTable[errorCorrectionLevel]![maskPattern]!;
}

function placeFormatInformation(
  matrix: number[][],
  formatInfo: string
): number[][] {
  const size = matrix.length;

  // Format info bits are indexed 0-14
  // Bits 0-6: horizontal in top-left, vertical in bottom-left
  // Bits 7-14: vertical in top-left, horizontal in top-right

  // Top-left horizontal (row 8, columns 0-7, skipping column 6)
  // Place bits 0-6
  matrix[8]![0] = parseInt(formatInfo[0]!, 10);
  matrix[8]![1] = parseInt(formatInfo[1]!, 10);
  matrix[8]![2] = parseInt(formatInfo[2]!, 10);
  matrix[8]![3] = parseInt(formatInfo[3]!, 10);
  matrix[8]![4] = parseInt(formatInfo[4]!, 10);
  matrix[8]![5] = parseInt(formatInfo[5]!, 10);
  // Skip column 6 (timing pattern)
  matrix[8]![7] = parseInt(formatInfo[6]!, 10);

  // Bottom-left vertical (column 8, rows size-7 to size-1)
  // Place bits 0-6 (duplicate)
  for (let i = 0; i < 7; i++) {
    matrix[size - 7 + i]![8] = parseInt(formatInfo[i]!, 10);
  }

  // Top-left vertical (column 8, rows 0-8, skipping row 6)
  // Place bits 7-14
  matrix[0]![8] = parseInt(formatInfo[14]!, 10);
  matrix[1]![8] = parseInt(formatInfo[13]!, 10);
  matrix[2]![8] = parseInt(formatInfo[12]!, 10);
  matrix[3]![8] = parseInt(formatInfo[11]!, 10);
  matrix[4]![8] = parseInt(formatInfo[10]!, 10);
  matrix[5]![8] = parseInt(formatInfo[9]!, 10);
  // Skip row 6 (timing pattern)
  matrix[7]![8] = parseInt(formatInfo[8]!, 10);
  matrix[8]![8] = parseInt(formatInfo[7]!, 10);

  // Top-right horizontal (row 8, columns size-1 to size-8)
  // Place bits 7-14 (duplicate)
  for (let i = 0; i < 8; i++) {
    matrix[8]![size - 1 - i] = parseInt(formatInfo[14 - i]!, 10);
  }

  return matrix;
}
// function placeFormatInformation(
//   matrix: number[][],
//   formatInfo: string
// ): number[][] {
//   const size = matrix.length;
//   // Top-left: vertical
//   for (let i = 0; i < 6; i++) {
//     matrix[i]![8] = parseInt(formatInfo[i] ?? "0", 10);
//   }
//   // Top-left: horizontal
//   for (let i = 0; i < 8; i++) {
//     matrix[8]![size - 8 + i] = parseInt(formatInfo[7 + i] ?? "0", 10); // Top-right
//     if (i < 7) {
//       matrix[size - 1 - i]![8] = parseInt(formatInfo[i] ?? "0", 10); // Bottom-left
//     }
//   }
//   matrix[7]![8] = parseInt(formatInfo[6] ?? "0", 10);
//   matrix[8]![8] = parseInt(formatInfo[7] ?? "0", 10);
//   matrix[8]![7] = parseInt(formatInfo[8] ?? "0", 10);
//   for (let i = 9; i < 15; i++) {
//     matrix[8]![14 - i] = parseInt(formatInfo[i] ?? "0", 10);
//   }
//   return matrix;
// }
// createFormatInformationEncoding(
//   errorCorrectionLevel: ErrorCorrectionLevel,
//   maskPattern: number
// ): string {
//   // Step 1: Build 5-bit format info
//   const ecLevelBitsMap: { [key in ErrorCorrectionLevel]: string } = {
//     L: "01",
//     M: "00",
//     Q: "11",
//     H: "10"
//   };
//   const ecLevelBits = ecLevelBitsMap[errorCorrectionLevel];
//   const maskPatternBits = maskPattern.toString(2).padStart(3, "0");
//   const formatInfoWithoutBCH = ecLevelBits + maskPatternBits; // 5 bits
//
//   // Step 2: Append 10 zeros (shift left by 10 bits)
//   let data = formatInfoWithoutBCH + "0000000000";
//
//   // Step 3: Polynomial division (modulo 2, XOR)
//   const generator = "10100110111";
//   function xorStrings(a: string, b: string): string {
//     return a
//       .split("")
//       .map((c, i) => (c === b[i] ? "0" : "1"))
//       .join("");
//   }
//   while (data.length >= generator.length) {
//     if (data[0] === "1") {
//       const paddedGen = generator.padEnd(data.length, "0");
//       data = xorStrings(data, paddedGen);
//     }
//     // Remove leading zero
//     data = data.replace(/^0+/, "");
//   }
//   // Step 4: Pad to 10 bits
//   const bchCode = data.padStart(10, "0");
//
//   // Step 5: Concatenate format info and error correction bits
//   let formatInfo = formatInfoWithoutBCH + bchCode;
//
//   // Step 6: XOR with mask pattern
//   const mask = "101010000010010";
//   formatInfo = xorStrings(formatInfo.padStart(15, "0"), mask);
//
//   console.log("Format Information Encoding:", formatInfo);
//
//   return formatInfo;
// }
//
// placeFormatInformation(matrix: number[][], formatInfo: string): number[][] {
//   let updatedMatrix = matrix;
//   const size = matrix.length;
//
//   // Place bits in the reserved areas
//   // Top-left
//   for (let i = 0; i < 6; i++) {
//     updatedMatrix[8]![i] = parseInt(formatInfo[i] ?? "0", 10);
//   }
//   updatedMatrix[8]![7] = parseInt(formatInfo[6] ?? "0", 10);
//   updatedMatrix[8]![8] = parseInt(formatInfo[7] ?? "0", 10);
//   updatedMatrix[7]![8] = parseInt(formatInfo[8] ?? "0", 10);
//   for (let i = 9; i < 15; i++) {
//     updatedMatrix[14 - i]![8] = parseInt(formatInfo[i] ?? "0", 10);
//   }
//
//   // Top-right
//   for (let i = 0; i < 8; i++) {
//     updatedMatrix[8]![size - 8 + i] = parseInt(formatInfo[7 + i] ?? "0", 10);
//   }
//   // Bottom-left
//   for (let i = 0; i < 7; i++) {
//     updatedMatrix[size - 1 - i]![8] = parseInt(formatInfo[i] ?? "0", 10);
//   }
//
//   console.log("QR Code Matrix with Format Information:");
//   console.table(updatedMatrix);
//   return updatedMatrix;
// }

// Implements version information encoding for versions 7 and above
function createVersionInformationEncoding(version: number): string {
  // Look up pre-computed version information from VERSION_INFO
  const versionInfo = VERSION_INFO[version];
  if (versionInfo === undefined) {
    throw new Error(`Version information not available for version ${version}`);
  }
  // Return as 18-bit binary string
  return versionInfo.toString(2).padStart(18, "0");
}

function placeQuietZone(matrix: number[][], quietZoneSize: number): number[][] {
  const size = matrix.length;
  const newSize = size + quietZoneSize * 2;
  const newMatrix: number[][] = Array.from({ length: newSize }, () =>
    Array(newSize).fill(0)
  );

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      newMatrix[r + quietZoneSize]![c + quietZoneSize] = matrix[r]![c]!;
    }
  }

  return newMatrix;
}

function placeDataBits(
  matrix: number[][],
  dataBits: number[],
  isFunctionModule: boolean[][]
): number[][] {
  const size = matrix.length;
  let bitIndex = 0;

  // Start from the bottom-right corner, move in 2-column strips
  for (let right = size - 1; right >= 1; right -= 2) {
    // Skip the timing pattern column at column 6
    let col = right;
    if (right <= 6) col = right - 1;

    // Determine if we're going up or down
    // Right-most strip goes up, then alternates
    const stripIndex = (size - 1 - right) / 2;
    const goingUp = stripIndex % 2 === 0;

    for (let i = 0; i < size; i++) {
      const row = goingUp ? size - 1 - i : i;

      // Process columns in the 2-column strip
      // Always place right column first, then left column (regardless of direction)
      for (let j = 0; j < 2; j++) {
        const c = col - j;
        if (c < 0) continue;
        if (c === 6) continue; // Skip timing column
        if (isFunctionModule[row]![c]) continue;
        if (bitIndex >= dataBits.length) continue;

        matrix[row]![c] = dataBits[bitIndex++]!;
      }
    }
  }

  return matrix;
}

export {
  placeFinderPattern,
  placeDarkModule,
  createFormatInformationEncoding,
  placeFormatInformation,
  createVersionInformationEncoding,
  placeVersionInformation,
  placeQuietZone,
  placeAlignmentPattern,
  placeTimingPatterns,
  placeDataBits
};
