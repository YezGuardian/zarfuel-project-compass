/**
 * Script to update all page headings to use the Typography component
 * 
 * Usage:
 * - Run with "node scripts/update-page-headings.js"
 * - This will scan all page components and update heading elements
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

const PAGES_DIR = path.join(__dirname, '../src/pages');
const COMPONENTS_DIR = path.join(__dirname, '../src/components');

// Regex patterns for finding heading elements
const H1_REGEX = /<h1[^>]*>(.*?)<\/h1>/g;
const P_AFTER_H1_REGEX = /<h1[^>]*>.*?<\/h1>\s*<p[^>]*class="text-muted-foreground"[^>]*>(.*?)<\/p>/gs;

// Replacement patterns
const IMPORT_TO_ADD = 'import { H1, Paragraph } from \'@/components/ui/typography\';';
const H1_REPLACEMENT = '<H1>$1</H1>';
const P_REPLACEMENT = '<Paragraph className="text-muted-foreground">$1</Paragraph>';

async function updateFile(filePath) {
  try {
    // Read the file
    let content = await readFile(filePath, 'utf8');
    let modified = false;

    // Check if the file already imports Typography components
    const hasTypographyImport = content.includes('@/components/ui/typography');

    // If not, check if we need to add the import
    if (!hasTypographyImport && (content.includes('<h1') || content.includes('<p class="text-muted-foreground"'))) {
      // Find a good place to add the import (after the last import)
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
      if (importLines.length > 0) {
        const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
        if (lastImportIndex !== -1) {
          const insertPos = lastImportIndex + importLines[importLines.length - 1].length;
          content = content.substring(0, insertPos) + '\n' + IMPORT_TO_ADD + content.substring(insertPos);
          modified = true;
        }
      }
    }

    // Replace h1 tags
    const h1Matches = content.match(H1_REGEX);
    if (h1Matches) {
      content = content.replace(H1_REGEX, H1_REPLACEMENT);
      modified = true;
    }

    // Replace p tags that follow h1 tags
    const pMatches = content.match(P_AFTER_H1_REGEX);
    if (pMatches) {
      content = content.replace(P_AFTER_H1_REGEX, (match, group1) => {
        return `<H1>${group1}</H1>\n          <Paragraph className="text-muted-foreground">$1</Paragraph>`;
      });
      modified = true;
    }

    // Write the updated content back to the file if modified
    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`Updated headings in ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function processDirectory(directory) {
  try {
    const entries = await readdir(directory);
    
    for (const entry of entries) {
      const entryPath = path.join(directory, entry);
      const entryStat = await stat(entryPath);
      
      if (entryStat.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(entryPath);
      } else if (entryStat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.jsx'))) {
        // Process all .tsx and .jsx files
        await updateFile(entryPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

async function main() {
  console.log('Updating page headings to use Typography components...');
  
  // Process pages directory
  await processDirectory(PAGES_DIR);
  
  // Process components that might have page-like layouts
  await processDirectory(COMPONENTS_DIR);
  
  console.log('Finished updating page headings.');
}

main().catch(console.error); 