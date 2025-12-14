import {
  implementErrorCorrection,
  version4ErrorCorrection
} from "../src/errorCorrection";
import { encodeData } from "../src/encoding";
import {
  EncodingMode,
  type QRCodeOptions,
  ErrorCorrectionLevel
} from "../src/types";

describe("Error Correction tests", () => {
  describe("implementErrorCorrection", () => {
    it("should implement error correction on encoded data for L", () => {
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

      // final data length should equal error corrected codewords + data codewords
      const blockSizeInfo =
        version4ErrorCorrection[options.errorCorrectionLevel];
      const totalCodewords =
        blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
        blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
      expect(finalData.length).toBe(totalCodewords);
    });
    it("should implement error correction on encoded data for M", () => {
      const data = "1234567890";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "M",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel,
        options.version
      );

      // final data length should equal error corrected codewords + data codewords
      // for version 4 it should be 100 bytes
      const blockSizeInfo =
        version4ErrorCorrection[options.errorCorrectionLevel];
      const totalCodewords =
        blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
        blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
      expect(finalData.length).toBe(totalCodewords);
    });
    it("should implement error correction on encoded data for Q", () => {
      const data = "1234567890";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "Q",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel,
        options.version
      );

      // final data length should equal error corrected codewords + data codewords
      // for version 4 it should be 100 bytes
      const blockSizeInfo =
        version4ErrorCorrection[options.errorCorrectionLevel];
      const totalCodewords =
        blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
        blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
      expect(finalData.length).toBe(totalCodewords);
    });
    it("should implement error correction on encoded data for H", () => {
      const data = "1234567890";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "H",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel,
        options.version
      );

      // final data length should equal error corrected codewords + data codewords
      // for version 4 it should be 100 bytes
      const blockSizeInfo =
        version4ErrorCorrection[options.errorCorrectionLevel];
      const totalCodewords =
        blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
        blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
      expect(finalData.length).toBe(totalCodewords);
    });
    it("should implement error correction on encoded data for H", () => {
      const data = "1234567890";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "H",
        version: 4
      } as QRCodeOptions;
      const encodedData = encodeData(data, options);
      const finalData = implementErrorCorrection(
        encodedData,
        options.errorCorrectionLevel,
        options.version
      );

      // final data length should equal error corrected codewords + data codewords
      // for version 4 it should be 100 bytes
      const blockSizeInfo =
        version4ErrorCorrection[options.errorCorrectionLevel];
      const totalCodewords =
        blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
        blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
      expect(finalData.length).toBe(totalCodewords);
    });

    it("should throw error when data length doesn't match expected codewords", () => {
      const invalidData = new Uint8Array([1, 2, 3]); // Too short
      expect(() =>
        implementErrorCorrection(invalidData, ErrorCorrectionLevel.L, 4)
      ).toThrow("Data length must be 80 codewords");
    });

    it("should correctly interleave data blocks for M level", () => {
      // Version 4-M has 2 blocks of 32 data codewords each
      const data = new Uint8Array(64);
      // Fill with pattern: block1 = 1,2,3..., block2 = 101,102,103...
      for (let i = 0; i < 32; i++) {
        data[i] = i + 1;
        data[32 + i] = i + 101;
      }

      const result = implementErrorCorrection(data, ErrorCorrectionLevel.M, 4);

      // First 64 bytes should be interleaved data: 1,101,2,102,3,103...
      for (let i = 0; i < 32; i++) {
        expect(result[i * 2]).toBe(i + 1);
        expect(result[i * 2 + 1]).toBe(i + 101);
      }
    });

    it("should correctly interleave EC blocks for M level", () => {
      const data = new Uint8Array(64).fill(0);

      const result = implementErrorCorrection(data, ErrorCorrectionLevel.M, 4);

      // Result should have 64 data + 36 EC = 100 codewords
      // (2 blocks * 18 EC codewords per block = 36)
      expect(result.length).toBe(100);
    });

    it("should produce different EC codewords for different data", () => {
      const data1 = new Uint8Array(80).fill(1);
      const data2 = new Uint8Array(80).fill(2);

      const result1 = implementErrorCorrection(
        data1,
        ErrorCorrectionLevel.L,
        4
      );
      const result2 = implementErrorCorrection(
        data2,
        ErrorCorrectionLevel.L,
        4
      );

      // Data portion should differ
      expect(result1[0]).not.toBe(result2[0]);
      // EC portion should also differ
      expect(result1[80]).not.toBe(result2[80]);
    });

    it("should handle H level with 4 blocks correctly", () => {
      // Version 4-H has 4 blocks of 9 data codewords each = 36 total
      const data = new Uint8Array(36);
      for (let i = 0; i < 36; i++) {
        data[i] = i;
      }

      const result = implementErrorCorrection(data, ErrorCorrectionLevel.H, 4);

      // 36 data + 64 EC (4 blocks * 16) = 100 codewords
      expect(result.length).toBe(100);

      // Check interleaving: first 4 bytes should be first byte of each block
      // Block 0 starts at 0, Block 1 at 9, Block 2 at 18, Block 3 at 27
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(9);
      expect(result[2]).toBe(18);
      expect(result[3]).toBe(27);
    });
  });

  describe("Multi-version error correction tests", () => {
    describe("Version 1 error correction", () => {
      it("should implement error correction for version 1-L", () => {
        const data = new Uint8Array(19).fill(42);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.L, 1);

        // Version 1-L: 1 block, 19 data + 7 EC = 26 total
        expect(result.length).toBe(26);
      });

      it("should implement error correction for version 1-H", () => {
        const data = new Uint8Array(9).fill(42);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.H, 1);

        // Version 1-H: 1 block, 9 data + 17 EC = 26 total
        expect(result.length).toBe(26);
      });
    });

    describe("Version 2 error correction", () => {
      it("should implement error correction for version 2-M", () => {
        const data = new Uint8Array(28).fill(100);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.M, 2);

        // Version 2-M: 1 block, 28 data + 16 EC = 44 total
        expect(result.length).toBe(44);
      });
    });

    describe("Version 5 error correction (dual groups)", () => {
      it("should handle version 5-Q with dual block groups", () => {
        const data = new Uint8Array(62).fill(55);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.Q, 5);

        // Version 5-Q: 2 blocks of 15 + 2 blocks of 16 = 62 data
        // EC: 18 per block * 4 blocks = 72 EC
        // Total: 62 + 72 = 134
        expect(result.length).toBe(134);
      });

      it("should handle version 5-H with dual block groups", () => {
        const data = new Uint8Array(46).fill(77);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.H, 5);

        // Version 5-H: 2 blocks of 11 + 2 blocks of 12 = 46 data
        // EC: 22 per block * 4 blocks = 88 EC
        // Total: 46 + 88 = 134
        expect(result.length).toBe(134);
      });
    });

    describe("Version 7 error correction", () => {
      it("should implement error correction for version 7-L", () => {
        const data = new Uint8Array(156).fill(88);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.L, 7);

        // Version 7-L: 2 blocks, 78 data each = 156 data
        // EC: 20 per block * 2 = 40 EC
        // Total: 196
        expect(result.length).toBe(196);
      });

      it("should implement error correction for version 7-Q with dual groups", () => {
        const data = new Uint8Array(88).fill(33);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.Q, 7);

        // Version 7-Q: 2 blocks of 14 + 4 blocks of 15 = 88 data
        // EC: 18 per block * 6 blocks = 108 EC
        // Total: 196
        expect(result.length).toBe(196);
      });
    });

    describe("Version 10 error correction", () => {
      it("should implement error correction for version 10-M", () => {
        const data = new Uint8Array(216).fill(11);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.M, 10);

        // Version 10-M: 4 blocks of 43 + 1 block of 44 = 216 data
        // EC: 26 per block * 5 blocks = 130 EC
        // Total: 346
        expect(result.length).toBe(346);
      });

      it("should implement error correction for version 10-H", () => {
        const data = new Uint8Array(122).fill(99);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.H, 10);

        // Version 10-H: 6 blocks of 15 + 2 blocks of 16 = 122 data
        // EC: 28 per block * 8 blocks = 224 EC
        // Total: 346
        expect(result.length).toBe(346);
      });
    });

    describe("Version 15 error correction", () => {
      it("should implement error correction for version 15-L", () => {
        const data = new Uint8Array(523).fill(5);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.L, 15);

        // Version 15-L: 5 blocks of 87 + 1 block of 88 = 523 data
        // EC: 22 per block * 6 blocks = 132 EC
        // Total: 655
        expect(result.length).toBe(655);
      });
    });

    describe("Version 20 error correction", () => {
      it("should implement error correction for version 20-Q", () => {
        const data = new Uint8Array(485).fill(8);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.Q, 20);

        // Version 20-Q: 15 blocks of 24 + 5 blocks of 25 = 485 data
        // EC: 30 per block * 20 blocks = 600 EC
        // Total: 1085
        expect(result.length).toBe(1085);
      });
    });

    describe("Version 27 error correction", () => {
      it("should implement error correction for version 27-M", () => {
        const data = new Uint8Array(1128).fill(66);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.M, 27);

        // Version 27-M: 22 blocks of 45 + 3 blocks of 46 = 1128 data
        // EC: 28 per block * 25 blocks = 700 EC
        // Total: 1828
        expect(result.length).toBe(1828);
      });
    });

    describe("Version 30 error correction", () => {
      it("should implement error correction for version 30-H", () => {
        const data = new Uint8Array(745).fill(22);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.H, 30);

        // Version 30-H: 23 blocks of 15 + 25 blocks of 16 = 745 data
        // EC: 30 per block * 48 blocks = 1440 EC
        // Total: 2185
        expect(result.length).toBe(2185);
      });
    });

    describe("Version 40 error correction (maximum)", () => {
      it("should implement error correction for version 40-L", () => {
        const data = new Uint8Array(2956).fill(1);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.L, 40);

        // Version 40-L: 19 blocks of 118 + 6 blocks of 119 = 2956 data
        // EC: 30 per block * 25 blocks = 750 EC
        // Total: 3706
        expect(result.length).toBe(3706);
      });

      it("should implement error correction for version 40-Q", () => {
        const data = new Uint8Array(1666).fill(127);
        const result = implementErrorCorrection(data, ErrorCorrectionLevel.Q, 40);

        // Version 40-Q: 34 blocks of 24 + 34 blocks of 25 = 1666 data
        // EC: 30 per block * 68 blocks = 2040 EC
        // Total: 3706
        expect(result.length).toBe(3706);
      });
    });

    describe("Error correction interleaving verification", () => {
      it("should properly interleave data for version 10-L with dual groups", () => {
        const data = new Uint8Array(274);
        // Fill with pattern: block indices
        for (let i = 0; i < 274; i++) {
          data[i] = i % 100;
        }

        const result = implementErrorCorrection(data, ErrorCorrectionLevel.L, 10);

        // Version 10-L: 2 blocks of 68 + 2 blocks of 69 = 274 data
        // First few bytes should be interleaved from blocks
        expect(result[0]).toBe(0); // Block 0, byte 0
        expect(result[1]).toBe(68); // Block 1, byte 0
        expect(result[2]).toBe(36); // Block 2, byte 0 (136 % 100)
        expect(result[3]).toBe(5); // Block 3, byte 0 (205 % 100)
      });
    });
  });
});
