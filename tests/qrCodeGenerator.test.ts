import {
  QRCodeGenerator,
  EncodingMode,
  EncodingModeIndicator,
  ErrorCorrectionLevel,
  NumberOfDataCodewordsLvl4,
  QRCodeOptions
} from "../src/qrCodeGenerator";

describe("QRCodeGenerator", () => {
  let qrCodeGenerator: QRCodeGenerator;

  beforeEach(() => {
    qrCodeGenerator = new QRCodeGenerator();
  });

  // describe("detectBestEncoding", () => {
  //   it("should detect NUMERIC encoding for numeric data", () => {
  //     const encoding = qrCodeGenerator.detectBestEncoding("1234567890");
  //     expect(encoding).toBe(EncodingMode.NUMERIC);
  //   });
  //
  //   it("should detect ALPHANUMERIC encoding for alphanumeric data", () => {
  //     const encoding = qrCodeGenerator.detectBestEncoding("HELLO WORLD 123");
  //     expect(encoding).toBe(EncodingMode.ALPHANUMERIC);
  //   });
  //
  //   it("should detect BYTE encoding for byte data", () => {
  //     // ISO-8859-1 characters
  //     const encoding = qrCodeGenerator.detectBestEncoding(
  //       "Hello, World! ñ ü é"
  //     );
  //     expect(encoding).toBe(EncodingMode.BYTE);
  //   });
  //
  //   it("should detect KANJI encoding for kanji data", () => {
  //     const encoding = qrCodeGenerator.detectBestEncoding("漢字テスト");
  //     expect(encoding).toBe(EncodingMode.KANJI);
  //   });
  //
  //   it("should detect a url correctly and return BYTE encoding", () => {
  //     const encoding = qrCodeGenerator.detectBestEncoding(
  //       "https://www.example.com"
  //     );
  //     expect(encoding).toBe(EncodingMode.BYTE);
  //   });
  // });

  describe("encodeDataToBinary", () => {
    it("should encode numeric data correctly", () => {
      const data = "1234567890";
      const encoded = qrCodeGenerator.encodeDataToBinary(
        data,
        EncodingMode.NUMERIC
      );
      // Expected binary string for numeric encoding of "1234567890"
      const expectedBinary = "0001111011011100100011000101010000";
      expect(encoded).toBe(expectedBinary);
    });
    it("should encode alphanumeric data correctly", () => {
      const data = "HELLO WORLD 123";
      const encoded = qrCodeGenerator.encodeDataToBinary(
        data,
        EncodingMode.ALPHANUMERIC
      );
      // Expected binary string for alphanumeric encoding of "HELLO WORLD 123"
      const expectedBinary =
        "0110000101101111000110100010111001011011100010011010100010011011010000010111100010000111"; // Encoded data
      expect(encoded).toBe(expectedBinary);
    });
    it("should encode byte data correctly", () => {
      const data = "Hello, World! ñ ü é";
      const encoded = qrCodeGenerator.encodeDataToBinary(
        data,
        EncodingMode.BYTE
      );
      // Expected binary string for byte encoding of "Hello, World! ñ ü é"
      const expectedBinary =
        "01001000011001010110110001101100011011110010110000100000010101110110111101110010011011000110010000100001001000001111000100100000111111000010000011101001"; // Encoded data
      expect(encoded).toBe(expectedBinary);
    });
    it("should encode kanji data correctly", () => {
      const data = "漢字";
      const encoded = qrCodeGenerator.encodeDataToBinary(
        data,
        EncodingMode.KANJI
      );
      // Expected binary string for kanji encoding of "漢字"
      const expectedBinary = "01001011111110110101011010"; // Encoded data
      expect(encoded).toBe(expectedBinary);
    });
  });

  describe("encodeModeIndicatorToBinary", () => {
    it("should encode mode indicator for NUMERIC correctly", () => {
      const binary = qrCodeGenerator.encodeModeIndicatorToBinary(
        EncodingMode.NUMERIC
      );
      expect(binary).toBe("0001");
    });
    it("should encode mode indicator for ALPHANUMERIC correctly", () => {
      const binary = qrCodeGenerator.encodeModeIndicatorToBinary(
        EncodingMode.ALPHANUMERIC
      );
      expect(binary).toBe("0010");
    });
    it("should encode mode indicator for BYTE correctly", () => {
      const binary = qrCodeGenerator.encodeModeIndicatorToBinary(
        EncodingMode.BYTE
      );
      expect(binary).toBe("0100");
    });
    it("should encode mode indicator for KANJI correctly", () => {
      const binary = qrCodeGenerator.encodeModeIndicatorToBinary(
        EncodingMode.KANJI
      );
      expect(binary).toBe("1000");
    });
  });

  describe("encodeCharacterCountToBinary", () => {
    it("should return correct length for NUMERIC mode", () => {
      const numeric = "12345";
      const binary = qrCodeGenerator.encodeCharacterCountToBinary(
        numeric.length,
        EncodingMode.NUMERIC
      );
      expect(binary).toBe("0000000101"); // 10 bits for length 5
    });
    it("should return correct length for ALPHANUMERIC mode", () => {
      const alphanumeric = "HELLO";
      const binary = qrCodeGenerator.encodeCharacterCountToBinary(
        alphanumeric.length,
        EncodingMode.ALPHANUMERIC
      );
      expect(binary).toBe("000000101"); // 9 bits for length 5
    });
    it("should return correct length for BYTE mode", () => {
      const byteData = "Hello, World! ñ ü é";
      const binary = qrCodeGenerator.encodeCharacterCountToBinary(
        byteData.length,
        EncodingMode.BYTE
      );
      expect(binary).toBe("00010011"); // 8 bits for length 18
    });
    it("should return correct length for KANJI mode", () => {
      const kanjiData = "漢字テスト";
      const binary = qrCodeGenerator.encodeCharacterCountToBinary(
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
      const paddedData = qrCodeGenerator.padBinaryString(
        binaryString,
        errorCorrectionLevel
      );

      const expectedLength =
        NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
      expect(paddedData.length).toBe(expectedLength);
    });
    it("should pad encoded data to fit the required length for M correction level", () => {
      const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
      const errorCorrectionLevel = ErrorCorrectionLevel.M;
      const paddedData = qrCodeGenerator.padBinaryString(
        binaryString,
        errorCorrectionLevel
      );
      const expectedLength =
        NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
      expect(paddedData.length).toBe(expectedLength);
    });
    it("should pad encoded data to fit the required length for Q correction level", () => {
      const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
      const errorCorrectionLevel = ErrorCorrectionLevel.Q;
      const paddedData = qrCodeGenerator.padBinaryString(
        binaryString,
        errorCorrectionLevel
      );

      const expectedLength =
        NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
      expect(paddedData.length).toBe(expectedLength);
    });
    it("should pad encoded data to fit the required length for H correction level", () => {
      const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
      const errorCorrectionLevel = ErrorCorrectionLevel.H;
      const paddedData = qrCodeGenerator.padBinaryString(
        binaryString,
        errorCorrectionLevel
      );

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
      const encoded = qrCodeGenerator.encodeData(data, options);

      // Expected values:
      const modeIndicator = "0001";
      const characterCountIndicator = "0000001010";
      const dataBits = "0001111011011100100011000101010000";
      // Expected binary string for numeric encoding of "1234567890"
      const expectedBinary = modeIndicator + characterCountIndicator + dataBits;

      const expectedPaddedBinary = qrCodeGenerator.padBinaryString(
        expectedBinary,
        options.errorCorrectionLevel
      );

      const expectedUint8Array = new Uint8Array(
        expectedPaddedBinary.match(/.{1,8}/g)!.map((byte) => parseInt(byte, 2))
      );
      expect(encoded).toEqual(expectedUint8Array);
    });
    // it("should encode alphanumeric data correctly", () => {
    //   const data = "HELLO WORLD 123";
    //   const options = {
    //     encodingMode: EncodingMode.ALPHANUMERIC,
    //     errorCorrectionLevel: "L",
    //     version: 4
    //   } as QRCodeOptions;
    //   const encoded = qrCodeGenerator.encodeData(data, options);
    //
    //   // Expected values:
    //   const modeIndicator = "0010";
    //   const characterCountIndicator = "000001110"; // 9 bits for length 13
    //   const dataBits =
    //     "1001000100010110011001001100100111110000010101111001111101001010011001000100100000110001110010110011";
    //   // Expected binary string for alphanumeric encoding of "HELLO WORLD 123"
    //   const expectedBinary = modeIndicator + characterCountIndicator + dataBits;
    //
    //   const expectedPaddedBinary = qrCodeGenerator.padBinaryString(
    //     expectedBinary,
    //     options.errorCorrectionLevel
    //   );
    //
    //   const expectedUint8Array = new Uint8Array(
    //     expectedPaddedBinary.match(/.{1,8}/g)!.map((byte) => parseInt(byte, 2))
    //   );
    //   expect(encoded).toEqual(expectedUint8Array);
    // });
  });
});
