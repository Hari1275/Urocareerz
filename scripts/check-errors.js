const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const errors = [];

  // Check 1: Prisma Client Import (removed - using standard @prisma/client)

  // Check 2: Empty Select Values
  const emptySelectRegex = /<SelectItem\s+value=["']{2}/g;
  let match;
  while ((match = emptySelectRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split("\n").length;
    errors.push({
      type: "Empty Select Value",
      message:
        'SelectItem cannot have empty string value. Use "all", "none", or "default"',
      line: line,
    });
  }

  // Check 3: Dynamic Route Params (not awaited)
  if (content.includes("params.id") || content.includes("params.slug")) {
    const paramsRegex = /params\.\w+/g;
    let match;
    while ((match = paramsRegex.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const lastAwait = beforeMatch.lastIndexOf("await");
      const lastConst = beforeMatch.lastIndexOf("const");

      if (lastConst > lastAwait) {
        const line = content.substring(0, match.index).split("\n").length;
        errors.push({
          type: "Dynamic Route Params",
          message:
            "params should be awaited. Use: const { id } = await params;",
          line: line,
        });
      }
    }
  }

  // Check 4: Invalid HTML Nesting (div inside p)
  if (content.includes("<CardDescription") && content.includes("<div")) {
    const cardDescRegex = /<CardDescription[^>]*>[\s\S]*?<div/g;
    let match;
    while ((match = cardDescRegex.exec(content)) !== null) {
      const line = content.substring(0, match.index).split("\n").length;
      errors.push({
        type: "HTML Nesting",
        message:
          "CardDescription renders as <p> and cannot contain <div>. Use <div> instead.",
        line: line,
      });
    }
  }

  return errors;
}

function walkDir(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith(".") &&
      item !== "node_modules"
    ) {
      files.push(...walkDir(fullPath));
    } else if (
      stat.isFile() &&
      (item.endsWith(".ts") ||
        item.endsWith(".tsx") ||
        item.endsWith(".js") ||
        item.endsWith(".jsx"))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  log("🔍 Checking for common errors...", "blue");
  log("", "reset");

  const srcDir = path.join(__dirname, "..", "src");
  const files = walkDir(srcDir);

  let totalErrors = 0;
  let filesWithErrors = 0;

  for (const file of files) {
    const errors = checkFile(file);

    if (errors.length > 0) {
      filesWithErrors++;
      const relativePath = path.relative(process.cwd(), file);
      log(`📁 ${relativePath}`, "yellow");

      for (const error of errors) {
        totalErrors++;
        log(`  ❌ Line ${error.line}: ${error.type}`, "red");
        log(`     ${error.message}`, "red");
      }
      log("", "reset");
    }
  }

  log("", "reset");
  log("📊 Summary:", "bold");
  log(`   Files checked: ${files.length}`, "blue");
  log(
    `   Files with errors: ${filesWithErrors}`,
    filesWithErrors > 0 ? "red" : "green"
  );
  log(`   Total errors: ${totalErrors}`, totalErrors > 0 ? "red" : "green");

  if (totalErrors === 0) {
    log("", "reset");
    log("✅ No common errors found!", "green");
  } else {
    log("", "reset");
    log("🔧 Please fix the errors above before committing.", "yellow");
    log("📖 See CURSOR_RULES.md for detailed guidance.", "blue");
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, walkDir };
