import { Pylon } from 'addressProvider'
import { getMineLpStakingAmount, getTokenBalance, ustPerLP } from 'api'
import { Repay } from 'terra/autoRepay'

export async function getUstFromMineLp(
  autoReapy: Repay,
  insufficientUST: number
): Promise<boolean | void> {
  const address = autoReapy.wallet.key.accAddress
  const stakedAmount = await getMineLpStakingAmount(address)
  const lpTokenBalance = await getTokenBalance(address, Pylon.MINE_UST_LP)
  const ustPerLpToken = await ustPerLP(Pylon.MINE_UST_pair)
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

  await autoReapy.withdrawMineLp(unstakeAmount, withdrawAmount)

  return isFilled
}
