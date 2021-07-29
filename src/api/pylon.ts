import { getContractStore } from 'api'
import { Pylon } from 'addressProvider'

export async function getMineLpStakingAmount(address: string): Promise<number | void> {
  const query = `
    {
      "staker_info": {
        "staker": "${address}"
      }
    }
  `
  const staking = await getContractStore(Pylon.MINE_LP_staking, query).catch()
  if (!staking) return undefined
  return Number(staking.bond_amount)
}
