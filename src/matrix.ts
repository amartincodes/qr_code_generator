import { EncodingMode, ErrorCorrectionLevel, getQRCodeSize } from "./types";
import type { QRCodeOptions } from "./types";
import { implementErrorCorrection } from "./errorCorrection";
import { ALIGNMENT_PATTERN_POSITIONS } from "./patterns";
import {
  placeFinderPattern,
  placeAlignmentPattern,
  placeTimingPatterns,
  placeDarkModule,
  placeDataBits,
  placeFormatInformation,
  placeQuietZone,
  createFormatInformationEncoding
} from "./patterns";
import { selectBestMaskPattern, applyDataMask } from "./masking";
import { encodeData } from "./encoding";

function createInitialMatrix(
  dataWithEc: Uint8Array,
  options: QRCodeOptions
): number[][] {
  // Get QR code matrix size based on version
  const size = getQRCodeSize(options.version);
  const matrix: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(0)
  );

  // place finder patterns with separators
  // Top-left
  placeFinderPattern(matrix, 0, 0);
  // Top-right
  placeFinderPattern(matrix, 0, size - 7);
  // Bottom-left
  placeFinderPattern(matrix, size - 7, 0);

  placeAlignmentPattern(matrix, options.version);

  placeTimingPatterns(matrix, size);
  // console.log("QR Code Matrix with Timing Patterns:");
  // console.table(matrix);

  // reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      matrix[8]![i] = 0; // Top-left horizontal
      matrix[i]![8] = 0; // Top-left vertical
    }
  }
  for (let i = size - 8; i < size; i++) {
    matrix[8]![i] = 0; // Top-right
    matrix[i]![8] = 0; // Bottom-left
  }

  placeDarkModule(matrix, size);

  console.log("Final QR Code Matrix with Reserved Areas:");
  console.table(matrix);

  // place data + ec bits
  placeDataBits(
    matrix,
    Array.from(dataWithEc).flatMap((byte) =>
      Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1)
    ),
    createIsFunctionModuleMatrix(size, options.version)
  );

  console.log("Final QR Code Matrix with Data Bits:");
  console.table(matrix);

  return matrix;
}

function createIsFunctionModuleMatrix(
  size: number,
  version: number
): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Finder patterns + separators (8x8 area for each)
  // Top-left: rows 0-7, cols 0-7
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      matrix[r]![c] = true;
    }
  }
  // Top-right: rows 0-7, cols (size-8) to (size-1)
  for (let r = 0; r < 8; r++) {
    for (let c = size - 8; c < size; c++) {
      matrix[r]![c] = true;
    }
  }
  // Bottom-left: rows (size-8) to (size-1), cols 0-7
  for (let r = size - 8; r < size; r++) {
    for (let c = 0; c < 8; c++) {
      matrix[r]![c] = true;
    }
  }

  // Timing patterns (row 6 and column 6)
  for (let i = 0; i < size; i++) {
    matrix[6]![i] = true;
    matrix[i]![6] = true;
  }

  // Alignment patterns (version-aware)
  const positions = ALIGNMENT_PATTERN_POSITIONS[version];
  if (positions && positions.length > 0) {
    for (const row of positions) {
      for (const col of positions) {
        // Skip if overlaps with finder patterns
        const overlapsTopLeft = row <= 8 && col <= 8;
        const overlapsTopRight = row <= 8 && col >= size - 9;
        const overlapsBottomLeft = row >= size - 9 && col <= 8;

        if (overlapsTopLeft || overlapsTopRight || overlapsBottomLeft) {
          continue;
        }

        // Mark 5x5 alignment pattern area
        for (let r = row - 2; r <= row + 2; r++) {
          for (let c = col - 2; c <= col + 2; c++) {
            matrix[r]![c] = true;
          }
        }
      }
    }
  }

  // Format information areas
  // Top-left horizontal (row 8, cols 0-8)
  for (let c = 0; c <= 8; c++) {
    matrix[8]![c] = true;
  }
  // Top-left vertical (rows 0-8, col 8)
  for (let r = 0; r <= 8; r++) {
    matrix[r]![8] = true;
  }
  // Top-right horizontal (row 8, cols size-8 to size-1)
  for (let c = size - 8; c < size; c++) {
    matrix[8]![c] = true;
  }
  // Bottom-left vertical (rows size-7 to size-1, col 8)
  for (let r = size - 7; r < size; r++) {
    matrix[r]![8] = true;
  }

  // Dark module (always at (size - 8, 8))
  matrix[size - 8]![8] = true;

  // Version information areas (for versions >= 7 only)
  if (version >= 7) {
    // Bottom-left area: 6 rows × 3 columns
    for (let r = size - 11; r < size - 8; r++) {
      for (let c = 0; c < 6; c++) {
        matrix[r]![c] = true;
      }
    }
    // Top-right area: 3 rows × 6 columns
    for (let r = 0; r < 6; r++) {
      for (let c = size - 11; c < size - 8; c++) {
        matrix[r]![c] = true;
      }
    }
  }

  return matrix;
}

function createQrCodeMatrix(
  data: string,
  encoding: EncodingMode,
  errorCorrectionLevel: ErrorCorrectionLevel,
  version: number = 4 // Default to version 4 for backward compatibility
): number[][] {
  const encodedData = encodeData(data, {
    encodingMode: encoding,
    errorCorrectionLevel,
    version
  });
  console.log("Encoded Data Bytes:", encodedData);
  const dataWithEc = implementErrorCorrection(
    encodedData,
    errorCorrectionLevel,
    version
  );
  console.log("Data with Error Correction Bytes:", dataWithEc);
  let qrMatrix = createInitialMatrix(dataWithEc, {
    encodingMode: encoding,
    errorCorrectionLevel,
    version
  });

  const isFunctionModule = createIsFunctionModuleMatrix(
    qrMatrix.length,
    version
  );
  const bestMask = selectBestMaskPattern(qrMatrix, isFunctionModule);
  console.log("Best Mask Pattern Selected:", bestMask);
  qrMatrix = applyDataMask(qrMatrix, bestMask, isFunctionModule);

  const formatInfo = createFormatInformationEncoding(
    errorCorrectionLevel,
    bestMask
  );
  qrMatrix = placeFormatInformation(qrMatrix, formatInfo);

  qrMatrix = placeQuietZone(qrMatrix, 4);

  console.log("Final QR Code Matrix with Quiet Zone:");
  console.table(qrMatrix);

  return qrMatrix;
}

export {
  createInitialMatrix,
  createIsFunctionModuleMatrix,
  createQrCodeMatrix
};
