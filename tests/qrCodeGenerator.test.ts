import { QRCodeGenerator, EncodingMode } from "../src/qrCodeGenerator";

describe("QRCodeGenerator", () => {
  let qrCodeGenerator: QRCodeGenerator;

  beforeEach(() => {
    qrCodeGenerator = new QRCodeGenerator();
  });

  describe("detectBestEncoding", () => {
    it("should detect NUMERIC encoding for numeric data", () => {
      const encoding = qrCodeGenerator.detectBestEncoding("1234567890");
      expect(encoding).toBe(EncodingMode.NUMERIC);
    });

    it("should detect ALPHANUMERIC encoding for alphanumeric data", () => {
      const encoding = qrCodeGenerator.detectBestEncoding("HELLO WORLD 123");
      expect(encoding).toBe(EncodingMode.ALPHANUMERIC);
    });

    it("should detect BYTE encoding for byte data", () => {
      // ISO-8859-1 characters
      const encoding = qrCodeGenerator.detectBestEncoding(
        "Hello, World! ñ ü é"
      );
      expect(encoding).toBe(EncodingMode.BYTE);
    });

    it("should detect KANJI encoding for kanji data", () => {
      const encoding = qrCodeGenerator.detectBestEncoding("漢字テスト");
      expect(encoding).toBe(EncodingMode.KANJI);
    });
  });
});
