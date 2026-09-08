import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseTaxonomyXML, buildTaxonomyTree } from '@/lib/xml-parser';

const fixture = (name: string) =>
  fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf-8');

describe('parseTaxonomyXML', () => {
  it('parses all taxons from a catalog with namespace prefixes', async () => {
    const taxons = await parseTaxonomyXML(fixture('taxonomy.xml'));
    expect(taxons).toHaveLength(3);
    expect(taxons.map(t => t.name)).toEqual([
      'Measure.Acceleration',
      'Measure.Voltage.DC',
      'Measure.Legacy.Resistance',
    ]);
  });

  it('normalizes deprecated attribute to a boolean', async () => {
    const taxons = await parseTaxonomyXML(fixture('taxonomy.xml'));
    const legacy = taxons.find(t => t.name === 'Measure.Legacy.Resistance')!;
    const active = taxons.find(t => t.name === 'Measure.Acceleration')!;
    expect(legacy.deprecated).toBe(true);
    expect(legacy.replacement).toBe('Measure.Resistance.DC');
    expect(active.deprecated).toBe(false);
  });

  it('normalizes single Discipline/Parameter elements into arrays', async () => {
    const taxons = await parseTaxonomyXML(fixture('taxonomy.xml'));
    const accel = taxons.find(t => t.name === 'Measure.Acceleration')!;
    expect(Array.isArray(accel.Discipline)).toBe(true);
    expect(accel.Discipline).toEqual([{ name: 'Mechanical' }]);
    expect(Array.isArray(accel.Parameter)).toBe(true);
    expect(accel.Parameter![0].name).toBe('frequency');
    expect(accel.Parameter![0].optional).toBe(true);

    const voltage = taxons.find(t => t.name === 'Measure.Voltage.DC')!;
    expect(voltage.Discipline).toHaveLength(2);
    expect(voltage.Parameter![0].optional).toBe(false);
  });

  it('parses Result quantity and mLayer', async () => {
    const taxons = await parseTaxonomyXML(fixture('taxonomy.xml'));
    const voltage = taxons.find(t => t.name === 'Measure.Voltage.DC')!;
    expect(voltage.Result?.Quantity?.name).toBe('voltage');
    expect(voltage.Result?.mLayer).toEqual({ aspect: 'electromagnetics', id: 'Q3' });
  });

  it('handles a catalog with a single taxon (non-array)', async () => {
    const taxons = await parseTaxonomyXML(fixture('taxonomy-single.xml'));
    expect(taxons).toHaveLength(1);
    expect(taxons[0].name).toBe('Measure.Temperature');
  });

  it('returns an empty array for XML without a Taxonomy root', async () => {
    const taxons = await parseTaxonomyXML('<root><foo/></root>');
    expect(taxons).toEqual([]);
  });

  it('returns an empty array for garbage input', async () => {
    const taxons = await parseTaxonomyXML('this is not xml at all >>><<<');
    expect(taxons).toEqual([]);
  });
});

describe('buildTaxonomyTree', () => {
  it('builds a hierarchy from dotted taxon names', async () => {
    const taxons = await parseTaxonomyXML(fixture('taxonomy.xml'));
    const tree = buildTaxonomyTree(taxons);

    const measure = tree.children.find((c: any) => c.name === 'Measure');
    expect(measure).toBeDefined();
    expect(measure.children.map((c: any) => c.name)).toContain('Acceleration');
    expect(measure.children.map((c: any) => c.name)).toContain('Voltage');

    const voltage = measure.children.find((c: any) => c.name === 'Voltage');
    const dc = voltage.children.find((c: any) => c.name === 'DC');
    expect(dc.fullName).toBe('Measure.Voltage.DC');
    expect(dc.taxon?.name).toBe('Measure.Voltage.DC');
  });
});
