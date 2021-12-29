/* eslint-disable import/no-anonymous-default-export */
import { currentProjectIDAtom, projectAuthorAtom, projectDescriptionAtom, projectTitleAtom } from "@recoil/project"
import { IoTelescope } from "react-icons/io5"
import { useRecoilValue, useRecoilState } from "recoil"

export const useProjectTitle = (): [{ text: string, isValid: boolean }, (ev: any) => void] => {

  const projectID = useRecoilValue(currentProjectIDAtom)
  const [title, setProjectTitle] = useRecoilState(projectTitleAtom(projectID))

  const setTitle = (ev) => {

    let t: string = ev.target.value

    setProjectTitle({
      text: t,
      isValid: /^[a-z0-9|!|\.|_| ]+$/i.test(t)
    })
  }

  return [title, setTitle]
}

export const useProjectDescription = (): [{ text: string, isValid: boolean }, (ev: any) => void] => {

  const projectID = useRecoilValue(currentProjectIDAtom)
  const [description, setProjectDescription] = useRecoilState(projectDescriptionAtom(projectID))

  const setDescription = (ev) => {

    let d: string = ev.target.value

    setProjectDescription({
      text: d,
      isValid: /^[a-z0-9|!|\.|_| ]+$/i.test(d)
    })
  }

  return [description, setDescription]
}

export const useProjectAuthor = (): string => {
  const projectID = useRecoilValue(currentProjectIDAtom)
  const author = useRecoilValue(projectAuthorAtom(projectID))

  return author
}