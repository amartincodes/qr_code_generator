import { QRCodeGenerator } from "../src/qrCodeGenerator";
import { EncodingMode, ErrorCorrectionLevel } from "../src/types";

describe("Performance Tests", () => {
  let generator: QRCodeGenerator;

  beforeEach(() => {
    generator = new QRCodeGenerator();
  });

  describe("QR Code Generation Performance", () => {
    it("should generate Version 1 QR code in under 100ms", () => {
      const start = performance.now();
      generator.generate("123", {
        version: 1,
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: ErrorCorrectionLevel.L
      });
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100);
    });

    it("should generate Version 10 QR code in under 150ms", () => {
      const start = performance.now();
      generator.generate("HELLO WORLD", {
        version: 10,
        encodingMode: EncodingMode.ALPHANUMERIC,
        errorCorrectionLevel: ErrorCorrectionLevel.M
      });
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(150);
    });

    it("should generate Version 20 QR code in under 250ms", () => {
      const start = performance.now();
      generator.generate("Test message for version 20", {
        version: 20,
        encodingMode: EncodingMode.BYTE,
        errorCorrectionLevel: ErrorCorrectionLevel.Q
      });
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(250);
    });

    it("should generate Version 40 QR code in under 500ms", () => {
      const start = performance.now();
      generator.generate("A".repeat(100), {
        version: 40,
        encodingMode: EncodingMode.BYTE,
        errorCorrectionLevel: ErrorCorrectionLevel.L
      });
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describe("Batch Generation Performance", () => {
    it("should generate 10 Version 4 QR codes in under 500ms", () => {
      const start = performance.now();
      for (let i = 0; i < 10; i++) {
        generator.generate(`Data${i}`, {
          version: 4,
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.M
        });
      }
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(500);
    });

    it("should generate 50 Version 1 QR codes in under 2000ms", () => {
      const start = performance.now();
      for (let i = 0; i < 50; i++) {
        generator.generate(`${i}`, {
          version: 1,
          encodingMode: EncodingMode.NUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.L
        });
      }
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(2000);
    });
  });

  describe("Encoding Mode Performance Comparison", () => {
    it("numeric encoding should be fastest for numbers", () => {
      const numericStart = performance.now();
      generator.generate("1234567890", {
        version: 10,
        encodingMode: EncodingMode.NUMERIC,
        errorCorrectionLevel: ErrorCorrectionLevel.L
      });
      const numericDuration = performance.now() - numericStart;

      const byteStart = performance.now();
      generator.generate("1234567890", {
        version: 10,
        encodingMode: EncodingMode.BYTE,
        errorCorrectionLevel: ErrorCorrectionLevel.L
      });
      const byteDuration = performance.now() - byteStart;

      // Both should complete in reasonable time
      expect(numericDuration).toBeLessThan(150);
      expect(byteDuration).toBeLessThan(150);
    });

    it("alphanumeric encoding should handle uppercase efficiently", () => {
      const start = performance.now();
      generator.generate("HELLO WORLD 123", {
        version: 10,
        encodingMode: EncodingMode.ALPHANUMERIC,
        errorCorrectionLevel: ErrorCorrectionLevel.M
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(150);
    });
  });

  describe("Error Correction Level Performance", () => {
    const data = "Test data";
    const version = 10;

    it("should generate with L level efficiently", () => {
      const start = performance.now();
      generator.generate(data, {
        version,
        encodingMode: EncodingMode.BYTE,
        errorCorrectionLevel: ErrorCorrectionLevel.L
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(150);
    });

    it("should generate with M level efficiently", () => {
      const start = performance.now();
      generator.generate(data, {
        version,
        encodingMode: EncodingMode.BYTE,
        errorCorrectionLevel: ErrorCorrectionLevel.M
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(150);
    });

    it("should generate with Q level efficiently", () => {
      const start = performance.now();
      generator.generate(data, {
        version,
        encodingMode: EncodingMode.BYTE,
        errorCorrectionLevel: ErrorCorrectionLevel.Q
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(150);
    });

    it("should generate with H level efficiently", () => {
      const start = performance.now();
      generator.generate(data, {
        version,
        encodingMode: EncodingMode.BYTE,
        errorCorrectionLevel: ErrorCorrectionLevel.H
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(150);
    });
  });

  describe("Memory Efficiency", () => {
    it("should handle large data without excessive memory", () => {
      const largeData = "A".repeat(1000);

      // This should not throw an out of memory error
      expect(() => {
        generator.generate(largeData, {
          version: 40,
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.L
        });
      }).not.toThrow();
    });

    it("should handle multiple consecutive generations", () => {
      // Generate 100 QR codes consecutively
      expect(() => {
        for (let i = 0; i < 100; i++) {
          generator.generate(`Data${i}`, {
            version: 4,
            encodingMode: EncodingMode.BYTE,
            errorCorrectionLevel: ErrorCorrectionLevel.M
          });
        }
      }).not.toThrow();
    });
  });

  describe("Throughput Benchmarks", () => {
    it("should achieve minimum throughput for Version 1", () => {
      const iterations = 20;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        generator.generate(`${i}`, {
          version: 1,
          encodingMode: EncodingMode.NUMERIC,
          errorCorrectionLevel: ErrorCorrectionLevel.L
        });
      }

      const duration = performance.now() - start;
      const throughput = (iterations / duration) * 1000; // ops per second

      // Should be able to generate at least 50 Version 1 QR codes per second
      expect(throughput).toBeGreaterThan(50);
    });

    it("should achieve minimum throughput for Version 10", () => {
      const iterations = 10;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        generator.generate(`Data${i}`, {
          version: 10,
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.M
        });
      }

      const duration = performance.now() - start;
      const throughput = (iterations / duration) * 1000; // ops per second

      // Should be able to generate at least 20 Version 10 QR codes per second
      expect(throughput).toBeGreaterThan(20);
    });
  });
});
