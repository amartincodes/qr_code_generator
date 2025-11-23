import * as fs from "fs";
import * as path from "path";
import { PNG } from "pngjs";
import Encoding from "encoding-japanese";

enum EncodingMode {
  NUMERIC = "NUMERIC",
  ALPHANUMERIC = "ALPHANUMERIC",
  BYTE = "BYTE",
  KANJI = "KANJI"
}
enum EncodingModeIndicator {
  NUMERIC = 0b0001,
  ALPHANUMERIC = 0b0010,
  BYTE = 0b0100,
  KANJI = 0b1000
}
enum CharacterCountIndicator {
  NUMERIC = 10, // for version 1-9
  ALPHANUMERIC = 9, // for version 1-9
  BYTE = 8, // for version 1-9
  KANJI = 8 // for version 1-9
}

enum ErrorCorrectionLevel {
  L = "L", // 7%
  M = "M", // 15%
  Q = "Q", // 25%
  H = "H" // 30%
}

enum NumberOfDataCodewordsLvl4 {
  L = 80,
  M = 64,
  Q = 48,
  H = 36
}

enum QRCodeSizeByVersion {
  VERSION_1 = 21,
  VERSION_2 = 25,
  VERSION_3 = 29,
  VERSION_4 = 33
  // ... up to 40
}

export interface QRCodeOptions {
  encodingMode: EncodingMode;
  errorCorrectionLevel: ErrorCorrectionLevel;
  version: number; // 1 to 40
}

// TODO: Add support for different versions (1-40)
const VERSION = 4; // we're just using a fixed version for simplicity (33 x 33 modules)

class QRCodeGenerator {
  constructor() {
    // this.generate = this.generate.bind(this);
  }

  validateInput(data: string): boolean {
    return data.length > 0 && data.length <= 2953; // Max length for QR Code version 40-L
  }

