import { Anchor } from 'addressProvider'
import { getTokenBalance, getAustExchangeRate } from 'api'
import { Repay } from 'terra/autoRepay'

export async function getUstFromAust(
  autoRepay: Repay,
  insufficientUST: number
): Promise<boolean | void> {
  const address = autoRepay.wallet.key.accAddress
  const aUstBalane = await getTokenBalance(address, Anchor.aUST).catch()
  const aUstExchangeRate = await getAustExchangeRate().catch()
  let isFilled = false
  if (!aUstBalane || !aUstExchangeRate) return

  const withdrawableValue = aUstExchangeRate * aUstBalane

  let aUstAmount = 0

  if (insufficientUST > withdrawableValue) {
    aUstAmount = aUstBalane
  } else {
    aUstAmount = Math.floor(insufficientUST / aUstExchangeRate)
    isFilled = true
  }

  if (aUstAmount != 0) {
    await autoRepay.withdrawAust(aUstAmount)
  }

  console.log(isFilled)

  return isFilled
}
