import Encoding from "encoding-japanese";
import {
  EncodingMode,
  EncodingModeIndicator,
  CharacterCountIndicator,
  ErrorCorrectionLevel,
  NumberOfDataCodewordsLvl4
} from "./types";
import type { QRCodeOptions } from "./types";

function detectBestEncoding(data: string): EncodingMode {
  // Support for numerical, alphanumeric, byte, and kanji modes can be added here
  if (/^\d+$/.test(data)) {
    return EncodingMode.NUMERIC;
  } else if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) {
    return EncodingMode.ALPHANUMERIC;
  } else if (/^[\x00-\xFF]+$/.test(data)) {
    // ISO-8859-1 range
    return EncodingMode.BYTE;
  } else {
    return EncodingMode.KANJI;
  }
}

function encodeModeIndicatorToBinary(encodingMode: EncodingMode): string {
  const modeIndicator = EncodingModeIndicator[encodingMode];
  return modeIndicator.toString(2).padStart(4, "0");
}

function encodeCharacterCountToBinary(
  dataLength: number,
  encodingMode: EncodingMode
): string {
  const charCountIndicatorBits = CharacterCountIndicator[encodingMode];
  return dataLength.toString(2).padStart(charCountIndicatorBits, "0");
}

function padBinaryString(
  binary: string,
  errorCorrectionLevel: ErrorCorrectionLevel
): string {
  const capacityBits = NumberOfDataCodewordsLvl4[errorCorrectionLevel] * 8;
  if (binary.length > capacityBits) {
    throw new Error(
      "Data exceeds capacity for the selected error correction level."
    );
  }

  // Add terminator
  let paddedBinary = binary;
  const terminatorLength = Math.min(4, capacityBits - paddedBinary.length);
  paddedBinary += "0".repeat(terminatorLength);
  // const remainingBits = capacityBits - paddedBinary.length;
  if (paddedBinary.length % 8 !== 0) {
    paddedBinary = paddedBinary.padEnd(
      Math.ceil(paddedBinary.length / 8) * 8,
      "0"
    );
  }
  while (paddedBinary.length < capacityBits) {
    paddedBinary += "11101100"; // 0xEC
    if (paddedBinary.length < capacityBits) {
      paddedBinary += "00010001"; // 0x11
    }
  }
  paddedBinary = paddedBinary.substring(0, capacityBits); // ensure exact length
  console.log(
    "Padded Data Binary:",
    paddedBinary,
    paddedBinary.length,
    paddedBinary.length % 8
  );
  return paddedBinary;
}

function encodeDataToBinary(data: string, encodingMode: EncodingMode): string {
  // Data encoding based on mode
  let encodedData: string = "";
  switch (encodingMode) {
    case EncodingMode.NUMERIC:
      for (let i = 0; i < data.length; i += 3) {
        const segment = data.substring(i, i + 3);
        const num = parseInt(segment, 10);
        let bitLength;
        if (segment.length === 3) {
          bitLength = 10;
        } else if (segment.length === 2) {
          bitLength = 7;
        } else {
          bitLength = 4;
        }
        encodedData += num.toString(2).padStart(bitLength, "0");
      }
      break;
    case EncodingMode.ALPHANUMERIC:
      const alphanumericTable = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
      for (let i = 0; i < data.length; i += 2) {
        const firstChar = alphanumericTable.indexOf(data[i] || "");
        const secondChar = alphanumericTable.indexOf(data[i + 1] || "");
        const value =
          secondChar === -1 ? firstChar : firstChar * 45 + secondChar;
        const bitLength = secondChar === -1 ? 6 : 11;
        encodedData += value.toString(2).padStart(bitLength, "0");
      }
      break;
    case EncodingMode.BYTE:
      for (let i = 0; i < data.length; i++) {
        const byte = data.charCodeAt(i);
        encodedData += byte.toString(2).padStart(8, "0");
      }
      break;
    case EncodingMode.KANJI: {
      // Convert to Shift JIS byte array
      const sjisBytes = Encoding.convert(data, {
        from: "UNICODE",
        to: "SJIS",
        type: "array"
      });

      for (let i = 0; i < sjisBytes.length; i += 2) {
        const byte1 = sjisBytes[i] || 0;
        const byte2 = sjisBytes[i + 1] || 0;
        const code = (byte1 << 8) | byte2;

        let adjustedCode;
        if (code >= 0x8140 && code <= 0x9ffc) {
          adjustedCode = code - 0x8140;
        } else if (code >= 0xe040 && code <= 0xebbf) {
          adjustedCode = code - 0xc140;
        } else {
          throw new Error(
            `Invalid Kanji character at bytes ${byte1.toString(16)}, ${byte2.toString(16)}`
          );
        }

        const upperByte = Math.floor(adjustedCode / 0xc0);
        const lowerByte = adjustedCode % 0xc0;
        const value = upperByte * 0xc0 + lowerByte;

        encodedData += value.toString(2).padStart(13, "0");
      }
      break;
    }
  }

  return encodedData;
}

function encodeData(data: string, options: QRCodeOptions): Uint8Array {
  const { encodingMode, errorCorrectionLevel, version } = options;

  // Encoding mode indicator binary
  const modeIndicatorBinary = encodeModeIndicatorToBinary(encodingMode);
  console.log("Mode Indicator Binary:", modeIndicatorBinary);

  // Char count indicator binary
  const charCountBinary = encodeCharacterCountToBinary(
    data.length,
    encodingMode
  );
  console.log("Character Count Binary:", charCountBinary);

  // Encoded data binary
  const encodedData = encodeDataToBinary(data, encodingMode);
  console.log("Encoded Data Binary:", encodedData);

  // Combine all binaries - mode indicator + char count + data
  const finalDataBinary = modeIndicatorBinary + charCountBinary + encodedData;
  console.log("mod of final data length:", finalDataBinary.length % 8);

  // add padding bits if necessary
  const paddedBinary = padBinaryString(finalDataBinary, errorCorrectionLevel);

  // Convert binary string to byte array
  const byteArrayLength = Math.ceil(paddedBinary.length / 8);
  const byteArray = new Uint8Array(byteArrayLength);
  for (let i = 0; i < byteArrayLength; i++) {
    const byteString = paddedBinary.substring(i * 8, i * 8 + 8);
    byteArray[i] = parseInt(byteString, 2);
  }

  return byteArray;
}

function reedSolomonEncode(data: Uint8Array, ecCodewords: number): Uint8Array {
  // QR uses GF(256) with primitive polynomial 0x11d
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

  // Generator polynomial
  const gen = new Uint8Array(ecCodewords + 1);
  gen[0] = 1;
  for (let i = 0; i < ecCodewords; i++) {
    for (let j = i + 1; j > 0; j--) {
      gen[j] = gen[j] ^ gfMul(gen[j - 1], gfExp[i]);
    }
  }

  function gfMul(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return gfExp[(gfLog[a] + gfLog[b]) % 255];
  }

  // Initialize buffer
  const buffer = new Uint8Array(data.length + ecCodewords);
  buffer.set(data);

  // Reed-Solomon division
  for (let i = 0; i < data.length; i++) {
    const coef = buffer[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        buffer[i + j] ^= gfMul(coef, gen[j]);
      }
    }
  }

  // Error correction codewords are the last ecCodewords bytes
  return buffer.slice(-ecCodewords);
}

export {
  detectBestEncoding,
  encodeModeIndicatorToBinary,
  encodeCharacterCountToBinary,
  padBinaryString,
  encodeDataToBinary,
  encodeData,
  reedSolomonEncode
};
