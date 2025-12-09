describe("Generator Polynomial Debug", () => {
  it("should print generator polynomial for 10 EC codewords", () => {
    const ecCodewords = 10;
    
    // GF(256) setup  
    const gfExp = new Uint8Array(512);
    const gfLog = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      gfExp[i] = x;
      gfLog[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      gfExp[i] = gfExp[i - 255];
    }
    
    function gfMul(a: number, b: number): number {
      if (a === 0 || b === 0) return 0;
      return gfExp[(gfLog[a] + gfLog[b]) % 255];
    }
    
    // Build generator polynomial
    const gen = new Uint8Array(ecCodewords + 1);
    gen[0] = 1;
    for (let i = 0; i < ecCodewords; i++) {
      for (let j = i + 1; j > 0; j--) {
        gen[j] = gen[j] ^ gfMul(gen[j - 1], gfExp[i]);
      }
    }
    
    console.log('Generator polynomial coefficients:');
    console.log(Array.from(gen));
    console.log('');
    console.log('Expected from QR spec (degree 10):');
    console.log('[1, 216, 194, 159, 111, 199, 94, 95, 113, 157, 193]');
    // Source: https://www.thonky.com/qr-code-tutorial/generator-polynomial-tool
  });
});
