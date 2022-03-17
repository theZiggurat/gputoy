import { useToast } from "@chakra-ui/toast"
import GPU from "@core/system/gpu"
import { gpuStatusAtom } from "core/recoil/atoms/gpu"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useLogger from "../useLogger"

const useGPU = () => {
  const logger = useLogger()
  const setGPUStatus = useSetRecoilState(gpuStatusAtom)
  const toast = useToast()

  useEffect(() => {
    const init = async () => {
      const result = await GPU.init(logger)
      setGPUStatus(result)


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

      // if (result == 'ok') {
      //   toast({
      //     title: 'GPU Initialized',
      //     status: 'success',
      //     duration: 1500,
      //     isClosable: true,
      //   })
      // }
    }
    init()
  }, [])
}

export default useGPU