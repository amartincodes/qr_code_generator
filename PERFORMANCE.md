# Performance Benchmarks & Tests

This document describes the performance benchmarking infrastructure for the QR Code Generator.

## Overview

The project includes two types of performance evaluation:

1. **Performance Tests** (`tests/performance.test.ts`) - Jest-based tests that enforce performance standards and fail if thresholds are exceeded
2. **Benchmark Suite** (`benchmarks/performance.benchmark.ts`) - Comprehensive standalone benchmarks for detailed performance analysis

## Quick Start

```bash
# Run performance regression tests
npm run test:perf

# Run comprehensive benchmarks
npm run benchmark

# Run all tests (including performance)
npm run test:all
```

## Performance Standards

### Generation Time Limits

| QR Version | Max Time | Use Case |
|------------|----------|----------|
| Version 1  | 100ms    | Small data (up to 25 chars) |
| Version 10 | 150ms    | Medium data (up to 174 chars) |
| Version 20 | 250ms    | Large data (up to 858 chars) |
| Version 40 | 500ms    | Maximum data (up to 2953 chars) |

### Throughput Requirements

- **Version 1**: ≥ 50 codes/second
- **Version 10**: ≥ 20 codes/second
- **Batch (10 codes, V4)**: < 500ms
- **Batch (50 codes, V1)**: < 2000ms

## Benchmark Categories

### 1. Version Performance
Tests across all 40 QR code versions with focus on:
- Small versions (1, 5)
- Medium versions (10, 20)
- Large versions (30, 40)

### 2. Encoding Mode Performance
Compares efficiency of different encoding modes:
- **Numeric**: Optimized for digits (0-9)
- **Alphanumeric**: For uppercase letters and select symbols
- **Byte**: General purpose (UTF-8/ISO-8859-1)
- **Kanji**: Japanese characters

### 3. Error Correction Impact
Measures the performance impact of different EC levels:
- **L (Low)**: 7% error recovery - Fastest
- **M (Medium)**: 15% error recovery
- **Q (Quartile)**: 25% error recovery
- **H (High)**: 30% error recovery - Most data, slower

### 4. Batch Generation
Evaluates throughput when generating multiple QR codes:
- 10 codes
- 50 codes
- 100 codes

### 5. Large Data Handling
Tests performance with substantial data payloads:
- 100 characters
- 500 characters
- 1000 characters

## Interpreting Results

### Benchmark Output Metrics

```
Version 1 - 3 chars
  Iterations: 50
  Total time: 2500.00ms
  Average time: 50.00ms      ← Primary metric for comparison
  Min time: 45.00ms          ← Best case performance
  Max time: 65.00ms          ← Worst case performance
  Ops/second: 20.00          ← Throughput metric
```

**Key Metrics:**
- **Average Time**: Most reliable for performance comparisons
- **Ops/Second**: Useful for capacity planning
- **Min/Max Range**: Indicates consistency (smaller range = more consistent)

### Performance Test Results

Performance tests pass/fail based on hard thresholds:

```
✓ should generate Version 1 QR code in under 100ms (45ms)
✓ should generate Version 10 QR code in under 150ms (82ms)
✗ should generate Version 20 QR code in under 250ms (312ms)  ← FAILURE
```

## Continuous Integration

Performance tests run automatically in CI/CD:

- **On every push to master**
- **On all pull requests**
- Tests fail if performance degrades below thresholds
- Helps catch performance regressions early

## Adding Custom Benchmarks

### Adding a Performance Test

Edit `tests/performance.test.ts`:

```typescript
it("should meet custom performance requirement", () => {
  const start = performance.now();

  // Your code to test
  generator.generate("test data", options);

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(YOUR_THRESHOLD_MS);
});
```

### Adding a Benchmark

Edit `benchmarks/performance.benchmark.ts`:

```typescript
const result = await benchmark.runBenchmark(
  "Custom benchmark name",
  () => {
    // Code to benchmark
    generator.generate("data", options);
  },
  100 // iterations
);
benchmark.printResult(result);
```

## Performance Optimization Tips

Based on the benchmarks, here are optimization guidelines:

1. **Choose the right version**: Use the smallest version that fits your data
2. **Use appropriate encoding**: Numeric > Alphanumeric > Byte for compatible data
3. **Lower EC when possible**: Use L level unless you need error recovery
4. **Batch efficiently**: Reuse QRCodeGenerator instances instead of creating new ones
5. **Monitor V10+ performance**: Versions 10-26 have different character count bit lengths

## Troubleshooting

### Tests Failing in CI

1. Check if performance degraded in recent commits
2. Run `npm run benchmark` locally to identify slow operations
3. Profile specific test cases that are failing
4. Consider if threshold adjustments are justified

### Inconsistent Results

Performance can vary based on:
- System load
- Node.js version
- Available memory
- CPU architecture

Run benchmarks multiple times and look at average values for reliable comparisons.

## Further Reading

- [Benchmarks README](./benchmarks/README.md) - Detailed benchmark documentation
- [QR Code Specification](https://www.qrcode.com/en/about/standards.html) - Official QR code standards
