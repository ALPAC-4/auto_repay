export interface Option {
  target_percent: number | string
  trigger_percent: number | string
  get_UST_option: string[]
}

export interface ReadableOption {
  targetPercent: number
  triggerPercent: number
  getUstOption: string[][]
}