  detectBestEncoding(data: string): EncodingMode {
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

  encodeModeIndicatorToBinary(encodingMode: EncodingMode): string {
    const modeIndicator = EncodingModeIndicator[encodingMode];
    return modeIndicator.toString(2).padStart(4, "0");
  }

  encodeCharacterCountToBinary(
    dataLength: number,
    encodingMode: EncodingMode
  ): string {
    const charCountIndicatorBits = CharacterCountIndicator[encodingMode];
    return dataLength.toString(2).padStart(charCountIndicatorBits, "0");
  }

  padBinaryString(
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

  encodeDataToBinary(data: string, encodingMode: EncodingMode): string {
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
        const alphanumericTable =
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
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

  encodeData(data: string, options: QRCodeOptions): Uint8Array {
    const { encodingMode, errorCorrectionLevel, version } = options;

    // Encoding mode indicator binary
    const modeIndicatorBinary = this.encodeModeIndicatorToBinary(encodingMode);
    console.log("Mode Indicator Binary:", modeIndicatorBinary);

    // Char count indicator binary
    const charCountBinary = this.encodeCharacterCountToBinary(
      data.length,
      encodingMode
    );
    console.log("Character Count Binary:", charCountBinary);

    // Encoded data binary
    const encodedData = this.encodeDataToBinary(data, encodingMode);
    console.log("Encoded Data Binary:", encodedData);

    // Combine all binaries - mode indicator + char count + data
    const finalDataBinary = modeIndicatorBinary + charCountBinary + encodedData;
    console.log("mod of final data length:", finalDataBinary.length % 8);

    // add padding bits if necessary
    const paddedBinary = this.padBinaryString(
      finalDataBinary,
      errorCorrectionLevel
    );

    // Convert binary string to byte array
    const byteArrayLength = Math.ceil(paddedBinary.length / 8);
    const byteArray = new Uint8Array(byteArrayLength);
    for (let i = 0; i < byteArrayLength; i++) {
      const byteString = paddedBinary.substring(i * 8, i * 8 + 8);
      byteArray[i] = parseInt(byteString, 2);
    }

    return byteArray;
  }

  reedSolomonEncode(data: Uint8Array, ecCodewords: number): Uint8Array {
    // QR uses GF(256) with primitive polynomial 0x11d
    const gfExp = new Uint8Array(512);
    const gfLog = new Uint8Array(256);

    // Generate exponent and log tables
    let x = 1;
    for (let i = 0; i < 255; i++) {
      gfExp[i] = x;
      gfLog[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      gfExp[i] = gfExp[i - 255] || 0;
    }

    // Generator polynomial
    const gen = new Uint8Array(ecCodewords + 1);
    gen[0] = 1;
    for (let i = 0; i < ecCodewords; i++) {
      for (let j = i; j >= 0; j--) {
        // ignore object might be undefined
        // @ts-ignore
        gen[j + 1] ^= gfExp[(gfLog[gen[j]] + i) % 255];
      }
    }

    // Initialize buffer
    const buffer = new Uint8Array(data.length + ecCodewords);
    buffer.set(data);

    // Reed-Solomon division
    for (let i = 0; i < data.length; i++) {
      const coef = buffer[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          // @ts-ignore
          buffer[i + j] ^= gfExp[(gfLog[coef] + gfLog[gen[j]]) % 255];
        }
      }
    }

    // Error correction codewords are the last ecCodewords bytes
    return buffer.slice(-ecCodewords);
  }

  version4ErrorCorrection = {
    L: { blocks: 1, ecCodewordsPerBlock: 20, dataCodewordsPerBlock: 80 },
    M: { blocks: 2, ecCodewordsPerBlock: 18, dataCodewordsPerBlock: 32 },
    Q: { blocks: 2, ecCodewordsPerBlock: 26, dataCodewordsPerBlock: 24 },
    H: { blocks: 4, ecCodewordsPerBlock: 16, dataCodewordsPerBlock: 9 }
  };

  implementErrorCorrection(
    data: Uint8Array,
    level: ErrorCorrectionLevel
  ): Uint8Array {
    // For version 4
    const dataCodewords =
      this.version4ErrorCorrection[level].dataCodewordsPerBlock *
      this.version4ErrorCorrection[level].blocks;
    const ecCodewords =
      this.version4ErrorCorrection[level].ecCodewordsPerBlock *
      this.version4ErrorCorrection[level].blocks;
    const blocks = this.version4ErrorCorrection[level].blocks;

    // Ensure data is correct length
    if (data.length !== dataCodewords) {
      throw new Error(`Data length must be ${dataCodewords} codewords`);
    }

    // Split data into blocks
    const blockSize = dataCodewords / blocks;
    const dataBlocks: Uint8Array[] = [];
    for (let i = 0; i < blocks; i++) {
      dataBlocks.push(data.slice(i * blockSize, (i + 1) * blockSize));
    }

    console.log("Data Blocks:", dataBlocks);

    // Generate error correction codewords
    const ecBlocks: Uint8Array[] = [];
    for (let i = 0; i < blocks; i++) {
      if (!dataBlocks[i]) {
        throw new Error(`Data block ${i} is undefined`);
      }
      ecBlocks.push(
        this.reedSolomonEncode(
          dataBlocks[i] as Uint8Array,
          this.version4ErrorCorrection[level].ecCodewordsPerBlock
        )
      );
    }
    console.log("Error Correction Codewords:", ecBlocks);

    // Interleave data correction codewords
    const result = new Uint8Array(dataCodewords + ecCodewords);
    let pos = 0;
    for (let i = 0; i < blockSize; i++) {
      for (let j = 0; j < blocks; j++) {
        // @ts-ignore
        result[pos++] = dataBlocks[j][i];
      }
    }

    // interleave error correction codewords
    for (
      let i = 0;
      i < this.version4ErrorCorrection[level].ecCodewordsPerBlock;
      i++
    ) {
      for (let j = 0; j < blocks; j++) {
        // @ts-ignore
        result[pos++] = ecBlocks[j][i];
      }
    }

    console.log("Final Data + EC Codewords:", result);

    return result;
  }

  private placeFinderPattern(matrix: number[][], row: number, col: number) {
    // Finder pattern (7x7)
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 ||
          i === 6 ||
          j === 0 ||
          j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          // @ts-ignore
          matrix[row + i][col + j] = 1;
        }
      }
    }
    // Separator (8x8)
    for (let i = 0; i < 8; i++) {
      if (row + i < matrix.length && col + 7 < matrix.length) {
        matrix[row + i]![col + 7] = 0;
      }
      if (row + 7 < matrix.length && col + i < matrix.length) {
        matrix[row + 7]![col + i] = 0;
      }
    }
  }

