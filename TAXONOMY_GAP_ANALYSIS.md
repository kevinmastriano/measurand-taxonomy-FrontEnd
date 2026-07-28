# Measurand Taxonomy — Gap Analysis ("Missing Taxons")

> ⚠️ **Superseded in part.** See `TAXONOMY_GAP_ANALYSIS_REVIEW.md` for a critical review.
> The enumerated candidate lists below remain useful, but the counts in §7, the summary
> table, the tier sequencing, and several individual proposals are withdrawn or corrected
> there. Do not cite §7 standalone.

**Source analyzed:** `NCSLI-MII/measurand-taxonomy` → `MeasurandTaxonomyCatalog.xml` (`main`)
**Snapshot:** 2026-07-28
**Catalog size:** 144 taxons total — **135 active**, 9 deprecated
(73 active `Measure.*`, 62 active `Source.*`)

---

## 1. Method

"Missing" is used here in four distinct senses, kept separate because they carry very
different confidence levels and require different kinds of decisions:

| Class | How it was derived | Confidence |
|---|---|---|
| **A. Role asymmetry** | Set difference between active `Measure.*` and `Source.*` suffixes | Mechanical — derived from the file itself |
| **B. Naming asymmetry** | Pairs that differ only by naming convention, not by concept | Mechanical |
| **C. Orphan quantities** | `uom:Quantity` values that appear as `Parameter` but never as a `Result` | Mechanical |
| **D. Domain coverage** | Calibration scopes commonly held under ISO/IEC 17025 with no representable taxon | Judgment — needs committee review |

Classes A–C are facts about the XML. Class D is the substantive list and is where the
bulk of the missing taxons live.

**Discipline distribution today** (why class D is large):

```
Electrical                            62
Mass                                  20
Dimensional                           20
Thermodynamics                        14
Pressure                               8
Vibration                              6
Torque                                 4
Time and Frequency                     4
(blank)                                4
Chemical                               1
Acoustics, ultrasound and vibration    1
```

Electrical alone is 46 % of the catalog. Optical/photometric, ionizing radiation,
hardness, flow, and acoustics are effectively unrepresented.

---

## 2. Class A — Role asymmetry (`Measure` without `Source`, and vice versa)

### A.1 `Measure.*` with no `Source.*` counterpart (34)

Not every one of these needs a source — you cannot meaningfully "source" flatness of a
surface plate — but the starred ones correspond to real, commonly calibrated source
instruments and are genuine gaps.

