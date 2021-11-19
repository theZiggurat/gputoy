import {DependencyList, useCallback, useEffect, useRef} from 'react'
import _ from 'lodash'

export const useThrottle = (cb: (...args: any) => any, delay: number, additionalDeps: any[]) => {
  const options = { leading: true, trailing: false }; // pass custom lodash options
  const cbRef = useRef(cb);
  const throttledCb = useCallback(
    _.throttle((...args) => cbRef.current(...args), delay, options),
    [delay]
  );
  useEffect(() => {
    cbRef.current = cb;
  });
  // set additionalDeps to execute effect, when other values change (not only on delay change)
  useEffect(throttledCb, [throttledCb, ...additionalDeps]);
}

export const useDebounce = (cb: (...args: any) => any, delay: number, additionalDeps: any[]) => {
  const options = { leading: true, trailing: true }; // pass custom lodash options
  const cbRef = useRef(cb);
  const throttledCb = useCallback(
    _.debounce((...args) => cbRef.current(...args), delay, options),
    [delay]
  );
  useEffect(() => {
    cbRef.current = cb;
  });
  // set additionalDeps to execute effect, when other values change (not only on delay change)
  useEffect(throttledCb, [throttledCb, ...additionalDeps]);
}