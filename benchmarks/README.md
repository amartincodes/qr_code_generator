# Performance Benchmarks

This directory contains performance benchmarks and tests for the QR Code Generator.

## Running Benchmarks

### Standalone Benchmark Suite

Run the comprehensive benchmark suite that tests various scenarios:

```bash
npm run benchmark
```

This will output detailed performance metrics including:
- Average execution time
- Min/max execution times
- Operations per second
- Comparative analysis across different configurations

### Performance Tests (Jest)

Run performance regression tests that ensure the code meets minimum performance standards:

```bash
npm run test:perf
```

These tests will fail if performance degrades below acceptable thresholds.

## Benchmark Categories

### 1. QR Code Version Benchmarks
Tests performance across different QR code versions (1-40):
- Version 1 (smallest)
- Version 10 (medium)
- Version 20 (large)
- Version 40 (maximum)

### 2. Encoding Mode Benchmarks
Compares performance of different encoding modes:
- Numeric encoding
- Alphanumeric encoding
- Byte encoding
- Kanji encoding

### 3. Error Correction Level Benchmarks
Tests all four error correction levels:
- L (Low - 7% recovery)
- M (Medium - 15% recovery)
- Q (Quartile - 25% recovery)
- H (High - 30% recovery)

### 4. Batch Generation Benchmarks
Measures throughput when generating multiple QR codes:
- 10 QR codes
- 50 QR codes
- 100 QR codes

### 5. Large Data Benchmarks
Tests performance with large amounts of data:
- 100 characters
- 500 characters
- 1000 characters

## Performance Targets

The performance tests enforce these minimum standards:

| QR Version | Max Time (ms) |
|------------|---------------|
| Version 1  | 100           |
| Version 10 | 150           |
| Version 20 | 250           |
| Version 40 | 500           |

**Throughput Targets:**
- Version 1: ≥50 codes/second
- Version 10: ≥20 codes/second

## Adding New Benchmarks

To add a new benchmark to the standalone suite:

1. Edit `benchmarks/performance.benchmark.ts`
2. Add your benchmark using the `runBenchmark` method:

```typescript
const result = await benchmark.runBenchmark(
  "Your benchmark name",
  () => {
    // Code to benchmark
    generator.generate("data", options);
  },
  50 // number of iterations
);
benchmark.printResult(result);
```

To add a new performance test:

1. Edit `tests/performance.test.ts`
2. Add a new test case with timing assertions:

```typescript
it("should meet your performance requirement", () => {
  const start = performance.now();
  // Code to test
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(YOUR_THRESHOLD);
});
```

## Interpreting Results

- **Average Time**: Most reliable metric for comparing performance
- **Ops/Second**: Good for understanding throughput
- **Min/Max Time**: Helps identify variability (smaller range is better)
- **Total Time**: Useful for understanding overall impact of changes

## CI/CD Integration

Performance tests automatically run in CI/CD via GitHub Actions. If tests fail, it indicates a performance regression that needs to be addressed.
