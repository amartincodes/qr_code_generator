export enum EncodingMode {
  NUMERIC = "NUMERIC",
  ALPHANUMERIC = "ALPHANUMERIC",
  BYTE = "BYTE",
  KANJI = "KANJI"
}

export enum EncodingModeIndicator {
  NUMERIC = 0b0001,
  ALPHANUMERIC = 0b0010,
  BYTE = 0b0100,
  KANJI = 0b1000
}

export enum CharacterCountIndicator {
  NUMERIC = 10, // for version 1-9
  ALPHANUMERIC = 9, // for version 1-9
  BYTE = 8, // for version 1-9
  KANJI = 8 // for version 1-9
}

export enum ErrorCorrectionLevel {
  L = "L", // 7%
  M = "M", // 15%
  Q = "Q", // 25%
  H = "H" // 30%
}

export enum NumberOfDataCodewordsLvl4 {
  L = 80,
  M = 64,
  Q = 48,
  H = 36
}

export enum QRCodeSizeByVersion {
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
