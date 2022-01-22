import React from "react"
import Dropdown, { DropdownDivider, DropdownItem, DropdownSubDropdown } from "../dropdown"


const SettingsDropdown = () => {

  const _ = useDropdown()

  return (
    <Dropdown text="Settings">
      <DropdownItem text="Exit" rightText="Ctrl+Esc" />
      <DropdownDivider />
      <DropdownItem text="New" rightText="Ctrl+N" />
      <DropdownItem text="Load" rightText="Ctrl+L" />
      <DropdownDivider />
      <DropdownItem text="Save" rightText="Ctrl+S" />
      <DropdownItem text="Download" />
      <DropdownItem text="Export" />
      <DropdownDivider />
      <DropdownItem text="Fork" rightText="Ctrl+" />
      <DropdownItem text="Publish" rightText="Ctrl+S" />
    </Dropdown>
  )
}

const useDropdown = () => {

}

export default SettingsDropdown