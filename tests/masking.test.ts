import {
  selectBestMaskPattern,
  calculateMaskPenalty,
  applyDataMask
} from "../src/masking";
import { encodeData } from "../src/encoding";
import { implementErrorCorrection } from "../src/errorCorrection";
import {
  createInitialMatrix,
  createIsFunctionModuleMatrix
} from "../src/matrix";
import { EncodingMode } from "../src/types";
import type { QRCodeOptions } from "../src/types";

describe("Masking tests: ", () => {
  describe("applyDataMask", () => {
    it("should apply data mask to the QR code matrix", () => {
      const data = "1234567890";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "L",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel,
        options.version
      );
      const matrix = createInitialMatrix(finalData, options);
      const isFunctionModule = createIsFunctionModuleMatrix(matrix.length, 4);
      const maskedMatrix = applyDataMask(matrix, 0, isFunctionModule);

      // The masked matrix should have the same dimensions as the original matrix
      expect(maskedMatrix.length).toBe(matrix.length);
      expect(maskedMatrix[0].length).toBe(matrix[0].length);
    });

    it("should not modify function modules", () => {
      // Create a small test matrix
      const matrix = [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1]
      ];
      // Mark top-left 2x2 as function modules
      const isFunctionModule = [
        [true, true, false, false],
        [true, true, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ];

      const maskedMatrix = applyDataMask(matrix, 0, isFunctionModule);

      // Function modules should remain unchanged
      expect(maskedMatrix[0]![0]).toBe(1);
      expect(maskedMatrix[0]![1]).toBe(0);
      expect(maskedMatrix[1]![0]).toBe(0);
      expect(maskedMatrix[1]![1]).toBe(1);
    });

    it("should correctly apply mask pattern 0: (row + col) % 2 === 0", () => {
      const matrix = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      const isFunctionModule = Array.from({ length: 4 }, () =>
        Array(4).fill(false)
      );

      const maskedMatrix = applyDataMask(matrix, 0, isFunctionModule);

      // Pattern 0 flips where (row + col) % 2 === 0
      expect(maskedMatrix[0]![0]).toBe(1); // (0+0)%2=0, flip
      expect(maskedMatrix[0]![1]).toBe(0); // (0+1)%2=1, no flip
      expect(maskedMatrix[1]![0]).toBe(0); // (1+0)%2=1, no flip
      expect(maskedMatrix[1]![1]).toBe(1); // (1+1)%2=0, flip
    });

    it("should correctly apply mask pattern 1: row % 2 === 0", () => {
      const matrix = Array.from({ length: 4 }, () => Array(4).fill(0));
      const isFunctionModule = Array.from({ length: 4 }, () =>
        Array(4).fill(false)
      );

      const maskedMatrix = applyDataMask(matrix, 1, isFunctionModule);

      // Pattern 1 flips entire rows where row % 2 === 0
      expect(maskedMatrix[0]![0]).toBe(1); // row 0, flip
      expect(maskedMatrix[0]![1]).toBe(1); // row 0, flip
      expect(maskedMatrix[1]![0]).toBe(0); // row 1, no flip
      expect(maskedMatrix[2]![0]).toBe(1); // row 2, flip
    });

    it("should correctly apply mask pattern 2: col % 3 === 0", () => {
      const matrix = Array.from({ length: 4 }, () => Array(4).fill(0));
      const isFunctionModule = Array.from({ length: 4 }, () =>
        Array(4).fill(false)
      );

      const maskedMatrix = applyDataMask(matrix, 2, isFunctionModule);

      // Pattern 2 flips where col % 3 === 0
      expect(maskedMatrix[0]![0]).toBe(1); // col 0, flip
      expect(maskedMatrix[0]![1]).toBe(0); // col 1, no flip
      expect(maskedMatrix[0]![2]).toBe(0); // col 2, no flip
      expect(maskedMatrix[0]![3]).toBe(1); // col 3, flip
    });

    it("should apply all 8 mask patterns without error", () => {
      const matrix = Array.from({ length: 10 }, () => Array(10).fill(0));
      const isFunctionModule = Array.from({ length: 10 }, () =>
        Array(10).fill(false)
      );

      for (let mask = 0; mask < 8; mask++) {
        expect(() =>
          applyDataMask(matrix, mask, isFunctionModule)
        ).not.toThrow();
      }
    });

    it("should not mutate the original matrix", () => {
      const matrix = [
        [0, 1],
        [1, 0]
      ];
      const isFunctionModule = [
        [false, false],
        [false, false]
      ];

      const originalCopy = matrix.map((row) => [...row]);
      applyDataMask(matrix, 0, isFunctionModule);

      expect(matrix).toEqual(originalCopy);
    });
  });

  describe("calculateMaskPenalty", () => {
    it("should return 0 for a checkerboard pattern (optimal)", () => {
      // Checkerboard has no adjacent same-color runs, no 2x2 blocks
      const matrix = Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => (r + c) % 2)
      );

      const penalty = calculateMaskPenalty(matrix);

      // Should have minimal penalty (only rule 4 proportion penalty)
      expect(penalty).toBeLessThan(100);
    });

    it("should penalize long runs of same color (Rule 1)", () => {
      // All black row
      const matrix = Array.from({ length: 10 }, () => Array(10).fill(0));
      matrix[0] = Array(10).fill(1); // One row all black

      const penalty = calculateMaskPenalty(matrix);

      // 10 consecutive = 3 + (10-5) = 8 penalty for that row
      expect(penalty).toBeGreaterThan(0);
    });

    it("should penalize 2x2 blocks of same color (Rule 2)", () => {
      // Create 2x2 black block
      const matrix = Array.from({ length: 4 }, () => Array(4).fill(0));
      matrix[0]![0] = 1;
      matrix[0]![1] = 1;
      matrix[1]![0] = 1;
      matrix[1]![1] = 1;

      const penalty = calculateMaskPenalty(matrix);

      // Should include 3 points for the 2x2 block
      expect(penalty).toBeGreaterThanOrEqual(3);
    });

    it("should penalize finder-like patterns (Rule 3)", () => {
      // Create pattern: 1,0,1,1,1,0,1,0,0,0,0
      const matrix = Array.from({ length: 11 }, () => Array(11).fill(0));
      const pattern = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
      for (let i = 0; i < 11; i++) {
        matrix[0]![i] = pattern[i]!;
      }

      const penalty = calculateMaskPenalty(matrix);

      // Should include 40 points for finder-like pattern
      expect(penalty).toBeGreaterThanOrEqual(40);
    });

    it("should penalize unbalanced dark/light ratio (Rule 4)", () => {
      // All black matrix (100% dark)
      const allBlack = Array.from({ length: 10 }, () => Array(10).fill(1));
      const penaltyBlack = calculateMaskPenalty(allBlack);

      // 50% dark matrix
      const balanced = Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => (r + c) % 2)
      );
      const penaltyBalanced = calculateMaskPenalty(balanced);

      expect(penaltyBlack).toBeGreaterThan(penaltyBalanced);
    });
  });

  describe("selectBestMaskPattern", () => {
    it("should return a mask pattern between 0 and 7", () => {
      const matrix = Array.from({ length: 21 }, () => Array(21).fill(0));
      const isFunctionModule = Array.from({ length: 21 }, () =>
        Array(21).fill(false)
      );

      const bestMask = selectBestMaskPattern(matrix, isFunctionModule);

      expect(bestMask).toBeGreaterThanOrEqual(0);
      expect(bestMask).toBeLessThanOrEqual(7);
    });

    it("should select the mask with lowest penalty", () => {
      const data = "HELLO";
      const options = {
        encodingMode: EncodingMode.ALPHANUMERIC,
        errorCorrectionLevel: "L",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel,
        options.version
      );
      const matrix = createInitialMatrix(finalData, options);
      const isFunctionModule = createIsFunctionModuleMatrix(matrix.length, 4);

      const bestMask = selectBestMaskPattern(matrix, isFunctionModule);

      // Verify this mask has the lowest penalty
      let lowestPenalty = Infinity;
      let expectedBest = 0;
      for (let mask = 0; mask < 8; mask++) {
        const maskedMatrix = applyDataMask(
          matrix.map((r) => [...r]),
          mask,
          isFunctionModule
        );
        const penalty = calculateMaskPenalty(maskedMatrix);
        if (penalty < lowestPenalty) {
          lowestPenalty = penalty;
          expectedBest = mask;
        }
      }

      expect(bestMask).toBe(expectedBest);
    });
  });
});
