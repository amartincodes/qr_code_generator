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
  const ecInfo = version4ErrorCorrection[level];
  const blocks = ecInfo.blocks;
  const ecCodewordsPerBlock = ecInfo.ecCodewordsPerBlock;
  const dataCodewordsPerBlock = ecInfo.dataCodewordsPerBlock;
  const totalDataCodewords = dataCodewordsPerBlock * blocks;
  const totalECCCodewords = ecCodewordsPerBlock * blocks;

  if (data.length !== totalDataCodewords) {
    throw new Error(`Data length must be ${totalDataCodewords} codewords`);
  }

  // For QR version 4, all blocks have equal size except for H (which is also equal here)
  // But for generality, let's handle uneven blocks (QR spec: some blocks may be longer by 1)
  // For version 4, all blocks are equal, but this logic works for all versions

  // Prepare block sizes
  const shortBlockSize = Math.floor(data.length / blocks);
  const longBlockSize = shortBlockSize + (data.length % blocks > 0 ? 1 : 0);
  const numLongBlocks = data.length % blocks;
  const numShortBlocks = blocks - numLongBlocks;

  // Split data into blocks
  const dataBlocks: Uint8Array[] = [];
  let offset = 0;
  for (let i = 0; i < blocks; i++) {
    const size = i < numLongBlocks ? longBlockSize : shortBlockSize;
    dataBlocks.push(data.slice(offset, offset + size));
    offset += size;
  }

  // Generate error correction codewords for each block
  const ecBlocks: Uint8Array[] = [];
  for (let i = 0; i < blocks; i++) {
    ecBlocks.push(reedSolomonEncode(dataBlocks[i], ecCodewordsPerBlock));
  }

  // Interleave data codewords
  const result = new Uint8Array(totalDataCodewords + totalECCCodewords);
  let pos = 0;
  // Interleave data codewords
  const maxDataBlockLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataBlockLen; i++) {
    for (let j = 0; j < blocks; j++) {
      if (i < dataBlocks[j].length) {
        result[pos++] = dataBlocks[j][i];
      }
    }
  }
  // Interleave ECC codewords
  for (let i = 0; i < ecCodewordsPerBlock; i++) {
    for (let j = 0; j < blocks; j++) {
      result[pos++] = ecBlocks[j][i];
    }
  }

  return result;
}

export { implementErrorCorrection, version4ErrorCorrection };
