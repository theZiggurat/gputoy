import { useCallback, useEffect } from "react";
import { Logger } from "../recoil/console";
import GPU from './gpu'

const useGPUError = (
  isRunning: React.MutableRefObject<boolean>, 
  setRunning: React.Dispatch<React.SetStateAction<boolean>>,
  logger: Logger
) => {

  const errorHandler = (ev: GPUUncapturedErrorEvent) => {
    let message: string = ev.error.message

    // shader error
    if (message.startsWith('Tint WGSL reader failure')) {
      
      let start = message.indexOf(':')+1
      let body = message.substr(start, message.indexOf('Shader')-start).trim()
      logger.err("Shader error", body)
    }
    else if (message.startsWith('[ShaderModule] is an error.')) {
      logger.err("Shader module", message)
    }
    else {
      logger.err("Unknown error", message)
      
    }
    if (isRunning.current)
      setRunning(false)
  }

  useEffect(() => {
    if (GPU.isInitialized())
      GPU.device.onuncapturederror = errorHandler
  }, [])
}

export default useGPUError