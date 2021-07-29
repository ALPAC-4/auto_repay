export function decimalFormating(number: number, fixed = 2): string {
  return (number / 1e6).toFixed(fixed)
}

export function percentToNumber(percent: string | number): number {
  if (typeof percent == 'string' && /%$/.exec(percent)) {
    return Number(percent.slice(0, percent.length - 1)) / 100
  } else {
    return Number(percent)
  }
}

export function getRepayAmount(
  targetPercent: number,
  nowPercent: number,
  loanAmount: number
): number {
  return Math.floor(((nowPercent - targetPercent) / nowPercent) * loanAmount)
}
