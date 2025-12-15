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

// New structure for error correction table supporting dual block groups
type ECBlockGroup = {
  numBlocks: number;
  dataCodewordsPerBlock: number;
};

type ECInfo = {
  ecCodewordsPerBlock: number;
  group1: ECBlockGroup;
  group2?: ECBlockGroup;
};

// Complete error correction table for all QR code versions (1-40) and all EC levels
export const ERROR_CORRECTION_TABLE: {
  [version: number]: { [level in ErrorCorrectionLevel]: ECInfo };
} = {
  1: {
    L: {
      ecCodewordsPerBlock: 7,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 19 }
    },
    M: {
      ecCodewordsPerBlock: 10,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 16 }
    },
    Q: {
      ecCodewordsPerBlock: 13,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 13 }
    },
    H: {
      ecCodewordsPerBlock: 17,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 9 }
    }
  },
  2: {
    L: {
      ecCodewordsPerBlock: 10,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 34 }
    },
    M: {
      ecCodewordsPerBlock: 16,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 28 }
    },
    Q: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 22 }
    },
    H: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 16 }
    }
  },
  3: {
    L: {
      ecCodewordsPerBlock: 15,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 55 }
    },
    M: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 44 }
    },
    Q: {
      ecCodewordsPerBlock: 18,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 17 }
    },
    H: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 13 }
    }
  },
  4: {
    L: {
      ecCodewordsPerBlock: 20,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 80 }
    },
    M: {
      ecCodewordsPerBlock: 18,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 32 }
    },
    Q: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 24 }
    },
    H: {
      ecCodewordsPerBlock: 16,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 9 }
    }
  },
  5: {
    L: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 108 }
    },
    M: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 43 }
    },
    Q: {
      ecCodewordsPerBlock: 18,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 16 }
    },
    H: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 11 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 12 }
    }
  },
  6: {
    L: {
      ecCodewordsPerBlock: 18,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 68 }
    },
    M: {
      ecCodewordsPerBlock: 16,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 27 }
    },
    Q: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 19 }
    },
    H: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 15 }
    }
  },
  7: {
    L: {
      ecCodewordsPerBlock: 20,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 78 }
    },
    M: {
      ecCodewordsPerBlock: 18,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 31 }
    },
    Q: {
      ecCodewordsPerBlock: 18,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 14 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 15 }
    },
    H: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 13 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 14 }
    }
  },
  8: {
    L: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 97 }
    },
    M: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 38 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 39 }
    },
    Q: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 18 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 19 }
    },
    H: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 14 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 15 }
    }
  },
  9: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 116 }
    },
    M: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 36 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 37 }
    },
    Q: {
      ecCodewordsPerBlock: 20,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 16 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 17 }
    },
    H: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 12 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 13 }
    }
  },
  10: {
    L: {
      ecCodewordsPerBlock: 18,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 68 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 69 }
    },
    M: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 43 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 44 }
    },
    Q: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 6, dataCodewordsPerBlock: 19 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 20 }
    },
    H: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 6, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 16 }
    }
  },
  11: {
    L: {
      ecCodewordsPerBlock: 20,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 81 }
    },
    M: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 50 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 51 }
    },
    Q: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 22 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 23 }
    },
    H: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 12 },
      group2: { numBlocks: 8, dataCodewordsPerBlock: 13 }
    }
  },
  12: {
    L: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 92 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 93 }
    },
    M: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 6, dataCodewordsPerBlock: 36 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 37 }
    },
    Q: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 20 },
      group2: { numBlocks: 6, dataCodewordsPerBlock: 21 }
    },
    H: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 7, dataCodewordsPerBlock: 14 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 15 }
    }
  },
  13: {
    L: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 107 }
    },
    M: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 8, dataCodewordsPerBlock: 37 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 38 }
    },
    Q: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 8, dataCodewordsPerBlock: 20 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 21 }
    },
    H: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 12, dataCodewordsPerBlock: 11 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 12 }
    }
  },
  14: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 115 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 116 }
    },
    M: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 40 },
      group2: { numBlocks: 5, dataCodewordsPerBlock: 41 }
    },
    Q: {
      ecCodewordsPerBlock: 20,
      group1: { numBlocks: 11, dataCodewordsPerBlock: 16 },
      group2: { numBlocks: 5, dataCodewordsPerBlock: 17 }
    },
    H: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 11, dataCodewordsPerBlock: 12 },
      group2: { numBlocks: 5, dataCodewordsPerBlock: 13 }
    }
  },
  15: {
    L: {
      ecCodewordsPerBlock: 22,
      group1: { numBlocks: 5, dataCodewordsPerBlock: 87 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 88 }
    },
    M: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 5, dataCodewordsPerBlock: 41 },
      group2: { numBlocks: 5, dataCodewordsPerBlock: 42 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 5, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 7, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 11, dataCodewordsPerBlock: 12 },
      group2: { numBlocks: 7, dataCodewordsPerBlock: 13 }
    }
  },
  16: {
    L: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 5, dataCodewordsPerBlock: 98 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 99 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 7, dataCodewordsPerBlock: 45 },
      group2: { numBlocks: 3, dataCodewordsPerBlock: 46 }
    },
    Q: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 15, dataCodewordsPerBlock: 19 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 20 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 13, dataCodewordsPerBlock: 16 }
    }
  },
  17: {
    L: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 107 },
      group2: { numBlocks: 5, dataCodewordsPerBlock: 108 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 10, dataCodewordsPerBlock: 46 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 47 }
    },
    Q: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 22 },
      group2: { numBlocks: 15, dataCodewordsPerBlock: 23 }
    },
    H: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 14 },
      group2: { numBlocks: 17, dataCodewordsPerBlock: 15 }
    }
  },
  18: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 5, dataCodewordsPerBlock: 120 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 121 }
    },
    M: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 9, dataCodewordsPerBlock: 43 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 44 }
    },
    Q: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 17, dataCodewordsPerBlock: 22 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 23 }
    },
    H: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 14 },
      group2: { numBlocks: 19, dataCodewordsPerBlock: 15 }
    }
  },
  19: {
    L: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 113 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 114 }
    },
    M: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 44 },
      group2: { numBlocks: 11, dataCodewordsPerBlock: 45 }
    },
    Q: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 17, dataCodewordsPerBlock: 21 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 22 }
    },
    H: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 9, dataCodewordsPerBlock: 13 },
      group2: { numBlocks: 16, dataCodewordsPerBlock: 14 }
    }
  },
  20: {
    L: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 107 },
      group2: { numBlocks: 5, dataCodewordsPerBlock: 108 }
    },
    M: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 41 },
      group2: { numBlocks: 13, dataCodewordsPerBlock: 42 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 15, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 5, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 15, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 10, dataCodewordsPerBlock: 16 }
    }
  },
  21: {
    L: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 116 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 117 }
    },
    M: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 17, dataCodewordsPerBlock: 42 }
    },
    Q: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 17, dataCodewordsPerBlock: 22 },
      group2: { numBlocks: 6, dataCodewordsPerBlock: 23 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 19, dataCodewordsPerBlock: 16 },
      group2: { numBlocks: 6, dataCodewordsPerBlock: 17 }
    }
  },
  22: {
    L: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 111 },
      group2: { numBlocks: 7, dataCodewordsPerBlock: 112 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 17, dataCodewordsPerBlock: 46 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 7, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 16, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 24,
      group1: { numBlocks: 34, dataCodewordsPerBlock: 13 }
    }
  },
  23: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 121 },
      group2: { numBlocks: 5, dataCodewordsPerBlock: 122 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 47 },
      group2: { numBlocks: 14, dataCodewordsPerBlock: 48 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 11, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 14, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 16, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 14, dataCodewordsPerBlock: 16 }
    }
  },
  24: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 6, dataCodewordsPerBlock: 117 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 118 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 6, dataCodewordsPerBlock: 45 },
      group2: { numBlocks: 14, dataCodewordsPerBlock: 46 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 11, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 16, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 30, dataCodewordsPerBlock: 16 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 17 }
    }
  },
  25: {
    L: {
      ecCodewordsPerBlock: 26,
      group1: { numBlocks: 8, dataCodewordsPerBlock: 106 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 107 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 8, dataCodewordsPerBlock: 47 },
      group2: { numBlocks: 13, dataCodewordsPerBlock: 48 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 7, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 22, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 22, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 13, dataCodewordsPerBlock: 16 }
    }
  },
  26: {
    L: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 10, dataCodewordsPerBlock: 114 },
      group2: { numBlocks: 2, dataCodewordsPerBlock: 115 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 19, dataCodewordsPerBlock: 46 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 47 }
    },
    Q: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 28, dataCodewordsPerBlock: 22 },
      group2: { numBlocks: 6, dataCodewordsPerBlock: 23 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 33, dataCodewordsPerBlock: 16 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 17 }
    }
  },
  27: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 8, dataCodewordsPerBlock: 122 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 123 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 22, dataCodewordsPerBlock: 45 },
      group2: { numBlocks: 3, dataCodewordsPerBlock: 46 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 8, dataCodewordsPerBlock: 23 },
      group2: { numBlocks: 26, dataCodewordsPerBlock: 24 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 12, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 28, dataCodewordsPerBlock: 16 }
    }
  },
  28: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 117 },
      group2: { numBlocks: 10, dataCodewordsPerBlock: 118 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 3, dataCodewordsPerBlock: 45 },
      group2: { numBlocks: 23, dataCodewordsPerBlock: 46 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 31, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 11, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 31, dataCodewordsPerBlock: 16 }
    }
  },
  29: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 7, dataCodewordsPerBlock: 116 },
      group2: { numBlocks: 7, dataCodewordsPerBlock: 117 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 21, dataCodewordsPerBlock: 45 },
      group2: { numBlocks: 7, dataCodewordsPerBlock: 46 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 1, dataCodewordsPerBlock: 23 },
      group2: { numBlocks: 37, dataCodewordsPerBlock: 24 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 19, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 26, dataCodewordsPerBlock: 16 }
    }
  },
  30: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 5, dataCodewordsPerBlock: 115 },
      group2: { numBlocks: 10, dataCodewordsPerBlock: 116 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 19, dataCodewordsPerBlock: 47 },
      group2: { numBlocks: 10, dataCodewordsPerBlock: 48 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 15, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 25, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 23, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 25, dataCodewordsPerBlock: 16 }
    }
  },
  31: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 13, dataCodewordsPerBlock: 115 },
      group2: { numBlocks: 3, dataCodewordsPerBlock: 116 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 46 },
      group2: { numBlocks: 29, dataCodewordsPerBlock: 47 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 42, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 23, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 28, dataCodewordsPerBlock: 16 }
    }
  },
  32: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 17, dataCodewordsPerBlock: 115 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 10, dataCodewordsPerBlock: 46 },
      group2: { numBlocks: 23, dataCodewordsPerBlock: 47 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 10, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 35, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 19, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 35, dataCodewordsPerBlock: 16 }
    }
  },
  33: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 17, dataCodewordsPerBlock: 115 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 116 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 14, dataCodewordsPerBlock: 46 },
      group2: { numBlocks: 21, dataCodewordsPerBlock: 47 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 29, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 19, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 11, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 46, dataCodewordsPerBlock: 16 }
    }
  },
  34: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 13, dataCodewordsPerBlock: 115 },
      group2: { numBlocks: 6, dataCodewordsPerBlock: 116 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 14, dataCodewordsPerBlock: 46 },
      group2: { numBlocks: 23, dataCodewordsPerBlock: 47 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 44, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 7, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 59, dataCodewordsPerBlock: 16 },
      group2: { numBlocks: 1, dataCodewordsPerBlock: 17 }
    }
  },
  35: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 12, dataCodewordsPerBlock: 121 },
      group2: { numBlocks: 7, dataCodewordsPerBlock: 122 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 12, dataCodewordsPerBlock: 47 },
      group2: { numBlocks: 26, dataCodewordsPerBlock: 48 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 39, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 14, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 22, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 41, dataCodewordsPerBlock: 16 }
    }
  },
  36: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 6, dataCodewordsPerBlock: 121 },
      group2: { numBlocks: 14, dataCodewordsPerBlock: 122 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 6, dataCodewordsPerBlock: 47 },
      group2: { numBlocks: 34, dataCodewordsPerBlock: 48 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 46, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 10, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 2, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 64, dataCodewordsPerBlock: 16 }
    }
  },
  37: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 17, dataCodewordsPerBlock: 122 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 123 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 29, dataCodewordsPerBlock: 46 },
      group2: { numBlocks: 14, dataCodewordsPerBlock: 47 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 49, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 10, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 24, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 46, dataCodewordsPerBlock: 16 }
    }
  },
  38: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 4, dataCodewordsPerBlock: 122 },
      group2: { numBlocks: 18, dataCodewordsPerBlock: 123 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 13, dataCodewordsPerBlock: 46 },
      group2: { numBlocks: 32, dataCodewordsPerBlock: 47 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 48, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 14, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 42, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 32, dataCodewordsPerBlock: 16 }
    }
  },
  39: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 20, dataCodewordsPerBlock: 117 },
      group2: { numBlocks: 4, dataCodewordsPerBlock: 118 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 40, dataCodewordsPerBlock: 47 },
      group2: { numBlocks: 7, dataCodewordsPerBlock: 48 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 43, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 22, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 10, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 67, dataCodewordsPerBlock: 16 }
    }
  },
  40: {
    L: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 19, dataCodewordsPerBlock: 118 },
      group2: { numBlocks: 6, dataCodewordsPerBlock: 119 }
    },
    M: {
      ecCodewordsPerBlock: 28,
      group1: { numBlocks: 18, dataCodewordsPerBlock: 47 },
      group2: { numBlocks: 31, dataCodewordsPerBlock: 48 }
    },
    Q: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 34, dataCodewordsPerBlock: 24 },
      group2: { numBlocks: 34, dataCodewordsPerBlock: 25 }
    },
    H: {
      ecCodewordsPerBlock: 30,
      group1: { numBlocks: 20, dataCodewordsPerBlock: 15 },
      group2: { numBlocks: 61, dataCodewordsPerBlock: 16 }
    }
  }
};

