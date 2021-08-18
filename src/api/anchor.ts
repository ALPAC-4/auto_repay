import { getContractStore, getLatestBlock } from './mantle'
import { Anchor } from 'addressProvider'
import { delay } from 'bluebird'

export async function getAustExchangeRate(): Promise<number | void> {
  const query = '{"state":{}}'
  const state = await getContractStore(Anchor.market, query)
  if (!state) return
  return Number(state.prev_exchange_rate)
}

export async function getAncLpStakingAmount(address: string): Promise<number | void> {
  const query = `
    {
      "staker_info": {
        "staker": "${address}"
      }
    }
  `
  const staking = await getContractStore(Anchor.ANC_LP_staking, query)
  if (!staking) return undefined
  return Number(staking.bond_amount)
}

export async function getBorrowLimit(address: string): Promise<number | void> {
  const query = `
    {
      "borrow_limit": {
        "borrower": "${address}"
      }
    }
  `
  const borrow_limit = await getContractStore(Anchor.overseer, query)
  if (!borrow_limit) return
  return Number(borrow_limit?.borrow_limit)
}

export async function getLoanAmount(address: string): Promise<number | void> {
  let height = undefined

  while (!height) {
    height = await getLatestBlock()
    await delay(1000)
  }

  const query = `
    {
      "borrower_info": {
        "borrower": "${address}",
        "block_height": ${height}
      }
    }
  `
  const loanAmount = await getContractStore(Anchor.market, query)
  if (!loanAmount) return
  return Number(loanAmount?.loan_amount)
}
