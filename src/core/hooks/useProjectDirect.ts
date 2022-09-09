import {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useEffect,
  MutableRefObject,
} from "react";
import { useRecoilValue } from "recoil";
import { gpuStatusAtom } from "../../core/recoil/atoms/gpu";
import System from "@core/system";
import * as types from "@core/types";
import { fail } from "assert";

const useProjectDirect = (
  project: types.ProjectQuery,
  io: Record<string, types.IOChannel>,
  autoplay?: boolean
): [boolean, boolean, Dispatch<SetStateAction<boolean>>] => {
  const sysRef = useRef<System | undefined>(undefined);
  const controls = useProjectLifecycleDirect(sysRef);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const animationHandle = useRef(0);
  const playingRef = useRef(false);
  const gpuStatusValue = useRecoilValue(gpuStatusAtom);
  const [failure, setFailure] = useState(false);

  useEffect(() => {
    const init = async () => {
      sysRef.current = new System();
      sysRef.current.pushFileDelta(project.files, []);
      sysRef.current.pushIoDelta(io, [], []);
      if (!(await sysRef.current.prebuild())) {
        setFailure(true);
        return;
      }
      if (!(await sysRef.current.build())) {
        setFailure(true);
        return;
      }
      setFailure(false);
      setLoading(false);
    };
    if (gpuStatusValue == "ok") init();
    return () => {
      cancelAnimationFrame(animationHandle.current);
    };
  }, [gpuStatusValue]);

  useEffect(() => {
    if (autoplay || (!loading && !failure)) setPlaying(true);
  }, [autoplay, loading, failure]);

  const render = () => {
    if (!playingRef.current) return;
    controls.step();
    animationHandle.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    playingRef.current = playing;
    if (!loading) {
      if (playing || autoplay) {
        controls.play();
        animationHandle.current = requestAnimationFrame(render);
      } else {
        controls.pause();
      }
    }
    return () => cancelAnimationFrame(animationHandle.current);
  }, [playing, loading]);

  return [loading, failure, setPlaying];
};

export default useProjectDirect;

const useProjectLifecycleDirect = (
  system: MutableRefObject<System | undefined>
) => {
  const [frameState, setFrameState] = useState(types.defaultFrameState);

  const pause = () => {
    setFrameState((old) => {
      return {
        ...old,
        running: false,
        prevDuration: old.runDuration,
      };
    });
  };

  const play = () => {
    setFrameState((old) => {
      return {
        ...old,
        running: true,
        lastStartTime: performance.now(),
      };
    });
  };

  const stop = () => {
    setFrameState((old) => {
      return {
        ...old,
        running: false,
        frameNum: 0,
        runDuration: 0,
        prevDuration: 0,
      };
    });
  };

  const step = () => {
    setFrameState((old) => {
      let now = performance.now();
      system.current?.dispatch(old);
      return {
        ...old,
        runDuration: (now - old.lastStartTime) / 1000 + old.prevDuration,
        lastFrameRendered: now,
        dt: now - old.lastFrameRendered,
        frameNum: old.frameNum + 1,
      };
    });
  };

  return { play, pause, stop, step };
};
