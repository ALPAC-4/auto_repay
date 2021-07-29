export interface TokenBalance {
  balance: string
}

export interface AUstExchangeRate {
  anc_emission_rate: string
  global_intersest_index: string
  last_intersest_updated: number
  last_reward_updated: number
  prev_aterra_supply: string
  prev_exchange_rate: string
  total_liabilities: string
  total_reserve: string
}

export interface AncLpStakedAmount {
  bond_amount: string
  pending_reward: string
  reward_index: string
  staker: string
}

export interface BorrowLimit {
  borrow_limit: string
  borrower: string
}

export interface BorrowAmount {
  borrower: string
  interset_index: string
  loan_amount: string
  pending_rewards: string
  reward_index: string
}

export interface Pool {
  assets: Asset[]
}

export interface RewardInfo {
  asset_token: string
  bond_amount: string
  is_short: boolean
  pending_reward: string
}

interface Asset {
  amount: string
  info: NativeInfo | NonNativeInfo
}

interface NativeInfo {
  native_token: {
    denom: string
  }
}

interface NonNativeInfo {
  token: {
    contract_addr: string
  }
}
