export interface UOMQuantity {
  name: string;
}

export interface MLayer {
  aspect: string;
  id: string;
}

export interface ExternalQuantityType {
  quantityName: string;
  quantityCode: string;
  quantityCodeSystem?: string;
}

export interface Result {
  name?: string;
  quantity?: UOMQuantity;
  mLayer?: MLayer;
  externalQuantityType?: ExternalQuantityType;
}

export interface Parameter {
  name: string;
  optional: boolean;
  definition?: string;
  quantity?: UOMQuantity;
  mLayer?: MLayer;
  externalQuantityType?: ExternalQuantityType;
}

export interface Discipline {
  name: string;
}

export interface ExternalReference {
  name?: string;
  url?: string;
}

export interface ExternalReferences {
  reference: ExternalReference[];
}

export interface Taxon {
  name: string;
  deprecated: boolean;
  replacement?: string;
  result?: Result;
  parameters: Parameter[];
  disciplines: Discipline[];
  definition?: string;
  externalReferences?: ExternalReferences;
}

export interface Taxonomy {
  taxons: Taxon[];
}

export interface PendingMeasurand {
  id: string;
  taxon: Taxon;
  submittedAt: Date;
  submittedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface FilterOptions {
  search: string;
  discipline: string;
  deprecated: boolean | null;
  hasParameters: boolean | null;
}

export type ViewType = 'table' | 'tree'; 