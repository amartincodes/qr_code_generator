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
  // }

  // describe("encodeDataToBinary", () => {
  //   it("should encode numeric data correctly", () => {
  //     const data = "1234567890";
  //     const encoded = qrCodeGenerator.encodeDataToBinary(
  //       data,
  //       EncodingMode.NUMERIC
  //     );
  //     // Expected binary string for numeric encoding of "1234567890"
  //     const expectedBinary = "0001111011011100100011000101010000";
  //     expect(encoded).toBe(expectedBinary);
  //   });
  //   it("should encode alphanumeric data correctly", () => {
  //     const data = "HELLO WORLD 123";
  //     const encoded = qrCodeGenerator.encodeDataToBinary(
  //       data,
  //       EncodingMode.ALPHANUMERIC
  //     );
  //     // Expected binary string for alphanumeric encoding of "HELLO WORLD 123"
  //     const expectedBinary =
  //       "0110000101101111000110100010111001011011100010011010100010011011010000010111100010000111"; // Encoded data
  //     expect(encoded).toBe(expectedBinary);
  //   });
  //   it("should encode byte data correctly", () => {
  //     const data = "Hello, World! ñ ü é";
  //     const encoded = qrCodeGenerator.encodeDataToBinary(
  //       data,
  //       EncodingMode.BYTE
  //     );
  //     // Expected binary string for byte encoding of "Hello, World! ñ ü é"
  //     const expectedBinary =
  //       "01001000011001010110110001101100011011110010110000100000010101110110111101110010011011000110010000100001001000001111000100100000111111000010000011101001"; // Encoded data
  //     expect(encoded).toBe(expectedBinary);
  //   });
  //   it("should encode kanji data correctly", () => {
  //     const data = "漢字";
  //     const encoded = qrCodeGenerator.encodeDataToBinary(
  //       data,
  //       EncodingMode.KANJI
  //     );
  //     // Expected binary string for kanji encoding of "漢字"
  //     const expectedBinary = "01001011111110110101011010"; // Encoded data
  //     expect(encoded).toBe(expectedBinary);
  //   });
  // });

  // describe("encodeModeIndicatorToBinary", () => {
  //   it("should encode mode indicator for NUMERIC correctly", () => {
  //     const binary = qrCodeGenerator.encodeModeIndicatorToBinary(
  //       EncodingMode.NUMERIC
  //     );
  //     expect(binary).toBe("0001");
  //   });
  //   it("should encode mode indicator for ALPHANUMERIC correctly", () => {
  //     const binary = qrCodeGenerator.encodeModeIndicatorToBinary(
  //       EncodingMode.ALPHANUMERIC
  //     );
  //     expect(binary).toBe("0010");
  //   });
  //   it("should encode mode indicator for BYTE correctly", () => {
  //     const binary = qrCodeGenerator.encodeModeIndicatorToBinary(
  //       EncodingMode.BYTE
  //     );
  //     expect(binary).toBe("0100");
  //   });
  //   it("should encode mode indicator for KANJI correctly", () => {
  //     const binary = qrCodeGenerator.encodeModeIndicatorToBinary(
  //       EncodingMode.KANJI
  //     );
  //     expect(binary).toBe("1000");
  //   });
  // });

  // describe("encodeCharacterCountToBinary", () => {
  //   it("should return correct length for NUMERIC mode", () => {
  //     const numeric = "12345";
  //     const binary = qrCodeGenerator.encodeCharacterCountToBinary(
  //       numeric.length,
  //       EncodingMode.NUMERIC
  //     );
  //     expect(binary).toBe("0000000101"); // 10 bits for length 5
  //   });
  //   it("should return correct length for ALPHANUMERIC mode", () => {
  //     const alphanumeric = "HELLO";
  //     const binary = qrCodeGenerator.encodeCharacterCountToBinary(
  //       alphanumeric.length,
  //       EncodingMode.ALPHANUMERIC
  //     );
  //     expect(binary).toBe("000000101"); // 9 bits for length 5
  //   });
  //   it("should return correct length for BYTE mode", () => {
  //     const byteData = "Hello, World! ñ ü é";
  //     const binary = qrCodeGenerator.encodeCharacterCountToBinary(
  //       byteData.length,
  //       EncodingMode.BYTE
  //     );
  //     expect(binary).toBe("00010011"); // 8 bits for length 18
  //   });
  //   it("should return correct length for KANJI mode", () => {
  //     const kanjiData = "漢字テスト";
  //     const binary = qrCodeGenerator.encodeCharacterCountToBinary(
  //       kanjiData.length,
  //       EncodingMode.KANJI
  //     );
  //     expect(binary).toBe("00000101"); // 8 bits for length 5
  //   });
  // });

  // describe("padBinaryString", () => {
  //   it("should pad encoded data to fit the required length for L correction level", () => {
  //     const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
  //     const errorCorrectionLevel = ErrorCorrectionLevel.L;
  //     const paddedData = qrCodeGenerator.padBinaryString(
  //       binaryString,
  //       errorCorrectionLevel
  //     );
  //
  //     const expectedLength =
  //       NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
  //     expect(paddedData.length).toBe(expectedLength);
  //   });
  //   it("should pad encoded data to fit the required length for M correction level", () => {
  //     const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
  //     const errorCorrectionLevel = ErrorCorrectionLevel.M;
  //     const paddedData = qrCodeGenerator.padBinaryString(
  //       binaryString,
  //       errorCorrectionLevel
  //     );
  //     const expectedLength =
  //       NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
  //     expect(paddedData.length).toBe(expectedLength);
  //   });
  //   it("should pad encoded data to fit the required length for Q correction level", () => {
  //     const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
  //     const errorCorrectionLevel = ErrorCorrectionLevel.Q;
  //     const paddedData = qrCodeGenerator.padBinaryString(
  //       binaryString,
  //       errorCorrectionLevel
  //     );
  //
  //     const expectedLength =
  //       NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
  //     expect(paddedData.length).toBe(expectedLength);
  //   });
  //   it("should pad encoded data to fit the required length for H correction level", () => {
  //     const binaryString = "0001000000101000011110110111001000110000101010000"; // Example encoded data
  //     const errorCorrectionLevel = ErrorCorrectionLevel.H;
  //     const paddedData = qrCodeGenerator.padBinaryString(
  //       binaryString,
  //       errorCorrectionLevel
  //     );
  //
  //     const expectedLength =
  //       NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
  //     expect(paddedData.length).toBe(expectedLength);
  //   });
  // });

  // describe("encodeData", () => {
  //   it("should encode numeric data correctly", () => {
  //     const data = "1234567890";
  //     const options = {
  //       encodingMode: EncodingMode.NUMERIC,
  //       errorCorrectionLevel: "L",
  //       version: 4
  //     } as QRCodeOptions;
  //     const encoded = qrCodeGenerator.encodeData(data, options);
  //
  //     // Expected values:
  //     const modeIndicator = "0001";
  //     const characterCountIndicator = "0000001010";
  //     const dataBits = "0001111011011100100011000101010000";
  //     // Expected binary string for numeric encoding of "1234567890"
  //     const expectedBinary = modeIndicator + characterCountIndicator + dataBits;
  //
  //     const expectedPaddedBinary = qrCodeGenerator.padBinaryString(
  //       expectedBinary,
  //       options.errorCorrectionLevel
  //     );
  //
  //     const expectedUint8Array = new Uint8Array(
  //       expectedPaddedBinary.match(/.{1,8}/g)!.map((byte) => parseInt(byte, 2))
  //     );
  //     expect(encoded).toEqual(expectedUint8Array);
  //   });
  // });

  // describe("implementErrorCorrection", () => {
  //   it("should implement error correction on encoded data for L", () => {
  //     const data = "1234567890";
  //     const options = {
  //       encodingMode: EncodingMode.NUMERIC,
  //       errorCorrectionLevel: "L",
  //       version: 4
  //     } as QRCodeOptions;
  //     const encodedData = qrCodeGenerator.encodeData(data, options);
  //     const finalData = qrCodeGenerator.implementErrorCorrection(
  //       encodedData,
  //       options.errorCorrectionLevel
  //     );
  //
  //     // final data length should equal error corrected codewords + data codewords
  //     const blockSizeInfo =
  //       qrCodeGenerator.version4ErrorCorrection[options.errorCorrectionLevel];
  //     const totalCodewords =
  //       blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
  //       blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
  //     expect(finalData.length).toBe(totalCodewords);
  //   });
  //   it("should implement error correction on encoded data for M", () => {
  //     const data = "1234567890";
  //     const options = {
  //       encodingMode: EncodingMode.NUMERIC,
  //       errorCorrectionLevel: "M",
  //       version: 4
  //     } as QRCodeOptions;
  //     const encodedData = qrCodeGenerator.encodeData(data, options);
  //     const finalData = qrCodeGenerator.implementErrorCorrection(
  //       encodedData,
  //       options.errorCorrectionLevel
  //     );
  //
  //     // final data length should equal error corrected codewords + data codewords
  //     // for version 4 it should be 100 bytes
  //     const blockSizeInfo =
  //       qrCodeGenerator.version4ErrorCorrection[options.errorCorrectionLevel];
  //     const totalCodewords =
  //       blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
  //       blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
  //     expect(finalData.length).toBe(totalCodewords);
  //   });
  //   it("should implement error correction on encoded data for Q", () => {
  //     const data = "1234567890";
  //     const options = {
  //       encodingMode: EncodingMode.NUMERIC,
  //       errorCorrectionLevel: "Q",
  //       version: 4
  //     } as QRCodeOptions;
  //     const encodedData = qrCodeGenerator.encodeData(data, options);
  //     const finalData = qrCodeGenerator.implementErrorCorrection(
  //       encodedData,
  //       options.errorCorrectionLevel
  //     );
  //
  //     // final data length should equal error corrected codewords + data codewords
  //     // for version 4 it should be 100 bytes
  //     const blockSizeInfo =
  //       qrCodeGenerator.version4ErrorCorrection[options.errorCorrectionLevel];
  //     const totalCodewords =
  //       blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
  //       blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
  //     expect(finalData.length).toBe(totalCodewords);
  //   });
  //   it("should implement error correction on encoded data for H", () => {
  //     const data = "1234567890";
  //     const options = {
  //       encodingMode: EncodingMode.NUMERIC,
  //       errorCorrectionLevel: "H",
  //       version: 4
  //     } as QRCodeOptions;
  //     const encodedData = qrCodeGenerator.encodeData(data, options);
  //     const finalData = qrCodeGenerator.implementErrorCorrection(
  //       encodedData,
  //       options.errorCorrectionLevel
  //     );
  //
  //     // final data length should equal error corrected codewords + data codewords
  //     // for version 4 it should be 100 bytes
  //     const blockSizeInfo =
  //       qrCodeGenerator.version4ErrorCorrection[options.errorCorrectionLevel];
  //     const totalCodewords =
  //       blockSizeInfo.ecCodewordsPerBlock * blockSizeInfo.blocks +
  //       blockSizeInfo.dataCodewordsPerBlock * blockSizeInfo.blocks;
  //     expect(finalData.length).toBe(totalCodewords);
  //   });
  // });

  // describe("createQRCodeMatrix", () => {
  //   it("should create a QR code matrix for numeric data", () => {
  //     const data = "1234567890";
  //     const options = {
  //       encodingMode: EncodingMode.NUMERIC,
  //       errorCorrectionLevel: "L",
  //       version: 4
  //     } as QRCodeOptions;
  //     const encodedData = qrCodeGenerator.encodeData(data, options);
  //     const finalData = qrCodeGenerator.implementErrorCorrection(
  //       encodedData,
  //       options.errorCorrectionLevel
  //     );
  //     const matrix = qrCodeGenerator.createQRCodeMatrix(finalData, options);
  //
  //     // For version 4, the matrix should be 33x33
  //     expect(matrix.length).toBe(33);
  //     expect(matrix[0].length).toBe(33);
  //   });
  // });

  // describe("applyDataMask", () => {
  //   it("should apply data mask to the QR code matrix", () => {
  //     const data = "1234567890";
  //     const options = {
  //       encodingMode: EncodingMode.NUMERIC,
  //       errorCorrectionLevel: "L",
  //       version: 4
  //     } as QRCodeOptions;
  //     const encodedData = qrCodeGenerator.encodeData(data, options);
  //     const finalData = qrCodeGenerator.implementErrorCorrection(
  //       encodedData,
  //       options.errorCorrectionLevel
  //     );
  //     const matrix = qrCodeGenerator.createQRCodeMatrix(finalData, options);
  //     const maskedMatrix = qrCodeGenerator.applyDataMask(matrix, 0);
  //
  //     // The masked matrix should have the same dimensions as the original matrix
  //     expect(maskedMatrix.length).toBe(matrix.length);
  //     expect(maskedMatrix[0].length).toBe(matrix[0].length);
  //   });
  // });

  // describe("createFormatInformationEncoding", () => {
  //   it("should create format information encoding for L level and mask pattern 4", () => {
  //     const formatInfo = qrCodeGenerator.createFormatInformationEncoding(
  //       ErrorCorrectionLevel.L,
  //       4
  //     );
  //     expect(formatInfo).toBe("110011000101111");
  //     expect(formatInfo.length).toBe(15);
  //   });
  // });
  // describe("placeFormatInformation", () => {
  //   it("should place format information into the QR code matrix", () => {
  //     const matrix = Array.from({ length: 33 }, () =>
  //       Array.from({ length: 33 }, () => 0)
  //     );
  //     const formatData = "110011000101111";
  //     const updatedMatrix = qrCodeGenerator.placeFormatInformation(
  //       matrix,
  //       formatData
  //     );
  //
  //     // top left format info
  //     expect(updatedMatrix[0][8]).toBe(parseInt(formatData[14]));
  //     expect(updatedMatrix[1][8]).toBe(parseInt(formatData[13]));
  //     expect(updatedMatrix[2][8]).toBe(parseInt(formatData[12]));
  //     expect(updatedMatrix[3][8]).toBe(parseInt(formatData[11]));
  //     expect(updatedMatrix[4][8]).toBe(parseInt(formatData[10]));
  //     expect(updatedMatrix[5][8]).toBe(parseInt(formatData[9]));
  //     expect(updatedMatrix[7][8]).toBe(parseInt(formatData[8]));
  //     expect(updatedMatrix[8][8]).toBe(parseInt(formatData[7]));
  //     expect(updatedMatrix[8][7]).toBe(parseInt(formatData[6]));
  //     expect(updatedMatrix[8][5]).toBe(parseInt(formatData[5]));
  //     expect(updatedMatrix[8][4]).toBe(parseInt(formatData[4]));
  //     expect(updatedMatrix[8][3]).toBe(parseInt(formatData[3]));
  //     expect(updatedMatrix[8][2]).toBe(parseInt(formatData[2]));
  //     expect(updatedMatrix[8][1]).toBe(parseInt(formatData[1]));
  //     expect(updatedMatrix[8][0]).toBe(parseInt(formatData[0]));
  //
  //     // bottom left format info
  //     expect(updatedMatrix[32][8]).toBe(parseInt(formatData[0]));
  //     expect(updatedMatrix[31][8]).toBe(parseInt(formatData[1]));
  //     expect(updatedMatrix[30][8]).toBe(parseInt(formatData[2]));
  //     expect(updatedMatrix[29][8]).toBe(parseInt(formatData[3]));
  //     expect(updatedMatrix[28][8]).toBe(parseInt(formatData[4]));
  //     expect(updatedMatrix[27][8]).toBe(parseInt(formatData[5]));
  //     expect(updatedMatrix[26][8]).toBe(parseInt(formatData[6]));
  //
  //     // top right format info
  //     expect(updatedMatrix[8][25]).toBe(parseInt(formatData[7]));
  //     expect(updatedMatrix[8][26]).toBe(parseInt(formatData[8]));
  //     expect(updatedMatrix[8][27]).toBe(parseInt(formatData[9]));
  //     expect(updatedMatrix[8][28]).toBe(parseInt(formatData[10]));
  //     expect(updatedMatrix[8][29]).toBe(parseInt(formatData[11]));
  //     expect(updatedMatrix[8][30]).toBe(parseInt(formatData[12]));
  //     expect(updatedMatrix[8][31]).toBe(parseInt(formatData[13]));
  //     expect(updatedMatrix[8][32]).toBe(parseInt(formatData[14]));
  //   });
  // });

  // describe("createVersionInformationEncoding", () => {});

  // describe("generateQRCode", () => {
  //   it("should generate a QR code matrix for numeric data", () => {
  //     const data = "1234567890";
  //     // const options = {
  //     //   encodingMode: EncodingMode.NUMERIC,
  //     //   errorCorrectionLevel: "L",
  //     //   version: 4
  //     // } as QRCodeOptions;
  //     const qrCodeMatrix = qrCodeGenerator.generate(data);
  //
  //     // For version 4, the matrix should be 33x33
  //     const exepectedSize = 33 + 8; // Including quiet zone
  //     expect(qrCodeMatrix.length).toBe(exepectedSize);
  //     expect(qrCodeMatrix[0].length).toBe(exepectedSize);
  //   });
  // });

  describe("saveQRCodeAsImage", () => {
    it("should save the QR code matrix as an image file", () => {
      const data = "google.com";
      const qrCodeMatrix = qrCodeGenerator.generate(data);
      const filePath = "./tests/qr_codes/test_qr_code.png";

      qrCodeGenerator.saveQRCodeAsImage(qrCodeMatrix, filePath);

      // TODO: create clean up function to remove generated files after tests
      //

      // const fs = require("fs");
      // expect(fs.existsSync(filePath)).toBe(true);
      //
      // // Clean up the generated file after test
      // fs.unlinkSync(filePath);
    });
  });
});
