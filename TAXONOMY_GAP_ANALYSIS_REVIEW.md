# Critical Review — `TAXONOMY_GAP_ANALYSIS.md`

**Reviewer posture:** national-metrology-institute peer review
**Subject:** gap analysis of `MeasurandTaxonomyCatalog.xml` (144 taxons, 135 active)
**Verdict:** the report answers the wrong question, and several of its specific
recommendations are technically wrong. A subset of findings survives and is worth acting
on. Detail below.

---

## 1. Principal objection — the report counts names, not measurands

The report treats "missing taxon" as a naming-coverage problem. It is not. A taxon exists
to **define a measurand**: the quantity intended to be measured, together with the
conditions that must be fixed for the result to mean anything (VIM 3 §2.3). By that
standard the catalog's dominant defect is not breadth. It is that most existing taxons do
not define a measurand at all.

Measured against the file:

| Metric | Value |
|---|---|
| Active taxons | 135 |
| **Taxons with exactly one mandatory parameter** | **77 (57 %)** |
| Median mandatory-parameter count | **1** |

In 77 cases the single mandatory parameter is the quantity value itself. The taxon
therefore constrains nothing about how the measurement was made. Concrete examples:

- **`Measure.Current.AC`** — one parameter total, `Current`. **No frequency parameter
  exists at all, not even optional.** An AC current measurand without a stated frequency
  is not a measurand; it is a label. Two labs claiming this taxon may be describing
  measurements that are not comparable by an order of magnitude in uncertainty.
- **`Measure.Temperature`** — one parameter, `Temperature`. No medium (stirred bath / dry
  block / air / surface), no immersion depth, no sensor type. Immersion depth alone is
  worth more than most of the uncertainty budget in a comparison calibration.
- **`Source.Impedance`, `Source.Inductance`** — one parameter each, **no frequency
  parameter**. Inductance without frequency is undefined for any real component.
- **`Measure.Power.Ultrasonic`** — one parameter, no frequency.
- **`Measure.Length.Form.Parallelism`** — 11 parameters, of which exactly 1 is mandatory.
- **`Source.MassFlowRate.Gas`** — 18 parameters, of which exactly 1 is mandatory.

The report proposed adding roughly 215 taxons to this schema. Doing so propagates the
defect across a catalog 2.5× larger and makes it correspondingly harder to fix later.
**Depth before breadth.** The correct first work item is a mandatory-parameter audit of
the 77, not a name-expansion program.

## 2. The `Measure`/`Source` symmetry premise is unsound, and the report contradicts itself on it

