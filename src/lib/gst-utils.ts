const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function convertBelowThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];
  if (n < 100) {
    const t = tens[Math.floor(n / 10)];
    const o = ones[n % 10];
    return o ? `${t} ${o}` : t;
  }
  const h = ones[Math.floor(n / 100)] + " Hundred";
  const rem = n % 100;
  return rem ? `${h} and ${convertBelowThousand(rem)}` : h;
}

export function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let words = "";

  if (rupees >= 10000000) {
    words += convertBelowThousand(Math.floor(rupees / 10000000)) + " Crore ";
  }
  const afterCrore = rupees % 10000000;
  if (afterCrore >= 100000) {
    words += convertBelowThousand(Math.floor(afterCrore / 100000)) + " Lakh ";
  }
  const afterLakh = afterCrore % 100000;
  if (afterLakh >= 1000) {
    words += convertBelowThousand(Math.floor(afterLakh / 1000)) + " Thousand ";
  }
  const afterThousand = afterLakh % 1000;
  if (afterThousand > 0) {
    words += convertBelowThousand(afterThousand);
  }

  words = words.trim() + " Rupees";

  if (paise > 0) {
    words += " and " + convertBelowThousand(paise) + " Paise";
  }

  return words + " Only";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function validateGSTIN(gstin: string): boolean {
  if (!gstin || gstin.length !== 15) return false;
  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return pattern.test(gstin.toUpperCase());
}

export function getStateCodeFromGSTIN(gstin: string): string {
  if (!gstin || gstin.length < 2) return "";
  return gstin.substring(0, 2);
}

export function isInterState(sellerStateCode: string, buyerStateCode: string): boolean {
  return sellerStateCode !== buyerStateCode;
}

export function calculateGST(
  subtotal: number,
  gstRate: number,
  isInterStateSupply: boolean
): { cgst: number; sgst: number; igst: number; totalTax: number } {
  const taxAmount = (subtotal * gstRate) / 100;
  if (isInterStateSupply) {
    return { cgst: 0, sgst: 0, igst: taxAmount, totalTax: taxAmount };
  }
  return {
    cgst: taxAmount / 2,
    sgst: taxAmount / 2,
    igst: 0,
    totalTax: taxAmount,
  };
}
