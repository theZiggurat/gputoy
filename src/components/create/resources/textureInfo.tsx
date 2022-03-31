import { chakra, Flex, Input, InputGroup, InputRightAddon, InputRightElement, Text, Select } from "@chakra-ui/react";
import Checkbox from "@components/shared/checkbox";
import Label from "@components/shared/label";
import * as types from '@core/types'
import { fontMono, themed } from '@theme/theme'


const BufferInfo = (props: {
  args: types.TextureArgs,
  onChange: (args: types.TextureArgs) => void
}) => {

  const optionStyle = {
    backgroundColor: themed('a1'),
    border: "none"
  }

  const bgProps = {
    bg: themed('a2'),
    _hover: {
      bg: themed('a1')
    }
  }

  const labelProps = {
    borderY: "1px",
    h: '2rem',
    borderColor: themed('borderLight'),
    px: "0.75rem",
    pt: "1px",
    alignItems: "center",
    bg: themed('a2')
  }

  const inputProps = {
    bg: "none",
    border: "0px",
    borderBottom: "2px",
    _hover: { bg: 'none' },
    borderColor: themed('borderLight')
  }

  const { width, height, depthOrArrayLayers, dim, formatType, format, sampleCount, usage } = props.args

  const toggleUsage = (bit: number, toggle: boolean) => {
    props.onChange({
      ...props.args,
      usage: toggle ? usage | bit : usage & ~bit
    })
  }

  return <Flex
    flex="1 1 auto"
    h="100%"
    overflowY="scroll"
    bg={themed('a2')}
    flexDir="column"
    gridGap="4px"
    py="4px"
  >
    <Label text="Dimension" {...labelProps} >
      <chakra.select
        color={themed('textMidLight')}
        fontSize="0.75rem"
        value={dim}
        onChange={s => props.onChange({ ...props.args, dim: s.target.value as types.TextureDim })}
        sx={bgProps}
        paddingStart="0.5rem"
        paddingEnd="0.5rem"
        w="100px"
      >
        <option value="1d" style={optionStyle}>1D</option>
        <option value="2d" style={optionStyle}>2D</option>
        <option value="3d" style={optionStyle}>3D</option>
      </chakra.select>
    </Label>


    <Label text="Width" {...labelProps}>
      <InputGroup size="xs">
        <Input
          w="100px"
          type="number"
          value={width}
          max={8192}
          {...inputProps}
        />
        <InputRightElement color={themed('textLight')}>
          px
        </InputRightElement>
      </InputGroup>
    </Label>


    {
      dim !== '1d' &&
      <Label text="Height" {...labelProps}>
        <InputGroup size="xs">
          <Input
            w="100px"
            type="number"
            value={height}
            onChange={s => props.onChange({ ...props.args, height: parseInt(s.target.value) })}
            max={8192}
            {...inputProps}
          />
          <InputRightElement color={themed('textLight')}>
            px
          </InputRightElement>
        </InputGroup>
      </Label>
    }


    {
      dim !== '1d' &&
      <Label text={dim === '3d' ? 'Depth' : 'Array Layers'} {...labelProps}>
        <InputGroup size="xs">
          <Input
            w="100px"
            type="number"
            value={depthOrArrayLayers}
            max={4096}
            {...inputProps}
          />
          {
            dim === '3d' &&
            <InputRightElement color={themed('textLight')}>
              px
            </InputRightElement>
          }

        </InputGroup>
      </Label>
    }


    <Label text="Usage" {...labelProps} height="min-content">
      <Flex flexDir="column" flexWrap="wrap" py="4px" gridGap="2px">
        <Checkbox
          title="COPY_SRC"
          checked={!!(usage & 0x1)}
          onCheck={(val) => toggleUsage(0x1, val)}
          hint="If checked, this texture can be read from outside of a shader."
        />
        <Checkbox
          title="COPY_DST"
          checked={!!(usage & 0x2)}
          onCheck={(val) => toggleUsage(0x2, val)}
          hint="If checked, this texture can be written to outside of a shader."
        />
        <Checkbox
          title="TEXTURE_BINDING"
          checked={!!(usage & 0x4)}
          onCheck={(val) => toggleUsage(0x4, val)}
          hint="If checked, this texture can be read from a shader using a sampler."
        />
        <Checkbox
          title="STORAGE_BINDING"
          checked={!!(usage & 0x8)}
          onCheck={(val) => toggleUsage(0x8, val)}
          hint="If checked, this texture can be read and written from a shader using texel coordinates."

        />
        <Checkbox
          title="RENDER_ATTACHMENT"
          checked={!!(usage & 0x10)}
          onCheck={(val) => toggleUsage(0x10, val)}
          hint="If checked, this texture can be a target for a vertex/fragment pipeline."
        />
      </Flex>
    </Label>

    <Label text="Format" {...labelProps}>
      <chakra.select
        color={themed('textMidLight')}
        fontSize="0.75rem"
        value={formatType}
        onChange={s => props.onChange({ ...props.args, formatType: s.target.value as types.TextureFormatType })}
        sx={bgProps}
        paddingStart="0.5rem"
        paddingEnd="0.5rem"
        w="50px"
      >
        {
          types.TEXTURE_FORMAT_TYPES.map(t =>
            <option key={t} title={t} value={t} style={optionStyle}>{t}</option>
          )
        }
      </chakra.select>
      {
        types.TEXTURE_FORMAT_FAMILIES[formatType] &&
        <chakra.select
          color={themed('textMidLight')}
          fontSize="0.75rem"
          value={format}
          onChange={s => props.onChange({ ...props.args, format: s.target.value as GPUTextureFormat })}
          sx={bgProps}
          paddingStart="0.5rem"
          paddingEnd="0.5rem"
          w="50px"
        >
          {
            types.TEXTURE_FORMAT_FAMILIES[formatType].map(t =>
              <option key={t} title={t} value={t} style={optionStyle}>{t}</option>
            )
          }
        </chakra.select>

      }
    </Label>
    {
      dim === '2d' &&
      <Label text="Samples" {...labelProps}>
        <Input
          w="100px"
          type="number"
          value={sampleCount}
          onChange={s => props.onChange({ ...props.args, sampleCount: parseInt(s.target.value) })}
          max={16}
          {...inputProps}
        />
      </Label>
    }

  </Flex>
}

export default BufferInfo