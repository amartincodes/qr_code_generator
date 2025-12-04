import {
  placeFinderPattern,
  placeDarkModule,
  createFormatInformationEncoding,
  createVersionInformationEncoding,
  placeFormatInformation,
  placeAlignmentPattern,
  placeDataBits,
  placeQuietZone,
  placeTimingPatterns,
  placeVersionInformation
} from "../src/patterns";
import { ErrorCorrectionLevel } from "../src/types";

describe("Patterns tests: ", () => {
  describe("createFormatInformationEncoding", () => {
    it("should create format information encoding for L level and mask pattern 4", () => {
      const formatInfo = createFormatInformationEncoding(
        ErrorCorrectionLevel.L,
        4
      );
      expect(formatInfo.length).toBe(15);
      // Format info should be a 15-bit binary string
      expect(/^[01]{15}$/.test(formatInfo)).toBe(true);
    });

    it("should create different encodings for different EC levels", () => {
      const formatL = createFormatInformationEncoding(
        ErrorCorrectionLevel.L,
        0
      );
      const formatM = createFormatInformationEncoding(
        ErrorCorrectionLevel.M,
        0
      );
      const formatQ = createFormatInformationEncoding(
        ErrorCorrectionLevel.Q,
        0
      );
      const formatH = createFormatInformationEncoding(
        ErrorCorrectionLevel.H,
        0
      );

      // All should be unique
      const formats = [formatL, formatM, formatQ, formatH];
      const uniqueFormats = new Set(formats);
      expect(uniqueFormats.size).toBe(4);
    });

    it("should create different encodings for different mask patterns", () => {
      const formats = [];
      for (let mask = 0; mask < 8; mask++) {
        formats.push(
          createFormatInformationEncoding(ErrorCorrectionLevel.L, mask)
        );
      }

      // All 8 should be unique
      const uniqueFormats = new Set(formats);
      expect(uniqueFormats.size).toBe(8);
    });

    it("should produce known format string for L level mask 0", () => {
      // Known value from QR spec: L level (01) + mask 0 (000) = 01000
      // After BCH and XOR with mask, should produce: 111011111000100
      const formatInfo = createFormatInformationEncoding(
        ErrorCorrectionLevel.L,
        0
      );
      expect(formatInfo).toBe("111011111000100");
    });

    it("should produce known format string for M level mask 0", () => {
      // M level (00) + mask 0 (000) = 00000
      // After BCH and XOR, should produce: 101010000010010
      const formatInfo = createFormatInformationEncoding(
        ErrorCorrectionLevel.M,
        0
      );
      expect(formatInfo).toBe("101010000010010");
    });
  });

  describe("placeFormatInformation", () => {
    it("should place format information into the QR code matrix", () => {
      const matrix = Array.from({ length: 33 }, () =>
        Array.from({ length: 33 }, () => 0)
      );
      const formatData = "110011000101111";
      const updatedMatrix = placeFormatInformation(matrix, formatData);
      const size = 33;

      // Top-left vertical strip (column 8, rows 0-5, 7, 8)
      expect(updatedMatrix[0]![8]).toBe(parseInt(formatData[0]!));
      expect(updatedMatrix[1]![8]).toBe(parseInt(formatData[1]!));
      expect(updatedMatrix[2]![8]).toBe(parseInt(formatData[2]!));
      expect(updatedMatrix[3]![8]).toBe(parseInt(formatData[3]!));
      expect(updatedMatrix[4]![8]).toBe(parseInt(formatData[4]!));
      expect(updatedMatrix[5]![8]).toBe(parseInt(formatData[5]!));
      expect(updatedMatrix[7]![8]).toBe(parseInt(formatData[6]!));
      expect(updatedMatrix[8]![8]).toBe(parseInt(formatData[7]!));

      // Top-left horizontal strip (row 8, columns 7, 5-0)
      expect(updatedMatrix[8]![7]).toBe(parseInt(formatData[8]!));
      expect(updatedMatrix[8]![5]).toBe(parseInt(formatData[9]!));
      expect(updatedMatrix[8]![4]).toBe(parseInt(formatData[10]!));
      expect(updatedMatrix[8]![3]).toBe(parseInt(formatData[11]!));
      expect(updatedMatrix[8]![2]).toBe(parseInt(formatData[12]!));
      expect(updatedMatrix[8]![1]).toBe(parseInt(formatData[13]!));
      expect(updatedMatrix[8]![0]).toBe(parseInt(formatData[14]!));

      // Top-right area (row 8, columns size-8 to size-1) - bits 14 down to 7
      expect(updatedMatrix[8]![size - 8]).toBe(parseInt(formatData[14]!));
      expect(updatedMatrix[8]![size - 7]).toBe(parseInt(formatData[13]!));
      expect(updatedMatrix[8]![size - 6]).toBe(parseInt(formatData[12]!));
      expect(updatedMatrix[8]![size - 5]).toBe(parseInt(formatData[11]!));
      expect(updatedMatrix[8]![size - 4]).toBe(parseInt(formatData[10]!));
      expect(updatedMatrix[8]![size - 3]).toBe(parseInt(formatData[9]!));
      expect(updatedMatrix[8]![size - 2]).toBe(parseInt(formatData[8]!));
      expect(updatedMatrix[8]![size - 1]).toBe(parseInt(formatData[7]!));

      // Bottom-left area (column 8, rows size-7 to size-1) - bits 14 down to 8
      expect(updatedMatrix[size - 7]![8]).toBe(parseInt(formatData[14]!));
      expect(updatedMatrix[size - 6]![8]).toBe(parseInt(formatData[13]!));
      expect(updatedMatrix[size - 5]![8]).toBe(parseInt(formatData[12]!));
      expect(updatedMatrix[size - 4]![8]).toBe(parseInt(formatData[11]!));
      expect(updatedMatrix[size - 3]![8]).toBe(parseInt(formatData[10]!));
      expect(updatedMatrix[size - 2]![8]).toBe(parseInt(formatData[9]!));
      expect(updatedMatrix[size - 1]![8]).toBe(parseInt(formatData[8]!));
    });

    it("should not modify other cells", () => {
      const matrix = Array.from({ length: 33 }, () =>
        Array.from({ length: 33 }, () => 5)
      ); // Fill with 5 to detect changes
      const formatData = "110011000101111";
      const updatedMatrix = placeFormatInformation(matrix, formatData);

      // Check a cell that shouldn't be modified
      expect(updatedMatrix[15]![15]).toBe(5);
      expect(updatedMatrix[20]![20]).toBe(5);
    });
  });

  describe("placeFinderPattern", () => {
    it("should place a 7x7 finder pattern at specified position", () => {
      const matrix = Array.from({ length: 21 }, () => Array(21).fill(0));
      placeFinderPattern(matrix, 0, 0);

      // Outer border should be 1
      for (let i = 0; i < 7; i++) {
        expect(matrix[0]![i]).toBe(1); // Top row
        expect(matrix[6]![i]).toBe(1); // Bottom row
        expect(matrix[i]![0]).toBe(1); // Left column
        expect(matrix[i]![6]).toBe(1); // Right column
      }
    });

    it("should have white ring inside outer border", () => {
      const matrix = Array.from({ length: 21 }, () => Array(21).fill(0));
      placeFinderPattern(matrix, 0, 0);

      // Inner white ring (row 1 and row 5, cols 1-5)
      expect(matrix[1]![1]).toBe(0);
      expect(matrix[1]![5]).toBe(0);
      expect(matrix[5]![1]).toBe(0);
      expect(matrix[5]![5]).toBe(0);
    });

    it("should have 3x3 black center", () => {
      const matrix = Array.from({ length: 21 }, () => Array(21).fill(0));
      placeFinderPattern(matrix, 0, 0);

      // Center 3x3 should be black
      for (let r = 2; r <= 4; r++) {
        for (let c = 2; c <= 4; c++) {
          expect(matrix[r]![c]).toBe(1);
        }
      }
    });

    it("should place finder pattern at top-right corner", () => {
      const size = 21;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      placeFinderPattern(matrix, 0, size - 7);

      // Check top-right corner
      expect(matrix[0]![size - 7]).toBe(1);
      expect(matrix[0]![size - 1]).toBe(1);
      expect(matrix[3]![size - 4]).toBe(1); // Center
    });

    it("should place finder pattern at bottom-left corner", () => {
      const size = 21;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      placeFinderPattern(matrix, size - 7, 0);

      // Check bottom-left corner
      expect(matrix[size - 7]![0]).toBe(1);
      expect(matrix[size - 1]![0]).toBe(1);
      expect(matrix[size - 4]![3]).toBe(1); // Center
    });

    it("should place separator around finder pattern", () => {
      const matrix = Array.from({ length: 21 }, () => Array(21).fill(1));
      placeFinderPattern(matrix, 0, 0);

      // Separator should be white (0) at column 7 and row 7
      expect(matrix[0]![7]).toBe(0);
      expect(matrix[7]![0]).toBe(0);
    });
  });

  describe("placeTimingPatterns", () => {
    it("should place alternating pattern on row 6", () => {
      const size = 21;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      placeTimingPatterns(matrix, size);

      // Horizontal timing pattern at row 6, between finder patterns
      for (let i = 8; i < size - 8; i++) {
        expect(matrix[6]![i]).toBe(i % 2 === 0 ? 1 : 0);
      }
    });

    it("should place alternating pattern on column 6", () => {
      const size = 21;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      placeTimingPatterns(matrix, size);

      // Vertical timing pattern at column 6, between finder patterns
      for (let i = 8; i < size - 8; i++) {
        expect(matrix[i]![6]).toBe(i % 2 === 0 ? 1 : 0);
      }
    });

    it("should return the modified matrix", () => {
      const size = 21;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      const result = placeTimingPatterns(matrix, size);

      expect(result).toBe(matrix);
    });
  });

  describe("placeAlignmentPattern", () => {
    it("should place 5x5 alignment pattern at (26,26) for version 4", () => {
      const matrix = Array.from({ length: 33 }, () => Array(33).fill(0));
      placeAlignmentPattern(matrix);

      // Center should be black
      expect(matrix[26]![26]).toBe(1);

      // Ring around center should be white
      expect(matrix[25]![26]).toBe(0);
      expect(matrix[26]![25]).toBe(0);
      expect(matrix[27]![26]).toBe(0);
      expect(matrix[26]![27]).toBe(0);

      // Outer border should be black
      expect(matrix[24]![24]).toBe(1);
      expect(matrix[24]![28]).toBe(1);
      expect(matrix[28]![24]).toBe(1);
      expect(matrix[28]![28]).toBe(1);
    });

    it("should return the modified matrix", () => {
      const matrix = Array.from({ length: 33 }, () => Array(33).fill(0));
      const result = placeAlignmentPattern(matrix);

      expect(result).toBe(matrix);
    });
  });

  describe("placeDarkModule", () => {
    it("should place dark module at correct position for version 4", () => {
      const size = 33;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      placeDarkModule(matrix, size);

      // Dark module at (size-8, 8) = (25, 8)
      expect(matrix[size - 8]![8]).toBe(1);
    });

    it("should return the modified matrix", () => {
      const size = 33;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      const result = placeDarkModule(matrix, size);

      expect(result).toBe(matrix);
    });

    it("should only modify single cell", () => {
      const size = 33;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      placeDarkModule(matrix, size);

      // Count how many 1s are in the matrix
      let count = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r]![c] === 1) count++;
        }
      }
      expect(count).toBe(1);
    });
  });

  describe("placeQuietZone", () => {
    it("should add 4-module quiet zone around matrix", () => {
      const matrix = [
        [1, 0],
        [0, 1]
      ];
      const result = placeQuietZone(matrix, 4);

      // New size should be original + 2*quietZone
      expect(result.length).toBe(10); // 2 + 4*2 = 10
      expect(result[0]!.length).toBe(10);
    });

    it("should fill quiet zone with zeros", () => {
      const matrix = [
        [1, 1],
        [1, 1]
      ];
      const result = placeQuietZone(matrix, 4);

      // Check all quiet zone cells are 0
      for (let i = 0; i < 10; i++) {
        // Top quiet zone
        for (let j = 0; j < 4; j++) {
          expect(result[j]![i]).toBe(0);
        }
        // Bottom quiet zone
        for (let j = 6; j < 10; j++) {
          expect(result[j]![i]).toBe(0);
        }
        // Left quiet zone
        for (let j = 0; j < 4; j++) {
          expect(result[i]![j]).toBe(0);
        }
        // Right quiet zone
        for (let j = 6; j < 10; j++) {
          expect(result[i]![j]).toBe(0);
        }
      }
    });

    it("should preserve original matrix content", () => {
      const matrix = [
        [1, 0],
        [0, 1]
      ];
      const result = placeQuietZone(matrix, 4);

      // Original content should be at offset (4, 4)
      expect(result[4]![4]).toBe(1);
      expect(result[4]![5]).toBe(0);
      expect(result[5]![4]).toBe(0);
      expect(result[5]![5]).toBe(1);
    });

    it("should handle different quiet zone sizes", () => {
      const matrix = [[1]];
      const result2 = placeQuietZone(matrix, 2);
      const result6 = placeQuietZone(matrix, 6);

      expect(result2.length).toBe(5); // 1 + 2*2
      expect(result6.length).toBe(13); // 1 + 6*2
    });
  });

  describe("placeDataBits", () => {
    it("should place data bits in zigzag pattern", () => {
      const size = 21;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      const isFunctionModule = Array.from({ length: size }, () =>
        Array(size).fill(false)
      );
      // Create simple data bits
      const dataBits = Array(100).fill(1);

      placeDataBits(matrix, dataBits, isFunctionModule);

      // Some data cells should be set to 1
      let hasOnes = false;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r]![c] === 1) hasOnes = true;
        }
      }
      expect(hasOnes).toBe(true);
    });

    it("should skip function modules", () => {
      const size = 10;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      const isFunctionModule = Array.from({ length: size }, () =>
        Array(size).fill(false)
      );
      // Mark some cells as function modules
      isFunctionModule[5]![5] = true;
      isFunctionModule[5]![6] = true;

      const dataBits = Array(200).fill(1);
      placeDataBits(matrix, dataBits, isFunctionModule);

      // Function modules should remain 0
      expect(matrix[5]![5]).toBe(0);
      expect(matrix[5]![6]).toBe(0);
    });

    it("should skip timing pattern column (column 6)", () => {
      const size = 21;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      const isFunctionModule = Array.from({ length: size }, () =>
        Array(size).fill(false)
      );
      // Mark column 6 as function module (timing pattern)
      for (let r = 0; r < size; r++) {
        isFunctionModule[r]![6] = true;
      }

      const dataBits = Array(300).fill(1);
      placeDataBits(matrix, dataBits, isFunctionModule);

      // Column 6 should remain 0 (skipped)
      for (let r = 0; r < size; r++) {
        expect(matrix[r]![6]).toBe(0);
      }
    });

    it("should return the modified matrix", () => {
      const size = 10;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      const isFunctionModule = Array.from({ length: size }, () =>
        Array(size).fill(false)
      );
      const dataBits = [1, 0, 1, 0];

      const result = placeDataBits(matrix, dataBits, isFunctionModule);

      expect(result).toBe(matrix);
    });

    it("should place both 0s and 1s from data", () => {
      const size = 10;
      const matrix = Array.from({ length: size }, () => Array(size).fill(0));
      const isFunctionModule = Array.from({ length: size }, () =>
        Array(size).fill(false)
      );
      const dataBits = [1, 0, 1, 0, 1, 0, 1, 0];

      placeDataBits(matrix, dataBits, isFunctionModule);

      // Count placed bits
      let ones = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r]![c] === 1) ones++;
        }
      }
      // Should have placed 4 ones (half of 8 bits)
      expect(ones).toBe(4);
    });
  });
});
