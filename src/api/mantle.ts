import { GraphQLClient, gql } from 'graphql-request'

interface Balance {
  Amount: string
  Denom: string
}

export let mantle: GraphQLClient

export function initMantle(URL: string): GraphQLClient {
  mantle = new GraphQLClient(URL, {
    timeout: 60000,
    keepalive: true,
  })
  return mantle
}

export async function getContractStore(contractAddr: string, query: string): Promise<any | void> {
  const res = await mantle
    .request(
      gql`
        query ($contractAddr: String!, $query: String!) {
          WasmContractsContractAddressStore(ContractAddress: $contractAddr, QueryMsg: $query) {
            Height
            Result
          }
        }
      `,
      {
        contractAddr,
        query,
      }
    )
 

  if (!res?.WasmContractsContractAddressStore?.Result) return undefined
  return JSON.parse(res.WasmContractsContractAddressStore.Result)
}

export async function getNativeBalance(address: string, token: string): Promise<number | void> {
  const res = await mantle
    .request(
      gql`
        query ($address: String!) {
          BankBalancesAddress(Address: $address) {
            Height
            Result {
              Amount
              Denom
            }
          }
        }
      `,
      {
        address,
      }
    )


  if (!res?.BankBalancesAddress?.Result) return
  const tokenBalance = res.BankBalancesAddress.Result.filter((e: Balance) => e.Denom == token)
  return tokenBalance[0] ? Number(tokenBalance[0].Amount) : 0
}

export async function getLatestBlock(): Promise<number | void> {
  const response = await mantle
    .request(
      gql`
        {
          LastSyncedHeight
        }
      `
    )

  return response?.LastSyncedHeight
}

export async function getTokenBalance(address: string, token: string): Promise<number | void> {
  const query = `
    {
      "balance": {
        "address": "${address}"
      }
    }
  `
  const balance = await getContractStore(token, query)
  if (!balance) return

  return Number(balance?.balance)
}

export async function ustPerLP(pairAddress: string): Promise<number | void> {
  const query = '{"pool":{}}'
  const pool = await getContractStore(pairAddress, query)
  if (!pool) return

  let ustAmount
  for (const i of pool.assets) {
    if (i.info.native_token) ustAmount = Number(i.amount)
  }
  if (!ustAmount) return

  const totalShare = Number(pool.total_share)

  return ustAmount / totalShare
}

export async function taxCap(): Promise<number | void> {
  const res = await mantle
    .request(
      gql`
        {
          TreasuryTaxCapDenom(Denom: "uusd") {
            Result
          }
        }
      `
    )

  return Number(res?.TreasuryTaxCapDenom?.Result)
}
