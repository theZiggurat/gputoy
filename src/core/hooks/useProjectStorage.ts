import { toast, useToast } from '@chakra-ui/toast'
import { CreatePageProjectQuery, CreatePageProjectSaveHistorySer } from 'core/types/queries'
import { withCreatePageProject } from 'core/recoil/selectors/queries'
import { currentProjectIdAtom, projectLastSave, projectLastSaveLocal } from 'core/recoil/atoms/project'
import { debounce, update } from 'lodash'
import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil'
import useProjectSession from './useProjectSession'

type ProjectStorageProps = {
  projectFromDB: CreatePageProjectQuery | null | undefined,
  dateInfo: CreatePageProjectSaveHistorySer | null
  session: Session | null
}

const useProjectStorage = (props: ProjectStorageProps) => {

  const {
    projectFromDB,
    dateInfo,
    session
  } = props

  const [projectState, setProjectState] = useRecoilState(withCreatePageProject)
  const [projectID, setProjectID] = useRecoilState(currentProjectIdAtom)
  const setProjectLastSave = useSetRecoilState(projectLastSave)
  const setProjectLastSaveLocal = useSetRecoilState(projectLastSaveLocal)
  const [_s, _l, isOwner] = useProjectSession()
  const [enableSave, setEnableSave] = useState(false)
  const toast = useToast()

  const router = useRouter()

  const [isSet, setIsSet] = useState(false)
  const timeoutId = useRef(0)

  useEffect(() => {
    timeoutId.current = setTimeout(() => {
      toast({
        title: 'Project not found or link outdated',
        status: 'info',
        duration: 5000,
        isClosable: true
      })
      router.push('/editor')
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (isSet)
      clearTimeout(timeoutId.current)
  }, [isSet])

  /**
   * 
   */
  useEffect(() => {

    console.log(`project_local_${projectID}`)
    const projectFromStorage = localStorage.getItem(`project_local_${projectID}`)
    console.log(projectFromStorage)
    console.log('storage', !!projectFromStorage, 'db', !!projectFromDB, projectID)
    if (!projectFromDB && !projectFromStorage) {
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
    setIsSet(true)
    setEnableSave(true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID, projectFromDB, setProjectID])

  const saveToLocalStorage = () => {
    const updateDateLocal = new Date().toISOString()
    const projectWithDate = { ...projectState, updatedAt: updateDateLocal }
    setProjectLastSaveLocal(updateDateLocal)
    console.log
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
  }, [projectState, projectID, isOwner, enableSave, debouncedSaveToLocalStorage])

}

export default useProjectStorage