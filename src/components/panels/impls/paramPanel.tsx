import {
    Button,
    Flex,
    HStack,
    Input,
    InputGroup,
    InputLeftElement, Popover,
    PopoverContent,
    PopoverTrigger,
    Portal, Text
} from "@chakra-ui/react";
import { typeToInterface } from "@components/create/params/paramInterface";
import ParamListCompact from "@components/create/params/paramListCompact";
import ParamListExpanded from "@components/create/params/paramListExpanded";
import useInstance from "@core/hooks/useInstance";
import { themed } from "@theme/theme";
import { projectParamKeys, projectParamsAtom } from "core/recoil/atoms/project";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { MdAdd, MdArrowDropUp, MdDelete, MdSettings } from "react-icons/md";
import { useResizeDetector } from "react-resize-detector";
import { useRecoilState } from "recoil";
import { RowButton } from "../../shared/rowButton";
import { ParamInstanceState } from "../descriptors";
import {
    Panel,
    PanelBar,
    PanelBarEnd,
    PanelBarMiddle,
    PanelContent
} from "../panel";

const InterfaceTypeSelect = (props: { selectedParam: string }) => {
  const [param, setParam] = useRecoilState(
    projectParamsAtom(props.selectedParam)
  );
  const [isOpen, setOpen] = useState(false);
  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const interfaces = typeToInterface[param.paramType];

  return (
    <Popover
      isOpen={isOpen}
      onClose={close}
      closeOnBlur
      preventOverflow
      matchWidth
      placement="top-start"
      offset={[5, 0]}
      gutter={0}
    >
      <PopoverTrigger>
        <HStack
          bg={themed("input")}
          pl="0.2rem"
          pr="0.5rem"
          borderStartRadius="md"
          _hover={{ bg: themed("buttonHovered") }}
          cursor="pointer"
          pos="relative"
          onClick={isOpen ? close : open}
        >
          <MdArrowDropUp />
          <Text display="inline" fontSize="xs" color={themed("textMid")}>
            {interfaces[param.interface ?? 0]}
          </Text>
        </HStack>
      </PopoverTrigger>
      <Portal>
        <PopoverContent outline="none" border="none" w="100%">
          <Flex
            bg={themed("a2")}
            flexDir="column"
            border="1px"
            borderColor={themed("borderLight")}
          >
            {interfaces.map((s, idx) => (
              <Button
                key={s}
                size="xs"
                width="100%"
                borderRadius="0"
                fontWeight="normal"
                onClick={() => {
                  setParam((old) => ({ ...old, interface: idx }));
                  close();
                }}
              >
                {s}
              </Button>
            ))}
          </Flex>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

interface ParamPanelProps {
  paramKeys: string[];
  addParam: () => void;
  removeParam: (key: string) => void;
}

const ParamPanel = (props: ParamPanelProps) => {
  const { paramKeys, addParam, removeParam } = useParamsPanel();
  const { width, height, ref } = useResizeDetector();
  const { ...panelProps } = props;
  const [instanceState, setInstanceState] =
    useInstance<ParamInstanceState>(props);
  const renderCompact = (width ?? 0) < (height ?? 0) * 1.5;

  const { keywordFilter, selectedParam } = instanceState;
  const setKeywordFilter = (filter: string) =>
    setInstanceState({ ...instanceState, keywordFilter: filter });
  const setSelectedParam = (pid: string) =>
    setInstanceState({ ...instanceState, selectedParam: pid });

  //useDebounce(() => setNameErrors(params.map(p => !(/^[a-z0-9]+$/i.test(p.paramName)))), 500, [params])

  return (
    <Panel {...panelProps}>
      <PanelContent ref={ref}>
        {renderCompact && (
          <ParamListCompact
            keys={paramKeys}
            selectedParam={selectedParam}
            onChangeSelected={(k) => setSelectedParam(k)}
          />
        )}
        {!renderCompact && (
          <ParamListExpanded
            keys={paramKeys}
            selectedParam={selectedParam}
            onChangeSelected={(k) => setSelectedParam(k)}
          />
        )}
      </PanelContent>
      <PanelBar>
        <PanelBarMiddle>
          <RowButton
            purpose="Add param"
            onClick={addParam}
            icon={<MdAdd />}
            first
          />
          <InputGroup size="xs" maxWidth="500" minWidth="100">
            <InputLeftElement>
              <FaSearch size="0.6rem" color={themed("textLight")} />
            </InputLeftElement>
            <Input
              value={instanceState.keywordFilter}
              onChange={(ev) => setKeywordFilter(ev.target.value)}
            />
            <RowButton
              purpose="Remove param"
              onClick={() => removeParam(selectedParam ?? "")}
              disabled={!selectedParam}
              icon={<MdDelete />}
              last
            />
          </InputGroup>
        </PanelBarMiddle>
        <PanelBarEnd>
          {selectedParam && (
            <InterfaceTypeSelect selectedParam={selectedParam} />
          )}
          <RowButton purpose="Options" icon={<MdSettings />} last />
        </PanelBarEnd>
      </PanelBar>
    </Panel>
  );
};
export default ParamPanel;

export const useParamsPanel = (): ParamPanelProps => {
  const [paramKeys, setParamKeys] = useRecoilState(projectParamKeys);

  const addParam = useCallback(() => {
    setParamKeys((old) => [...old, nanoid(8)]);
  }, [setParamKeys]);

  const removeParam = useCallback(
    (key: string) => {
      setParamKeys((oldKeys) => {
        let newParams = [...oldKeys];
        newParams.splice(oldKeys.indexOf(key), 1);
        return newParams;
      });
    },
    [setParamKeys]
  );

  return { paramKeys, addParam, removeParam };
};
