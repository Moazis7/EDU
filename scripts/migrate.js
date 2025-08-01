#!/usr/bin/env node

/**
 * Migration Script - Old Structure to New Architecture
 * This script helps migrate from the old structure to the new professional architecture
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Starting migration to new architecture...');

// Create new directory structure
const directories = [
  'src',
  'src/controllers',
  'src/services',
  'src/repositories',
  'src/container',
  'src/factories',
  'src/routes',
  'src/middleware',
  'src/models',
  'src/utils',
  'scripts',
  'tests',
  'tests/unit',
  'tests/integration',
  'tests/fixtures',
  'docs'
];

console.log('📁 Creating directory structure...');

directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  } else {
    console.log(`⚠️  Already exists: ${dir}`);
  }
});

// Copy existing files to new structure
const fileMappings = [
  { from: 'middleware', to: 'src/middleware' },
  { from: 'models', to: 'src/models' },
  { from: 'utils', to: 'src/utils' },
  { from: 'config', to: 'src/config' }
];

console.log('📋 Copying existing files...');

fileMappings.forEach(mapping => {
  const sourcePath = path.join(process.cwd(), mapping.from);
  const targetPath = path.join(process.cwd(), mapping.to);
  
  if (fs.existsSync(sourcePath)) {
    // Copy directory contents
    const copyRecursive = (src, dest) => {
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };
    
    copyRecursive(sourcePath, targetPath);
    console.log(`✅ Copied: ${mapping.from} → ${mapping.to}`);
  }
});

// Create backup of old files
console.log('💾 Creating backup of old structure...');

const backupDir = `backup-${new Date().toISOString().split('T')[0]}`;
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const oldFiles = [
  'server.js',
  'routes',
  'middleware',
  'models',
  'utils',
  'config'
];

oldFiles.forEach(file => {
  const sourcePath = path.join(process.cwd(), file);
  const backupPath = path.join(process.cwd(), backupDir, file);
  
  if (fs.existsSync(sourcePath)) {
    if (fs.statSync(sourcePath).isDirectory()) {
      // Copy directory
      const copyRecursive = (src, dest) => {
        if (fs.statSync(src).isDirectory()) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          fs.readdirSync(src).forEach(item => {
            copyRecursive(path.join(src, item), path.join(dest, item));
          });
        } else {
          fs.copyFileSync(src, dest);
        }
      };
      copyRecursive(sourcePath, backupPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, backupPath);
    }
    console.log(`✅ Backed up: ${file}`);
  }
});

// Create migration guide
const migrationGuide = `# Migration Guide

## What was migrated:

### ✅ Files Copied
- middleware/ → src/middleware/
- models/ → src/models/
- utils/ → src/utils/
- config/ → src/config/

### ✅ New Structure Created
- src/controllers/ - HTTP request handlers
- src/services/ - Business logic layer
- src/repositories/ - Data access layer
- src/container/ - Dependency injection
- src/factories/ - Object creation patterns
- src/routes/ - Route definitions
- tests/ - Test files
- scripts/ - Utility scripts

### ✅ Backup Created
- Old files backed up to: ${backupDir}

## Next Steps:

1. Update imports in new files to use correct paths
2. Test the new structure
3. Gradually migrate route logic to controllers
4. Extract business logic to services
5. Create repositories for data access
6. Update package.json scripts
7. Run tests to ensure everything works

## Rollback:
If you need to rollback, restore files from: ${backupDir}
`;

fs.writeFileSync('MIGRATION_GUIDE.md', migrationGuide);
console.log('✅ Created: MIGRATION_GUIDE.md');

console.log('\n🎉 Migration completed successfully!');
console.log('📋 Next steps:');
console.log('1. Review MIGRATION_GUIDE.md');
console.log('2. Update imports in new files');
console.log('3. Test the new structure');
console.log('4. Gradually migrate existing logic');
console.log(`5. Backup available in: ${backupDir}`);

console.log('\n🚀 Your project is now ready for the new professional architecture!'); 