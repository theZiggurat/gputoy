import { projectBuildStatusAtom, ProjectBuildStatus as Status } from "@core/recoil/atoms/controls"
import { Project } from "@core/system/project"
import { useCallback, useEffect } from "react"
import { useRecoilState } from "recoil"

const useProjectBuild = (): [() => Promise<boolean>, Status] => {
  const [buildStatus, setBuildStatus] = useRecoilState(projectBuildStatusAtom)

  const build = useCallback(async (): Promise<boolean> => {
    if (buildStatus !== Status.BUILDING) {
      setBuildStatus(Status.BUILDING)
      let res = await Project.instance().build()
      setBuildStatus(res ? Status.SUCCESS : Status.FAILED)
    }
    return false
  }, [buildStatus, setBuildStatus])

  return [build, buildStatus]
}

export default useProjectBuild