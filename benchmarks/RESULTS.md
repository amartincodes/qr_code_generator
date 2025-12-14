# Benchmark Results History

This file tracks performance benchmark results over time to monitor performance trends and catch regressions.

## Latest Results

### Benchmark Run - 12/14/2025, 4:07:00 PM

**System Information:**
- Node.js: v20.19.6
- Platform: linux 6.11.0-1018-azure
- Architecture: x64
- CPU: 4x AMD EPYC 7763 64-Core Processor
- Memory: 15.62 GB

**Results:**

| Benchmark | Avg Time (ms) | Min (ms) | Max (ms) | Ops/sec | Iterations |
|-----------|---------------|----------|----------|---------|------------|
| Version 1 - 3 chars | 3.09 | 2.40 | 5.17 | 324.13 | 50 |
| Version 5 - 10 chars | 7.44 | 6.22 | 11.87 | 134.35 | 50 |
| Version 10 - 15 chars | 19.03 | 15.93 | 62.09 | 52.56 | 50 |
| Version 20 - 37 chars | 47.18 | 44.38 | 66.04 | 21.20 | 50 |
| Version 30 - 50 chars | 100.92 | 93.59 | 117.62 | 9.91 | 50 |
| Version 40 - 100 chars | 186.86 | 161.39 | 592.51 | 5.35 | 50 |
| NUMERIC encoding | 19.28 | 18.42 | 28.19 | 51.87 | 50 |
| ALPHANUMERIC encoding | 18.54 | 17.83 | 19.23 | 53.95 | 50 |
| BYTE encoding | 18.58 | 18.00 | 20.33 | 53.81 | 50 |
| EC Level L | 19.03 | 16.95 | 27.35 | 52.55 | 50 |
| EC Level M | 17.23 | 16.47 | 18.88 | 58.03 | 50 |
| EC Level Q | 17.83 | 17.01 | 21.50 | 56.07 | 50 |
| EC Level H | 17.49 | 16.78 | 21.24 | 57.17 | 50 |
| Generate 10 QR codes (Version 4) | 61.53 | 59.40 | 64.54 | 16.25 | 5 |
| Generate 50 QR codes (Version 4) | 342.11 | 320.22 | 353.78 | 2.92 | 5 |
| Generate 100 QR codes (Version 4) | 670.13 | 651.43 | 694.15 | 1.49 | 5 |
| 100 chars - Version 20 | 54.68 | 49.02 | 61.23 | 18.29 | 20 |
| 500 chars - Version 30 | 103.84 | 95.11 | 109.29 | 9.63 | 20 |
| 1000 chars - Version 40 | 188.83 | 172.06 | 210.01 | 5.30 | 20 |

---


## Historical Results

Results are appended below with newest first.

---
