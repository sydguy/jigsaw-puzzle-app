// Design proposal only. Review before app adoption.
export const designTokens = {
  "meta": {
    "name": "Jigsaw Fun Time",
    "version": "0.1.0",
    "status": "Proposed for owner review",
    "date": "2026-10-05",
    "basis": "Normalized from supplied raster designs; exact tokens are proposed, not extracted source specifications.",
    "units": "React Native logical points; CSS px in reference board"
  },
  "color": {
    "canvas": "#F7F7FE",
    "surface": "#FFFFFF",
    "surfaceSoft": "#EFEEFD",
    "selected": "#E7E1FF",
    "text": "#17124F",
    "textSecondary": "#625B87",
    "primary": "#5430E8",
    "primaryPressed": "#4020BF",
    "gradientStart": "#7140EC",
    "gradientEnd": "#3030F4",
    "border": "#DAD7EE",
    "controlBorder": "#8D84B2",
    "focus": "#2F23B9",
    "success": "#27763D",
    "successSoft": "#E9F5EA",
    "warning": "#995000",
    "warningSoft": "#FFF1D9",
    "danger": "#BA2F3A",
    "dangerSoft": "#FFF0F1",
    "info": "#255FD0",
    "infoSoft": "#EAF1FF",
    "disabledSurface": "#E9E7F0",
    "disabledText": "#716C85",
    "hint": "#377E3C",
    "preview": "#AC510B",
    "restart": "#BA2F3A",
    "shuffle": "#255FD0",
    "premiumGold": "#F3BA43"
  },
  "gradient": {
    "primary": {
      "angle": 110,
      "colors": [
        "#7140EC",
        "#3030F4"
      ]
    },
    "hint": {
      "colors": [
        "#4B944B",
        "#377E3C"
      ]
    },
    "preview": {
      "colors": [
        "#C26316",
        "#AC510B"
      ]
    },
    "restart": {
      "colors": [
        "#D24448",
        "#BA2F3A"
      ]
    },
    "shuffle": {
      "colors": [
        "#3471DC",
        "#255FD0"
      ]
    }
  },
  "space": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48
  },
  "radius": {
    "small": 8,
    "control": 12,
    "card": 16,
    "sheet": 24,
    "pill": 999
  },
  "type": {
    "family": "Platform system sans-serif",
    "display": {
      "size": 32,
      "lineHeight": 40,
      "weight": "700"
    },
    "title": {
      "size": 24,
      "lineHeight": 32,
      "weight": "700"
    },
    "section": {
      "size": 20,
      "lineHeight": 28,
      "weight": "700"
    },
    "body": {
      "size": 16,
      "lineHeight": 24,
      "weight": "400"
    },
    "label": {
      "size": 14,
      "lineHeight": 20,
      "weight": "600"
    },
    "caption": {
      "size": 12,
      "lineHeight": 16,
      "weight": "400"
    },
    "metric": {
      "size": 24,
      "lineHeight": 32,
      "weight": "700",
      "tabularNumbers": true
    }
  },
  "size": {
    "touchMinimum": 48,
    "buttonMinimumHeight": 48,
    "inputMinimumHeight": 48,
    "icon": 24,
    "illustrationSmall": 48,
    "illustrationMedium": 72,
    "illustrationLarge": 112,
    "phoneGutter": 16,
    "tabletGutter": 24,
    "bottomNavMinimumHeight": 64,
    "landscapeInspector": 280
  },
  "motion": {
    "pressMs": 120,
    "selectionMs": 160,
    "sheetMs": 220,
    "celebrationMaximumMs": 800,
    "reducedMotionMs": 0
  },
  "elevation": {
    "card": {
      "color": "#352174",
      "opacity": 0.06,
      "offsetY": 4,
      "blur": 16,
      "androidElevation": 1
    },
    "floating": {
      "color": "#352174",
      "opacity": 0.14,
      "offsetY": 8,
      "blur": 24,
      "androidElevation": 4
    }
  },
  "layout": {
    "phoneColumns": 3,
    "tabletColumns": 6,
    "imageAspectRatio": 1.5,
    "tabletClassRequired": true,
    "wideLayoutMinimumAvailableWidth": 900
  },
  "puzzle": {
    "grids": [
      [
        2,
        3
      ],
      [
        4,
        6
      ],
      [
        6,
        9
      ],
      [
        8,
        12
      ],
      [
        10,
        15
      ],
      [
        12,
        18
      ],
      [
        14,
        21
      ],
      [
        16,
        24
      ]
    ],
    "presets": [
      54,
      96,
      150,
      216
    ],
    "rotationDefault": false
  }
} as const;
