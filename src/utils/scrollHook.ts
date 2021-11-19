import { useRef, useEffect, MutableRefObject } from "react";

const useHorizontalScroll = (prevent: boolean = false): MutableRefObject<HTMLDivElement | undefined> => {
  const elRef = useRef<HTMLDivElement>()

  useEffect(() => {
    
    const el = elRef.current
    console.log(el)
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (!e || prevent) return;
        e.preventDefault()
        console.log(el.scrollLeft)
        el.scrollTo({
          left: el.scrollLeft + e.deltaY,
          behavior: "smooth"
        })
      };
      el.addEventListener("wheel", onWheel)
      return () => el.removeEventListener("wheel", onWheel)
    }
  }, [prevent])
  return elRef
}

export default useHorizontalScroll