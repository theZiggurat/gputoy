import { Box, Flex, Text } from "@chakra-ui/react";
import Label from "@components/shared/label";
import { SVGBox } from "@components/shared/svgBox";
import { themed, themedRaw } from "@theme/theme";
import { hslToRgb, rgbToHsl, toHex } from "utils/colors";
import { InterfaceProps, useInterfaceProps } from "../paramInterface";

export const RGBInterface = (props: InterfaceProps) => {
  const [{}, setPropValue, _c] = useInterfaceProps(props);

  const size = Math.min(props.width ?? 0, props.height ?? 0);
  const half = size / 2;

  const bg = themedRaw("bgInterface");
  const s1 = themedRaw("s1Interface");
  const s2 = themedRaw("s2Interface");
  const text = themedRaw("textMidLight");
  const red = "#E53E3E";
  const redAlpha = "#E53E3E50";

  const rgba = props.value;
  const opacity = rgba[3];
  const hsl = rgbToHsl(rgba[0] * 255, rgba[1] * 255, rgba[2] * 255);
  const hue = Math.round(hsl[0] * 360);

  const satLightCursor = [hsl[2] / (1 - hsl[1] / 2), hsl[1]];
  const hueCursor = hsl[0];

  const cssbg = `rgba(${rgba[0] * 255}, ${rgba[1] * 255}, ${
    rgba[2] * 255
  }, ${opacity})`;

  const onHandleHueChange = (coord: number[], bounds: number[]) => {
    const newhue = Math.max(0, Math.min(coord[0] / bounds[0]));
    const rgb = hslToRgb(newhue, hsl[1], hsl[2]).map((v) => v / 255);
    props.onChange([...rgb, opacity]);
  };

  const onHandleSatLightChange = (coord: number[], bounds: number[]) => {
    const newSat = Math.max(0, Math.min(1, coord[1] / bounds[1]));
    const newLight = Math.max(
      0,
      Math.min(1, (coord[0] / bounds[0]) * (1 - newSat / 2))
    );
    const rgb = hslToRgb(hsl[0], newSat, newLight).map((v) => v / 255);
    props.onChange([...rgb, opacity]);
  };

  return (
    <Flex flexDir="column" width="100%" height="100%" maxH="100%">
      <SVGBox
        h="60%"
        innerMargin={6}
        onScrub={onHandleSatLightChange}
        withSvg={(width, height) => (
          <>
            <defs>
              <clipPath id="clip">
                <rect
                  x={1}
                  y={1}
                  width={width - 1}
                  height={height - 1}
                  r={half}
                />
              </clipPath>
              <linearGradient id="g1" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor={`hsl(${hue}, 50%, 100%)`} />
                <stop offset="100%" stopColor={`hsl(${hue}, 100%, 50%)`} />
              </linearGradient>
              <linearGradient id="g2">
                <stop offset="0%" stopColor="hsla(0, 100%, 0%)" />
                <stop offset="100%" stopColor="hsl(0, 100%, 0%, 0)" />
              </linearGradient>
            </defs>
            <g id="sat-light-spectrum" opacity={opacity} clipPath="url(#clip)">
              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="url('#g1')"
              />
              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="url('#g2')"
                style={{ mixBlendMode: "multiply" }}
              />
            </g>
            <circle
              cx={satLightCursor[0] * width}
              cy={satLightCursor[1] * height}
              r={10}
              fill={cssbg}
              stroke={bg}
              strokeWidth="2px"
            />
          </>
        )}
      />
      <Box px="8px">
        <SVGBox
          h="16px"
          flex="0 0 auto"
          onScrub={onHandleHueChange}
          withSvg={(width, height) => (
            <>
              <defs>
                <linearGradient id="g3">
                  <stop offset="0" stopColor="hsl(0, 100%, 50%)" />
                  <stop offset="16%" stopColor="hsl(60, 100%, 50%)" />
                  <stop offset="33%" stopColor="hsl(120, 100%, 50%)" />
                  <stop offset="50%" stopColor="hsl(180, 100%, 50%)" />
                  <stop offset="66%" stopColor="hsl(240, 100%, 50%)" />
                  <stop offset="84%" stopColor="hsl(300, 100%, 50%)" />
                  <stop offset="100%" stopColor="hsl(360, 100%, 50%)" />
                </linearGradient>
              </defs>

              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="url('#g3')"
              />
              <line
                x1={hueCursor * width}
                x2={hueCursor * width}
                y1={-1}
                y2={height + 1}
                stroke={bg}
                strokeWidth="6px"
              />
            </>
          )}
        ></SVGBox>
      </Box>
      <Box width="100%" height="40%" p="8px" minH="40px">
        <Flex h="100%" w="100%" fontSize="10px">
          <Box flex="0 0 auto" width="40%" height="100%" bg={cssbg} />
          <Flex
            bg={themed("bg")}
            w="100%"
            h="100%"
            flexDir="column"
            whiteSpace="nowrap"
            pt="4px"
          >
            <Label text="HSL" w="100%" px="0.5rem" py="2x">
              <Text
                wrap="nowrap"
                fontSize="10px"
                color={themed("textMidLight")}
              >
                {Math.round(hsl[0] * 360)}° {hsl[1].toFixed(2)}{" "}
                {hsl[2].toFixed(2)}
              </Text>
            </Label>
            <Label text="RGBA" w="100%" px="0.5rem" py="2px">
              <Text
                wrap="nowrap"
                fontSize="10px"
                color={themed("textMidLight")}
              >
                {rgba.map((s) => Math.round(s * 255)).join(" ")}
              </Text>
            </Label>
            <Label text="HEX" w="100%" px="0.5rem" py="2px">
              <Text
                wrap="nowrap"
                fontSize="10px"
                color={themed("textMidLight")}
              >
                {toHex(rgba)}
              </Text>
            </Label>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};
