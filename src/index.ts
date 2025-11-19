import { QRCodeGenerator } from "./qrCodeGenerator";

const qrCodeData = "https://example.com";
const qrCodeGenerator = new QRCodeGenerator();
const qrCodeImage = qrCodeGenerator.generate(qrCodeData);

console.log("Generated QR Code Image:", qrCodeImage);
