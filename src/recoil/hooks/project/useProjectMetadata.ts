/* eslint-disable import/no-anonymous-default-export */
import { currentProjectIDAtom, projectAuthorAtom, projectDescriptionAtom, projectTitleAtom } from "@recoil/project"
import { TypeScriptConfig } from "next/dist/server/config-shared"
import { useRecoilValue, useRecoilState } from "recoil"
import * as types from '@gpu/types'

export const useProjectTitle = (): [string, (ev: any) => void] => {

  const projectID = useRecoilValue(currentProjectIDAtom)
  const [title, setProjectTitle] = useRecoilState(projectTitleAtom)

  const setTitle = (ev) => {
    setProjectTitle(ev.target.value)
  }

  return [title, setTitle]
}

export const useProjectDescription = (): [string, (ev: any) => void] => {

  const projectID = useRecoilValue(currentProjectIDAtom)
  const [description, setProjectDescription] = useRecoilState(projectDescriptionAtom)

  const setDescription = (ev) => {
    setProjectDescription(ev.target.value)
  }

  return [description, setDescription]
}

export const useProjectAuthor = (): types.Author | null => {
  const projectID = useRecoilValue(currentProjectIDAtom)
  const author = useRecoilValue(projectAuthorAtom)

  return author
}