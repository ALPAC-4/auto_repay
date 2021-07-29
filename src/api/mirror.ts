import { AssetData, RewardInfo } from 'types'
import { Mirror } from 'addressProvider'
import { getContractStore } from './mantle'

export async function getMirrorStakingState(address: string): Promise<RewardInfo[] | void> {
  const query = `
    {
      "reward_info": {
        "staker_addr": "${address}"
      }
    }
  `
  const MirrorSatkingState = await getContractStore(Mirror.MIR_LP_staking, query).catch()
  if (!MirrorSatkingState?.reward_infos) return
  return MirrorSatkingState.reward_infos
}

export async function getMassetLpStakingAmount(
  assetSymbol: string,
  mAssetsData: AssetData[],
  mirrorStakingState: RewardInfo[]
): Promise<number | void> {
  const assetRelativeAddresses = mAssetsData.filter((e) => e.symbol == assetSymbol)[0]
  const assetLpState = mirrorStakingState.filter(
    (e) => e.asset_token == assetRelativeAddresses.token && e.is_short == false
  )[0]

  return assetLpState?.bond_amount ? Number(assetLpState.bond_amount) : 0
}
