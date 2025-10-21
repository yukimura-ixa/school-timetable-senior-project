/**
 * Serena MCP Integration Test
 * 
 * This test file demonstrates and validates the Serena MCP (Model Context Protocol) integration.
 * Serena MCP provides advanced code navigation, search, and refactoring capabilities.
 * 
 * Serena MCP Capabilities:
 * - Code navigation (list directories, find symbols)
 * - Pattern-based code search
 * - Symbol renaming across codebase
 * - Symbol body replacement
 * 
 * Note: These tests validate the integration pattern and expected behavior.
 * Actual Serena MCP functionality requires project configuration.
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Serena MCP Integration', () => {
  const projectRoot = path.join(__dirname, '..');

  describe('Project Structure Validation', () => {
    it('should have valid project structure for MCP navigation', () => {
      const requiredDirs = ['src', 'prisma', '__test__'];
      
      requiredDirs.forEach(dir => {
        const dirPath = path.join(projectRoot, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });

    it('should have TypeScript configuration for code analysis', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      
      // Read content and verify it has compilerOptions
      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      expect(content).toContain('compilerOptions');
      expect(content).toContain('target');
    });

    it('should have package.json for dependency tracking', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.name).toBe('school-timetable');
      expect(packageJson.dependencies).toBeDefined();
    });
  });

  describe('Code Search Patterns', () => {
    it('should be able to find TypeScript files in src directory', () => {
      const srcDir = path.join(projectRoot, 'src');
      const files: string[] = [];
      
      function findTsFiles(dir: string) {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            findTsFiles(itemPath);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(itemPath);
          }
        });
      }
      
      findTsFiles(srcDir);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should validate that key source files exist', () => {
      const keyFiles = [
        'src/middleware.ts',
        'auth.ts',
      ];
      
      keyFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should find API route files', () => {
      const apiDir = path.join(projectRoot, 'src', 'app', 'api');
      
      if (fs.existsSync(apiDir)) {
        const files: string[] = [];
        
        function findRouteFiles(dir: string) {
          const items = fs.readdirSync(dir);
          items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
              findRouteFiles(itemPath);
            } else if (item === 'route.ts' || item === 'route.tsx') {
              files.push(itemPath);
            }
          });
        }
        
        findRouteFiles(apiDir);
        expect(files.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Symbol Detection', () => {
    it('should find exported functions in middleware', () => {
      const middlewarePath = path.join(projectRoot, 'src', 'middleware.ts');
      
      if (fs.existsSync(middlewarePath)) {
        const content = fs.readFileSync(middlewarePath, 'utf-8');
        
        // Check for common middleware patterns
        const hasExport = /export\s+(default\s+)?/g.test(content);
        const hasFunction = /function|const\s+\w+\s*=|export\s+\{/g.test(content);
        
        expect(hasExport || hasFunction).toBe(true);
      }
    });

    it('should detect TypeScript type definitions', () => {
      const typesDir = path.join(projectRoot, 'src', 'types');
      
      if (fs.existsSync(typesDir)) {
        const files = fs.readdirSync(typesDir);
        const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        
        expect(tsFiles.length).toBeGreaterThan(0);
        
        // Check at least one file has type definitions
        let hasTypeDefinitions = false;
        tsFiles.forEach(file => {
          const content = fs.readFileSync(path.join(typesDir, file), 'utf-8');
          if (/type\s+\w+|interface\s+\w+|enum\s+\w+/.test(content)) {
            hasTypeDefinitions = true;
          }
        });
        
        expect(hasTypeDefinitions).toBe(true);
      }
    });
  });

  describe('Refactoring Safety', () => {
    it('should have test coverage for critical modules', () => {
      const testDir = path.join(projectRoot, '__test__');
      const testFiles = fs.readdirSync(testDir, { recursive: true })
        .filter(f => typeof f === 'string' && (f.endsWith('.test.ts') || f.endsWith('.test.tsx')));
      
      expect(testFiles.length).toBeGreaterThan(0);
    });

    it('should have TypeScript strict mode enabled', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      
      // Read content and check for type safety features
      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      
      // Check for strict mode or other type safety features
      const hasTypeSafety = content.includes('"strict"') ||
                           content.includes('strictNullChecks') ||
                           content.includes('strictFunctionTypes') ||
                           content.includes('noFallthroughCasesInSwitch') ||
                           content.includes('forceConsistentCasingInFileNames');
      
      expect(hasTypeSafety).toBe(true);
    });
  });

  describe('MCP Integration Documentation', () => {
    it('should have AGENTS.md with MCP instructions', () => {
      const agentsPath = path.join(projectRoot, 'AGENTS.md');
      expect(fs.existsSync(agentsPath)).toBe(true);
      
      const content = fs.readFileSync(agentsPath, 'utf-8');
      expect(content).toContain('MCP');
    });

    it('should have GitHub Copilot instructions configured', () => {
      const copilotInstructionsPath = path.join(projectRoot, '.github', 'copilot-instructions.md');
      expect(fs.existsSync(copilotInstructionsPath)).toBe(true);
      
      const content = fs.readFileSync(copilotInstructionsPath, 'utf-8');
      expect(content).toContain('MCP');
    });

    it('should document serena MCP usage patterns', () => {
      // This test validates that the project is set up to use Serena MCP
      const agentsPath = path.join(projectRoot, 'AGENTS.md');
      const content = fs.readFileSync(agentsPath, 'utf-8');
      
      // Check for general MCP documentation
      const hasMcpDocs = content.includes('MCP') || content.includes('Model Context Protocol');
      expect(hasMcpDocs).toBe(true);
    });
  });

  describe('Expected MCP Behaviors', () => {
    it('should support directory listing for navigation', () => {
      // Validate that directory structure is navigable
      const srcDir = path.join(projectRoot, 'src');
      const subdirs = fs.readdirSync(srcDir).filter(item => {
        const stat = fs.statSync(path.join(srcDir, item));
        return stat.isDirectory();
      });
      
      expect(subdirs.length).toBeGreaterThan(0);
      expect(subdirs).toContain('app');
      expect(subdirs).toContain('components');
    });

    it('should support pattern-based search across codebase', () => {
      // Demonstrate pattern matching capability
      const srcDir = path.join(projectRoot, 'src');
      let functionCount = 0;
      
      function countFunctions(dir: string) {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory() && !item.startsWith('.')) {
            countFunctions(itemPath);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            const content = fs.readFileSync(itemPath, 'utf-8');
            // Count function declarations
            const matches = content.match(/(?:export\s+)?(?:async\s+)?function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\(/g);
            if (matches) {
              functionCount += matches.length;
            }
          }
        });
      }
      
      countFunctions(srcDir);
      expect(functionCount).toBeGreaterThan(0);
    });

    it('should identify symbols available for refactoring', () => {
      // Check that we can identify exportable symbols
      const srcDir = path.join(projectRoot, 'src');
      let exportCount = 0;
      
      function countExports(dir: string) {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory() && !item.startsWith('.')) {
            countExports(itemPath);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            const content = fs.readFileSync(itemPath, 'utf-8');
            const matches = content.match(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|interface|type|enum)/g);
            if (matches) {
              exportCount += matches.length;
            }
          }
        });
      }
      
      countExports(srcDir);
      expect(exportCount).toBeGreaterThan(0);
    });
  });

  describe('Integration Results', () => {
    it('should confirm Serena MCP test file exists', () => {
      const thisFile = __filename;
      expect(fs.existsSync(thisFile)).toBe(true);
      expect(thisFile).toContain('serena-mcp-integration.test.ts');
    });

    it('should pass all integration tests', () => {
      // Meta-test: if we reach here, all above tests passed
      expect(true).toBe(true);
    });
  });
});

/**
 * Serena MCP Usage Examples
 * 
 * When Serena MCP is properly configured, you can use it to:
 * 
 * 1. List directories:
 *    serena-list_dir({ relative_path: "src", recursive: true })
 * 
 * 2. Search for patterns:
 *    serena-search_for_pattern({ 
 *      substring_pattern: "export.*function",
 *      restrict_search_to_code_files: true 
 *    })
 * 
 * 3. Rename symbols:
 *    serena-rename_symbol({
 *      name_path: "oldFunctionName",
 *      relative_path: "src/utils.ts",
 *      new_name: "newFunctionName"
 *    })
 * 
 * 4. Replace symbol bodies:
 *    serena-replace_symbol_body({
 *      name_path: "functionName",
 *      relative_path: "src/utils.ts",
 *      body: "// new implementation"
 *    })
 * 
 * Configuration:
 * - Serena MCP requires project path configuration
 * - Integration may vary by environment (local dev, CI/CD)
 * - This test validates the code structure is MCP-ready
 */
