import { DefaultValue } from 'recoil';

export default (key: string) => ({ setSelf, onSet }) => {
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
    isReset
      ? localStorage.removeItem(key)
      : localStorage.setItem(key, JSON.stringify(newValue));
  })
}