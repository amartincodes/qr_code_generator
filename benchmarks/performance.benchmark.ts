import { QRCodeGenerator } from "../src/qrCodeGenerator";
import { EncodingMode, ErrorCorrectionLevel } from "../src/types";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  opsPerSecond: number;
  minTime: number;
  maxTime: number;
}

interface SystemInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  cpus: string;
  totalMemory: string;
  timestamp: string;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  getSystemInfo(): SystemInfo {
    const cpus = os.cpus();
    return {
      nodeVersion: process.version,
      platform: `${os.platform()} ${os.release()}`,
      arch: os.arch(),
      cpus: `${cpus.length}x ${cpus[0]?.model || "Unknown"}`,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      timestamp: new Date().toISOString()
    };
  }

  formatResultsAsMarkdown(systemInfo: SystemInfo): string {
    let markdown = `### Benchmark Run - ${new Date(systemInfo.timestamp).toLocaleString()}\n\n`;
    markdown += `**System Information:**\n`;
    markdown += `- Node.js: ${systemInfo.nodeVersion}\n`;
    markdown += `- Platform: ${systemInfo.platform}\n`;
    markdown += `- Architecture: ${systemInfo.arch}\n`;
    markdown += `- CPU: ${systemInfo.cpus}\n`;
    markdown += `- Memory: ${systemInfo.totalMemory}\n\n`;

    markdown += `**Results:**\n\n`;
    markdown += `| Benchmark | Avg Time (ms) | Min (ms) | Max (ms) | Ops/sec | Iterations |\n`;
    markdown += `|-----------|---------------|----------|----------|---------|------------|\n`;

    this.results.forEach((result) => {
      markdown += `| ${result.name} | ${result.avgTime.toFixed(2)} | ${result.minTime.toFixed(2)} | ${result.maxTime.toFixed(2)} | ${result.opsPerSecond.toFixed(2)} | ${result.iterations} |\n`;
    });

    markdown += `\n---\n\n`;
    return markdown;
  }

  private countHistoricalResults(historicalSection: string): number {
    // Count the number of "### Benchmark Run -" entries
    const matches = historicalSection.match(/### Benchmark Run -/g);
    return matches ? matches.length : 0;
  }

  private async archiveOldResults(
    filePath: string,
    oldestResults: string
  ): Promise<void> {
    const archivePath = path.join(
      path.dirname(filePath),
      "RESULTS.archive.json"
    );

    let archive: any[] = [];
    if (fs.existsSync(archivePath)) {
      const archiveContent = fs.readFileSync(archivePath, "utf-8");
      archive = JSON.parse(archiveContent);
    }

    // Parse the oldest results and add to archive
    const timestamp = new Date().toISOString();
    archive.push({
      archivedAt: timestamp,
      content: oldestResults.trim()
    });

    fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2), "utf-8");
    console.log(`✓ Archived old results to ${archivePath}`);
  }

  async saveResults(filePath: string): Promise<void> {
    const systemInfo = this.getSystemInfo();
    const markdown = this.formatResultsAsMarkdown(systemInfo);

    try {
      // Read existing content
      let existingContent = "";
      if (fs.existsSync(filePath)) {
        existingContent = fs.readFileSync(filePath, "utf-8");
      }

      // Find where to insert new results (after "## Latest Results" section)
      const latestResultsMarker = "## Latest Results";
      const historicalResultsMarker = "## Historical Results";

      let newContent: string;
      if (existingContent.includes(latestResultsMarker)) {
        // Split at the historical results marker
        const parts = existingContent.split(historicalResultsMarker);
        const beforeHistorical = parts[0] || "";
        const historicalSection = parts[1] || "";

        // Extract the old "Latest Results" section content
        const latestSectionStart =
          beforeHistorical.indexOf(latestResultsMarker);
        const header = beforeHistorical.substring(
          0,
          latestSectionStart + latestResultsMarker.length
        );
        const oldLatestResults = beforeHistorical
          .substring(latestSectionStart + latestResultsMarker.length)
          .trim();

        // Prepend old latest results to historical section (insert after the intro text)
        let updatedHistoricalSection = historicalSection;
        if (oldLatestResults && oldLatestResults.length > 0) {
          // Find the end of the intro text in historical section (after "---")
          const historicalIntroEnd = historicalSection.indexOf("---");
          if (historicalIntroEnd !== -1) {
            const beforeIntro = historicalSection.substring(
              0,
              historicalIntroEnd + 3
            );
            const afterIntro = historicalSection.substring(
              historicalIntroEnd + 3
            );
            updatedHistoricalSection =
              beforeIntro + "\n\n" + oldLatestResults + "\n" + afterIntro;
          } else {
            // If no intro found, just prepend to historical section
            updatedHistoricalSection =
              "\n\n" + oldLatestResults + "\n" + historicalSection;
          }
        }

        // Count historical results and archive if too many
        const historicalCount = this.countHistoricalResults(
          updatedHistoricalSection
        );
        const MAX_HISTORICAL_RESULTS = 20;

        if (historicalCount > MAX_HISTORICAL_RESULTS) {
          // Extract the oldest results (everything after the MAX_HISTORICAL_RESULTS-th entry)
          const benchmarkRunPattern = /### Benchmark Run -/g;
          let matches = 0;
          let splitIndex = -1;
          let match;

          while (
            (match = benchmarkRunPattern.exec(updatedHistoricalSection)) !==
            null
          ) {
            matches++;
            if (matches === MAX_HISTORICAL_RESULTS) {
              splitIndex = match.index;
              break;
            }
          }

          if (splitIndex > 0) {
            const recentHistorical = updatedHistoricalSection.substring(
              0,
              splitIndex
            );
            const oldestResults =
              updatedHistoricalSection.substring(splitIndex);

            // Archive the oldest results
            await this.archiveOldResults(filePath, oldestResults);

            updatedHistoricalSection = recentHistorical;
            console.log(
              `✓ Moved ${historicalCount - MAX_HISTORICAL_RESULTS} oldest results to archive`
            );
          }
        }

        newContent =
          header +
          "\n\n" +
          markdown +
          "\n" +
          historicalResultsMarker +
          updatedHistoricalSection;
      } else {
        // If file doesn't have the expected structure, create it
        newContent =
          existingContent +
          "\n" +
          latestResultsMarker +
          "\n\n" +
          markdown +
          "\n" +
          historicalResultsMarker +
          "\n\nResults are appended below with newest first.\n\n---\n\n";
      }

      fs.writeFileSync(filePath, newContent, "utf-8");
      console.log(`\n✓ Results saved to ${filePath}`);
    } catch (error) {
      console.error(`Error saving results to ${filePath}:`, error);
      throw error;
    }
  }

  async runBenchmark(
    name: string,
    fn: () => void,
    iterations: number = 100
  ): Promise<BenchmarkResult> {
    const times: number[] = [];

    // Warm-up
    for (let i = 0; i < 10; i++) {
      fn();
    }

    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = 1000 / avgTime;

    const result: BenchmarkResult = {
      name,
      iterations,
      totalTime,
      avgTime,
      opsPerSecond,
      minTime,
      maxTime
    };

    this.results.push(result);
    return result;
  }

  printResult(result: BenchmarkResult): void {
    console.log(`\n${result.name}`);
    console.log(`  Iterations: ${result.iterations}`);
    console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`  Average time: ${result.avgTime.toFixed(2)}ms`);
    console.log(`  Min time: ${result.minTime.toFixed(2)}ms`);
    console.log(`  Max time: ${result.maxTime.toFixed(2)}ms`);
    console.log(`  Ops/second: ${result.opsPerSecond.toFixed(2)}`);
  }

  printSummary(): void {
    console.log("\n" + "=".repeat(60));
    console.log("BENCHMARK SUMMARY");
    console.log("=".repeat(60));

    const sortedResults = [...this.results].sort(
      (a, b) => a.avgTime - b.avgTime
    );

    console.log("\nRanked by Average Time (fastest first):");
    console.log("-".repeat(60));
    sortedResults.forEach((result, index) => {
      console.log(
        `${index + 1}. ${result.name.padEnd(40)} ${result.avgTime.toFixed(2)}ms`
      );
    });

    console.log("\n" + "=".repeat(60));
  }
}

