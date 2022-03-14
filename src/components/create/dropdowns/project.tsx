import usePanels from "@core/hooks/singleton/usePanels"
import React from "react"
import Dropdown, { DropdownDivider, DropdownItem, DropdownSubDropdown } from "../dropdown"


const ProjectDropdown = () => {

  const { toggleSummary } = useDropdown()

  return (
    <Dropdown text="Project">
      <DropdownItem text="Toggle Summary" onClick={toggleSummary} />
      <DropdownDivider />
      <DropdownItem text="Run" rightText="Ctrl+Space" />
      <DropdownItem text="Pause" rightText="Ctrl+Space" />
      <DropdownItem text="Stop" rightText="Ctrl+X" />
      <DropdownDivider />
      <DropdownItem text="Compile" rightText="Ctrl+Q" />
      <DropdownItem text="Set Current File as Render" />
      <DropdownDivider />
      <DropdownItem text="Manage Extensions" />
      <DropdownDivider />
      <DropdownItem text="Publish" />
      <DropdownItem text="Fork" />
    </Dropdown>
  )
}

const useDropdown = () => {

  const { addPanel } = usePanels({})

  const toggleSummary = () => {
    addPanel(5, 'left')
  }

  return {
    toggleSummary
  }

}

export default ProjectDropdown