// GitLab configuration type
export interface GitLabConfig {
  apiBaseUrl: string;
  apiToken: string;
  projectId: number;
}

// Artifact configuration type
export interface ArtifactConfig {
  repoId: number;
  pkgNamePrefix: string;
}

// Parameter definition type
export interface ParamDef {
  field: string;
  label: string;
  type: 'input' | 'boolean' | 'json';
}

// Step configuration type
export interface StepConfig {
  name: string;
  description: string;
  paramsDef: ParamDef[];
}

// Procedure configuration type
export interface ProcedureConfig {
  name: string;
  products: string[];
  steps: string[];
}

// Product configuration type
export interface ProductConfig {
  name: string;
  feIntegrationRepo: string;
  fullIntegrationRepo: string;
  procedures: string[];
}

// Business repository configuration type
export type BusinessRepoConfig = Record<string, {
  gitlab: GitLabConfig;
  artifact: ArtifactConfig;
}>;

// FE Integration repository configuration type
export type FeIntegrationRepoConfig = Record<string, {
  gitlab: GitLabConfig;
  artifact: ArtifactConfig;
}>;

// Full Integration repository configuration type
export type FullIntegrationRepoConfig = Record<string, {
  gitlab: GitLabConfig;
}>;

// Root configuration types
export type StepConfigRoot = Record<string, StepConfig>;

export type ProcedureConfigRoot = Record<string, ProcedureConfig>;

export type ProductConfigRoot = Record<string, ProductConfig>;

// Main configuration type
export interface Config {
  businessRepo: BusinessRepoConfig;
  feIntegrationRepo: FeIntegrationRepoConfig;
  fullIntegrationRepo: FullIntegrationRepoConfig;
  step: StepConfigRoot;
  procedure: ProcedureConfigRoot;
  product: ProductConfigRoot;
}

export interface BusinessConfigCacheItem<T> {
  data: T;
  timestamp: number;
}

// Domain types for business config service
export interface ProductListItem {
  id: string;
  name: string;
}

export interface Step {
  id: string;
  name: string;
  description: string;
  paramsDef: ParamDef[];
}

export interface ProcedureListItem {
  id: string;
  name: string;
  steps: Step[];
} 