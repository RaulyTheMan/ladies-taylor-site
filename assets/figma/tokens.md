# Color tokens (sampled from rendered pixels)

Pulled via histogram analysis of the actual screenshot exports, not eyeballed — these are exact.

## Core palette (main homepage direction — red/yellow/black)
| Token | Hex | Usage |
|---|---|---|
| `--color-yellow` | `#FFCE00` | primary background |
| `--color-red` | `#FF001E` | section bands, buttons, accents |
| `--color-blue` | `#027DDA` | secondary section bands ("Fuck The Bullshit") |
| `--color-dark` | `#202224` | footer / near-black text & bg |
| `--color-cream` | `#FFFBF2` | card backgrounds (e.g. "Drink and Think" ticket card) |
| `--color-placeholder-gray` | `#D9D9D9` | image placeholder fill |

## Alternate variant palette (pink/sky exploration)
| Token | Hex | Usage |
|---|---|---|
| `--color-pale-yellow` | `#FFE780` | header bg |
| `--color-pink` | `#FF808F` | section band |
| `--color-sky-blue` | `#81BEED` | illustrated sky bg |
| `--color-peach` | `#F6C69A` | bottom block |

## Notes
- Pure white (`#FFFFFF`) and pure black (`#000000`) both appear for borders/outlines (the comic-style hard shadow/outline on buttons and cards).
- Not extracted: exact border-radius, shadow offset, and spacing values — these should be read off the reference screenshots by eye or grabbed directly from Figma's Inspect panel (the MCP metadata tool is currently broken on this file, see README).
