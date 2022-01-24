import { useToast } from "@chakra-ui/toast"
import GPU from "@gpu/gpu"
import { gpuStatusAtom } from "@recoil/gpu"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useLogger from "./useLogger"

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
          description: 'Uknown error. Try refreshing the page.',
          status: 'info',
          isClosable: true,
          duration: null,
        })
      }

      if (result == 'incompatible') {
        toast({
          title: 'Your browser is not compatible with WebGPU',
          description: 'Use the help section to find compatible browsers.',
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