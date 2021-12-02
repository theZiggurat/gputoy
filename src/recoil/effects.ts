import { DefaultValue } from 'recoil';

export var SKIP_STORAGE = false
export const setSkipStorage = (skip: boolean) => SKIP_STORAGE = skip

const localStorageEffect = (key: string) => ({setSelf, onSet}) => {
  setSelf(() => {
    if (typeof window === 'undefined')
      return new DefaultValue()
    const localStorage = window.localStorage
    const val = localStorage.getItem(key)
    return val != null
        ? JSON.parse(val as string)
        : new DefaultValue()
  })

  onSet((newValue, _, isReset) => {
    if (SKIP_STORAGE) return
    isReset
      ? localStorage.removeItem(key)
      : localStorage.setItem(key, JSON.stringify(newValue));
  })
}

export const consoleLogEffect = (key: string) => ({setSelf, onSet}) => {

  setSelf(() => new DefaultValue)

  onSet((newValue, _, isReset) => {
    isReset
      ? console.log(key, 'Reset')
      : console.log(key, 'set to', newValue)
  })
}


export default localStorageEffect