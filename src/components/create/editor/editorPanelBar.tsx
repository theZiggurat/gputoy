import {
    Flex, Input, Popover, PopoverContent, PopoverTrigger, Portal
} from "@chakra-ui/react";
import {
    PanelBarEnd, PanelBarMiddle
} from "@components/panels/panel";
import { RowButton } from "@components/shared/rowButton";
import { useFileMetadata } from "@core/hooks/useFiles";
import { themed } from "@theme/theme";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdAdd, MdClose, MdCode, MdSettings } from "react-icons/md";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";

const EditorPanelBar = (props: { fileId?: string }) => {
  const { fileId } = props;
  const { fileMetadata, setFilename, setExtension } = useFileMetadata(fileId);

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((o) => !o);
  const close = () => setIsOpen(false);

  const onHandleFilenameChange = (ev) => {
    setFilename(ev.target.value);
  };

  return (
    <>
      <PanelBarMiddle zIndex="3">
        <RowButton
          purpose="File properties"
          icon={
            isOpen ? (
              <RiArrowDropDownLine size={17} />
            ) : (
              <RiArrowDropUpLine size={17} />
            )
          }
          onClick={toggle}
          disabled={!fileId}
          first
        />
        <Popover
          placement="top-start"
          gutter={5}
          preventOverflow
          isOpen={isOpen && !!fileId}
          onClose={close}
          closeOnBlur
          modifiers={[
            {
              name: "preventOverflow",
              options: {
                tether: false,
              },
            },
          ]}
        >
          <PopoverTrigger>
            <Input
              size="xs"
              maxWidth="500"
              minWidth="200"
              width="200"
              borderRadius="0"
              borderLeft="0"
              onChange={onHandleFilenameChange}
              value={
                fileId ? fileMetadata.filename : "Choose file from side menu"
              }
              color={fileId ? "" : themed("textLight")}
              fontWeight="light"
              autoCorrect="off"
              spellCheck="false"
            />
          </PopoverTrigger>
          {fileId && (
            <Portal>
              <PopoverContent zIndex="10" width="fit-content" border="0">
                <Flex
                  direction="column"
                  width="200px"
                  backgroundColor={themed("a2")}
                  border="1px"
                  borderBottom="0"
                  borderColor={themed("dividerLight")}
                >
                  {/* <Label text="Lang" p="0.5rem">
                  <RowToggleButton text='glsl' onClick={() => setExtension('glsl')} first toggled={(currentFile?.lang ?? '') === 'glsl'} />
                  <RowToggleButton text='wgsl' onClick={() => setExtension('wgsl')} last toggled={(currentFile?.lang ?? '') === 'wgsl'} />
                </Label> */}
                  {/* 
              TODO: make proper checkbox component
            */}
                </Flex>
              </PopoverContent>
            </Portal>
          )}
        </Popover>
        <RowButton
          purpose="Add file"
          // onClick={onHandleAddFile}
          icon={<MdAdd size={17} />}
        />
        <RowButton
          purpose="Remove file from workspace"
          // onClick={onHandleRemoveFile}
          disabled={!fileId}
          icon={<MdClose size={17} />}
          last
        />
      </PanelBarMiddle>
      <PanelBarEnd>
        <RowButton purpose="Check code" icon={<MdCode />} first />
        <RowButton purpose="Delete file" icon={<FaRegTrashAlt />} />
        <RowButton purpose="Settings" icon={<MdSettings />} last />
      </PanelBarEnd>
    </>
  );
};

export default EditorPanelBar;
