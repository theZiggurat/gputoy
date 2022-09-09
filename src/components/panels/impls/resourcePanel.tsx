import { chakra, Flex, Input } from "@chakra-ui/react";
import BufferInfo from "@components/create/resources/bufferInfo";
import TextureInfo from "@components/create/resources/textureInfo";
import useInstance from "@core/hooks/useInstance";
import { useTaskReciever } from "@core/hooks/useTask";
import { resourceAtom } from "@core/recoil/atoms/resource";
import * as types from "@core/types";
import { fontMono, themed } from "@theme/theme";
import { useRecoilState } from "recoil";
import { ResourceInstanceState } from "../descriptors";
import {
    Panel,
    PanelBar,
    PanelBarEnd,
    PanelBarMiddle,
    PanelContent,
    PanelInProps
} from "../panel";

const ResourcePanelContent = (props: { resourceKey: string }) => {
  const optionStyle = {
    backgroundColor: themed("a1"),
    border: "none",
  };

  const bgProps = {
    bg: themed("a2"),
    _hover: {
      bg: themed("a1"),
    },
  };

  const [resource, setResource] = useRecoilState(
    resourceAtom(props.resourceKey)
  );
  const { name, type, args } = resource;

  const onArgChange = (args: types.ResourceArgs) => {
    setResource((old) => ({ ...old, args }));
  };

  return (
    <Flex w="100%" h="100%">
      <Flex
        flex="0 0 auto"
        flexDir="column"
        h="100%"
        w="fit-content"
        borderRight="1px"
        borderColor={themed("borderLight")}
      >
        <Flex
          borderBottom="1px"
          borderColor={themed("borderLight")}
          bg={themed("a3")}
          flex="0 0 auto"
          alignItems="center"
        >
          <Input
            value={name}
            fontSize="0.75rem"
            bg="none"
            _hover={{ bg: "none" }}
            placeholder="Resource Name"
            onChange={(s) =>
              setResource((old) => ({ ...old, name: s.target.value }))
            }
            borderRadius="0px"
            fontFamily={fontMono}
            spellCheck={false}
            color={themed("textMidLight")}
            paddingInlineEnd="0"
            my="auto"
            fontWeight="bold"
            transform="translate(0, 1.5px)"
          />
          <chakra.select
            color={themed("textMidLight")}
            fontSize="0.75rem"
            value={type}
            onChange={(s) =>
              setResource((old) => ({
                ...old,
                type: s.target.value as types.ResourceType,
                args: types.resourceTypeToDefaultArgs[
                  s.target.value as types.ResourceType
                ],
              }))
            }
            sx={bgProps}
            paddingStart="0.5rem"
            paddingEnd="0.5rem"
            mr="0.5rem"
          >
            <option value="buffer" style={optionStyle}>
              Buffer
            </option>
            <option value="texture" style={optionStyle}>
              Texture
            </option>
            <option value="sampler" style={optionStyle}>
              Sampler
            </option>
          </chakra.select>
        </Flex>
        {type === "buffer" && (
          <BufferInfo args={args as types.BufferArgs} onChange={onArgChange} />
        )}
        {type === "texture" && (
          <TextureInfo
            args={args as types.TextureArgs}
            onChange={onArgChange}
          />
        )}
        {/* {
        type === 'sampler' &&
        <SamplerInfo args={args as types.SamplerArgs} onChange={onArgChange} />
      } 
      */}
      </Flex>
      <Flex flex="1 1 auto" h="100%"></Flex>
    </Flex>
  );
};

const ResourcePanel = (props: PanelInProps) => {
  const [instanceState, setInstanceState] =
    useInstance<ResourceInstanceState>(props);
  const { openResource } = instanceState;

  const setOpenResource = (resourceKey?: string) => {
    setInstanceState((old) => ({
      ...old,
      openResource: resourceKey,
    }));
  };

  useTaskReciever(props.instanceID, {
    // recieves open resource command from other components
    // arg: string resourceKey
    openResource: (task) => {
      if (typeof task.args === "string") {
        setOpenResource(task.args);
      }
      return true;
    },
  });

  return (
    <Panel {...props}>
      <PanelContent>
        {openResource && <ResourcePanelContent resourceKey={openResource} />}
      </PanelContent>
      <PanelBar>
        <PanelBarMiddle>
          {/* <RowButton
          purpose="Add resource"
          icon={<MdAdd />}
          onClick={onResourceAdd}
          first
        /> */}
        </PanelBarMiddle>
        <PanelBarEnd></PanelBarEnd>
      </PanelBar>
    </Panel>
  );
};

export default ResourcePanel;
