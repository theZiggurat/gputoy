import React from "react"
import Dropdown, { DropdownDivider, DropdownItem, DropdownSubDropdown } from "../dropdown"


const FileDropdown = () => {

  const _ = useDropdown()

  return (
    <Dropdown text="File">
      <DropdownItem text="Exit" rightText="Ctrl+Esc" />
      <DropdownDivider />
      <DropdownItem text="New" rightText="Ctrl+N" />
      <DropdownItem text="Open" rightText="Ctrl+O" />
      <DropdownDivider />
      <DropdownItem text="Save" rightText="Ctrl+S" />
      <DropdownItem text="Download" />
      <DropdownItem text="Export" />
      <DropdownDivider />
      <DropdownItem text="Publish" />
      <DropdownItem text="Fork" />
    </Dropdown>
  )
}

const useDropdown = () => {

}

export default FileDropdown