| Existing `Measure.*` | Missing counterpart | Real source instrument? |
|---|---|---|
| `Measure.Charge.DC` | `Source.Charge.DC` | ★ charge calibrators, piezo simulators |
| `Measure.Current.DC` | `Source.Current.DC` | ★ see B.1 — `Source.Current` is ambiguous |
| `Measure.Current.AC` | `Source.Current.AC` | ★ see B.1 |
| `Measure.Frequency.AmplitudeModulation.Rate` | `Source.Frequency.AmplitudeModulation.Rate` | ★ signal generators |
| `Measure.Frequency.FrequencyModulation.Rate` | `Source.Frequency.FrequencyModulation.Rate` | ★ signal generators |
| `Measure.Frequency.FrequencyModulation.Deviation` | `Source.Frequency.FrequencyModulation.Deviation` | ★ signal generators |
| `Measure.Frequency.PhaseModulation.Rate` | `Source.Frequency.PhaseModulation.Rate` | ★ signal generators |
| `Measure.Ratio.AmplitudeModulation` | `Source.Ratio.AmplitudeModulation` | ★ AM depth on any sig gen |
| `Measure.Phase.PhaseModulation` | `Source.Phase.PhaseModulation` | ★ ΦM deviation on any sig gen |
| `Measure.Phase-Noise.Sideband` | `Source.Phase-Noise.Sideband` | ★ phase noise standards |
| `Measure.Voltage.AC.Squarewave` | `Source.Voltage.AC.Squarewave` | ★ function generators |
| `Measure.Voltage.AC.Trianglewave` | `Source.Voltage.AC.Trianglewave` | ★ function generators |
| `Measure.Voltage.AC.Ripple.OnDC` | `Source.Voltage.AC.Ripple.OnDC` | ★ PSU ripple simulators |
| `Measure.Ratio.Voltage.AC.Ripple.OnDC` | `Source.Ratio.Voltage.AC.Ripple.OnDC` | ★ |
| `Measure.Time` | `Source.Time` | ★ time-of-day / interval sources |
| `Measure.Time.Transition` | `Source.Time.Transition` | ★ edge/rise-time standards |
| `Measure.Pressure.Differential.Static` | — | see B.4 (naming) |
| `Measure.Torque.HydraulicPressure` | `Source.Torque.HydraulicPressure` | ★ hydraulic torque calibrators |
| `Measure.Ratio.Torque` | `Source.Ratio.Torque` | ★ torque multipliers |
| `Measure.Ratio.Humidity.Relative` | `Source.Ratio.Humidity.Relative` | ★ see B.5 |
| `Measure.Ratio.Humidity.Specific` | `Source.Ratio.Humidity.Specific` | ★ |
| `Measure.Ratio.DensityMass` | `Source.Ratio.DensityMass` | ★ density standards |
| `Measure.Power.Ultrasonic` | `Source.Power.Ultrasonic` | ★ ultrasonic power standards |
| `Measure.Phase.ReflectionFactor.RF` | `Source.Phase.ReflectionFactor.RF` | ★ mismatch/airline standards |
| `Measure.Phase.TransmissionFactor` | `Source.Phase.TransmissionFactor` | ★ phase-shift standards |
| `Measure.Ratio.Power.ReflectionFactor.RF` | `Source.Ratio.Power.ReflectionFactor.RF` | ★ VSWR standards |
| `Measure.Ratio.Power.TransmissionFactor` | `Source.Ratio.Power.TransmissionFactor` | ★ step attenuators |
| `Measure.Length.Form.Flatness` | `Source.Length.Form.Flatness` | ★ optical flats, surface plates as artifacts |
| `Measure.Length.Form.Parallelism` | `Source.Length.Form.Parallelism` | ★ parallel artifacts |
| `Measure.Length.Form.Roughness` | `Source.Length.Form.Roughness` | ★ roughness comparison specimens |
| `Measure.Length.Form.Straightness.Axis` | `Source.Length.Form.Straightness.Axis` | ★ straightedge artifacts |
| `Measure.Frequency` | — | see B.3 (naming) |
| `Measure.Frequency.Arbitrary.Cardiograph` | `Source.Frequency.Arbitrary.Cardiograph` | ★ patient simulators |
| `Measure.Impedance` | `Source.Impedance` | already exists — no gap |

**Net class-A gap: 31 proposed `Source.*` taxons.**

### A.2 `Source.*` with no `Measure.*` counterpart (23)

These are the more surprising ones — the catalog can express generating a stimulus but
not measuring it.

| Existing `Source.*` | Missing counterpart | Why it matters |
|---|---|---|
| `Source.Power.DC` | `Measure.Power.DC` | ★★ DC power meters / wattmeters — a major hole |
| `Source.Power.AC.Sinewave` | `Measure.Power.AC.Sinewave` | ★★ AC power analyzers, watt-hour meters |
| `Source.Power.DC.Simulated` | `Measure.Power.DC.Simulated` | ★ |
| `Source.Power.AC.Sinewave.Simulated` | `Measure.Power.AC.Sinewave.Simulated` | ★ |
| `Source.Power.Noise.Terminated` | `Measure.Power.Noise.Terminated` | ★ noise figure / ENR measurement |
| `Source.Voltage.Noise.Terminated` | `Measure.Voltage.Noise.Terminated` | ★ noise voltage measurement |
| `Source.Acceleration.Shock` | `Measure.Acceleration.Shock` | ★★ shock recorders, drop testers |
| `Source.Acceleration.Vibration` | `Measure.Acceleration.Vibration` | ★★ vibration meters, accelerometers |
| `Source.Ratio.Acceleration.Delta.Amplitude` | `Measure.Ratio.Acceleration.Delta.Amplitude` | ★ accelerometer amplitude linearity |
| `Source.Ratio.Acceleration.Delta.Frequency` | `Measure.Ratio.Acceleration.Delta.Frequency` | ★ accelerometer frequency response |
| `Source.MassFlowRate.Gas` | `Measure.MassFlowRate.Gas` | ★★ mass flow meters — see D.4 |
| `Source.Temperature.FixedPoint.ITS90` | `Measure.Temperature.FixedPoint.ITS90` | ★ fixed-point cell realization |
| `Source.Time.Marker` | `Measure.Time.Marker` | ★ time-mark measurement |
| `Source.Time.Squarewave` | `Measure.Time.Squarewave` | ★ |
| `Source.Voltage.DC.Delta.Voltage` | `Measure.Voltage.DC.Delta.Voltage` | ★ DC linearity |
| `Source.Voltage.Shorted` | `Measure.Voltage.Shorted` | ★ short/offset checks |
| `Source.Pressure.Pneumatic.Differential.Static` | — | see B.4 |
| `Source.Ratio.Humidity` | — | see B.5 |
| `Source.Current` | — | see B.1 |
| `Source.Frequency.AC.Sinewave` / `.Squarewave` / `.RF.Sinewave` | — | see B.3 |
| `Source.Voltage.AC.Sinewave` | — | see B.2 |

