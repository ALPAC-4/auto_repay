import { delay } from 'bluebird'
import { Repay } from 'terra/autoRepay'
import { getUstFromAnchorLp } from './anchor'
import { getUstFromMineLp } from './pylon'
import { getUstFromAust } from './aUST'
import { getUstFromMirrorRelativeLp } from './mirror'
import { AssetData, RewardInfo } from 'types'
import { getNativeBalance } from 'api'

export async function getUST(
  option: string[],
  insufficientUST: number,
  autoReapy: Repay,
  assetsData: AssetData[],
  mirrorStakingState: RewardInfo[]
): Promise<void | boolean> {
  if (option[0] == 'aUST') {
    return await getUstFromAust(autoReapy, insufficientUST)
  } else if (option[0] == 'LP') {
    if (option[1] == 'ANC') {
      return await getUstFromAnchorLp(autoReapy, insufficientUST)
    } else if (option[1] == 'MINE') {
      return await getUstFromMineLp(autoReapy, insufficientUST)
    } else {
      return await getUstFromMirrorRelativeLp(
        autoReapy,
        insufficientUST,
        option[1],
        assetsData,
        mirrorStakingState
      )
    }
  }
  return
}

export async function getProcess(
  options: string[][],
  insufficientUST: number,
  autoRepay: Repay,
  assetsData: AssetData[],
  mirrorStakingState: RewardInfo[]
): Promise<void> {
  for (const option of options) {
    let balanceGetted = false
    let ustBalance = 0
    while (!balanceGetted) {
      const gettedUstBalance = await getNativeBalance(
        autoRepay.wallet.key.accAddress,
        'uusd'
      )

      if (gettedUstBalance) {
        ustBalance = gettedUstBalance
        balanceGetted = true
      }
      await delay(1000)
    }

    const isFilled = await getUST(
      option,
      insufficientUST - ustBalance,
      autoRepay,
      assetsData,
      mirrorStakingState
    )
    if (isFilled) return
  }
}
