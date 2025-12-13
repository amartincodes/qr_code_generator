#!/usr/bin/env node
import { QRCodeGenerator } from "./qrCodeGenerator.js";
import * as path from "path";
import { readFileSync } from "fs";

function getVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(path.join(__dirname, "../package.json"), "utf-8")
    );
    return pkg.version;
  } catch {
    return "1.0.0";
  }
}

function showHelp(): void {
  console.log(`
qr-code-gen - Generate QR codes from text

Usage:
  qr-code-gen <data> [output-file]
  qr-code-gen [options]

Arguments:
  data          Text or URL to encode in the QR code
  output-file   Output PNG file path (default: ./qrcode.png)

Options:
  -h, --help     Show this help message
  -v, --version  Show version number

Examples:
  qr-code-gen "Hello World" ./hello.png
  qr-code-gen "https://example.com" ./website-qr.png
  qr-code-gen "Contact info" 
`);
}

const args = process.argv.slice(2);

// Handle flags
if (args.includes("-h") || args.includes("--help")) {
  showHelp();
  process.exit(0);
}

if (args.includes("-v") || args.includes("--version")) {
  console.log(getVersion());
  process.exit(0);
}

if (args.length < 1) {
  showHelp();
  process.exit(1);
}

const dataToEncode = args[0];
const outputFilePath = args[1] || "./qrcode.png";

if (!dataToEncode || dataToEncode.trim() === "") {
  console.error("Error: Data to encode cannot be empty.");
  process.exit(1);
} else if (dataToEncode.length > 2953) {
  console.error(
    "Error: Data exceeds maximum length for QR code (2953 characters)."
  );
  process.exit(1);
}

if (path.extname(outputFilePath).toLowerCase() !== ".png") {
  console.error("Error: Output file path must have a .png extension.");
  process.exit(1);
}

const qrGenerator = new QRCodeGenerator();
try {
  const qrMatrix = qrGenerator.generate(dataToEncode);
  qrGenerator.saveQRCodeAsImage(qrMatrix, outputFilePath);
  console.log(`✓ QR code saved to ${outputFilePath}`);
} catch (error: any) {
  console.error("Error generating QR code:", error.message);
  process.exit(1);
}