**Net class-A gap: 16 proposed `Measure.*` taxons.**

---

## 3. Class B — Naming asymmetries (not missing concepts, but broken symmetry)

These produce false gaps in any automated diff, and real ambiguity for anyone mapping a
scope of accreditation. Each needs either a rename + deprecation, or a new alias taxon.

| # | Issue | Current state | Recommendation |
|---|---|---|---|
| **B.1** | Current role naming | `Measure.Current.DC` + `Measure.Current.AC` vs. a single generic `Source.Current` | Add `Source.Current.DC` and `Source.Current.AC`; deprecate `Source.Current` |
| **B.2** | AC voltage waveform | `Measure.Current.AC.Sinewave` exists, but **`Measure.Voltage.AC.Sinewave` does not** — while `Source.Voltage.AC.Sinewave` does | Add `Measure.Voltage.AC.Sinewave` |
| **B.3** | Frequency | `Measure.Frequency` (generic) vs. `Source.Frequency.AC.Sinewave` / `.AC.Squarewave` / `.RF.Sinewave` | Add matching `Measure.Frequency.AC.Sinewave`, `.AC.Squarewave`, `.RF.Sinewave` |
| **B.4** | Differential pressure | `Measure.Pressure.Differential.Static` (no medium) vs. `Source.Pressure.Pneumatic.Differential.Static` (medium) | Normalize on `<Medium>.<Type>.<Dynamics>`; add `Measure.Pressure.Pneumatic.Differential.Static` and `Measure.Pressure.Hydraulic.Differential.Static` |
| **B.5** | Humidity | `Measure.Ratio.Humidity.Relative` + `.Specific` vs. bare `Source.Ratio.Humidity` | Add `Source.Ratio.Humidity.Relative` / `.Specific`; deprecate `Source.Ratio.Humidity` |
| **B.6** | Torque medium | `Measure.Torque.HydraulicPressure` has no pneumatic/electric sibling and no source | Add `Source.Torque.HydraulicPressure` |

---

## 4. Class C — Orphan quantities (declared but never a result)

Five `uom:Quantity` values are wired into the catalog **only as parameters**. The
taxonomy can describe them as influence quantities but cannot express measuring them —
a strong signal that a top-level taxon is missing.

| Quantity | m-layer aspect | Used as Result | Used as Parameter | Missing taxons |
|---|---|---|---|---|
| `volume` | `AS37` | **0** | 13 | `Measure.Volume.Liquid`, `Measure.Volume.Solid`, `Source.Volume.Liquid` |
| `plane-angle` | `AS10` | **0** | 9 | `Measure.Angle.Plane`, `Source.Angle.Plane` |
| `speed` | `AS38` | **0** | 1 | `Measure.Speed.Rotational`, `Measure.Speed.Linear`, `Source.Speed.Rotational` |
| `dynamic-viscosity` | `AS107` | **0** | 1 | `Measure.Viscosity.Dynamic`, `Measure.Viscosity.Kinematic` |
| `relative-humidity` | `AS110` | **0** | 3 | RH results are modeled via `ratio` — confirm this is intentional |

---

## 5. Class D — Missing domain coverage

Proposed names follow the existing convention `Role.Quantity[.Modifier…]`.

### D.1 Optical, photometric & radiometric — **entire discipline absent**

