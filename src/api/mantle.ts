import { GraphQLClient, gql } from 'graphql-request'

interface Balance {
  amount: string
  denom: string
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
  query = JSON.parse(query)
  const res = await mantle
    .request(
      gql`
        query ($contractAddr: String!, $query: JSON!) {
          wasm{
            contractQuery(contractAddress: $address, query: $query) 
          }
        }
      `,
      {
        contractAddr,
        query,
      }
    )
 

  if (!res?.wasm?.contractQuery) return undefined
  return JSON.parse(res.wasm.contractQuery)
}

export async function getNativeBalance(address: string, token: string): Promise<number | void> {
  const res = await mantle
    .request(
      gql`
        query ($address: String!) {
          bank{
            balance(address: $address"){
              denom
              amount
            }
          }
        }
      `,
      {
        address,
      }
    )


  if (!res?.bank?.balance) return
  const tokenBalance = res.bank.balance.filter((e: Balance) => e.denom == token)
  return tokenBalance[0] ? Number(tokenBalance[0].Amount) : 0
}

export async function getLatestBlock(): Promise<number> {
  const response = await mantle.request(
    gql`
      {
        tendermint {
          blockInfo {
            block {
              header {
                height
              }
            }
          }
        }
      }
    `
  )
  return Number(response?.tendermint?.blockInfo?.block?.header?.height)
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
          treasury{
            taxCap(denom: uusd) {
              Result
            }
          }
        }
      `
    )

  return Number(res?.treasury?.taxCap?.amount)
}
