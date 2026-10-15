// OnBuy commission rates. Never hardcode these elsewhere.
//
// STATUS: UNVERIFIED. OnBuy's own fee page was not reachable (HTTP 403) when
// this was written. Figures come from the M2E Pro integration docs
// (https://docs-m2.m2epro.com/docs/onbuy-seller-fees/, "current as of
// November 7, 2025"). Other third-party sources disagree (some quote 5-9%),
// so check the Seller Centre / OnBuy fee page and update before launch.
//
// Assumptions to confirm: (1) banded rates apply marginally (the first band
// at its rate, only the part above the threshold at the next rate), not to the
// whole price; (2) commission is charged on price + delivery, VAT included.

export const FEES_LAST_VERIFIED = "unverified (source dated 2025-11-07)";

/** A band covers prices up to `upToPence` (inclusive); the last band has no limit. */
export type CommissionBand = {
  upToPence: number | null;
  rateBps: number; // basis points: 1500 = 15%
};

export type CommissionRule = {
  label: string;
  bands: CommissionBand[];
  minFeePence: number;
};

const MIN_FEE_PENCE = 25;

export const COMMISSION_RULES = {
  standard: {
    label: "Most categories",
    bands: [{ upToPence: null, rateBps: 1500 }],
    minFeePence: MIN_FEE_PENCE,
  },
  consumerElectronics: {
    label: "Consumer electronics / large appliances",
    bands: [{ upToPence: null, rateBps: 700 }],
    minFeePence: MIN_FEE_PENCE,
  },
  jewellery: {
    label: "Jewellery",
    bands: [
      { upToPence: 22500, rateBps: 2000 },
      { upToPence: null, rateBps: 2000 }, // above £225: not confirmed, kept at 20%
    ],
    minFeePence: MIN_FEE_PENCE,
  },
  healthBabyFood: {
    label: "Health & beauty / baby & toddler / food & drink",
    bands: [
      { upToPence: 1000, rateBps: 800 },
      { upToPence: null, rateBps: 1500 },
    ],
    minFeePence: MIN_FEE_PENCE,
  },
} as const satisfies Record<string, CommissionRule>;

export type CommissionRuleKey = keyof typeof COMMISSION_RULES;

export const DEFAULT_VAT_RATE_BPS = 2000; // UK standard rate 20%