No taxon in the catalog carries an optical quantity. This blocks fiber-optic,
illumination, and spectrophotometry scopes entirely.

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.Power.Optical` / `Source.Power.Optical` | fiber optic power meters, optical sources |
| `Measure.Ratio.Power.Optical.Attenuation` / `Source.Ratio.Power.Optical.Attenuation` | optical attenuators |
| `Measure.Wavelength.Optical` / `Source.Wavelength.Optical` | OSAs, tunable lasers |
| `Measure.Length.Optical.ReturnLoss` | OTDRs, return-loss meters |
| `Measure.Illuminance` / `Source.Illuminance` | lux meters, light boxes |
| `Measure.Luminance` / `Source.Luminance` | luminance meters, displays |
| `Measure.LuminousFlux` | integrating spheres |
| `Measure.LuminousIntensity` | candela standards |
| `Measure.Irradiance` / `Source.Irradiance` | UV radiometers, solar simulators |
| `Measure.Radiance` | radiance standards |
| `Measure.Ratio.Transmittance` / `Measure.Ratio.Reflectance` | spectrophotometers |
| `Measure.Absorbance` | UV-Vis spectrophotometers |
| `Measure.Ratio.Color` | colorimeters |
| `Measure.RefractiveIndex` | refractometers |
| `Measure.Ratio.Gloss` | glossmeters |

### D.2 Acoustics — 1 taxon (`Measure.Power.Ultrasonic`)

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.Pressure.Acoustic` / `Source.Pressure.Acoustic` | sound level meters, pistonphones, acoustic calibrators |
| `Measure.Ratio.Power.Acoustic.SoundPressureLevel` | SPL in dB re 20 µPa |
| `Measure.Ratio.Power.Acoustic.Weighted` | A/C/Z-weighting networks |
| `Measure.Intensity.Acoustic` | sound intensity probes |
| `Measure.Frequency.Acoustic.Band` | octave / third-octave filters |
| `Source.Power.Ultrasonic` | ultrasonic power standards (see A.1) |
| `Measure.Ratio.Attenuation.Ultrasonic` | NDT reference blocks |

### D.3 Hardness — **entire discipline absent**

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.Hardness.Rockwell` / `Source.Hardness.Rockwell` | Rockwell testers, test blocks |
| `Measure.Hardness.Brinell` / `Source.Hardness.Brinell` | Brinell testers, test blocks |
| `Measure.Hardness.Vickers` / `Source.Hardness.Vickers` | Vickers / micro-hardness |
| `Measure.Hardness.Knoop` / `Source.Hardness.Knoop` | micro-hardness |
| `Measure.Hardness.Shore` / `Source.Hardness.Shore` | durometers, elastomer blocks |
| `Measure.Hardness.Leeb` | portable rebound testers |
| `Measure.Hardness.Barcol` | composites |

Note: hardness is a conventional scale, not an SI quantity — this needs a UOM decision
before taxons can be added.

### D.4 Flow & fluid mechanics — 1 taxon (`Source.MassFlowRate.Gas`)

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.MassFlowRate.Gas` | mass flow meters (see A.2) |
| `Measure.MassFlowRate.Liquid` / `Source.MassFlowRate.Liquid` | Coriolis meters, liquid provers |
| `Measure.VolumetricFlowRate.Gas` / `Source.VolumetricFlowRate.Gas` | rotameters, DFMs, gas provers |
| `Measure.VolumetricFlowRate.Liquid` / `Source.VolumetricFlowRate.Liquid` | turbine meters, syringe/infusion pumps |
| `Measure.Speed.Fluid` | anemometers, pitot tubes |
| `Measure.Viscosity.Dynamic` / `Measure.Viscosity.Kinematic` | viscometers (see class C) |
| `Measure.Volume.Liquid` / `Source.Volume.Liquid` | pipettes, burettes, prover tanks |
| `Measure.FlowRate.Leak.Gas` | leak standards, helium leak detectors |

### D.5 Ionizing radiation — **entire discipline absent**

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.Dose.Absorbed` / `Measure.DoseRate.Absorbed` | survey meters, ion chambers |
| `Measure.Dose.Equivalent` / `Measure.DoseRate.Equivalent` | dosimeters, area monitors |
| `Measure.Activity.Radionuclide` / `Source.Activity.Radionuclide` | dose calibrators, check sources |
| `Measure.Exposure.Radiation` | R-meters |
| `Measure.Fluence.Neutron` | neutron survey instruments |

### D.6 Chemical & analytical — 1 taxon (`Measure.Conductivity`)

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.pH` / `Source.pH` | pH meters, buffer standards |
| `Measure.Ratio.Concentration.Gas` / `Source.Ratio.Concentration.Gas` | O₂/CO/LEL detectors, span gas |
| `Measure.Ratio.Concentration.Liquid` | ion-selective electrodes |
| `Measure.Potential.Redox` | ORP meters |
| `Measure.Ratio.DissolvedOxygen` | DO meters |
| `Measure.Ratio.Turbidity` | turbidimeters |
| `Measure.Ratio.TotalDissolvedSolids` | TDS meters |
| `Measure.Ratio.MoistureContent` | moisture analyzers |
| `Measure.Ratio.Salinity` | salinity meters |

