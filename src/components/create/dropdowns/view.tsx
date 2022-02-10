import { useColorMode } from "@chakra-ui/color-mode"
import usePanels from "@core/hooks/usePanels"
import React, { useCallback } from "react"
import Dropdown, { DropdownDivider, DropdownItem, DropdownSubDropdown } from "../dropdown"


const ViewDropdown = () => {

  const {
    resetLayout,
    toggleColorMode
  } = useDropdown()

  return (
    <Dropdown text="View">
      <DropdownItem text="Reset Layout" onClick={resetLayout} />
      <DropdownDivider />
      <DropdownItem text="Save Layout" />
      <DropdownSubDropdown text="Load Layout" />
      <DropdownDivider />
      <DropdownSubDropdown text="Add Panel Left" />
      <DropdownSubDropdown text="Add Panel Right" />
      <DropdownSubDropdown text="Add Panel Top" />
      <DropdownSubDropdown text="Add Panel Bottom" />
      <DropdownDivider />
      <DropdownItem text="Toggle Night Mode" onClick={toggleColorMode} />
    </Dropdown>
  )
}

const useDropdown = () => {

  const { resetPanels, panelLayout, addPanel, onCombinePanel } = usePanels({})
  const { toggleColorMode } = useColorMode()

  const toggleSummary = useCallback(() => {
    if (panelLayout.left && panelLayout.right) {
      if (panelLayout.left.index == 5) {

      } else if (panelLayout.right.index == 5) {

      } else {
        addPanel(5, 'left')
      }
    }
  }, [panelLayout, addPanel, onCombinePanel])

  return {
    resetLayout: resetPanels,
    toggleColorMode,
    toggleSummary
  }
}

export default ViewDropdown