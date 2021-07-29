import { GraphQLClient, gql } from 'graphql-request'
import { AssetData } from 'types/mirrorGraphResponse'

export let mirror: GraphQLClient

export function initMirror(URL: string): GraphQLClient {
  mirror = new GraphQLClient(URL, {
    timeout: 60000,
    keepalive: true,
  })
  return mirror
}

export async function getMassetInfo(): Promise<AssetData[] | void> {
  const res = await mirror.request(
    gql`
      {
        assets {
          symbol
          token
          pair
          lpToken
        }
      }
    `
  )

  return res?.assets
}