Sources and measures are not duals. Whether a `Source.X` should exist is a fact about
whether calibration-grade stimulus generators for X exist — an instrumentation question,
not a property of the quantity. The report acknowledged this ("not every one of these
needs a source") and then counted all 47 asymmetries as "proposed new taxons" in the §7
summary table anyway. The caveat and the arithmetic contradict each other, and the
arithmetic is what a reader will quote.

Specific proposals that are category errors:

| Proposed | Why it is wrong |
|---|---|
| `Measure.Power.DC.Simulated`, `Measure.Power.AC.Sinewave.Simulated` | "Simulated" describes a *generation* technique — independent V and I outputs with no real power transfer (phantom power). Nothing measures simulated power. The dual of a simulated source is an ordinary power measurement. |
| `Measure.Voltage.Shorted` | `Source.Voltage.Shorted` is a zero-stimulus *condition* used to check meter offset. Its measure-side dual is `Measure.Voltage.DC` evaluated at zero, not a new taxon. |
| `Measure.Time.Marker`, `Measure.Time.Squarewave` | Measuring a time-mark generator's output is `Measure.Time` or `Measure.Frequency`. These add names without adding measurands. |
| `Measure.Temperature.FixedPoint.ITS90` | One does not *measure* a fixed point; one *realizes* it. The measurand at a fixed point is the resistance ratio W(T90) of the SPRT, which is a different thing entirely. Proposing this reveals a misreading of ITS-90. |

## 3. Class C ("orphan quantities") is oversold, and one row is simply wrong

The inference "quantity appears as a Parameter but never as a Result ⟹ missing taxon" was
presented as mechanical evidence. It does not carry that weight.

- **`speed` and `dynamic-viscosity` each appear exactly once** — both inside
  `Source.MassFlowRate.Gas`, where they are legitimate influence quantities on a gas flow
  computation. n = 1 is not a pattern. Tachometers and viscometers are genuine gaps, but
  the report reached that conclusion from domain knowledge and then dressed it in
  data-driven clothing. That is a methodological failure regardless of the conclusion
  being right.
- **`relative-humidity` should not be in the table.** RH is a dimensionless ratio and is
  correctly modeled with the `ratio` quantity on the Result. Listing it as an "orphan"
  implies a defect where the modeling is sound.
- **`volume`** — all 13 parameter uses are inside density taxons, where volume is a proper
  influence quantity. The volumetric-glassware gap is real, but again the cited evidence
  does not establish it.

Only **`plane-angle`** survives this test cleanly, and it survives strongly (see §7).

## 4. The discipline-vocabulary recommendation is backwards

The report observed `Vibration` (6 uses) coexisting with
`Acoustics, ultrasound and vibration` (1 use) and recommended normalizing onto a single
list — implicitly onto the majority term.

**"Acoustics, Ultrasound and Vibration" is the CIPM MRA metrology-area name (AUV).** The
single outlier is the *correct* entry; `Vibration` is the ad-hoc local coinage. The
recommendation, followed literally, would delete the one internationally-aligned label in
the file.

This error matters beyond the one line, because the correct framing reorganizes the entire
Class D. Against the CIPM MRA metrology areas, the catalog covers:

| CIPM MRA area | Catalog coverage |
|---|---|
| Electricity & Magnetism (EM) | heavy (62) — but magnetism absent entirely |
| Length (L) | moderate (20) |
| Mass & Related Quantities (M) | moderate (20); flow ≈ absent (1 taxon) |
| Thermometry (T) | moderate (14) |
| Time & Frequency (TF) | thin (4) |
| Acoustics, Ultrasound & Vibration (AUV) | thin (7) |
| **Photometry & Radiometry (PR)** | **absent** |
| **Ionizing Radiation (RI)** | **absent** |
| **Chemistry & Biology (QM)** | **1 taxon** |

That is a citable, falsifiable statement of coverage. "≈150 taxons enumerated from
memory" is not. The report should have anchored Class D to this framework from the start.

## 5. Internal contradiction: the report proposes re-adding a deliberately deprecated concept

§6 flags `Source.Mass.Apparent` as `deprecated="true"` with an empty `replacement` and
calls it "the only deprecated taxon with no forward path" — a defect. §D.13 then proposes
adding **`Measure.Mass.Apparent`**.

Both are wrong, for the same reason. Apparent mass is the superseded pre-OIML-D28 concept,
referenced against brass (8.4 g/cm³) or 8.0 g/cm³ depending on vintage. It is **not
convertible to conventional mass without knowing which density basis was used**. An empty
`replacement` is therefore the metrologically honest encoding: the concept was retired and
no safe automatic mapping exists. What the catalog is missing is a `<Definition>`
explaining that — not a replacement target, and certainly not a new `Measure` counterpart
resurrecting the obsolete concept.

## 6. Range confused with measurand

`Measure.Pressure.Vacuum` was proposed as a distinct taxon. Vacuum is not a measurand
distinct from absolute pressure; it is a *range* of absolute pressure. Ranges belong in the
CMC statement, not in the taxon name. Encoding range into taxonomy names produces
unbounded proliferation.

`Measure.Resistance.Insulation` survives the same test — but for a reason the report never
gave. It is legitimate not because the resistance is high, but because it is
**method-defined**: the result depends on applied test voltage and electrification time,
which are measurand-defining conditions. The report justified it as a range, which is the
wrong justification for a right answer.

## 7. Two substantive problems the report missed entirely

**7.1 Complex quantities are split across taxons, destroying correlation.**
`Measure.Phase.ReflectionFactor.RF` and `Measure.Ratio.Power.ReflectionFactor.RF` carry
*identical* parameter sets (Frequency, Power, Port, Bandwidth) and differ only in Result
(`Phase` vs `Magnitude`). Reflection coefficient Γ is complex. Magnitude and phase are
correlated, and any VNA CMC requires the covariance (or the real/imaginary formulation) to
propagate uncertainty correctly per JCGM 102 (GUM Supplement 2). Splitting Γ into two
independent taxons structurally discards that information. The same pattern applies to
transmission factor. This is more consequential than any missing name in the report.

**7.2 `optional` conflates two incompatible semantics.**
The schema offers only `optional="true|false"`. That single flag is being used for two
fundamentally different roles:

- **measurand-defining conditions** — change these and you are measuring a different thing
  (4-wire vs 2-wire; immersion depth; test voltage; frequency);
- **influence quantities** — change these and the *value and uncertainty* shift, but the
  measurand is the same (ambient temperature; humidity; line voltage).

Because the schema cannot distinguish them, no downstream consumer can auto-generate an
uncertainty budget, and no two labs' scope statements can be machine-verified as
describing the same measurand. That is precisely the interoperability purpose the taxonomy
exists to serve. This is a schema-level defect and it outranks the entire missing-taxon
list.

## 8. Plain data-quality defects the report walked past

It parsed the whole file and missed:

- **`Source.Pressure.Hydraulic.Static` has a parameter named `Presure`** — misspelled,
  single occurrence in the file. Any consumer keying on parameter names breaks here.
- **Two taxons have empty top-level `<Definition>`:** `Source.Power.RF.Sinewave` and
  `Source.Ratio.Power.RF.Sinewave.Delta.Power`.
- `Source.Mass.Apparent` has both a blank discipline *and* a blank definition — consistent
  with deliberate abandonment, which further undercuts §6 of the report.

## 9. Presentation defects

- **Fabricated precision.** §7 sums 31 + 16 + 9 + 8 with a hand-waved "≈150" and bolds
  "**≈215**". Three significant figures cannot be built on an unvalidated estimate that is
  70 % of the total.
- **No external validation.** Nothing is cross-referenced to accredited scopes, NIST
  SP 250, the CIPM MRA CMC database, or ILAC categories. Class D is unfalsifiable as
  written — it is a list of instruments the author could recall.
- **"★" ratings are undefined.** One and two stars appear with no stated criterion.

---

## 10. What survives review

These findings are sound and worth acting on:

1. **No angle taxon exists.** `plane-angle` appears as a parameter 9 times and as a Result
   zero times; there is no `Measure.Angle.Plane` or `Source.Angle.Plane`. Angle blocks,
   rotary tables, autocollimators, levels, clinometers, and index tables have no home in
   the catalog. This is the single strongest finding in the report and it was buried in a
   table in §4.
2. **`Measure.Power.DC` and `Measure.Power.AC.Sinewave` are absent** while both source
   forms exist. Wattmeters and power analyzers cannot be expressed.
3. **No source-side modulation taxons** — AM depth, FM deviation, FM/AM/ΦM rate. Every
   RF signal generator produces these and every one of them is calibrated.
4. **`Measure.Voltage.AC.Sinewave` is absent while `Measure.Current.AC.Sinewave` exists.**
   Clean, indefensible asymmetry.
5. **Thermistor simulation absent** while PRT, RTD, and thermocouple simulation all exist.
6. **Photometry & Radiometry, Ionizing Radiation, and Chemistry are absent as areas** —
   correct finding, wrong framing (see §4).
7. **Four taxons carry a blank `<Discipline>`.**

## 11. Recommended replacement work plan

The original report's four-tier plan should be discarded. Priority order:

1. **Fix the schema before the content.** Split `optional` into measurand-defining vs.
   influence semantics (§7.2), and decide how complex quantities are represented (§7.1).
   Everything else is built on this.
2. **Mandatory-parameter audit of the 77 under-specified taxons** (§1), starting with the
   ones where the omission is unambiguous: frequency on `Measure.Current.AC`,
   `Source.Impedance`, `Source.Inductance`, `Measure.Power.Ultrasonic`; medium and
   immersion on `Measure.Temperature`.
3. **Data-quality sweep** — the `Presure` typo, two empty definitions, four blank
   disciplines, and the discipline vocabulary normalized onto CIPM MRA area names (§4).
4. **Then** add taxons, beginning with the seven surviving findings in §10 and validated
   against actual accredited scopes rather than recall.

---

*This review supersedes the priority ranking in `TAXONOMY_GAP_ANALYSIS.md` §7. The
enumerated lists in that document remain useful as raw candidate material, but the counts,
the summary table, and the tier sequencing should not be cited.*
