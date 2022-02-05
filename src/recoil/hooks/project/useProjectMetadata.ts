/* eslint-disable import/no-anonymous-default-export */
import { currentProjectIdAtom, projectAuthorAtom, projectDescriptionAtom, projectTitleAtom } from "@recoil/project"
import { TypeScriptConfig } from "next/dist/server/config-shared"
import { useRecoilValue, useRecoilState } from "recoil"
import * as types from '@gpu/types'

export const useProjectTitle = (): [string | null, (ev: any) => void] => {

  const [title, setProjectTitle] = useRecoilState(projectTitleAtom)

  const setTitle = (ev) => {
    setProjectTitle(ev.target.value)
  }

  return [title, setTitle]
}

export const useProjectDescription = (): [string | null, (ev: any) => void] => {

  const [description, setProjectDescription] = useRecoilState(projectDescriptionAtom)

  const setDescription = (ev) => {
    setProjectDescription(ev.target.value)
  }

  return [description, setDescription]
}

export const useProjectAuthor = (): types.Author | null => {

  const author = useRecoilValue(projectAuthorAtom)

  return author
}