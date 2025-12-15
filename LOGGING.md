# Logging System

This project uses a custom logging utility to handle debug, info, warning, and error messages.

## Features

- **Log Levels**: DEBUG, INFO, WARN, ERROR, NONE
- **Environment-based**: Automatically enabled in development or when `DEBUG=true`
- **Minimal overhead**: Disabled by default in production
- **Simple API**: Familiar console-like interface

## Usage

### Basic Usage

```typescript
import { logger, LogLevel } from '@amartincodes/qr-code-gen';

// Debug messages (only shown when DEBUG=true or NODE_ENV=development)
logger.debug('Detailed debugging information', { data: someData });

// Info messages (only shown when DEBUG=true or NODE_ENV=development)
logger.info('General information');

// Warnings (always shown unless level is ERROR or NONE)
logger.warn('Something might be wrong');

// Errors (always shown unless level is NONE)
logger.error('Something went wrong', error);
```

### Enabling Debug Logs

Debug and info logs are disabled by default. To enable them:

**Option 1: Environment Variable**
```bash
DEBUG=true node your-script.js
```

**Option 2: Programmatically**
```typescript
import { logger, LogLevel } from '@amartincodes/qr-code-gen';

// Enable logging
logger.enable();

// Set specific log level
logger.setLevel(LogLevel.DEBUG);
```

### Log Levels

- `LogLevel.DEBUG` (0) - Show all messages
- `LogLevel.INFO` (1) - Show info, warnings, and errors
- `LogLevel.WARN` (2) - Show warnings and errors (default)
- `LogLevel.ERROR` (3) - Show only errors
- `LogLevel.NONE` (4) - Disable all logging

## Examples

### Development Mode

```typescript
import { logger } from '@amartincodes/qr-code-gen';

// These will only appear if DEBUG=true or NODE_ENV=development
logger.debug('QR Matrix size:', matrix.length);
logger.info('Encoding mode detected:', encoding);

// These always appear
logger.warn('Using default error correction level');
logger.error('Failed to generate QR code', error);
```

### Production Mode

In production, only warnings and errors are logged by default:

```typescript
logger.debug('This will not appear');  // Hidden
logger.info('This will not appear');   // Hidden
logger.warn('This will appear');       // Visible
logger.error('This will appear');      // Visible
```

## Implementation Details

The logger is a singleton instance that:
- Checks `process.env.DEBUG` and `process.env.NODE_ENV`
- Uses standard `console.log`, `console.warn`, and `console.error`
- Adds prefixes like `[DEBUG]`, `[INFO]`, `[WARN]`, `[ERROR]`
- Has zero overhead when disabled (checks happen before logging)

## CLI Output

The CLI (`src/cli.ts`) uses `console.log` directly for user-facing output. The logger is only used within the library code for debugging purposes.
