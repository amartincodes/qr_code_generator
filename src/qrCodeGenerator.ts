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
  placeQuietZone,
  placeDataBits
} from "./patterns";
import { createQrCodeMatrix } from "./matrix";

class QRCodeGenerator {
  constructor() {
    // this.generate = this.generate.bind(this);
  }

  validateInput(data: string): boolean {
    return data.length > 0 && data.length <= 2953; // Max length for QR Code version 40-L
  }

  generate(data: string): number[][] {
    if (!this.validateInput(data)) {
      throw new Error("Invalid input data for QR code generation.");
    }

    const encoding = detectBestEncoding(data);
    console.log(`Detected encoding mode: ${encoding}`);

    const qrMatrix = createQrCodeMatrix(data, encoding, ErrorCorrectionLevel.L);
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
