import { useToast } from "@chakra-ui/toast"
import GPU from "@core/system/gpu"
import { gpuLimitsAtom, gpuStatusAtom } from "core/recoil/atoms/gpu"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useLogger from "../useLogger"

const useGPU = () => {
  const logger = useLogger()
  const setGPUStatus = useSetRecoilState(gpuStatusAtom)
  const setLimits = useSetRecoilState(gpuLimitsAtom)
  const toast = useToast()

  useEffect(() => {
    const init = async () => {
      const result = await GPU.init(logger)
      setGPUStatus(result)
      let limits = GPU.device?.limits
      setLimits(old => {
        return limits
      })


      if (result == 'error') {
        toast({
          title: 'Could not initialize WebGPU',
          description: 'Unknown error. Try refreshing the page.',
          status: 'info',
          isClosable: true,
          duration: null,
        })
      }

      if (result == 'incompatible') {
        toast({
          title: 'Your browser is not compatible with WebGPU',
          description: 'Until the API stabilizes, this site will only function on Chrome 94 and higher or Firefox Nightly.',
          status: 'info',
          isClosable: true,
          duration: null,
        })
      }
    }
    init()
  }, [])
}

export default useGPU