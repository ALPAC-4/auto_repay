import { StdFee } from '@terra-money/terra.js'

export function feeGenerator(gas: number, amount: number): StdFee {
  const amountStr = amount.toString() + 'uusd'
  const fee = new StdFee(gas, amountStr)
  return fee
}
