import { reedSolomonEncode } from "./encoding";
import type { ErrorCorrectionLevel } from "./types";

type ErrorCorrectionBlockInfo = {
  blocks: number;
  ecCodewordsPerBlock: number;
  dataCodewordsPerBlock: number;
};
type ErrorCorrectionInfo = {
  [level in ErrorCorrectionLevel]: ErrorCorrectionBlockInfo;
};

const version4ErrorCorrection: ErrorCorrectionInfo = {
  L: { blocks: 1, ecCodewordsPerBlock: 20, dataCodewordsPerBlock: 80 },
  M: { blocks: 2, ecCodewordsPerBlock: 18, dataCodewordsPerBlock: 32 },
  Q: { blocks: 2, ecCodewordsPerBlock: 26, dataCodewordsPerBlock: 24 },
  H: { blocks: 4, ecCodewordsPerBlock: 16, dataCodewordsPerBlock: 9 }
};

function implementErrorCorrection(
  data: Uint8Array,
  level: ErrorCorrectionLevel
): Uint8Array {
  // For version 4
  const dataCodewords =
    version4ErrorCorrection[level].dataCodewordsPerBlock *
    version4ErrorCorrection[level].blocks;
  const ecCodewords =
    version4ErrorCorrection[level].ecCodewordsPerBlock *
    version4ErrorCorrection[level].blocks;
  const blocks = version4ErrorCorrection[level].blocks;

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
      reedSolomonEncode(
        dataBlocks[i] as Uint8Array,
        version4ErrorCorrection[level].ecCodewordsPerBlock
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
  for (let i = 0; i < version4ErrorCorrection[level].ecCodewordsPerBlock; i++) {
    for (let j = 0; j < blocks; j++) {
      // @ts-ignore
      result[pos++] = ecBlocks[j][i];
    }
  }

  console.log("Final Data + EC Codewords:", result);

  return result;
}

export { implementErrorCorrection, version4ErrorCorrection };
