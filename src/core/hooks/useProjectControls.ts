import { ProjectControl, projectControlAtom } from "core/recoil/atoms/controls";
import { useRecoilState } from "recoil";

const useProjectControls = () => {
  const [controlStatus, setProjectControlStatus] =
    useRecoilState(projectControlAtom);

  const play = () => setProjectControlStatus(ProjectControl.PLAY);
  const pause = () => setProjectControlStatus(ProjectControl.PAUSE);
  const stop = () => setProjectControlStatus(ProjectControl.STOP);

  return { controlStatus, play, pause, stop };
};

export default useProjectControls;
