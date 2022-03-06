import { extendTheme, useColorModeValue } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

// eslint-disable-next-line react-hooks/rules-of-hooks
export const themed = (key: string) => useColorModeValue(`light.${key}`, `dark.${key}`)
// eslint-disable-next-line react-hooks/rules-of-hooks
export const themedRaw = (key: string) => useColorModeValue(light[key], dark[key])

export const fontMono = '"Fira code", "Fira Mono", monospace'

const dark = {
  p: '#0D0D0D',
  a1: '#0C0C0C',
  a2: '#0B0B0B',
  a3: '#090909',
  bg: '#050505',
  button: 'rgba(255, 255, 255, 0.04)',//'whiteAlpha.100',
  buttonHovered: 'rgba(255, 255, 255, 0.08)',//'whiteAlpha.300',
  divider: 'rgba(255, 255, 255, 0.1)',//'blackAlpha.400',
  dividerLight: 'rgba(255, 255, 255, 0.03)',
  input: 'rgba(255, 255, 255, 0.04)', //'whiteAlpha.50',
  inputHovered: 'rgba(255, 255, 255, 0.06)', //'whiteAlpha.100'
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  textLight: 'rgba(255, 255, 255, 0.45)',
  textMidLight: 'rgba(255, 255, 255, 0.6)',
  textMid: 'rgba(255, 255, 255, 0.8)',
  textHigh: 'rgba(255, 255, 255, 1.0)',
  bgVisible: 'rgba(0, 0, 0, 0.4)',
  bgInterface: '#050505',
  s1Interface: 'rgba(255, 255, 255, 0.1)',
  s2Interface: 'rgba(255, 255, 255, 0.05)',
}

const light = {
  p: '#E2E2E2',
  a1: '#D3D3D3',
  a2: '#CACACA',
  a3: '#C7C7C7',
  bg: '#DADADA',
  button: 'rgba(255, 255, 255, 0.4)', //'whiteAlpha.800',
  buttonHovered: 'rgba(0, 0, 0, 0.05)',//'whiteAlpha.500',
  divider: 'rgba(0, 0, 0, 0.2)', //'blackAlpha.200',
  dividerLight: 'rgba(0, 0, 0, 0.1)',
  input: 'rgba(255, 255, 255, 0.2)', //'whiteAlpha.600',
  inputHovered: 'rgba(255, 255, 255, 0.4)', //'whiteAlpha.500'
  border: 'rgba(0, 0, 0, 0.2)',
  borderLight: 'rgba(0, 0, 0, 0.07)',
  textLight: 'rgba(0, 0, 0, 0.36)',
  textMidLight: 'rgba(0, 0, 0, 0.55)',
  textMid: 'rgba(0, 0, 0, 0.72)',
  textHigh: 'rgba(0, 0, 0, 1.0)',
  bgVisible: 'rgba(255, 255, 255, 0.4)',
  bgInterface: '#DADADA',
  s1Interface: 'rgba(0, 0, 0, 0.2)',
  s2Interface: 'rgba(0, 0, 0, 0.1)',
}

const theme = extendTheme({
  useSystemColorMode: true,
  colors: {
    dark,
    light
  },
  fonts: {
    heading: 'Segoe UI',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode('light.p', 'dark.p')(props),
      },
      button: {
        color: mode('rgba(0, 0, 0, 0.72)', 'rgba(255, 255, 255, 0.72)')(props),
        bg: mode('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.04)')(props),
        border: '1px',
        borderColor: 'transparent',//mode('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.05)')(props),
        _hover: {
          bg: mode('rgba(0, 0, 0, 0.05)', 'whiteAlpha.300')(props)
        },
      },
      input: {
        bg: mode('rgba(255, 255, 255, 0.2)', 'whiteAlpha.50')(props),
        border: '1px',
        borderColor: 'transparent',//mode('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.05)')(props),
        _hover: {
          bg: mode('rgba(255, 255, 255, 0.4)', 'whiteAlpha.100')(props)
        },
      },
      textarea: {
        bg: mode('rgba(255, 255, 255, 0.2)', 'whiteAlpha.50')(props),
        _hover: {
          bg: mode('rgba(255, 255, 255, 0.4)', 'whiteAlpha.100')(props)
        },
      },
      hr: {
        borderColor: mode('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0)')(props)
      }
    })
  },
  components: {
    Button: {
      baseStyle: {},
      variants: {
        base: {
          bg: '',
        },
        dark: {
          bg: '#333333',
          color: 'white'
        },
        empty: {
          bg: "none",
          border: "0px",
          _hover: {
            bg: "none"
          }
        },
        heavy: {
          color: "rgba(255, 255, 255, 0.85)",
          bg: "red.500",
          _hover: {
            bg: "red.600"
          },
          border: "2px",
          borderRadius: "md",
          borderColor: "red.500"
        }
      },
      defaultProps: {
        variant: 'base',
        size: 'sm'
      }
    },
    Badge: {
      baseStyle: {},
      variants: {
        heavy: {
          color: "rgba(255, 255, 255, 0.85)",
          bg: "red.500",
          _hover: {
            bg: "red.600"
          },
          border: "2px",
          borderRadius: "md",
          borderColor: "red.500"
        }
      }
    }
    ,
    Input: {
      baseStyle: {},
      variants: {
        base: {
          bg: '',
        },
        underline: {
          border: '0px',
          bg: 'green'
        }
      },
      defaultProps: {
        variant: 'base',
        size: 'sm'
      }
    },
    Textarea: {
      baseStyle: {},
      variants: {
        base: {
          bg: '',
        }
      },
      defaultProps: {
        variant: 'base',
        size: 'sm'
      }
    },
  },
})


export default theme