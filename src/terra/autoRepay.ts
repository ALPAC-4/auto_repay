import {
  MnemonicKey,
  LCDClient,
  MsgExecuteContract,
  Wallet,
  Coin,
  Coins,
  StdFee,
} from '@terra-money/terra.js'
import { delay } from 'bluebird'
import dotenv from 'dotenv'
import { decimalFormating } from 'utils'
import { Anchor, Mirror, Pylon } from 'addressProvider'
import { feeGenerator } from './feeGenerator'
import { taxCap } from 'api'
import { AssetData } from 'types'

dotenv.config()

const MNEMONIC = process.env.MNEMONIC != '' ? process.env.MNEMONIC : process.argv[2]

export class Repay {
  wallet: Wallet
  lcd: LCDClient

  constructor() {
    const key = new MnemonicKey({
      mnemonic: MNEMONIC,
    })
    const lcd = new LCDClient({
      URL: 'https://lcd.terra.dev',
      chainID: 'columbus-4',
    })

    this.wallet = new Wallet(lcd, key)
    this.lcd = lcd
  }

  async execute(msgs: Array<MsgExecuteContract>, fee: StdFee): Promise<void> {
    try {
      const tx = await this.wallet.createAndSignTx({ msgs, fee })
      const result = await this.wallet.lcd.tx.broadcastSync(tx)
      const isFound = await this.pollingTx(result.txhash)
      if (isFound) {
        console.log('Transaction Completed \n')
      } else {
        console.log('Transaction Failed, skip transaction \n')
      }
    } catch (err) {
      console.log('Transaction Failed \n')
      console.log(err)
    }
  }

  async pollingTx(txHash: string): Promise<boolean> {
    let isFound = false
    let count = 0

    //if txHash is not valid escape in 5 times
    while (!isFound && count < 5) {
      try {
        await this.wallet.lcd.tx.txInfo(txHash)
        isFound = true
      } catch (err) {
        await delay(3000)
        count += 1
      }
    }

    return isFound
  }

  async repay(amount: number): Promise<void> {
    console.log('Repaying ' + decimalFormating(amount) + 'UST ...')
    const coin = new Coin('uusd', amount)
    const coins = new Coins([coin])
    let tax
    let getted = false
    while (!getted) {
      tax = await taxCap()
      if (tax) getted = true
      await delay(1000)
    }

    if (!tax) return

    const fee = feeGenerator(1000000, tax + 762000)

    const repay = new MsgExecuteContract(
      this.wallet.key.accAddress,
      Anchor.market,
      {
        repay_stable: {},
      },
      coins
    )

    await this.execute([repay], fee)
  }

  async withdrawAust(amount: number): Promise<void> {
    console.log('Withdrawing ' + decimalFormating(amount) + 'aUST ...')

    const fee = feeGenerator(1000000, 762000)
    const withdraw = new MsgExecuteContract(
      this.wallet.key.accAddress,
      Anchor.aUST,
      {
        send: {
          contract: Anchor.market,
          amount: amount.toString(),
          msg: 'eyJyZWRlZW1fc3RhYmxlIjp7fX0=',
        },
      },
      new Coins()
    )

    await this.execute([withdraw], fee)
  }

  async withdrawAncLp(unstakeAmount: number, withdrawAmount: number): Promise<void> {
    console.log('Withdrawing ANC-UST LP Tokens ...')
    const fee = feeGenerator(1000000, 762000)

    const unstake = new MsgExecuteContract(
      this.wallet.key.accAddress,
      Anchor.ANC_LP_staking,
      {
        unbond: {
          amount: unstakeAmount.toString(),
        },
      },
      new Coins()
    )

    const withdraw = new MsgExecuteContract(
      this.wallet.key.accAddress,
      Anchor.ANC_UST_LP,
      {
        send: {
          contract: Anchor.ANC_UST_pair,
          amount: withdrawAmount.toString(),
          msg: 'eyJ3aXRoZHJhd19saXF1aWRpdHkiOnt9fQ==',
        },
      },
      new Coins()
    )

    await this.execute([unstake, withdraw], fee)
  }

  async withdrawMassetLp(
    unstakeAmount: number,
    withdrawAmount: number,
    tokenInfo: AssetData
  ): Promise<void> {
    console.log('Withdrawing ' + tokenInfo.symbol + '-UST LP ...')
    const fee = feeGenerator(1000000, 762000)

    const unstake = new MsgExecuteContract(
      this.wallet.key.accAddress,
      Mirror.MIR_LP_staking,
      {
        unbond: {
          asset_token: tokenInfo.token,
          amount: unstakeAmount.toString(),
        },
      },
      new Coins()
    )

    const withdraw = new MsgExecuteContract(
      this.wallet.key.accAddress,
      tokenInfo.lpToken,
      {
        send: {
          contract: tokenInfo.pair,
          amount: withdrawAmount.toString(),
          msg: 'eyJ3aXRoZHJhd19saXF1aWRpdHkiOnt9fQ',
        },
      },
      new Coins()
    )

    await this.execute([unstake, withdraw], fee)
  }

  async withdrawMineLp(unstakeAmount: number, withdrawAmount: number): Promise<void> {
    console.log('Withdrawing MINE-UST LP Tokens ...')
    const fee = feeGenerator(1000000, 762000)

    const unstake = new MsgExecuteContract(
      this.wallet.key.accAddress,
      Pylon.MINE_LP_staking,
      {
        unbond: {
          amount: unstakeAmount.toString(),
        },
      },
      new Coins()
    )

    const withdraw = new MsgExecuteContract(
      this.wallet.key.accAddress,
      Pylon.MINE_UST_LP,
      {
        send: {
          contract: Pylon.MINE_UST_pair,
          amount: withdrawAmount.toString(),
          msg: 'eyJ3aXRoZHJhd19saXF1aWRpdHkiOnt9fQ==',
        },
      },
      new Coins()
    )

    await this.execute([unstake, withdraw], fee)
  }
}
