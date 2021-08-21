import { Anchor } from 'addressProvider'
import { getAncLpStakingAmount, getTokenBalance, ustPerLP } from 'api'
import { Repay } from 'terra/autoRepay'

export async function getUstFromAnchorLp(
  autoReapy: Repay,
  insufficientUST: number
): Promise<boolean | void> {
  const address = autoReapy.wallet.key.accAddress
  const stakedAmount = await getAncLpStakingAmount(address)
  const lpTokenBalance = await getTokenBalance(address, Anchor.ANC_UST_LP)
  const ustPerLpToken = await ustPerLP(Anchor.ANC_UST_pair)
  console.log(stakedAmount, lpTokenBalance, ustPerLpToken)
  if (stakedAmount == undefined || lpTokenBalance == undefined || ustPerLpToken == undefined) return

  const lpNeeded = Math.floor(insufficientUST / ustPerLpToken)
  let unstakeAmount = 0
  let withdrawAmount = 0
  let isFilled = false

  if (insufficientUST > (stakedAmount + lpTokenBalance) * ustPerLpToken) {
    unstakeAmount = stakedAmount
    withdrawAmount = lpTokenBalance + stakedAmount
  } else if (lpTokenBalance * ustPerLpToken > insufficientUST) {
    withdrawAmount = lpNeeded
    isFilled = true
  } else {
    unstakeAmount = lpNeeded - lpTokenBalance
    withdrawAmount = lpNeeded
    isFilled = true
  }

  await autoReapy.withdrawAncLp(unstakeAmount, withdrawAmount)

  return isFilled
}
