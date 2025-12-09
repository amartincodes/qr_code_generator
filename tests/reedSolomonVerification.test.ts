import { reedSolomonEncode } from "../src/encoding";

describe("Reed-Solomon Verification", () => {
  it("should match known example from thonky.com", () => {
    // Test data from https://www.thonky.com/qr-code-tutorial/show-division-steps
    // Message: 32,91,11,120,209,114,220,77,67,64,236,17,236
    // Expected EC (verified from thonky.com tutorial): 87, 86, 68, 17, 99, 235, 189, 232, 98, 195

    const testData = new Uint8Array([32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236]);
    const ecCount = 10;

    const ecCodewords = reedSolomonEncode(testData, ecCount);

    // Verified using https://www.thonky.com/qr-code-tutorial/show-division-steps
    // with the exact input data above and 10 error correction codewords

    const expected = new Uint8Array([87, 86, 68, 17, 99, 235, 189, 232, 98, 195]);
    
    console.log('Input data:', Array.from(testData));
    console.log('EC codewords:', Array.from(ecCodewords));
    console.log('Expected EC:', Array.from(expected));
    
    expect(ecCodewords.length).toBe(10);
    expect(ecCodewords).toEqual(expected);
  });
});
