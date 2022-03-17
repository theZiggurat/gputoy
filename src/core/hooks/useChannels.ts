import { projectIOKeys, projectIOProvider } from "@core/recoil/atoms/io"
import { IOChannel } from "@core/types"
import { useEffect } from "react"
import { useRecoilState, useResetRecoilState, useSetRecoilState } from "recoil"


/**
 * Provides info to the system about an io channel. For instance, the info for the 
 * mouse io is an element id where the listeners should attach. Different types of
 * io channel have different arguments, as dependent on the args field of the channel object
 * @param id channel id
 * @param channel info about this channel
 */
const useChannel = (id: string, channel: IOChannel) => {

  const setIOState = useSetRecoilState(projectIOProvider(id))
  const resetIOState = useResetRecoilState(projectIOProvider(id))
  const setIOKeys = useSetRecoilState(projectIOKeys)

  useEffect(() => {

    // pushes new channel to recoil map
    // listened by useSystem.processIODelta
    setIOState(channel)
    setIOKeys(prev => {
      if (prev.includes(id)) {
        return prev
      } else {
        return [...prev, id]
      }
    })


    // remove channel from recoil map on unmount
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