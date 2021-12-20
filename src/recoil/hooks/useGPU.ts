import { useToast } from "@chakra-ui/toast"
import GPU from "@gpu/gpu"
import { gpuStatusAtom } from "@recoil/gpu"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useLogger from "./useLogger"

export default () => {
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
          status: 'error',
          isClosable: true,
          position: 'top-right',
          duration: null,
        })
      }

      if (result == 'incompatible') {
        toast({
          title: 'Your browser is not compatible with WebGPU',
          description: 'Use the help section to find compatible browsers.',
          status: 'error',
          isClosable: true,
          position: 'top-right',
          duration: null,
        })
      }

      if (result == 'ok') {
        toast({
          title: 'GPU Initialized',
          status: 'success',
          isClosable: true,
          position: 'top-right'
        })
      }
    }
    init()
  }, [])
}