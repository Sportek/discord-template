import glob from "glob-promise";
import path from "path";
/**
 * Resolves all files in the src directory
 * @returns {Promise<string[]>}
 */
export async function resolveFiles(): Promise<string[]> {
  const srcPath = path.resolve(__dirname, "..");
  const files = await glob("**/*{.ts,.js}", { cwd: srcPath, absolute: true });
  return files;
}