// Deprecated: Use ERROR_CORRECTION_TABLE instead
const version4ErrorCorrection: ErrorCorrectionInfo = {
  L: { blocks: 1, ecCodewordsPerBlock: 20, dataCodewordsPerBlock: 80 },
  M: { blocks: 2, ecCodewordsPerBlock: 18, dataCodewordsPerBlock: 32 },
  Q: { blocks: 2, ecCodewordsPerBlock: 26, dataCodewordsPerBlock: 24 },
  H: { blocks: 4, ecCodewordsPerBlock: 16, dataCodewordsPerBlock: 9 }
};

function implementErrorCorrection(
  data: Uint8Array,
  level: ErrorCorrectionLevel,
  version: number
): Uint8Array {
  // Get error correction info for this version and level
  const ecInfo = ERROR_CORRECTION_TABLE[version]?.[level];
  if (!ecInfo) {
    throw new Error(
      `No error correction data for version ${version} level ${level}`
    );
  }

  const ecCodewordsPerBlock = ecInfo.ecCodewordsPerBlock;
  const group1 = ecInfo.group1;
  const group2 = ecInfo.group2;

  // Calculate total blocks and data codewords
  const totalBlocks = group1.numBlocks + (group2?.numBlocks || 0);
  const totalDataCodewords =
    group1.numBlocks * group1.dataCodewordsPerBlock +
    (group2 ? group2.numBlocks * group2.dataCodewordsPerBlock : 0);
  const totalECCCodewords = ecCodewordsPerBlock * totalBlocks;

  if (data.length !== totalDataCodewords) {
    throw new Error(
      `Data length must be ${totalDataCodewords} codewords for version ${version} level ${level}, got ${data.length}`
    );
  }

  // Split data into blocks
  const dataBlocks: Uint8Array[] = [];
  let offset = 0;

  // Add group 1 blocks
  for (let i = 0; i < group1.numBlocks; i++) {
    dataBlocks.push(data.slice(offset, offset + group1.dataCodewordsPerBlock));
    offset += group1.dataCodewordsPerBlock;
  }

  // Add group 2 blocks (if any)
  if (group2) {
    for (let i = 0; i < group2.numBlocks; i++) {
      dataBlocks.push(
        data.slice(offset, offset + group2.dataCodewordsPerBlock)
      );
      offset += group2.dataCodewordsPerBlock;
    }
  }

  // Generate error correction codewords for each block
  const ecBlocks: Uint8Array[] = [];
  for (let i = 0; i < totalBlocks; i++) {
    ecBlocks.push(reedSolomonEncode(dataBlocks[i]!, ecCodewordsPerBlock));
  }

  // Interleave data codewords
  const result = new Uint8Array(totalDataCodewords + totalECCCodewords);
  let pos = 0;

  // Interleave data codewords
  const maxDataBlockLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataBlockLen; i++) {
    for (let j = 0; j < totalBlocks; j++) {
      if (i < dataBlocks[j]!.length) {
        result[pos++] = dataBlocks[j]![i]!;
      }
    }
  }

  // Interleave ECC codewords
  for (let i = 0; i < ecCodewordsPerBlock; i++) {
    for (let j = 0; j < totalBlocks; j++) {
      result[pos++] = ecBlocks[j]![i]!;
    }
  }

  return result;
}

export { implementErrorCorrection, version4ErrorCorrection };