  placeDataBits(
    matrix: number[][],
    dataBits: number[],
    isFunctionModule: boolean[][]
  ) {
    const size = matrix.length;
    let row = size - 1;
    let col = size - 1;
    let direction = -1; // up
    let bitIndex = 0;

    while (col > 0) {
      if (col === 6) col--; // skip timing pattern column

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < 2; j++) {
          const c = col - j;
          if (!isFunctionModule[row]![c] && bitIndex < dataBits.length) {
            matrix[row][c] = dataBits[bitIndex++];
          }
        }
        row += direction;
        if (row < 0 || row >= size) {
          row -= direction;
          direction *= -1;
          col -= 2;
          break;
        }
      }
    }
  }

  createQRCodeMatrix(
    dataWithEc: Uint8Array,
    options: QRCodeOptions
  ): number[][] {
    // Placeholder: In a real implementation, this would map data bits into the QR code matrix
    const size =
      QRCodeSizeByVersion[
        `VERSION_${options.version}` as keyof typeof QRCodeSizeByVersion
      ];
    const matrix: number[][] = Array.from({ length: size }, () =>
      Array(size).fill(0)
    );

    // place finder patterns with separators
    // Top-left
    this.placeFinderPattern(matrix, 0, 0);
    // Top-right
    this.placeFinderPattern(matrix, 0, size - 7);
    // Bottom-left
    this.placeFinderPattern(matrix, size - 7, 0);
    // console.log("QR Code Matrix with Finder Patterns:");
    // console.table(matrix);

    // add alignment patterns
    // For version 4, alignment pattern at (26,26)
    // TODO: Generalize for other versions
    const alignRow = 26;
    const alignCol = 26;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const r = alignRow + i;
        const c = alignCol + j;
        if (
          i === -2 ||
          i === 2 ||
          j === -2 ||
          j === 2 ||
          (i === 0 && j === 0)
        ) {
          matrix[r]![c] = 1; // black border and center
        } else {
          matrix[r]![c] = 0; // white center
        }
      }
    }
    // console.log("QR Code Matrix with Alignment Pattern:");
    // console.table(matrix);

    // add timing patterns
    // Horizontal
    for (let i = 8; i < size - 8; i++) {
      matrix[6]![i] = i % 2 === 0 ? 1 : 0;
    }
    // Vertical
    for (let i = 8; i < size - 8; i++) {
      matrix[i]![6] = i % 2 === 0 ? 1 : 0;
    }
    // console.log("QR Code Matrix with Timing Patterns:");
    // console.table(matrix);

    // Add dark module
    // For version 4, at (8, size-8)
    matrix[size - 8]![8] = 1;

    // reserve format information areas
    // for (let i = 0; i < 9; i++) {
    //   if (i !== 6) {
    //     matrix[8]![i] = 0; // Top-left horizontal
    //     matrix[i]![8] = 0; // Top-left vertical
    //   }
    // }
    // for (let i = size - 8; i < size; i++) {
    //   matrix[8]![i] = 0; // Top-right
    //   matrix[i]![8] = 0; // Bottom-left
    // }
    // console.log("Final QR Code Matrix with Reserved Areas:");
    // console.table(matrix);

    // TODO: the following can go into a separate function

    // place data bits into the matrix
    this.placeDataBits(
      matrix,
      Array.from(dataWithEc).flatMap((byte) =>
        Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1)
      ),
      this.createIsFunctionModuleMatrix(size)
    );

    // let row = size - 1;
    // let col = size - 1;
    // let direction = -1; // moving upwards initially
    // let byteIndex = 0;
    // let bitIndex = 7;
    //
    // for (let i = 0; i < dataWithEc.length * 8; i++) {
    //   // Skip reserved areas
    //   while (matrix[row]![col] !== 0 && matrix[row]![col] !== 1) {
    //     col -= 1;
    //     if (col < 0) {
    //       col = size - 1;
    //       row += direction;
    //       if (row < 0 || row >= size) {
    //         direction *= -1;
    //         row += direction;
    //       }
    //     }
    //   }
    //
    //   // @ts-ignore
    //   const bit = (dataWithEc[byteIndex] >> bitIndex) & 1;
    //   matrix[row]![col] = bit;
    //
    //   bitIndex -= 1;
    //   if (bitIndex < 0) {
    //     byteIndex += 1;
    //     bitIndex = 7;
    //   }
    //
    //   // Move to next position
    //   col -= 1;
    //   if (col < 0) {
    //     col = size - 1;
    //     row += direction;
    //     if (row < 0 || row >= size) {
    //       direction *= -1;
    //       row += direction;
    //     }
    //   }
    // }

    console.log("Final QR Code Matrix with Data Bits:");
    console.table(matrix);

    return matrix;
  }

  selectBestMaskPattern(
    matrix: number[][],
    applyDataMask: (m: number[][], mask: number) => number[][]
  ): number {
    let bestMask = 0;
    let lowestPenalty = Infinity;

    for (let mask = 0; mask < 8; mask++) {
      const maskedMatrix = applyDataMask(matrix, mask);
      const penalty = this.calculateMaskPenalty(maskedMatrix);
      if (penalty < lowestPenalty) {
        lowestPenalty = penalty;
        bestMask = mask;
      }
    }
    return bestMask;
  }

  // Penalty calculation based on QR spec (ISO/IEC 18004)
  private calculateMaskPenalty(matrix: number[][]): number {
    const size = matrix.length;
    let penalty = 0;

    // Rule 1: Adjacent modules in row/column in same color
    for (let i = 0; i < size; i++) {
      let rowCount = 1,
        colCount = 1;
      for (let j = 1; j < size; j++) {
        if (matrix[i]![j] === matrix[i]![j - 1]) rowCount++;
        else {
          if (rowCount >= 5) penalty += 3 + (rowCount - 5);
          rowCount = 1;
        }
        if (matrix[j]![i] === matrix[j - 1]![i]) colCount++;
        else {
          if (colCount >= 5) penalty += 3 + (colCount - 5);
          colCount = 1;
        }
      }
      if (rowCount >= 5) penalty += 3 + (rowCount - 5);
      if (colCount >= 5) penalty += 3 + (colCount - 5);
    }

    // Rule 2: 2x2 blocks of same color
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const color = matrix[r]![c];
        if (
          color === matrix[r]![c + 1] &&
          color === matrix[r + 1]![c] &&
          color === matrix[r + 1]![c + 1]
        ) {
          penalty += 3;
        }
      }
    }

    // Rule 3: Finder-like patterns in rows/columns
    const pattern = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - 11; j++) {
        // Row
        if (pattern.every((v, k) => matrix[i]![j + k] === v)) penalty += 40;
        // Column
        if (pattern.every((v, k) => matrix[j + k]![i] === v)) penalty += 40;
      }
    }

    // Rule 4: Proportion of dark modules
    let darkCount = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r]![c]) darkCount++;
      }
    }
    const total = size * size;
    const percent = (darkCount * 100) / total;
    const k = Math.abs(Math.floor(percent / 5) - 10);
    penalty += k * 10;

    return penalty;
  }

  createIsFunctionModuleMatrix(size: number): boolean[][] {
    const matrix = Array.from({ length: size }, () => Array(size).fill(false));

    // Finder patterns (top-left, top-right, bottom-left)
    const finderCoords: [number, number][] = [
      [0, 0],
      [0, size - 7],
      [size - 7, 0]
    ];
    for (const coord of finderCoords) {
      const [row, col] = coord;
      if (typeof row !== "number" || typeof col !== "number") continue;

      for (let r = row; r < row + 7; r++) {
        for (let c = col; c < col + 7; c++) {
          matrix[r]![c] = true;
        }
      }
    }
    // Separators (1-module wide white border around finder patterns)
    for (const [row, col] of finderCoords) {
      // Horizontal separators (above and below)
      for (let c = col - 1; c <= col + 7; c++) {
        if (row - 1 >= 0 && c >= 0 && c < size) {
          matrix[row - 1]![c] = 0;
          matrix[row - 1]![c] = true;
        }
        if (row + 7 < size && c >= 0 && c < size) {
          matrix[row + 7]![c] = 0;
          matrix[row + 7]![c] = true;
        }
      }
      // Vertical separators (left and right)
      for (let r = row; r < row + 7; r++) {
        if (col - 1 >= 0 && r >= 0 && r < size) {
          matrix[r]![col - 1] = 0;
          matrix[r]![col - 1] = true;
        }
        if (col + 7 < size && r >= 0 && r < size) {
          matrix[r]![col + 7] = 0;
          matrix[r]![col + 7] = true;
        }
      }
    }

    // Timing patterns (horizontal and vertical lines at row 6 and column 6)
    for (let i = 0; i < size; i++) {
      matrix[6]![i] = true;
      matrix[i]![6] = true;
    }

    // Alignment patterns (for versions >= 2)
    // Add logic for alignment patterns if needed
    // For version 4, alignment pattern at (26,26)
    // TODO: Generalize for other versions
    const alignRow = 26;
    const alignCol = 26;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (
          i === -2 ||
          i === 2 ||
          j === -2 ||
          j === 2 ||
          (i === 0 && j === 0)
        ) {
          matrix[alignRow + i]![alignCol + j] = true;
        } else {
          matrix[alignRow + i]![alignCol + j] = true;
        }
      }
    }

    // Format information areas
    for (let i = 0; i < 8; i++) {
      matrix[8]![i] = true;
      matrix[i]![8] = true;
      matrix[8]![size - 8 + i] = true;
      matrix[size - 8 + i]![8] = true;
    }

    // dark module
    matrix[size - 8]![8] = true;

    // Version information areas (for versions >= 7)
    // Add logic for version info if needed
    // TODO: add this bit when adding support for versions 7 and above

    return matrix;
  }

  applyDataMask(
    matrix: number[][],
    maskPattern: number,
    isFunctionModule: boolean[][]
  ): number[][] {
    const size = matrix.length;
    const maskedMatrix = matrix.map((row) => row.slice());

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (isFunctionModule[r]![c]) continue; // Skip function/reserved modules

        let mask = false;
        switch (maskPattern) {
          case 0:
            mask = (r + c) % 2 === 0;
            break;
          case 1:
            mask = r % 2 === 0;
            break;
          case 2:
            mask = c % 3 === 0;
            break;
          case 3:
            mask = (r + c) % 3 === 0;
            break;
          case 4:
            mask = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
            break;
          case 5:
            mask = ((r * c) % 2) + ((r * c) % 3) === 0;
            break;
          case 6:
            mask = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
            break;
          case 7:
            mask = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
            break;
        }
        if (mask) {
          // @ts-ignore
          maskedMatrix[r]![c] ^= 1;
        }
      }
    }
    return maskedMatrix;
  }

  createFormatInformationEncoding(
    errorCorrectionLevel: ErrorCorrectionLevel,
    maskPattern: number
  ): string {
    // Step 1: Build 5-bit format info
    const ecLevelBitsMap: { [key in ErrorCorrectionLevel]: string } = {
      L: "01",
      M: "00",
      Q: "11",
      H: "10"
    };
    const ecLevelBits = ecLevelBitsMap[errorCorrectionLevel];
    const maskPatternBits = maskPattern.toString(2).padStart(3, "0");
    const formatInfoWithoutBCH = ecLevelBits + maskPatternBits; // 5 bits

    // Step 2: Append 10 zeros (shift left by 10 bits)
    let data = formatInfoWithoutBCH + "0000000000";

    // Step 3: Polynomial division (modulo 2, XOR)
    const generator = "10100110111";
    function xorStrings(a: string, b: string): string {
      return a
        .split("")
        .map((c, i) => (c === b[i] ? "0" : "1"))
        .join("");
    }
    while (data.length >= generator.length) {
      if (data[0] === "1") {
        const paddedGen = generator.padEnd(data.length, "0");
        data = xorStrings(data, paddedGen);
      }
      // Remove leading zero
      data = data.replace(/^0+/, "");
    }
    // Step 4: Pad to 10 bits
    const bchCode = data.padStart(10, "0");

    // Step 5: Concatenate format info and error correction bits
    let formatInfo = formatInfoWithoutBCH + bchCode;

    // Step 6: XOR with mask pattern
    const mask = "101010000010010";
    formatInfo = xorStrings(formatInfo.padStart(15, "0"), mask);

    return formatInfo;
  }

  placeFormatInformation(matrix: number[][], formatInfo: string): number[][] {
    let updatedMatrix = matrix;
    const size = matrix.length;

    // Place bits in the reserved areas
    // Top-left
    for (let i = 0; i < 6; i++) {
      updatedMatrix[8]![i] = parseInt(formatInfo[i] ?? "0", 10);
    }
    updatedMatrix[8]![7] = parseInt(formatInfo[6] ?? "0", 10);
    updatedMatrix[8]![8] = parseInt(formatInfo[7] ?? "0", 10);
    updatedMatrix[7]![8] = parseInt(formatInfo[8] ?? "0", 10);
    for (let i = 9; i < 15; i++) {
      updatedMatrix[14 - i]![8] = parseInt(formatInfo[i] ?? "0", 10);
    }

    // Top-right
    for (let i = 0; i < 8; i++) {
      updatedMatrix[8]![size - 8 + i] = parseInt(formatInfo[7 + i] ?? "0", 10);
    }
    // Bottom-left
    for (let i = 0; i < 7; i++) {
      updatedMatrix[size - 1 - i]![8] = parseInt(formatInfo[i] ?? "0", 10);
    }

    console.log("QR Code Matrix with Format Information:");
    console.table(updatedMatrix);
    return updatedMatrix;
  }

  // TODO: Implement version information encoding for versions 7 and above
  createVersionInformationEncoding(version: number): string {
    // create the 18-bit version information string for versions 7 and above
    // Placeholder for version information encoding
    return "000000000000000000"; // This should be calculated properly
  }

  addQuietZone(matrix: number[][], quietZoneSize: number): number[][] {
    const size = matrix.length;
    const newSize = size + quietZoneSize * 2;
    const newMatrix: number[][] = Array.from({ length: newSize }, () =>
      Array(newSize).fill(0)
    );

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        newMatrix[r + quietZoneSize]![c + quietZoneSize] = matrix[r]![c];
      }
    }

    return newMatrix;
  }

  generateQrCode(
    data: string,
    encoding: EncodingMode,
    errorCorrectionLevel: ErrorCorrectionLevel
  ): number[][] {
    const encodedData = this.encodeData(data, {
      encodingMode: encoding,
      errorCorrectionLevel,
      version: VERSION
    });
    console.log("Encoded Data Bytes:", encodedData);
    const dataWithEc = this.implementErrorCorrection(
      encodedData,
      errorCorrectionLevel
    );
    console.log("Data with Error Correction Bytes:", dataWithEc);
    let qrMatrix = this.createQRCodeMatrix(dataWithEc, {
      encodingMode: encoding,
      errorCorrectionLevel,
      version: VERSION
    });

    const isFunctionModule = this.createIsFunctionModuleMatrix(qrMatrix.length);
    const bestMask = this.selectBestMaskPattern(qrMatrix, (m, mask) =>
      this.applyDataMask(m, mask, isFunctionModule)
    );
    console.log("Best Mask Pattern Selected:", bestMask);

    qrMatrix = this.applyDataMask(qrMatrix, bestMask, isFunctionModule);
    const formatInfo = this.createFormatInformationEncoding(
      errorCorrectionLevel,
      bestMask
    );
    qrMatrix = this.placeFormatInformation(qrMatrix, formatInfo);

    qrMatrix = this.addQuietZone(qrMatrix, 4);

    console.log("Final QR Code Matrix with Quiet Zone:");
    console.table(qrMatrix);

    return qrMatrix;
  }

  generate(data: string): number[][] {
    if (!this.validateInput(data)) {
      throw new Error("Invalid input data for QR code generation.");
    }

    const encoding = this.detectBestEncoding(data);
    console.log(`Detected encoding mode: ${encoding}`);

    const qrMatrix = this.generateQrCode(
      data,
      encoding,
      ErrorCorrectionLevel.L
    );
    console.log("Generated QR Code Matrix:");
    console.table(qrMatrix);

    return qrMatrix;
  }

  saveQRCodeAsImage(matrix: number[][], filePath?: string): void {
    const size = matrix.length;
    const scale = 10; // pixels per module
    const png = new PNG({
      width: size * scale,
      height: size * scale,
      colorType: 0
    });

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = matrix[y]![x] ? 0 : 255; // 0: black, 255: white
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const idx = ((y * scale + dy) * png.width + (x * scale + dx)) << 2;
            png.data[idx] = color; // R
            png.data[idx + 1] = color; // G
            png.data[idx + 2] = color; // B
            png.data[idx + 3] = 255; // A
          }
        }
      }
    }

    const filePathFinal = filePath || `./qr_codes/qrcode_${Date.now()}.png`;
    const dir = path.dirname(filePathFinal);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    png.pack().pipe(fs.createWriteStream(filePathFinal));
    console.log(`Saving QR code image to ${filePathFinal}...`);
  }
}

export {
  QRCodeGenerator,
  EncodingMode,
  EncodingModeIndicator,
  ErrorCorrectionLevel,
  NumberOfDataCodewordsLvl4
};