### D.7 Electrical — gaps inside the largest discipline

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.Power.DC`, `Measure.Power.AC.Sinewave` | power analyzers (see A.2) |
| `Measure.Energy.Electrical` / `Source.Energy.Electrical` | watt-hour meters |
| `Measure.Ratio.PowerFactor` / `Source.Ratio.PowerFactor` | power factor meters |
| `Measure.Phase.AC` / `Source.Phase.AC` | phase angle meters (only modulation phase exists today) |
| `Measure.Resistance.Insulation` / `Source.Resistance.Insulation` | megohmmeters, high-R standards |
| `Measure.Resistance.Bonding` | micro-ohmmeters, ground bond testers |
| `Measure.Current.Leakage` | electrical safety analyzers |
| `Measure.Voltage.Withstand` / `Source.Voltage.Withstand` | hipot testers |
| `Measure.Ratio.Distortion.Harmonic` / `Source.Ratio.Distortion.Harmonic` | THD analyzers |
| `Measure.Ratio.Power.NoiseFigure` | noise figure meters |
| `Measure.Ratio.SignalToNoise` | audio analyzers |
| `Measure.FluxDensity.Magnetic` / `Source.FluxDensity.Magnetic` | gaussmeters, Helmholtz coils |
| `Measure.FieldStrength.Electric` / `Source.FieldStrength.Electric` | EMC field probes |
| `Measure.FieldStrength.Magnetic` | EMC / magnetometry |
| `Measure.Temperature.Simulated.Thermistor` / `Source.Temperature.Simulated.Thermistor` | thermistor simulators (PRT/RTD/TC exist, thermistor does not) |

### D.8 Time & frequency — 4 taxons

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.Time.Interval` / `Source.Time.Interval` | universal counters, time interval standards |
| `Measure.Time.Delay` / `Source.Time.Delay` | delay lines, skew standards |
| `Measure.Time.Jitter` | jitter analyzers |
| `Measure.Ratio.Frequency.Offset` | frequency offset (ppm/ppb) vs. reference |
| `Measure.Ratio.Frequency.Stability` | Allan deviation, stability of standards |
| `Measure.Time.Difference.UTC` | GPS-disciplined oscillators, time servers |
| `Measure.Frequency.Duty` / `Source.Frequency.Duty` | duty cycle |

### D.9 Dimensional — 20 taxons, but GD&T only partly covered

Present form controls: flatness, parallelism, perpendicularity, roughness, roundness,
sphericity, straightness (axis + surface). Missing:

| Proposed taxon | Note |
|---|---|
| `Measure.Angle.Plane` / `Source.Angle.Plane` | angle blocks, rotary tables, autocollimators, levels (see class C) |
| `Measure.Length.Form.Cylindricity` | GD&T |
| `Measure.Length.Form.Concentricity` | GD&T |
| `Measure.Length.Form.Symmetry` | GD&T |
| `Measure.Length.Form.Runout` | circular & total runout |
| `Measure.Length.Form.Position` | true position |
| `Measure.Length.Form.Profile.Line` / `.Surface` | GD&T profile controls |
| `Measure.Length.Form.Angularity` | GD&T |
| `Measure.Length.Form.Taper` | tapers, gauges |
| `Measure.Length.Thickness` | coating/wall thickness, UT gauges |
| `Measure.Length.Pitch` | thread and gear pitch |
| `Measure.Length.Displacement` | LVDTs, probes, indicators |
| `Measure.Area` | area measurement |
| `Measure.Volume.Solid` | volumetric artifacts (see class C) |
| Missing `Source.*` for flatness, parallelism, roughness, straightness-axis | see A.1 |

