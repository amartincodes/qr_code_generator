import {
  EncodingMode,
  ErrorCorrectionLevel,
  QRCodeSizeByVersion
} from "./types";
import type { QRCodeOptions } from "./types";
import { implementErrorCorrection } from "./errorCorrection";
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

const VERSION = 4; // Example: Version 4 QR Code
function createInitialMatrix(
  dataWithEc: Uint8Array,
  options: QRCodeOptions
): number[][] {
  // Placeholder: In a real implementation, this would map data bits into the QR code matrix
  const size =
    QRCodeSizeByVersion[
      `VERSION_${options.version}` as keyof typeof QRCodeSizeByVersion
    ];
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

  placeAlignmentPattern(matrix);

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
    createIsFunctionModuleMatrix(size)
  );

  console.log("Final QR Code Matrix with Data Bits:");
  console.table(matrix);

  return matrix;
}

function createIsFunctionModuleMatrix(size: number): boolean[][] {
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

  // Alignment pattern at (26, 26) for version 4
  // TODO: Generalize for other versions using alignment pattern table
  const alignRow = 26;
  const alignCol = 26;
  for (let r = alignRow - 2; r <= alignRow + 2; r++) {
    for (let c = alignCol - 2; c <= alignCol + 2; c++) {
      matrix[r]![c] = true;
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

  // Dark module (always at (4*version + 9, 8) = (25, 8) for version 4)
  matrix[size - 8]![8] = true;

  // Version information areas (for versions >= 7 only)
  // TODO: Add when supporting versions 7+

  return matrix;
}

function createQrCodeMatrix(
  data: string,
  encoding: EncodingMode,
  errorCorrectionLevel: ErrorCorrectionLevel
): number[][] {
  const encodedData = encodeData(data, {
    encodingMode: encoding,
    errorCorrectionLevel,
    version: VERSION
  });
  console.log("Encoded Data Bytes:", encodedData);
  const dataWithEc = implementErrorCorrection(
    encodedData,
    errorCorrectionLevel
  );
  console.log("Data with Error Correction Bytes:", dataWithEc);
  let qrMatrix = createInitialMatrix(dataWithEc, {
    encodingMode: encoding,
    errorCorrectionLevel,
    version: VERSION
  });

  const isFunctionModule = createIsFunctionModuleMatrix(qrMatrix.length);
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
