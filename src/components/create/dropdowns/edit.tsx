import React from "react"
import Dropdown, { DropdownDivider, DropdownItem, DropdownSubDropdown } from "../dropdown"

const EditDropdown = () => {

  const _ = useDropdown()

  return (
    <Dropdown text="Edit">
      <DropdownItem text="Copy" rightText="Ctrl+C" />
      <DropdownItem text="Paste" rightText="Ctrl+V" />
      <DropdownDivider />
      <DropdownItem text="Find" rightText="Ctrl+F" />
      <DropdownItem text="Replace" rightText="Ctrl+R" />
      <DropdownDivider />
      <DropdownItem text="Undo" rightText="Ctrl+Z" />
      <DropdownItem text="Redo" rightText="Ctrl+Y" />
      <DropdownDivider />
      <DropdownItem text="Toggle Comment" rightText="Ctrl+ /" />
    </Dropdown>
  )
}

const useDropdown = () => {

}

export default EditDropdown