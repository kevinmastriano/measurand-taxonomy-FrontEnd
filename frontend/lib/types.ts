export interface Quantity {
  name: string;
}

export interface MLayer {
  aspect: string;
  id: string;
}

export interface ExternalReference {
  CategoryTag?: {
    name: string;
    value: string;
  };
  ReferenceUrl?: {
    name: string;
    url: string;
  };
}

export interface Property {
  name: string;
  id: string;
  Definition?: string;
  NominalValues?: string[];
  ExternalReferences?: {
    Reference?: ExternalReference[];
  };
}

export interface Parameter {
  name: string;
  optional: boolean;
  Definition?: string;
  Quantity?: Quantity;
  mLayer?: MLayer;
  Property?: Property;
}

export interface Result {
  name?: string;
  Quantity?: Quantity;
  mLayer?: MLayer;
}

export interface Discipline {
  name: string;
}

export interface Taxon {
  name: string;
  deprecated: boolean;
  replacement?: string;
  Definition?: string;
  Result?: Result;
  Parameter?: Parameter[];
  Discipline?: Discipline[];
  ExternalReferences?: {
    Reference?: ExternalReference[];
  };
}

export interface Taxonomy {
  Taxon: Taxon[];
}

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  files?: string[];
}

export interface TreeNode {
  name: string;
  fullName: string;
  children: TreeNode[];
  taxon?: Taxon;
  level: number;
}

export interface TaxonomyChange {
  commitHash: string;
  commitDate: string;
  commitAuthor: string;
  commitMessage: string;
  changes: TaxonChange[];
}

export interface TaxonChange {
  taxonName: string;
  changeType: 'added' | 'removed' | 'deprecated' | 'modified';
  oldTaxon?: Taxon;
  newTaxon?: Taxon;
  fieldChanges?: FieldChange[];
}

export interface FieldChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  changeType: 'added' | 'removed' | 'modified';
}

