/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import { CreatePageProjectQuery, CreatePageProjectSaveHistorySer } from '@database/args'
import { withCreatePageProject } from '@database/selectors'
import { currentProjectIDAtom, projectLastSave, projectLastSaveLocal } from '@recoil/project'
import { debounce, update } from 'lodash'
import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil'
import useProjectSession from './useProjectSession'

type ProjectStorageProps = {
  projectFromDB: CreatePageProjectQuery | null | undefined,
  dateInfo: CreatePageProjectSaveHistorySer | null
  session: Session | null
}

export default (props: ProjectStorageProps) => {

  const {
    projectFromDB,
    dateInfo,
    session
  } = props

  const [projectState, setProjectState] = useRecoilState(withCreatePageProject)
  const [projectID, setProjectID] = useRecoilState(currentProjectIDAtom)
  const setProjectLastSave = useSetRecoilState(projectLastSave)
  const setProjectLastSaveLocal = useSetRecoilState(projectLastSaveLocal)
  const [_s, _l, isOwner] = useProjectSession()
  const [enableSave, setEnableSave] = useState(false)

  const router = useRouter()

  useEffect(() => {

    const projectFromStorage = localStorage.getItem(`project_local_${projectID}`)

    console.log('storage', !!projectFromStorage, 'db', !!projectFromDB, projectID)
    if (!projectFromDB && !projectFromStorage) {
      router.push('/create')
      return
    }


    if (!projectFromStorage) {
      setProjectState(projectFromDB!)
      if (dateInfo)
        setProjectLastSave(dateInfo.updatedAt)
    } else {
      const { updatedAt, ...project } = JSON.parse(projectFromStorage)
      setProjectState(project)
      setProjectLastSaveLocal(updatedAt)
    }
    setEnableSave(true)

  }, [projectID, projectFromDB, setProjectID])

  const saveToLocalStorage = () => {
    const updateDateLocal = new Date().toISOString()
    const projectWithDate = { ...projectState, updatedAt: updateDateLocal }
    setProjectLastSaveLocal(updateDateLocal)
    localStorage.setItem(`project_local_${projectID}`, JSON.stringify(projectWithDate))
  }

  const debouncedSaveToLocalStorage = useMemo(() => debounce(saveToLocalStorage, 5000), [projectState, projectID])

  useEffect(() => {
    router.beforePopState(({ url, as, options }) => {
      debouncedSaveToLocalStorage.flush()
      return true
    })
  }, [router, debouncedSaveToLocalStorage])

  useEffect(() => {
    if (projectID !== undefined && projectID !== 'NOT_SET' && isOwner && enableSave) {
      debouncedSaveToLocalStorage()
    }
    return () => debouncedSaveToLocalStorage.cancel()
  }, [projectState, projectID])

}