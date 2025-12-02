import * as fs from "fs";
import * as path from "path";
import { PNG } from "pngjs";
import {
  EncodingMode,
  EncodingModeIndicator,
  ErrorCorrectionLevel,
  NumberOfDataCodewordsLvl4,
  QRCodeSizeByVersion
} from "./types";
import type { QRCodeOptions } from "./types";
import { detectBestEncoding, encodeData } from "./encoding";
import { selectBestMaskPattern, applyDataMask } from "./masking";
import { implementErrorCorrection } from "./errorCorrection";
import {
  placeFinderPattern,
  placeAlignmentPattern,
  placeTimingPatterns,
  placeDarkModule,
  placeFormatInformation,
  createFormatInformationEncoding,
  placeQuietZone
} from "./patterns";

// TODO: Add support for different versions (1-40)
const VERSION = 4; // we're just using a fixed version for simplicity (33 x 33 modules)

class QRCodeGenerator {
  constructor() {
    // this.generate = this.generate.bind(this);
  }

  validateInput(data: string): boolean {
    return data.length > 0 && data.length <= 2953; // Max length for QR Code version 40-L
  }

  placeDataBits(
    matrix: number[][],
    dataBits: number[],
    isFunctionModule: boolean[][]
  ) {
    const size = matrix.length;
    let col = size - 1;
    let direction = -1; // up
    let bitIndex = 0;

    while (col > 0) {
      if (col === 6) col--; // skip timing pattern column

      let row = direction === -1 ? size - 1 : 0; // Reset row for each column pair

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < 2; j++) {
          const c = col - j;
          if (!isFunctionModule[row]![c] && bitIndex < dataBits.length) {
            matrix[row]![c] = dataBits[bitIndex++];
          }
        }
        row += direction;
        if (row < 0 || row >= size) {
          direction *= -1;
          break;
        }
      }
      direction *= -1;
      col -= 2;
    }
  }

  createQRCodeMatrix(
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

    placeDarkModule(matrix, size);

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
    console.log("Final QR Code Matrix with Reserved Areas:");
    console.table(matrix);

    // place data + ec bits
    this.placeDataBits(
      matrix,
      Array.from(dataWithEc).flatMap((byte) =>
        Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1)
      ),
      this.createIsFunctionModuleMatrix(size)
    );

    console.log("Final QR Code Matrix with Data Bits:");
    console.table(matrix);

    return matrix;
  }

  createIsFunctionModuleMatrix(size: number): boolean[][] {
    const matrix = Array.from({ length: size }, () => Array(size).fill(false));

    // Finder patterns (top-left, top-right, bottom-left)
    const finderCoords: [number, number][] = [
      [0, 0],
      [0, size - 7],
      [size - 7, 0]
    ];
    for (const coord of finderCoords) {
      const [row, col] = coord;
      if (typeof row !== "number" || typeof col !== "number") continue;

      for (let r = row; r < row + 7; r++) {
        for (let c = col; c < col + 7; c++) {
          matrix[r]![c] = true;
        }
      }
    }
    // Separators (1-module wide white border around finder patterns)
    for (const [row, col] of finderCoords) {
      // Horizontal separators (above and below)
      for (let c = col - 1; c <= col + 7; c++) {
        if (row - 1 >= 0 && c >= 0 && c < size) {
          matrix[row - 1]![c] = 0;
          matrix[row - 1]![c] = true;
        }
        if (row + 7 < size && c >= 0 && c < size) {
          matrix[row + 7]![c] = 0;
          matrix[row + 7]![c] = true;
        }
      }
      // Vertical separators (left and right)
      for (let r = row; r < row + 7; r++) {
        if (col - 1 >= 0 && r >= 0 && r < size) {
          matrix[r]![col - 1] = 0;
          matrix[r]![col - 1] = true;
        }
        if (col + 7 < size && r >= 0 && r < size) {
          matrix[r]![col + 7] = 0;
          matrix[r]![col + 7] = true;
        }
      }
    }

    // Timing patterns (horizontal and vertical lines at row 6 and column 6)
    for (let i = 0; i < size; i++) {
      matrix[6]![i] = true;
      matrix[i]![6] = true;
    }

    // Alignment patterns (for versions >= 2)
    // Add logic for alignment patterns if needed
    // For version 4, alignment pattern at (26,26)
    // TODO: Generalize for other versions
    const alignRow = 26;
    const alignCol = 26;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (
          i === -2 ||
          i === 2 ||
          j === -2 ||
          j === 2 ||
          (i === 0 && j === 0)
        ) {
          matrix[alignRow + i]![alignCol + j] = true;
        } else {
          matrix[alignRow + i]![alignCol + j] = true;
        }
      }
    }

    // Format information areas
    for (let i = 0; i < 8; i++) {
      matrix[8]![i] = true;
      matrix[i]![8] = true;
      matrix[8]![size - 8 + i] = true;
      matrix[size - 8 + i]![8] = true;
    }

    // dark module
    matrix[size - 8]![8] = true;

    // Version information areas (for versions >= 7)
    // Add logic for version info if needed
    // TODO: add this bit when adding support for versions 7 and above

    return matrix;
  }

  generateQrCode(
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
    let qrMatrix = this.createQRCodeMatrix(dataWithEc, {
      encodingMode: encoding,
      errorCorrectionLevel,
      version: VERSION
    });

    const isFunctionModule = this.createIsFunctionModuleMatrix(qrMatrix.length);
    const bestMask = selectBestMaskPattern(qrMatrix, (m, mask) =>
      applyDataMask(m, mask, isFunctionModule)
    );
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

  generate(data: string): number[][] {
    if (!this.validateInput(data)) {
      throw new Error("Invalid input data for QR code generation.");
    }

    const encoding = detectBestEncoding(data);
    console.log(`Detected encoding mode: ${encoding}`);

    const qrMatrix = this.generateQrCode(
      data,
      encoding,
      ErrorCorrectionLevel.L
    );
    console.log("Generated QR Code Matrix:");
    console.table(qrMatrix);

    return qrMatrix;
  }

  saveQRCodeAsImage(matrix: number[][], filePath?: string): void {
    const size = matrix.length;
    const scale = 10; // pixels per module
    const png = new PNG({
      width: size * scale,
      height: size * scale,
      colorType: 0
    });

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = matrix[y]![x] ? 0 : 255; // 0: black, 255: white
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const idx = ((y * scale + dy) * png.width + (x * scale + dx)) << 2;
            png.data[idx] = color; // R
            png.data[idx + 1] = color; // G
            png.data[idx + 2] = color; // B
            png.data[idx + 3] = 255; // A
          }
        }
      }
    }

    const filePathFinal = filePath || `./qr_codes/qrcode_${Date.now()}.png`;
    const dir = path.dirname(filePathFinal);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    png.pack().pipe(fs.createWriteStream(filePathFinal));
    console.log(`Saving QR code image to ${filePathFinal}...`);
  }
}

export {
  QRCodeGenerator,
  EncodingMode,
  EncodingModeIndicator,
  ErrorCorrectionLevel,
  NumberOfDataCodewordsLvl4
};
