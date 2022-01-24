import usePost from '@recoil/hooks/project/usePost'
import React, { useCallback, useEffect } from 'react'

const KeybindManager = () => {

  const post = usePost()

  const onKeyDown = useCallback((ev: KeyboardEvent) => {
    if (ev.key == 's' && ev.ctrlKey) {
      post('save')
      ev.preventDefault()
    }
  }, [post])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  return <></>
}

export default KeybindManager