async function runAllBenchmarks(saveResults: boolean = false) {
  const benchmark = new PerformanceBenchmark();
  const generator = new QRCodeGenerator();

  console.log("Starting QR Code Performance Benchmarks...\n");
  console.log("=".repeat(60));

  // Benchmark 1: Different QR Code Versions
  console.log("\n1. QR CODE VERSION BENCHMARKS");
  console.log("=".repeat(60));

  const versionTests = [
    { version: 1, data: "123" },
    { version: 5, data: "1234567890" },
    { version: 10, data: "HELLO WORLD 123" },
    { version: 20, data: "This is a test message for version 20" },
    { version: 30, data: "A".repeat(50) },
    { version: 40, data: "1".repeat(100) }
  ];

  for (const test of versionTests) {
    const result = await benchmark.runBenchmark(
      `Version ${test.version} - ${test.data.length} chars`,
      () => {
        generator.generate(test.data, {
          version: test.version,
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.L
        });
      },
      50
    );
    benchmark.printResult(result);
  }

  // Benchmark 2: Different Encoding Modes
  console.log("\n2. ENCODING MODE BENCHMARKS (Version 10)");
  console.log("=".repeat(60));

  const encodingTests = [
    { mode: EncodingMode.NUMERIC, data: "1234567890123456" },
    { mode: EncodingMode.ALPHANUMERIC, data: "HELLO WORLD 123" },
    { mode: EncodingMode.BYTE, data: "Hello, World! 123" }
  ];

  for (const test of encodingTests) {
    const result = await benchmark.runBenchmark(
      `${test.mode} encoding`,
      () => {
        generator.generate(test.data, {
          version: 10,
          encodingMode: test.mode,
          errorCorrectionLevel: ErrorCorrectionLevel.M
        });
      },
      50
    );
    benchmark.printResult(result);
  }

  // Benchmark 3: Different Error Correction Levels
  console.log("\n3. ERROR CORRECTION LEVEL BENCHMARKS (Version 10)");
  console.log("=".repeat(60));

  const ecLevels = [
    ErrorCorrectionLevel.L,
    ErrorCorrectionLevel.M,
    ErrorCorrectionLevel.Q,
    ErrorCorrectionLevel.H
  ];

  for (const level of ecLevels) {
    const result = await benchmark.runBenchmark(
      `EC Level ${level}`,
      () => {
        generator.generate("Test data 123", {
          version: 10,
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: level
        });
      },
      50
    );
    benchmark.printResult(result);
  }

  // Benchmark 4: Batch Generation
  console.log("\n4. BATCH GENERATION BENCHMARKS");
  console.log("=".repeat(60));

  const batchSizes = [10, 50, 100];

  for (const size of batchSizes) {
    const result = await benchmark.runBenchmark(
      `Generate ${size} QR codes (Version 4)`,
      () => {
        for (let i = 0; i < size; i++) {
          generator.generate(`Data${i}`, {
            version: 4,
            encodingMode: EncodingMode.BYTE,
            errorCorrectionLevel: ErrorCorrectionLevel.M
          });
        }
      },
      5
    );
    benchmark.printResult(result);
  }

  // Benchmark 5: Large Data
  console.log("\n5. LARGE DATA BENCHMARKS");
  console.log("=".repeat(60));

  const largeDataTests = [
    { size: 100, version: 20 },
    { size: 500, version: 30 },
    { size: 1000, version: 40 }
  ];

  for (const test of largeDataTests) {
    const data = "A".repeat(test.size);
    const result = await benchmark.runBenchmark(
      `${test.size} chars - Version ${test.version}`,
      () => {
        generator.generate(data, {
          version: test.version,
          encodingMode: EncodingMode.BYTE,
          errorCorrectionLevel: ErrorCorrectionLevel.L
        });
      },
      20
    );
    benchmark.printResult(result);
  }

  benchmark.printSummary();

  // Save results if requested
  if (saveResults) {
    const resultsPath = path.join(__dirname, "RESULTS.md");
    await benchmark.saveResults(resultsPath);
  }
}

// Run benchmarks
const shouldSaveResults = process.argv.includes("--save");
runAllBenchmarks(shouldSaveResults).catch(console.error);
