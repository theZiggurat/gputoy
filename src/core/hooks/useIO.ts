import { projectIOKeys, projectIOProvider } from "@core/recoil/atoms/io"
import { IOChannel } from "@core/types"
import { useEffect } from "react"
import { useRecoilState, useResetRecoilState, useSetRecoilState } from "recoil"

const useChannel = (id: string, channel: IOChannel) => {

  const [ioState, setIOState] = useRecoilState(projectIOProvider(id))
  const resetIOState = useResetRecoilState(projectIOProvider(id))
  const setIOKeys = useSetRecoilState(projectIOKeys)

  useEffect(() => {
    setIOState(channel)
    setIOKeys(prev => {
      if (prev.includes(id)) {
        return prev
      } else {
        return [...prev, id]
      }
    })
    return () => {
      setIOKeys(prev => {
        const curr = [...prev]
        const idx = prev.indexOf(id)
        if (idx < 0)
          return prev
        curr.splice(idx, 1)
        return curr
      })
      resetIOState()
    }
  }, [id])
}

export default useChannel