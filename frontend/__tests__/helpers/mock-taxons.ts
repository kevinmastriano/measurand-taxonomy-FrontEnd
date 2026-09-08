import { Taxon } from '@/lib/types';

/**
 * Deterministic in-memory taxons used by route handler tests.
 * Shape mirrors what parseTaxonomyXML produces from the real catalog.
 */
export function makeTaxons(): Taxon[] {
  return [
    {
      name: 'Measure.Acceleration',
      deprecated: false,
      replacement: '',
      Definition: 'Measurement of proper acceleration.',
      Result: {
        name: 'acceleration',
        Quantity: { name: 'acceleration' },
        mLayer: { aspect: 'time-domain', id: 'Q1' },
      },
      Parameter: [
        {
          name: 'frequency',
          optional: true,
          Definition: 'Vibration frequency',
          Quantity: { name: 'frequency' },
          mLayer: { aspect: 'time-domain', id: 'Q2' },
        },
      ],
      Discipline: [{ name: 'Mechanical' }],
    },
    {
      name: 'Measure.Voltage.DC',
      deprecated: false,
      replacement: '',
      Definition: 'Measurement of direct-current voltage.',
      Result: {
        name: 'voltage',
        Quantity: { name: 'voltage' },
        mLayer: { aspect: 'electromagnetics', id: 'Q3' },
      },
      Parameter: [
        {
          name: 'nominal',
          optional: false,
          Quantity: { name: 'voltage' },
        },
      ],
      Discipline: [{ name: 'Electrical' }, { name: 'DC and Low Frequency' }],
    },
    {
      name: 'Measure.Legacy.Resistance',
      deprecated: true,
      replacement: 'Measure.Resistance.DC',
      Definition: 'Deprecated legacy resistance measurement.',
      Result: {
        name: 'resistance',
        Quantity: { name: 'resistance' },
        mLayer: { aspect: 'electromagnetics', id: 'Q4' },
      },
      Discipline: [{ name: 'Electrical' }],
    },
  ];
}
