import { Box, Flex, IconButton } from "@chakra-ui/react";
import { RowButton } from "@components/shared/rowButton";
import { resourceAtom, resourceKeysAtom } from "@core/recoil/atoms/resource";
import { nanoid } from "nanoid";
import { MdAdd } from "react-icons/md";
import { useRecoilState } from "recoil";
import { Panel, PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent, PanelInProps } from "../panel";

type ResourceEntryProps = {
  resourceKey: string
}

const ResourceEntry = (props: ResourceEntryProps) => {

  const { resourceKey } = props

  console.log(props)

  const resource = useRecoilState(resourceAtom(resourceKey))

  return <Flex>
    {resourceKey}
  </Flex>
}

const ResourcePanel = (props: PanelInProps) => {

  const [resources, setResources] = useRecoilState(resourceKeysAtom)

  const onResourceAdd = () => {
    setResources(old => [...old, nanoid(8)])
  }

  return <Panel {...props}>
    <PanelContent>
      <Box bg="red">
        Hello
      </Box>

      {
        resources.map(r => {
          <ResourceEntry key={r} resourceKey={r} />
        })
      }
    </PanelContent>
    <PanelBar>
      <PanelBarMiddle>
        <RowButton
          purpose="Add resource"
          icon={<MdAdd />}
          onClick={onResourceAdd}
          first
        />
      </PanelBarMiddle>
      <PanelBarEnd>

      </PanelBarEnd>
    </PanelBar>
  </Panel>
}

export default ResourcePanel