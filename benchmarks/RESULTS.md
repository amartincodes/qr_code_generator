# Benchmark Results History

This file tracks performance benchmark results over time to monitor performance trends and catch regressions.

## Latest Results

### Benchmark Run - 12/15/2025, 10:02:26 PM

**System Information:**
- Node.js: v20.19.6
- Platform: linux 6.11.0-1018-azure
- Architecture: x64
- CPU: 4x Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz
- Memory: 15.62 GB

**Results:**

| Benchmark | Avg Time (ms) | Min (ms) | Max (ms) | Ops/sec | Iterations |
|-----------|---------------|----------|----------|---------|------------|
| Version 1 - 3 chars | 2.81 | 2.31 | 4.50 | 356.41 | 50 |
| Version 5 - 10 chars | 6.85 | 6.17 | 9.98 | 146.03 | 50 |
| Version 10 - 15 chars | 19.48 | 14.80 | 45.15 | 51.33 | 50 |
| Version 20 - 37 chars | 44.16 | 41.27 | 64.95 | 22.65 | 50 |
| Version 30 - 50 chars | 92.13 | 83.97 | 106.69 | 10.85 | 50 |
| Version 40 - 100 chars | 171.39 | 143.62 | 600.81 | 5.83 | 50 |
| NUMERIC encoding | 16.64 | 15.77 | 23.91 | 60.10 | 50 |
| ALPHANUMERIC encoding | 16.70 | 15.79 | 20.79 | 59.88 | 50 |
| BYTE encoding | 16.70 | 15.83 | 23.02 | 59.88 | 50 |
| EC Level L | 17.47 | 16.20 | 23.53 | 57.24 | 50 |
| EC Level M | 16.85 | 15.97 | 18.25 | 59.35 | 50 |
| EC Level Q | 17.37 | 16.51 | 18.81 | 57.58 | 50 |
| EC Level H | 16.93 | 16.11 | 22.19 | 59.07 | 50 |
| Generate 10 QR codes (Version 4) | 58.92 | 56.84 | 61.79 | 16.97 | 5 |
| Generate 50 QR codes (Version 4) | 315.22 | 301.93 | 338.32 | 3.17 | 5 |
| Generate 100 QR codes (Version 4) | 656.41 | 629.83 | 673.49 | 1.52 | 5 |
| 100 chars - Version 20 | 55.24 | 50.07 | 58.96 | 18.10 | 20 |
| 500 chars - Version 30 | 108.00 | 97.48 | 122.65 | 9.26 | 20 |
| 1000 chars - Version 40 | 194.98 | 174.34 | 291.51 | 5.13 | 20 |

---


## Historical Results

Results are appended below with newest first.

---

### Benchmark Run - 12/15/2025, 9:53:56 PM

**System Information:**
- Node.js: v25.1.0
- Platform: linux 6.17.8-arch1-1
- Architecture: x64
- CPU: 16x AMD Ryzen 7 2700X Eight-Core Processor
- Memory: 15.54 GB

**Results:**

| Benchmark | Avg Time (ms) | Min (ms) | Max (ms) | Ops/sec | Iterations |
|-----------|---------------|----------|----------|---------|------------|
| Version 1 - 3 chars | 3.20 | 2.42 | 5.16 | 312.43 | 50 |
| Version 5 - 10 chars | 7.45 | 6.21 | 11.34 | 134.29 | 50 |
| Version 10 - 15 chars | 14.44 | 13.55 | 17.28 | 69.24 | 50 |
| Version 20 - 37 chars | 44.12 | 35.41 | 73.80 | 22.66 | 50 |
| Version 30 - 50 chars | 89.19 | 78.91 | 105.40 | 11.21 | 50 |
| Version 40 - 100 chars | 152.31 | 139.40 | 171.70 | 6.57 | 50 |
| NUMERIC encoding | 15.51 | 12.90 | 23.22 | 64.49 | 50 |
| ALPHANUMERIC encoding | 15.40 | 12.84 | 24.11 | 64.94 | 50 |
| BYTE encoding | 15.35 | 12.93 | 23.62 | 65.13 | 50 |
| EC Level L | 15.39 | 12.92 | 23.55 | 64.98 | 50 |
| EC Level M | 15.44 | 12.82 | 23.41 | 64.76 | 50 |
| EC Level Q | 15.59 | 12.89 | 23.28 | 64.15 | 50 |
| EC Level H | 15.64 | 12.88 | 23.63 | 63.94 | 50 |
| Generate 10 QR codes (Version 4) | 55.55 | 48.00 | 59.75 | 18.00 | 5 |
| Generate 50 QR codes (Version 4) | 277.62 | 274.23 | 280.03 | 3.60 | 5 |
| Generate 100 QR codes (Version 4) | 559.08 | 547.13 | 576.14 | 1.79 | 5 |
| 100 chars - Version 20 | 44.79 | 35.49 | 50.93 | 22.33 | 20 |
| 500 chars - Version 30 | 90.81 | 81.49 | 103.97 | 11.01 | 20 |
| 1000 chars - Version 40 | 153.19 | 140.11 | 166.52 | 6.53 | 20 |

---


### Benchmark Run - 12/14/2025, 3:24:16 PM

**System Information:**
- Node.js: v25.1.0
- Platform: linux 6.17.8-arch1-1
- Architecture: x64
- CPU: 16x AMD Ryzen 7 2700X Eight-Core Processor
- Memory: 15.54 GB

**Results:**

| Benchmark | Avg Time (ms) | Min (ms) | Max (ms) | Ops/sec | Iterations |
|-----------|---------------|----------|----------|---------|------------|
| Version 1 - 3 chars | 2.93 | 2.45 | 4.79 | 341.15 | 50 |
| Version 5 - 10 chars | 6.42 | 6.10 | 8.22 | 155.72 | 50 |
| Version 10 - 15 chars | 14.09 | 13.51 | 16.99 | 70.95 | 50 |
| Version 20 - 37 chars | 38.29 | 37.15 | 45.76 | 26.12 | 50 |
| Version 30 - 50 chars | 74.65 | 73.57 | 81.58 | 13.40 | 50 |
| Version 40 - 100 chars | 126.21 | 122.93 | 135.47 | 7.92 | 50 |
| NUMERIC encoding | 13.69 | 13.44 | 14.11 | 73.03 | 50 |
| ALPHANUMERIC encoding | 13.67 | 13.38 | 14.14 | 73.15 | 50 |
| BYTE encoding | 13.78 | 13.41 | 14.29 | 72.58 | 50 |
| EC Level L | 13.77 | 13.40 | 15.10 | 72.63 | 50 |
| EC Level M | 13.78 | 13.43 | 14.40 | 72.58 | 50 |
| EC Level Q | 13.73 | 13.48 | 14.18 | 72.86 | 50 |
| EC Level H | 13.79 | 13.47 | 14.15 | 72.51 | 50 |
| Generate 10 QR codes (Version 4) | 50.97 | 50.42 | 51.37 | 19.62 | 5 |
| Generate 50 QR codes (Version 4) | 251.95 | 248.98 | 256.46 | 3.97 | 5 |
| Generate 100 QR codes (Version 4) | 497.78 | 495.16 | 505.40 | 2.01 | 5 |
| 100 chars - Version 20 | 37.27 | 36.78 | 37.58 | 26.83 | 20 |
| 500 chars - Version 30 | 74.42 | 73.89 | 76.47 | 13.44 | 20 |
| 1000 chars - Version 40 | 124.03 | 123.16 | 125.60 | 8.06 | 20 |

---

