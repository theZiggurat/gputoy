import React, { ReactChild, useEffect, useState } from 'react'

type TyperProps = {
  speed?: number,
  initial?: number
  text: string
}
const Typer = (props: TyperProps) => {

  const [ptr, setPtr] = useState(props.initial ?? 0)

  useEffect(() => {
    const timer = setInterval(() => setPtr(ptr => ptr + 1), props.speed ?? 100)
    return () => clearInterval(timer)
  }, [])

  return <>
    {props.text.substr(0, ptr)}
  </>
}

export default Typer