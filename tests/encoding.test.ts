import {
  detectBestEncoding,
  encodeDataToBinary,
  encodeModeIndicatorToBinary,
  encodeCharacterCountToBinary,
  padBinaryString,
  encodeData,
  reedSolomonEncode
} from "../src/encoding";
import {
  EncodingMode,
  ErrorCorrectionLevel,
  QRCodeOptions,
  NumberOfDataCodewordsLvl4
} from "../src/types";

describe("QRCodeGenerator", () => {
  // let qrCodeGenerator: QRCodeGenerator;
  //
  // beforeEach(() => {
  //   qrCodeGenerator = new QRCodeGenerator();
  // });

  describe("detectBestEncoding", () => {
    it("should detect NUMERIC encoding for numeric data", () => {
      const encoding = detectBestEncoding("1234567890");
      expect(encoding).toBe(EncodingMode.NUMERIC);
    });

    it("should detect ALPHANUMERIC encoding for alphanumeric data", () => {
      const encoding = detectBestEncoding("HELLO WORLD 123");
      expect(encoding).toBe(EncodingMode.ALPHANUMERIC);
    });

    it("should detect BYTE encoding for byte data", () => {
      // ISO-8859-1 characters
      const encoding = detectBestEncoding("Hello, World! ñ ü é");
      expect(encoding).toBe(EncodingMode.BYTE);
    });

    it("should detect KANJI encoding for kanji data", () => {
      const encoding = detectBestEncoding("漢字テスト");
      expect(encoding).toBe(EncodingMode.KANJI);
    });

    it("should detect a url correctly and return BYTE encoding", () => {
      const encoding = detectBestEncoding("https://www.example.com");
      expect(encoding).toBe(EncodingMode.BYTE);
    });
  });

  describe("encodeDataToBinary", () => {
    it("should encode numeric data correctly", () => {
      const data = "1234567890";
      const encoded = encodeDataToBinary(data, EncodingMode.NUMERIC);
      // Expected binary string for numeric encoding of "1234567890"
      const expectedBinary = "0001111011011100100011000101010000";
      expect(encoded).toBe(expectedBinary);
    });
    it("should encode alphanumeric data correctly", () => {
      const data = "HELLO WORLD 123";
      const encoded = encodeDataToBinary(data, EncodingMode.ALPHANUMERIC);
      // Expected binary string for alphanumeric encoding of "HELLO WORLD 123"
      const expectedBinary =
        "0110000101101111000110100010111001011011100010011010100010011011010000010111100010000111"; // Encoded data
      expect(encoded).toBe(expectedBinary);
    });
    it("should encode byte data correctly", () => {
      const data = "Hello, World! ñ ü é";
      const encoded = encodeDataToBinary(data, EncodingMode.BYTE);
      // Expected binary string for byte encoding of "Hello, World! ñ ü é"
      const expectedBinary =
        "01001000011001010110110001101100011011110010110000100000010101110110111101110010011011000110010000100001001000001111000100100000111111000010000011101001"; // Encoded data
      expect(encoded).toBe(expectedBinary);
    });
    it("should encode kanji data correctly", () => {
      const data = "漢字";
      const encoded = encodeDataToBinary(data, EncodingMode.KANJI);
      // Expected binary string for kanji encoding of "漢字"
      const expectedBinary = "00111001111110101000011010"; // Encoded data
      expect(encoded).toBe(expectedBinary);
    });
  });

  describe("encodeModeIndicatorToBinary", () => {
    it("should encode mode indicator for NUMERIC correctly", () => {
      const binary = encodeModeIndicatorToBinary(EncodingMode.NUMERIC);
      expect(binary).toBe("0001");
    });
    it("should encode mode indicator for ALPHANUMERIC correctly", () => {
      const binary = encodeModeIndicatorToBinary(EncodingMode.ALPHANUMERIC);
      expect(binary).toBe("0010");
    });
    it("should encode mode indicator for BYTE correctly", () => {
      const binary = encodeModeIndicatorToBinary(EncodingMode.BYTE);
      expect(binary).toBe("0100");
    });
    it("should encode mode indicator for KANJI correctly", () => {
      const binary = encodeModeIndicatorToBinary(EncodingMode.KANJI);
      expect(binary).toBe("1000");
    });
  });

  describe("encodeCharacterCountToBinary", () => {
    it("should return correct length for NUMERIC mode", () => {
      const numeric = "12345";
      const binary = encodeCharacterCountToBinary(
        numeric.length,
        EncodingMode.NUMERIC
      );
      expect(binary).toBe("0000000101"); // 10 bits for length 5
    });
    it("should return correct length for ALPHANUMERIC mode", () => {
      const alphanumeric = "HELLO";
      const binary = encodeCharacterCountToBinary(
        alphanumeric.length,
        EncodingMode.ALPHANUMERIC
      );
      expect(binary).toBe("000000101"); // 9 bits for length 5
    });
    it("should return correct length for BYTE mode", () => {
      const byteData = "Hello, World! ñ ü é";
      const binary = encodeCharacterCountToBinary(
        byteData.length,
        EncodingMode.BYTE
      );
      expect(binary).toBe("00010011"); // 8 bits for length 18
    });
    it("should return correct length for KANJI mode", () => {
      const kanjiData = "漢字テスト";
      const binary = encodeCharacterCountToBinary(
        kanjiData.length,
        EncodingMode.KANJI
      );
      expect(binary).toBe("00000101"); // 8 bits for length 5
    });
  });

  describe("padBinaryString", () => {
    it("should pad encoded data to fit the required length for L correction level", () => {
      const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
      const errorCorrectionLevel = ErrorCorrectionLevel.L;
      const paddedData = padBinaryString(binaryString, errorCorrectionLevel);

      const expectedLength =
        NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
      expect(paddedData.length).toBe(expectedLength);
    });
    it("should pad encoded data to fit the required length for M correction level", () => {
      const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
      const errorCorrectionLevel = ErrorCorrectionLevel.M;
      const paddedData = padBinaryString(binaryString, errorCorrectionLevel);
      const expectedLength =
        NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
      expect(paddedData.length).toBe(expectedLength);
    });
    it("should pad encoded data to fit the required length for Q correction level", () => {
      const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
      const errorCorrectionLevel = ErrorCorrectionLevel.Q;
      const paddedData = padBinaryString(binaryString, errorCorrectionLevel);

      const expectedLength =
        NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
      expect(paddedData.length).toBe(expectedLength);
    });
    it("should pad encoded data to fit the required length for H correction level", () => {
      const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
      const errorCorrectionLevel = ErrorCorrectionLevel.H;
      const paddedData = padBinaryString(binaryString, errorCorrectionLevel);

      const expectedLength =
        NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
      expect(paddedData.length).toBe(expectedLength);
    });
  });

  describe("encodeData", () => {
    it("should encode numeric data correctly", () => {
      const data = "1234567890";
      const options = {
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: "L",
        version: 4
      } as QRCodeOptions;
      const encoded = encodeData(data, options);

      // Expected values:
      const modeIndicator = "0001";
      const characterCountIndicator = "0000001010";
      const dataBits = "0001111011011100100011000101010000";
      // Expected binary string for numeric encoding of "1234567890"
      const expectedBinary = modeIndicator + characterCountIndicator + dataBits;

      const expectedPaddedBinary = padBinaryString(
        expectedBinary,
        options.errorCorrectionLevel
      );

      const expectedUint8Array = new Uint8Array(
        expectedPaddedBinary.match(/.{1,8}/g)!.map((byte) => parseInt(byte, 2))
      );
      expect(encoded).toEqual(expectedUint8Array);
    });
  });

  describe("reedSolomonEncode", () => {
    it("should generate correct EC codewords for known input", () => {
      // Test case: "HELLO WORLD" encoded for Version 1-M
      const data = new Uint8Array([
        32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17
      ]);
      const ecCodewords = 10; // Version 1-M has 10 EC codewords

      const result = reedSolomonEncode(data, ecCodewords);

      // Expected EC codewords for this input
      const expected = new Uint8Array([
        196, 35, 39, 119, 235, 215, 231, 226, 93, 23
      ]);

      expect(result.length).toBe(ecCodewords);
      expect(Array.from(result)).toEqual(Array.from(expected));
    });

    it("should generate correct EC codewords for another known input", () => {
      // Test case: arbitrary data for Version 4-H
      const data = new Uint8Array([
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160,
        170, 180, 190, 200, 210, 220, 230, 240, 250, 5, 15, 25, 35, 45, 55, 65,
        75, 85, 95, 105, 115, 125
      ]);
      const ecCodewords = 16; // Version 4-H has 16 EC codewords per block

      const result = reedSolomonEncode(data, ecCodewords);

      // Actual EC codewords computed by the RS algorithm
      const expected = new Uint8Array([
        188, 242, 230, 31, 131, 56, 42, 34, 180, 23, 226, 152, 209, 3, 175, 71
      ]);

      expect(result.length).toBe(ecCodewords);
      expect(Array.from(result)).toEqual(Array.from(expected));
    });

    it("should return correct length for different EC codeword counts", () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);

      expect(reedSolomonEncode(data, 7).length).toBe(7);
      expect(reedSolomonEncode(data, 10).length).toBe(10);
      expect(reedSolomonEncode(data, 20).length).toBe(20);
    });

    it("should produce different EC codewords for different data", () => {
      const data1 = new Uint8Array([1, 2, 3, 4]);
      const data2 = new Uint8Array([1, 2, 3, 5]);

      const ec1 = reedSolomonEncode(data1, 10);
      const ec2 = reedSolomonEncode(data2, 10);

      expect(Array.from(ec1)).not.toEqual(Array.from(ec2));
    });
  });
});
