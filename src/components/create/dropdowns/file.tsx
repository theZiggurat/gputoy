import { useToast } from "@chakra-ui/toast"
import usePost from "@recoil/hooks/project/usePost"
import { useRouter } from "next/router"
import React from "react"
import Dropdown, { DropdownDivider, DropdownItem, DropdownSubDropdown } from "../dropdown"


const FileDropdown = () => {

  const { goToOpen, post } = useDropdown()

  return (
    <Dropdown text="File">
      <DropdownItem text="Exit" rightText="Ctrl+Esc" />
      <DropdownDivider />
      <DropdownItem text="New" rightText="Ctrl+N" />
      <DropdownItem text="Open" rightText="Ctrl+O" onClick={goToOpen} />
      <DropdownDivider />
      <DropdownItem text="Save" rightText="Ctrl+S" onClick={() => post('save')} />
      <DropdownItem text="Download" />
      <DropdownItem text="Export" />
      <DropdownDivider />
      <DropdownItem text="Publish" onClick={() => post('publish')} />
      <DropdownItem text="Fork" />
    </Dropdown>
  )
}

const useDropdown = () => {
  const router = useRouter()
  const post = usePost()

  const goToOpen = () => router.replace('/create')

  return { goToOpen, post }
}

export default FileDropdown