### D.10 Vibration & mechanical — 6 taxons

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.Acceleration.Vibration` / `Measure.Acceleration.Shock` | see A.2 |
| `Measure.Speed.Vibration` / `Source.Speed.Vibration` | velocity pickups |
| `Measure.Length.Displacement.Vibration` / `Source.Length.Displacement.Vibration` | proximity probes, eddy-current sensors |
| `Measure.Ratio.Sensitivity.Accelerometer` | pC/g, mV/g calibration |
| `Measure.Speed.Rotational` / `Source.Speed.Rotational` | tachometers, strobes (see class C) |

### D.11 Pressure — 8 taxons

| Proposed taxon | Note |
|---|---|
| `Measure.Pressure.Hydraulic.Absolute.Static` | hydraulic absolute is absent |
| `Measure.Pressure.Hydraulic.Differential.Static` | see B.4 |
| `Measure.Pressure.Pneumatic.Differential.Static` | see B.4 |
| `Source.Pressure.Hydraulic.Differential.Static` | |
| `Measure.Pressure.Pneumatic.Gage.Dynamic` / `Source.…Dynamic` | transient/dynamic pressure, shock tubes |
| `Measure.Pressure.Pneumatic.Absolute.Dynamic` | |
| `Measure.Pressure.Vacuum` / `Source.Pressure.Vacuum` | vacuum gauges below the absolute-static range |

### D.12 Thermodynamics — 14 taxons

| Proposed taxon | Typical UUT |
|---|---|
| `Measure.Temperature.DewPoint` / `Source.Temperature.DewPoint` | chilled-mirror hygrometers |
| `Measure.Temperature.Simulated.Thermistor` / `Source.…` | see D.7 |
| `Measure.Ratio.Temperature.Uniformity` | chamber / furnace mapping (AMS2750, CQI-9) |
| `Measure.Ratio.Temperature.Stability` | chamber stability |
| `Measure.FlowRate.Heat` | heat flux sensors |
| `Measure.Conductivity.Thermal` | thermal conductivity |
| `Measure.Ratio.Humidity.Absolute` | absolute humidity |

### D.13 Mass & force — 20 taxons

| Proposed taxon | Note |
|---|---|
| `Measure.Mass.Apparent` | `Source.Mass.Apparent` is deprecated **with no replacement** (see §6) |
| `Measure.Force.Tension` / `Measure.Force.Compression` | load cells frequently accredited separately |
| `Source.Force.Tension` / `Source.Force.Compression` | |
| `Measure.Force.Impact` | impact testers |
| `Measure.Ratio.DensityMass.Specific` | specific gravity / API gravity |
| `Measure.MomentOfInertia.Mass` | inertia standards |

---

## 6. Class E — Metadata gaps in existing taxons

Not missing taxons, but defects that should be fixed in the same pass:

1. **Four taxons have an empty `<mtc:Discipline name="">`:**
   - `Measure.Charge.DC` → should be `Electrical`
   - `Source.MassFlowRate.Gas` → needs a `Flow` discipline (does not exist yet)
   - `Source.Mass.Apparent` → `Mass`
   - `Source.Ratio.Humidity` → `Thermodynamics`

2. **`Source.Mass.Apparent` is `deprecated="true"` with `replacement=""`** — the only
   deprecated taxon with no forward path. Every other deprecation maps cleanly.

3. **Discipline vocabulary is inconsistent:** `Vibration` (6 uses) and
   `Acoustics, ultrasound and vibration` (1 use) coexist. Pick one controlled list.

4. **`Measure.Impedance` / `Source.Impedance`** carry `impedance` as a result but
   impedance appears as a parameter in 24 taxons — worth confirming the magnitude/phase
   split is modeled the way the committee intends.

---

## 7. Summary & suggested priority

| Class | Proposed new taxons |
|---|---|
| A.1 — missing `Source.*` | 31 |
| A.2 — missing `Measure.*` | 16 |
| B — naming normalization | 9 (plus 3 deprecations) |
| C — orphan quantities | 8 |
| D — domain coverage | ~150 |
| **Total** | **~215** |

**Recommended sequencing:**

1. **Tier 1 — mechanical, no new science.** Classes A, B, C and all of §6. These are
   self-evident from the file, need no new UOM entries beyond existing aspects, and
   close the symmetry holes that make the catalog awkward to map a scope against.
2. **Tier 2 — high-demand disciplines with existing SI quantities.** D.4 (flow),
   D.7 (electrical), D.9 (dimensional/GD&T), D.11 (pressure), D.12 (thermodynamics),
   D.10 (vibration). All reuse quantities and m-layer aspects already referenced.
3. **Tier 3 — new disciplines requiring UOM/m-layer additions.** D.1 (optical),
   D.2 (acoustics), D.5 (ionizing radiation), D.6 (chemical). Each needs new
   `uom:Quantity` entries and m-layer aspect IDs before taxons can be written.
4. **Tier 4 — conventional-scale quantities.** D.3 (hardness). Requires a policy
   decision on representing non-SI conventional scales.

---

*Generated from an automated diff of the catalog XML plus a coverage review against
common ISO/IEC 17025 scopes. Classes A–C and §6 are verifiable against the file;
class D is a proposal for committee review.*
