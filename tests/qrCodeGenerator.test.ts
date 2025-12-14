import { QRCodeGenerator } from "../src/qrCodeGenerator";
import { detectBestEncoding } from "../src/encoding";
import { EncodingMode } from "../src/types";
import { encodeData } from "../src/encoding";
import { implementErrorCorrection } from "../src/errorCorrection";
import { createFormatInformationEncoding } from "../src/patterns";
import type { QRCodeOptions } from "../src/types";
import { ErrorCorrectionLevel } from "../src/types";
import { createIsFunctionModuleMatrix } from "../src/matrix";
import { placeDataBits } from "../src/patterns";
import * as fs from "fs";
import * as path from "path";

describe("QRCodeGenerator", () => {
  let qrCodeGenerator: QRCodeGenerator;
  const testQrCodesDir = "./tests/qr_codes";

  beforeEach(() => {
    qrCodeGenerator = new QRCodeGenerator();
  });

  afterAll(async () => {
    // Add a small delay to ensure all file operations are complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clean up all test-generated files
    try {
      if (fs.existsSync(testQrCodesDir)) {
        fs.rmSync(testQrCodesDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  });

  describe("generateQRCode", () => {
    it("should generate a QR code matrix for numeric data", () => {
      const data = "1234567890";
      const qrCodeMatrix = qrCodeGenerator.generate(data);

      // For version 4, the matrix should be 33x33
      const expectedSize = 33 + 8; // Including quiet zone
      expect(qrCodeMatrix.length).toBe(expectedSize);
      expect(qrCodeMatrix[0]!.length).toBe(expectedSize);
    });
  });

  describe("saveQRCodeAsImage", () => {
    it("should save the QR code matrix as an image file", async () => {
      const data = "google.com";
      const qrCodeMatrix = qrCodeGenerator.generate(data);
      const filePath = "./tests/qr_codes/test_qr_code.png";

      qrCodeGenerator.saveQRCodeAsImage(qrCodeMatrix, filePath);

      // Wait for the file to be written (async operation)
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
  describe("Debug QR Generation", () => {
    it("should debug google.com encoding", () => {
      const data = "google.com";

      // Step 1: Detect encoding
      const encoding = detectBestEncoding(data);
      console.log("1. Detected encoding:", encoding);
      console.log("   Expected: BYTE (due to lowercase)");

      // Step 2: Encode data
      const options: QRCodeOptions = {
        encodingMode: encoding,
        errorCorrectionLevel: ErrorCorrectionLevel.L,
        version: 4
      };
      const encodedData = encodeData(data, options);
      console.log("2. Encoded data length:", encodedData.length, "bytes");
      console.log("   Expected: 80 bytes for Version 4-L");
      console.log("   First 10 bytes:", Array.from(encodedData.slice(0, 10)));

      // Manual calculation for "google.com" in byte mode:
      // Mode indicator: 0100 (4 bits)
      // Character count: 00001010 (8 bits for byte mode v1-9) = 10
      // Data: g=103, o=111, o=111, g=103, l=108, e=101, .=46, c=99, o=111, m=109
      const expectedStart = [
        0b01000000, // Mode (0100) + first 4 bits of count (0000)
        0b10100110, // Last 4 bits of count (1010) + first 4 bits of 'g' (0110)
        0b01110110 // Last 4 bits of 'g' (0111) + first 4 bits of 'o' (0110)
      ];
      console.log("   Expected start:", expectedStart);

      // Step 3: Error correction
      const dataWithEc = implementErrorCorrection(
        encodedData,
        ErrorCorrectionLevel.L,
        options.version
      );
      console.log("3. Data + EC length:", dataWithEc.length, "bytes");
      console.log("   Expected: 100 bytes (80 data + 20 EC for Version 4-L)");

      // Step 4: Format info
      const formatInfo = createFormatInformationEncoding(
        ErrorCorrectionLevel.L,
        0
      );
      console.log("4. Format info (mask 0):", formatInfo);
      console.log("   Expected for L-0: 111011111000100");

      expect(encoding).toBe(EncodingMode.BYTE);
      expect(encodedData.length).toBe(80);
      expect(dataWithEc.length).toBe(100);
    });
    it("should place all data bits", () => {
      const data = "google.com";
      const encoding = detectBestEncoding(data);
      const options: QRCodeOptions = {
        encodingMode: encoding,
        errorCorrectionLevel: ErrorCorrectionLevel.L,
        version: 4
      };
      const encodedData = encodeData(data, options);
      const dataWithEc = implementErrorCorrection(
        encodedData,
        ErrorCorrectionLevel.L,
        options.version
      );

      // Convert to bits
      const dataBits = Array.from(dataWithEc).flatMap((byte) =>
        Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1)
      );
      console.log("Total data bits:", dataBits.length); // Should be 800

      // Create matrix and function module mask
      const size = 33;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      const isFunctionModule = createIsFunctionModuleMatrix(size, 4);

      // Count available cells
      let availableCells = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!isFunctionModule[r]![c]) availableCells++;
        }
      }
      console.log("Available cells:", availableCells); // Should be >= 800

      placeDataBits(matrix, dataBits, isFunctionModule);

      // Count placed bits (cells that are 1)
      let placedOnes = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!isFunctionModule[r]![c] && matrix[r]![c] === 1) {
            placedOnes++;
          }
        }
      }
      console.log("Placed 1s:", placedOnes);

      // Verify roughly half are 1s (data should have mixed bits)
      expect(placedOnes).toBeGreaterThan(100);
      expect(dataBits.length).toBe(800);
    });
    it("should verify quiet zone in final matrix", () => {
      const generator = new QRCodeGenerator();
      const matrix = generator.generate("google.com");

      console.log("Final matrix size:", matrix.length, "x", matrix[0]?.length);
      console.log("Expected: 41x41 (33 + 4*2 quiet zone)");

      // Check quiet zone (first 4 rows should be all 0s)
      let quietZoneCorrect = true;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < matrix.length; c++) {
          if (matrix[r]![c] !== 0) {
            console.log(
              `Quiet zone violation at (${r}, ${c}): ${matrix[r]![c]}`
            );
            quietZoneCorrect = false;
          }
        }
      }
      // Check last 4 rows
      for (let r = matrix.length - 4; r < matrix.length; r++) {
        for (let c = 0; c < matrix.length; c++) {
          if (matrix[r]![c] !== 0) {
            console.log(
              `Quiet zone violation at (${r}, ${c}): ${matrix[r]![c]}`
            );
            quietZoneCorrect = false;
          }
        }
      }

      console.log("Quiet zone correct:", quietZoneCorrect);

      // Matrix should be 41x41 (33 + 8 for quiet zone)
      expect(matrix.length).toBe(41);
      expect(matrix[0]?.length).toBe(41);
      expect(quietZoneCorrect).toBe(true);
    });
  });

  describe("Multi-version QR code generation", () => {
    describe("Version 1 QR codes", () => {
      it("should generate version 1 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.NUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.L,
          version: 1
        };
        const matrix = generator.generate("12345", options);

        // Version 1: 21x21 + 8 for quiet zone = 29x29
        expect(matrix.length).toBe(29);
        expect(matrix[0]?.length).toBe(29);
      });

      it("should generate version 1 QR code for alphanumeric", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.ALPHANUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.M,
          version: 1
        };
        const matrix = generator.generate("AB", options);

        expect(matrix.length).toBe(29);
        expect(matrix[0]?.length).toBe(29);
      });
    });

    describe("Version 2 QR codes", () => {
      it("should generate version 2 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.Q,
          version: 2
        };
        const matrix = generator.generate("test", options);

        // Version 2: 25x25 + 8 for quiet zone = 33x33
        expect(matrix.length).toBe(33);
        expect(matrix[0]?.length).toBe(33);
      });
    });

    describe("Version 7 QR codes", () => {
      it("should generate version 7 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.NUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.H,
          version: 7
        };
        const matrix = generator.generate("1234567890", options);

        // Version 7: 45x45 + 8 for quiet zone = 53x53
        expect(matrix.length).toBe(53);
        expect(matrix[0]?.length).toBe(53);
      });
    });

    describe("Version 10 QR codes", () => {
      it("should generate version 10 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.L,
          version: 10
        };
        const matrix = generator.generate("HelloWorld", options);

        // Version 10: 57x57 + 8 for quiet zone = 65x65
        expect(matrix.length).toBe(65);
        expect(matrix[0]?.length).toBe(65);
      });
    });

    describe("Version 15 QR codes", () => {
      it("should generate version 15 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.ALPHANUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.M,
          version: 15
        };
        const matrix = generator.generate("HELLO WORLD", options);

        // Version 15: 77x77 + 8 for quiet zone = 85x85
        expect(matrix.length).toBe(85);
        expect(matrix[0]?.length).toBe(85);
      });
    });

    describe("Version 20 QR codes", () => {
      it("should generate version 20 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.Q,
          version: 20
        };
        const matrix = generator.generate("Test message", options);

        // Version 20: 97x97 + 8 for quiet zone = 105x105
        expect(matrix.length).toBe(105);
        expect(matrix[0]?.length).toBe(105);
      });
    });

    describe("Version 27 QR codes", () => {
      it("should generate version 27 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.NUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.L,
          version: 27
        };
        const matrix = generator.generate("12345", options);

        // Version 27: 125x125 + 8 for quiet zone = 133x133
        expect(matrix.length).toBe(133);
        expect(matrix[0]?.length).toBe(133);
      });
    });

    describe("Version 30 QR codes", () => {
      it("should generate version 30 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.H,
          version: 30
        };
        const matrix = generator.generate("DATA", options);

        // Version 30: 137x137 + 8 for quiet zone = 145x145
        expect(matrix.length).toBe(145);
        expect(matrix[0]?.length).toBe(145);
      });
    });

    describe("Version 40 QR codes (maximum)", () => {
      it("should generate version 40 QR code with correct size", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.NUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.L,
          version: 40
        };
        const matrix = generator.generate("123456", options);

        // Version 40: 177x177 + 8 for quiet zone = 185x185
        expect(matrix.length).toBe(185);
        expect(matrix[0]?.length).toBe(185);
      });

      it("should generate version 40 QR code for byte mode", () => {
        const generator = new QRCodeGenerator();
        const options: QRCodeOptions = {
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.M,
          version: 40
        };
        const matrix = generator.generate("QR Code Test", options);

        expect(matrix.length).toBe(185);
        expect(matrix[0]?.length).toBe(185);
      });
    });

    describe("Quiet zone verification across versions", () => {
      it("should have proper quiet zone for version 1", () => {
        const generator = new QRCodeGenerator();
        const matrix = generator.generate("123", {
          encodingMode: EncodingMode.NUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.L,
          version: 1
        });

        // Check quiet zone (first 4 rows should be all 0s)
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < matrix.length; c++) {
            expect(matrix[r]![c]).toBe(0);
          }
        }
      });

      it("should have proper quiet zone for version 10", () => {
        const generator = new QRCodeGenerator();
        const matrix = generator.generate("TEST", {
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.M,
          version: 10
        });

        // Check last 4 rows should be all 0s
        for (let r = matrix.length - 4; r < matrix.length; r++) {
          for (let c = 0; c < matrix.length; c++) {
            expect(matrix[r]![c]).toBe(0);
          }
        }
      });

      it("should have proper quiet zone for version 40", () => {
        const generator = new QRCodeGenerator();
        const matrix = generator.generate("X", {
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.L,
          version: 40
        });

        // Check left quiet zone (first 4 columns should be all 0s)
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < 4; c++) {
            expect(matrix[r]![c]).toBe(0);
          }
        }
      });
    });
  });
});
