import {
  getBorrowLimit,
  getLoanAmount,
  getMassetInfo,
  getMirrorStakingState,
  getNativeBalance,
  initMantle,
  initMirror,
} from 'api'
import { delay } from 'bluebird'
import fs from 'fs'
import { getProcess } from 'gettingUstProcess/process'
import moment from 'moment'
import { Repay } from 'terra/autoRepay'
import { getRepayAmount, optionCheck } from 'utils'

async function main() {
  initMirror('https://graph.mirror.finance/graphql')
  initMantle('https://hive.terra.dev/graphql')

  const option = JSON.parse(fs.readFileSync('option.txt').toString())
  let getted = false
  let assetsData
  while (!getted) {
    assetsData = await getMassetInfo()
    if (assetsData != undefined) getted = true
    await delay(1000)
  }
  if (!assetsData) return

  const readableOption = optionCheck(assetsData, option)
  if (!readableOption) return

  const autoReapy = new Repay()
  const myAddr = autoReapy.wallet.key.accAddress

  let ustBalance = await getUstBalance(myAddr)
  if (ustBalance <= 1e6) {
    console.log('You must have at least 1 UST')
    return
  }

  while (true) {
    const state = await updateState(myAddr).catch()
    const mirrorStakingState = await getMirrorStakingState(myAddr).catch()
    const nowPercent = state?.percentNow
    const loanAmount = state?.loanAmount
    if (
      mirrorStakingState &&
      nowPercent &&
      loanAmount &&
      nowPercent > readableOption.triggerPercent
    ) {
      ustBalance = await getUstBalance(myAddr)
      const neededAmount = getRepayAmount(readableOption.targetPercent, nowPercent, loanAmount)
      if (ustBalance < neededAmount + 5e6) {
        await getProcess(
          readableOption.getUstOption,
          neededAmount,
          autoReapy,
          assetsData,
          mirrorStakingState
        )
      }

      ustBalance = await getUstBalance(myAddr)
      const reapyAmount = Math.min(ustBalance - 5e6, neededAmount)
      if (reapyAmount > 5e6) {
        autoReapy.repay(reapyAmount)
      }
    }

    await delay(20000)
  }
}

async function updateState(myAddr: string) {
  const borrowLimit = await getBorrowLimit(myAddr)
  const loanAmount = await getLoanAmount(myAddr)
  if (!borrowLimit || !loanAmount) return
  const percentNow = loanAmount / borrowLimit

  console.log(moment().format('YYYY-MM-DD hh:mm:ss A'))
  console.log('Up to borrow limit: ' + (percentNow * 100).toFixed(2) + '%\n')

  return { percentNow, loanAmount }
}

async function getUstBalance(addr: string) {
  while (true) {
    const ustBalance = await getNativeBalance(addr, 'uusd')
    if (ustBalance) return ustBalance
    await delay(1000)
  }
}

main()
