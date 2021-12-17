import { extendTheme, useColorModeValue } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

export const themed = (key: string) => useColorModeValue(`light.${key}`, `dark.${key}`)

const theme = extendTheme({
  useSystemColorMode: true,
  colors: {
    dark: {
      p: '#1C1C1C',
      a1: '#17171A',
      a2: '#151517',
      bg: '#050505', 
      button: 'rgba(255, 255, 255, 0.06)',//'whiteAlpha.100',
      buttonHovered: 'rgba(255, 255, 255, 0.16)',//'whiteAlpha.300',
      divider: 'rgba(255, 255, 255, 0.1)',//'blackAlpha.400',
      input: 'rgba(255, 255, 255, 0.04)', //'whiteAlpha.50',
      inputHovered: 'rgba(255, 255, 255, 0.06)', //'whiteAlpha.100'
      border: 'rgba(255, 255, 255, 0.1)',
      textLight: 'rgba(255, 255, 255, 0.36)',
      textMid: 'rgba(255, 255, 255, 0.8)'
    },
    light: {
      p: '#E2E2E2',
      a1: '#D0D0D0',
      a2: '#C5C5C5',
      bg: '#DADADA',
      button: 'rgba(255, 255, 255, 0.4)', //'whiteAlpha.800',
      buttonHovered: 'rgba(0, 0, 0, 0.05)',//'whiteAlpha.500',
      divider: 'rgba(0, 0, 0, 0.2)', //'blackAlpha.200',
      input: 'rgba(255, 255, 255, 0.2)', //'whiteAlpha.600',
      inputHovered: 'rgba(255, 255, 255, 0.4)', //'whiteAlpha.500'
      border: 'rgba(0, 0, 0, 0.2)',
      textLight: 'rgba(0, 0, 0, 0.36)',
      textMid: 'rgba(0, 0, 0, 0.72)'
    }
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
        color: mode('rgba(0, 0, 0, 0.72)', '')(props),
        bg: mode('rgba(255, 255, 255, 0.4)', 'whiteAlpha.100')(props),
        border: '1px',
        borderColor: mode('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.05)')(props),
        _hover: {
          bg: mode('rgba(0, 0, 0, 0.05)', 'whiteAlpha.300')(props)
        },
      },
      input: {
        bg: mode('rgba(255, 255, 255, 0.2)', 'whiteAlpha.50')(props),
        border: '1px',
        borderColor: mode('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.05)')(props),
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
        }
      },
      defaultProps: {
        variant: 'base',
        size: 'sm'
      }
    },
    Input: {
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
  }
})


export default theme