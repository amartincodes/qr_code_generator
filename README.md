# WORK IN PROGRESS!

# QR Code Generator

- This is a simple QR Code Generator application that allows users to create QR codes for URLs, text, or other data.

1. **Data Analysis** - Determine encoding mode (numeric, alphanumeric, byte, kanji)
2. **Data Encoding** - Convert input to bit stream with mode indicator and character count
3. **Error Correction** - Add Reed-Solomon error correction codewords
4. **Structure Final Message** - Interleave data and EC codewords
5. **Matrix Construction**:
   - Create initial matrix with finder patterns (3 corners)
   - Add separators around finder patterns
   - Add alignment patterns (version 2+)
   - Add timing patterns (row 6, column 6)
   - Reserve format/version info areas
6. **Data Placement** - Place data bits in zigzag pattern
7. **Masking** - Apply mask patterns, evaluate, select best
8. **Format/Version Info** - Add format info (all versions) and version info (version 7+)
