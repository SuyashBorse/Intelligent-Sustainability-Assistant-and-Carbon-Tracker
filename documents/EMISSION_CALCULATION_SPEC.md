# Emission Calculation Specification

## Core Formula
`CO₂e (kg) = activity quantity × emission factor`

## Design Rules
- Centralize factors.
- Do not duplicate factors across modules.
- Store the factor ID used by every activity.
- Preserve historical calculation snapshots.
- Validate quantity and units before calculating.
- Reject negative quantities unless a future feature explicitly supports them.

## TypeScript Model
```typescript
interface EmissionResult {
  category: string;
  activity: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  co2eKg: number;
  emissionFactorId: string;
}
```

## Example
```text
25 km × 0.21 kg CO₂e/km = 5.25 kg CO₂e
```

The numerical factor above is illustrative only. Production factors must be sourced, documented, and regionally appropriate.

## Factor Metadata
Store:
- source
- region
- validity period
- unit
- active status

## User Messaging
Use:
- Estimated CO₂e
- Estimated impact
- Based on selected emission factors

Never imply perfect measurement accuracy.
