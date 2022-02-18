import { useToast } from "@chakra-ui/toast"
import usePost from "@core/hooks/usePost"
import { useRouter } from "next/router"
import React from "react"
import Dropdown, { DropdownDivider, DropdownItem, DropdownSubDropdown } from "../dropdown"


const FileDropdown = () => {

  const { goToOpen } = useDropdown()
  const [post, canPost] = usePost()

  return (
    <Dropdown text="File">
      <DropdownItem text="Exit" rightText="Ctrl+Esc" />
      <DropdownDivider />
      <DropdownItem text="New" rightText="Ctrl+N" />
      <DropdownItem text="Open" rightText="Ctrl+O" onClick={goToOpen} />
      <DropdownDivider />
      <DropdownItem text="Save" rightText="Ctrl+S" onClick={() => post('save')} disabled={!canPost} />
      <DropdownItem text="Download" />
      <DropdownItem text="Export" />
      <DropdownDivider />
      <DropdownItem text="Publish" onClick={() => post('publish')} disabled={!canPost} />
      <DropdownItem text="Fork" />
    </Dropdown>
  )
}

const useDropdown = () => {
  const router = useRouter()

  const goToOpen = () => router.replace('/editor', undefined, { shallow: true })

  return { goToOpen }
}

export default FileDropdown