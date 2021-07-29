import { AssetData, Option, ReadableOption } from 'types'
import { percentToNumber } from './number'

export function optionCheck(assetsData: AssetData[], options: Option): void | ReadableOption {
  const lpList = []
  for (const asset of assetsData) {
    lpList.push(asset.symbol)
  }
  lpList.push('ANC')
  lpList.push('MINE')
  const triggerPercent = percentToNumber(options.trigger_percent)
  const targetPercent = percentToNumber(options.target_percent)

  let temp_option
  const temp_array = []
  for (const option of options.get_UST_option) {
    if (option.search(/aUST/i) != -1) {
      temp_option = ['aUST']
    } else if (option.search(/LP/i) != -1) {
      temp_option = ['LP']
      for (const token of lpList) {
        if (option.search(RegExp(token, 'i')) != -1) {
          temp_option.push(token)
          break
        }
      }
      if (temp_option.length == 1) {
        console.log(option + ' is not available option')
        console.log('Avaliable LP list: ' + lpList)
        return
      }
    } else {
      console.log(option + ' is not available option')
      return
    }
    temp_array.push(temp_option)
  }

  const getUstOption = temp_array

  if (triggerPercent > 0.95 || triggerPercent < 0.6) {
    console.log('Allowed trigger_percent range is 0.6(60%)<= trigger_percent <= 0.95(95%)')
    return
  }

  if (targetPercent >= triggerPercent) {
    console.log('target_percent must be less than trigger_percent')
    return
  } else if (targetPercent < 0) {
    console.log('target_percent must be equal or greater than 0')
    return
  }

  return {
    triggerPercent,
    targetPercent,
    getUstOption,
  }
}
