# QR Code Generator

A high-performance, spec-compliant QR Code generator for Node.js with both CLI and library interfaces. Supports all QR Code versions (1-40), encoding modes, and error correction levels.

[![Run Tests](https://github.com/amartincodes/qr_code_generator/actions/workflows/test.yml/badge.svg)](https://github.com/amartincodes/qr_code_generator/actions/workflows/test.yml)
[![Run Benchmarks](https://github.com/amartincodes/qr_code_generator/actions/workflows/benchmark.yaml/badge.svg)](https://github.com/amartincodes/qr_code_generator/actions/workflows/benchmark.yaml)
[![npm version](https://badge.fury.io/js/@amartincodes%2Fqr-code-gen.svg)](https://www.npmjs.com/package/@amartincodes/qr-code-gen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Full QR Code Specification Support**
  - All 40 QR Code versions (21×21 to 177×177 modules)
  - Multiple encoding modes: Numeric, Alphanumeric, Byte, and Kanji
  - All error correction levels: L (7%), M (15%), Q (25%), H (30%)

- **High Performance**
  - Optimized for speed with comprehensive benchmarking
  - Efficient Reed-Solomon error correction implementation
  - Smart encoding mode detection
  - See [Performance Benchmarks](./PERFORMANCE.md) for detailed metrics

- **Developer Friendly**
  - Clean, well-documented API
  - TypeScript support with full type definitions
  - Both CLI and library interfaces
  - Extensive test coverage

- **PNG Output**
  - Generates standard PNG images
  - Configurable module size and quiet zone
  - Ready for printing or digital use

## Installation

### As a CLI Tool

```bash
npm install -g @amartincodes/qr-code-gen
```

### As a Library

```bash
npm install @amartincodes/qr-code-gen
```

## Quick Start

### CLI Usage

```bash
# Generate a QR code from text
qr-code-gen "Hello, World!" -o qrcode.png

# Generate with specific options
qr-code-gen "https://example.com" \
  --output website.png \
  --version 5 \
  --error-correction M \
  --encoding BYTE

# Use numeric encoding for numbers (most efficient)
qr-code-gen "1234567890" --encoding NUMERIC
```

**CLI Options:**

- `-o, --output <file>` - Output PNG file path (required)
- `-v, --version <number>` - QR Code version 1-40 (default: auto-detect)
- `-e, --error-correction <level>` - Error correction: L, M, Q, H (default: L)
- `-m, --encoding <mode>` - Encoding mode: NUMERIC, ALPHANUMERIC, BYTE, KANJI (default: auto-detect)

### Library Usage

```typescript
import {
  QRCodeGenerator,
  EncodingMode,
  ErrorCorrectionLevel
} from "@amartincodes/qr-code-gen";

const generator = new QRCodeGenerator();

// Simple usage - auto-detect encoding and version
const matrix = generator.generate("Hello, World!");

// Advanced usage with options
const matrix = generator.generate("https://example.com", {
  version: 5,
  encodingMode: EncodingMode.BYTE,
  errorCorrectionLevel: ErrorCorrectionLevel.M
});

// The matrix is a 2D array of 0s and 1s
// 0 = white module, 1 = black module
console.log(matrix); // [[0,0,0,...], [0,1,0,...], ...]
```

## API Reference

### `QRCodeGenerator`

The main class for generating QR codes.

#### `generate(data: string, options?: QRCodeOptions): number[][]`

Generates a QR code matrix from the input data.

**Parameters:**

- `data` (string): The data to encode in the QR code
- `options` (optional): Configuration options
  - `version` (1-40): QR Code version, determines size and capacity
  - `encodingMode`: How to encode the data
    - `EncodingMode.NUMERIC` - Digits 0-9 only (most efficient for numbers)
    - `EncodingMode.ALPHANUMERIC` - 0-9, A-Z, space, and select symbols
    - `EncodingMode.BYTE` - Any data (UTF-8/ISO-8859-1)
    - `EncodingMode.KANJI` - Japanese Kanji characters
  - `errorCorrectionLevel`: Amount of error correction
    - `ErrorCorrectionLevel.L` - ~7% correction (smallest QR code)
    - `ErrorCorrectionLevel.M` - ~15% correction (default)
    - `ErrorCorrectionLevel.Q` - ~25% correction
    - `ErrorCorrectionLevel.H` - ~30% correction (largest QR code, most resilient)

**Returns:** A 2D array representing the QR code matrix (including quiet zone)

**Example:**

```typescript
import {
  QRCodeGenerator,
  EncodingMode,
  ErrorCorrectionLevel
} from "@amartincodes/qr-code-gen";

const generator = new QRCodeGenerator();

// Auto-detect best encoding and minimal version
const qr1 = generator.generate("12345");

// Specify all options
const qr2 = generator.generate("HELLO WORLD", {
  version: 3,
  encodingMode: EncodingMode.ALPHANUMERIC,
  errorCorrectionLevel: ErrorCorrectionLevel.H
});

// Maximum capacity example (Version 40)
const qr3 = generator.generate("A".repeat(1000), {
  version: 40,
  encodingMode: EncodingMode.BYTE,
  errorCorrectionLevel: ErrorCorrectionLevel.L
});
```

## How It Works

The QR code generation follows the official ISO/IEC 18004 specification:

1. **Data Analysis** - Automatically determines the most efficient encoding mode (numeric, alphanumeric, byte, or kanji) based on input data
2. **Data Encoding** - Converts input to a binary bit stream with mode indicator, character count, and data
3. **Error Correction** - Generates Reed-Solomon error correction codewords using polynomial division
4. **Structure Final Message** - Interleaves data and error correction codewords into blocks
5. **Matrix Construction**:
   - Creates base matrix with finder patterns (three corners)
   - Adds separators around finder patterns
   - Places alignment patterns (version 2+)
   - Adds timing patterns (row 6 and column 6)
   - Reserves areas for format and version information
6. **Data Placement** - Places data bits in a zigzag pattern starting from bottom-right
7. **Masking** - Applies all 8 mask patterns, evaluates each using penalty rules, selects the best
8. **Format Information** - Adds format information (error correction level + mask pattern) with error correction
9. **Version Information** - Adds version information for versions 7+ with error correction
10. **Quiet Zone** - Adds 4-module quiet zone (white border) around the QR code

## QR Code Capacity

| Version | Size    | Numeric | Alphanumeric | Byte  | Kanji |
| ------- | ------- | ------- | ------------ | ----- | ----- |
| 1       | 21×21   | 41      | 25           | 17    | 10    |
| 10      | 57×57   | 652     | 395          | 271   | 167   |
| 20      | 97×97   | 1,901   | 1,154        | 792   | 488   |
| 30      | 137×137 | 3,706   | 2,249        | 1,542 | 952   |
| 40      | 177×177 | 7,089   | 4,296        | 2,953 | 1,817 |

_Capacities shown are for error correction level L (7%). Higher error correction levels reduce capacity._

## Performance

This library is optimized for performance. See detailed benchmarks and performance standards in:

- [Performance Documentation](./PERFORMANCE.md) - Standards, optimization tips, and CI integration
- [Benchmark Results](./benchmarks/RESULTS.md) - Historical benchmark data
- [Benchmark Suite](./benchmarks/README.md) - Running benchmarks locally

### Quick Stats (Version 10, Error Correction L)

- **Generation Speed**: ~70 ops/second
- **Average Time**: ~14ms per QR code
- **Throughput**: 50+ codes/second for small versions

Run benchmarks yourself:

```bash
npm run benchmark        # View results only
npm run benchmark:save   # Save results to history
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/amartincodes/qr_code_gen.git
cd qr_code_gen

# Install dependencies
npm install

# Build the project
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run only unit tests (exclude performance tests)
npm run test

# Run performance tests
npm run test:perf

# Run all tests including performance
npm run test:all
```

### Project Structure

```
qr_code_gen/
├── src/                    # Source code
│   ├── qrCodeGenerator.ts  # Main QR code generator
│   ├── encoding.ts         # Data encoding logic
│   ├── errorCorrection.ts  # Reed-Solomon error correction
│   ├── masking.ts          # Mask pattern application
│   ├── patterns.ts         # Finder, alignment, timing patterns
│   └── types.ts            # TypeScript type definitions
├── tests/                  # Test files
│   ├── *.test.ts          # Unit tests
│   └── performance.test.ts # Performance regression tests
├── benchmarks/             # Performance benchmarks
│   ├── performance.benchmark.ts
│   ├── RESULTS.md          # Historical benchmark data
│   └── README.md           # Benchmark documentation
├── .github/workflows/      # CI/CD workflows
│   ├── test.yml           # Run tests on push
│   └── benchmark.yaml      # Manual benchmark workflow
└── PERFORMANCE.md          # Performance documentation
```

## Publishing to npm

This package is configured for publishing to npm with full TypeScript support.

### Prerequisites

1. Make sure you're logged into npm:
   ```bash
   npm login
   ```

2. Verify your npm account is set correctly:
   ```bash
   npm whoami
   ```

### Publishing Process

The package uses automated checks before publishing:

1. **Update version** in `package.json` (follow [semantic versioning](https://semver.org/)):
   ```bash
   # For a patch release (bug fixes)
   npm version patch

   # For a minor release (new features, backward compatible)
   npm version minor

   # For a major release (breaking changes)
   npm version major
   ```

2. **Publish to npm**:
   ```bash
   npm publish --access public
   ```

   The `prepublishOnly` script will automatically:
   - Clean the dist folder
   - Build the project (JavaScript + TypeScript definitions)
   - Run all tests
   - Fail the publish if tests don't pass

### What Gets Published

The published package includes:
- `dist/` - Compiled JavaScript files
- `dist/*.d.ts` - TypeScript type definitions
- `README.md` - Package documentation
- `LICENSE` - MIT license file
- `package.json` - Package metadata

Files **excluded** from the package (via `.npmignore`):
- Source TypeScript files (`src/`)
- Tests (`tests/`)
- Benchmarks (`benchmarks/`)
- Configuration files
- GitHub workflows

### Verifying the Package

Before publishing, you can check what will be included:

```bash
npm pack --dry-run
```

This shows the files that will be included in the published package without actually creating a tarball.

To create a local tarball for testing:

```bash
npm pack
```

Then install it locally in another project:

```bash
npm install /path/to/amartincodes-qr-code-gen-1.0.0.tgz
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to:

- Update tests as appropriate
- Run `npm test` to ensure all tests pass
- Run `npm run benchmark` to check performance impact
- Follow the existing code style

## Resources

- [QR Code Specification (ISO/IEC 18004)](https://www.qrcode.com/en/about/standards.html)
- [QR Code Tutorial](https://www.thonky.com/qr-code-tutorial/)
- [Reed-Solomon Error Correction](https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**amartincodes**

- GitHub: [@amartincodes](https://github.com/amartincodes)

## Acknowledgments

- QR Code specification by Denso Wave
- Inspired by various QR code implementations and the ISO/IEC 18004 standard
