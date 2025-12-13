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
});
