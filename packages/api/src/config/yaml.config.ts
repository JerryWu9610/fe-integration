import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import * as yaml from 'js-yaml';
import { Config } from '../types';

export default async () => {
  const envFile = resolve(__dirname, '../../../..', 'env.yaml');

  try {
    const fileContents = await fs.readFile(envFile, 'utf8');
    return yaml.load(fileContents) as Config;
  } catch (error) {
    throw new Error(`Failed to load configuration file: ${error.message}`);
  }
}; 