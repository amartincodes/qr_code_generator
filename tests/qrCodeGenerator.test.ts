import { QRCodeGenerator } from "../src/qrCodeGenerator";

describe("QRCodeGenerator", () => {
  let qrCodeGenerator: QRCodeGenerator;

  beforeEach(() => {
    qrCodeGenerator = new QRCodeGenerator();
  });

  describe("generateQRCode", () => {
    it("should generate a QR code matrix for numeric data", () => {
      const data = "1234567890";
      const qrCodeMatrix = qrCodeGenerator.generate(data);

      // For version 4, the matrix should be 33x33
      const exepectedSize = 33 + 8; // Including quiet zone
      expect(qrCodeMatrix.length).toBe(exepectedSize);
      expect(qrCodeMatrix[0].length).toBe(exepectedSize);
    });
  });

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
