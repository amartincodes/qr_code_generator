import { EncodingMode } from "../src/types";
import type { QRCodeOptions } from "../src/types";
import { implementErrorCorrection } from "../src/errorCorrection";
import { encodeData } from "../src/encoding";
import {
  createInitialMatrix,
  createIsFunctionModuleMatrix,
  createQrCodeMatrix
} from "../src/matrix";

describe("Matrix tests: ", () => {
  describe("createInitialMatrix", () => {
    it("should create a QR code matrix for numeric data", () => {
      const data = "1234567890";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "L",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel
      );
      const matrix = createInitialMatrix(finalData, options);

      // For version 4, the matrix should be 33x33
      expect(matrix.length).toBe(33);
      expect(matrix[0].length).toBe(33);
    });

    it("should place finder patterns in correct positions", () => {
      const data = "12345";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "L",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel
      );
      const matrix = createInitialMatrix(finalData, options);
      const size = matrix.length;

      // Check top-left finder pattern (7x7)
      // Outer border should be 1
      for (let i = 0; i < 7; i++) {
        expect(matrix[0]![i]).toBe(1); // Top row
        expect(matrix[6]![i]).toBe(1); // Bottom row
        expect(matrix[i]![0]).toBe(1); // Left column
        expect(matrix[i]![6]).toBe(1); // Right column
      }
      // Center 3x3 should be 1
      expect(matrix[3]![3]).toBe(1);

      // Check top-right finder pattern
      for (let i = 0; i < 7; i++) {
        expect(matrix[0]![size - 7 + i]).toBe(1); // Top row
        expect(matrix[6]![size - 7 + i]).toBe(1); // Bottom row
      }

      // Check bottom-left finder pattern
      for (let i = 0; i < 7; i++) {
        expect(matrix[size - 7 + i]![0]).toBe(1); // Left column
        expect(matrix[size - 7 + i]![6]).toBe(1); // Right column
      }
    });

    it("should place timing patterns correctly", () => {
      const data = "12345";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "L",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel
      );
      const matrix = createInitialMatrix(finalData, options);
      const size = matrix.length;

      // Timing patterns alternate between 1 and 0
      // Horizontal timing pattern at row 6
      for (let i = 8; i < size - 8; i++) {
        expect(matrix[6]![i]).toBe(i % 2 === 0 ? 1 : 0);
      }
      // Vertical timing pattern at column 6
      for (let i = 8; i < size - 8; i++) {
        expect(matrix[i]![6]).toBe(i % 2 === 0 ? 1 : 0);
      }
    });

    it("should place dark module correctly", () => {
      const data = "12345";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "L",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel
      );
      const matrix = createInitialMatrix(finalData, options);
      const size = matrix.length;

      // Dark module is always at (4*version + 9, 8) = (25, 8) for version 4
      // Which is (size - 8, 8)
      expect(matrix[size - 8]![8]).toBe(1);
    });

    it("should place alignment pattern for version 4", () => {
      const data = "12345";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "L",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel
      );
      const matrix = createInitialMatrix(finalData, options);

      // Version 4 has alignment pattern at (26, 26)
      // Center should be 1
      expect(matrix[26]![26]).toBe(1);
      // Ring around center should be 0
      expect(matrix[25]![26]).toBe(0);
      expect(matrix[26]![25]).toBe(0);
      // Outer ring should be 1
      expect(matrix[24]![24]).toBe(1);
      expect(matrix[24]![28]).toBe(1);
      expect(matrix[28]![24]).toBe(1);
      expect(matrix[28]![28]).toBe(1);
    });

    it("should only contain 0s and 1s", () => {
      const data = "HELLO";
      const options = {
        encodingMode: EncodingMode.ALPHANUMERIC,
        errorCorrectionLevel: "M",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel
      );
      const matrix = createInitialMatrix(finalData, options);

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r]!.length; c++) {
          expect(matrix[r]![c] === 0 || matrix[r]![c] === 1).toBe(true);
        }
      }
    });
  });

  describe("createIsFunctionModuleMatrix", () => {
    it("should create matrix of correct size", () => {
      const size = 33;
      const matrix = createIsFunctionModuleMatrix(size);

      expect(matrix.length).toBe(size);
      expect(matrix[0]!.length).toBe(size);
    });

    it("should mark finder patterns and separators as function modules", () => {
      const size = 33;
      const matrix = createIsFunctionModuleMatrix(size);

      // Top-left 8x8 area (finder + separator)
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          expect(matrix[r]![c]).toBe(true);
        }
      }

      // Top-right 8x8 area
      for (let r = 0; r < 8; r++) {
        for (let c = size - 8; c < size; c++) {
          expect(matrix[r]![c]).toBe(true);
        }
      }

      // Bottom-left 8x8 area
      for (let r = size - 8; r < size; r++) {
        for (let c = 0; c < 8; c++) {
          expect(matrix[r]![c]).toBe(true);
        }
      }
    });

    it("should mark timing patterns as function modules", () => {
      const size = 33;
      const matrix = createIsFunctionModuleMatrix(size);

      // Row 6 and column 6 should all be function modules
      for (let i = 0; i < size; i++) {
        expect(matrix[6]![i]).toBe(true);
        expect(matrix[i]![6]).toBe(true);
      }
    });

    it("should mark alignment pattern as function modules", () => {
      const size = 33;
      const matrix = createIsFunctionModuleMatrix(size);

      // Version 4 alignment pattern at (26, 26), 5x5 area
      for (let r = 24; r <= 28; r++) {
        for (let c = 24; c <= 28; c++) {
          expect(matrix[r]![c]).toBe(true);
        }
      }
    });

    it("should mark format information areas as function modules", () => {
      const size = 33;
      const matrix = createIsFunctionModuleMatrix(size);

      // Top-left format info (row 8, cols 0-8 and rows 0-8, col 8)
      for (let i = 0; i <= 8; i++) {
        expect(matrix[8]![i]).toBe(true);
        expect(matrix[i]![8]).toBe(true);
      }

      // Top-right format info (row 8, cols size-8 to size-1)
      for (let c = size - 8; c < size; c++) {
        expect(matrix[8]![c]).toBe(true);
      }

      // Bottom-left format info (rows size-7 to size-1, col 8)
      for (let r = size - 7; r < size; r++) {
        expect(matrix[r]![8]).toBe(true);
      }
    });

    it("should not mark data areas as function modules", () => {
      const size = 33;
      const matrix = createIsFunctionModuleMatrix(size);

      // Check some data region cells (bottom-right area, away from patterns)
      expect(matrix[20]![20]).toBe(false);
      expect(matrix[30]![30]).toBe(false);
      expect(matrix[15]![15]).toBe(false);
    });
  });

  describe("createQrCodeMatrix", () => {
    it("should create a complete QR code matrix", () => {
      const data = "HELLO";
      const matrix = createQrCodeMatrix(data, EncodingMode.ALPHANUMERIC, "L");

      // Version 4 (33x33) + quiet zone (4 on each side) = 41x41
      expect(matrix.length).toBe(41);
      expect(matrix[0]!.length).toBe(41);
    });

    it("should have quiet zone of all zeros", () => {
      const data = "12345";
      const matrix = createQrCodeMatrix(data, EncodingMode.NUMERIC, "L");

      // Check quiet zone (first 4 rows/cols and last 4 rows/cols)
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < 4; j++) {
          expect(matrix[j]![i]).toBe(0); // Top
          expect(matrix[matrix.length - 1 - j]![i]).toBe(0); // Bottom
          expect(matrix[i]![j]).toBe(0); // Left
          expect(matrix[i]![matrix.length - 1 - j]).toBe(0); // Right
        }
      }
    });

    it("should produce different matrices for different data", () => {
      const matrix1 = createQrCodeMatrix(
        "HELLO",
        EncodingMode.ALPHANUMERIC,
        "L"
      );
      const matrix2 = createQrCodeMatrix(
        "WORLD",
        EncodingMode.ALPHANUMERIC,
        "L"
      );

      // Matrices should differ in data region
      let hasDifference = false;
      for (let r = 4; r < matrix1.length - 4 && !hasDifference; r++) {
        for (let c = 4; c < matrix1[r]!.length - 4 && !hasDifference; c++) {
          if (matrix1[r]![c] !== matrix2[r]![c]) {
            hasDifference = true;
          }
        }
      }
      expect(hasDifference).toBe(true);
    });

    it("should only contain 0s and 1s", () => {
      const matrix = createQrCodeMatrix("TEST", EncodingMode.ALPHANUMERIC, "M");

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r]!.length; c++) {
          expect(matrix[r]![c] === 0 || matrix[r]![c] === 1).toBe(true);
        }
      }
    });
  });
});
