import { getMassetLpStakingAmount, getTokenBalance, ustPerLP } from 'api'
import { Repay } from 'terra/autoRepay'
import { AssetData, RewardInfo } from 'types'

export async function getUstFromMirrorRelativeLp(
  autoReapy: Repay,
  insufficientUST: number,
  symbol: string,
  assetsData: AssetData[],
  mirrorStakingState: RewardInfo[]
): Promise<boolean | void> {
  const address = autoReapy.wallet.key.accAddress
  const stakedAmount = await getMassetLpStakingAmount(
    symbol,
    assetsData,
    mirrorStakingState
  ).catch()
  const lpTokenBalance = await getTokenBalance(
    address,
    getAssetInfoFromSymbol(assetsData, symbol).lpToken
  ).catch()
  const ustPerLpToken = await ustPerLP(getAssetInfoFromSymbol(assetsData, symbol).pair)
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

  await autoReapy.withdrawMassetLp(
    unstakeAmount,
    withdrawAmount,
    getAssetInfoFromSymbol(assetsData, symbol)
  )

  return isFilled
}

function getAssetInfoFromSymbol(assetsData: AssetData[], symbol: string) {
  return assetsData.filter((e) => e.symbol == symbol)[0]
}
