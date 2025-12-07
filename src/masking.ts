function selectBestMaskPattern(
  matrix: number[][],
  isFunctionModule: boolean[][]
): number {
  let bestMask = 0;
  let lowestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    // Create a deep copy to avoid mutating the original
    const matrixCopy = matrix.map((row) => row.slice());
    const maskedMatrix = applyDataMask(matrixCopy, mask, isFunctionModule);
    const penalty = calculateMaskPenalty(maskedMatrix);
    if (penalty < lowestPenalty) {
      lowestPenalty = penalty;
      bestMask = mask;
    }
  }
  return bestMask;
}

// Penalty calculation based on QR spec (ISO/IEC 18004)
function calculateMaskPenalty(matrix: number[][]): number {
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

  // Rule 3: Finder-like patterns in rows/columns (with 4 light modules before/after)
  const pattern = [1, 0, 1, 1, 1, 0, 1];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j <= size - 11; j++) {
      // Row
      if (
        pattern.every((v, k) => matrix[i]![j + k] === v) &&
        matrix[i]![j + 7] === 0 &&
        matrix[i]![j + 8] === 0 &&
        matrix[i]![j + 9] === 0 &&
        matrix[i]![j + 10] === 0
      ) {
        penalty += 40;
      }
      if (
        pattern.every((v, k) => matrix[i]![j + 4 + k] === v) &&
        matrix[i]![j] === 0 &&
        matrix[i]![j + 1] === 0 &&
        matrix[i]![j + 2] === 0 &&
        matrix[i]![j + 3] === 0
      ) {
        penalty += 40;
      }
      // Column
      if (
        pattern.every((v, k) => matrix[j + k]![i] === v) &&
        matrix[j + 7]![i] === 0 &&
        matrix[j + 8]![i] === 0 &&
        matrix[j + 9]![i] === 0 &&
        matrix[j + 10]![i] === 0
      ) {
        penalty += 40;
      }
      if (
        pattern.every((v, k) => matrix[j + 4 + k]![i] === v) &&
        matrix[j]![i] === 0 &&
        matrix[j + 1]![i] === 0 &&
        matrix[j + 2]![i] === 0 &&
        matrix[j + 3]![i] === 0
      ) {
        penalty += 40;
      }
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

function applyDataMask(
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

export { selectBestMaskPattern, calculateMaskPenalty, applyDataMask };
