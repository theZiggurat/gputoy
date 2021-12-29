/* eslint-disable import/no-anonymous-default-export */
import { currentProjectIDAtom, projectAuthorAtom, projectDescriptionAtom, projectTitleAtom } from "@recoil/project"
import { useRecoilValue, useRecoilState } from "recoil"

export const useProjectTitle = (): [string, (ev: any) => void] => {

  const projectID = useRecoilValue(currentProjectIDAtom)
  const [title, setProjectTitle] = useRecoilState(projectTitleAtom(projectID))

  const setTitle = (ev) => {
    setProjectTitle(ev.target.value)
  }

  return [title, setTitle]
}

export const useProjectDescription = (): [string, (ev: any) => void] => {

  const projectID = useRecoilValue(currentProjectIDAtom)
  const [description, setProjectDescription] = useRecoilState(projectDescriptionAtom(projectID))

  const setDescription = (ev) => {
    setProjectDescription(ev.target.value)
  }

  return [description, setDescription]
}

export const useProjectAuthor = (): string => {
  const projectID = useRecoilValue(currentProjectIDAtom)
  const author = useRecoilValue(projectAuthorAtom(projectID))

  return author
}