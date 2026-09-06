# Fonts for Multi-Language PDF Export

Place TTF font files in this directory to enable text rendering in different languages.

## Quick Setup

### For Arabic/Urdu
1. Download from: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
2. Extract the Regular weight: `NotoSansArabic-Regular.ttf`
3. Place here: `NotoSansArabic-Regular.ttf`

### For Chinese/Japanese/Korean
Download one or more from Google Noto Fonts:
- Japanese: `NotoSansCJKjp-Regular.ttf`
- Simplified Chinese: `NotoSansCJKsc-Regular.ttf`
- Traditional Chinese: `NotoSansCJKtc-Regular.ttf`
- Korean: `NotoSansCJKkr-Regular.ttf`

### For Hindi/Devanagari
1. Download: https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari
2. Place: `NotoSansDevanagari-Regular.ttf`

### For Thai
1. Download: https://fonts.google.com/noto/specimen/Noto+Sans+Thai
2. Place: `NotoSansThai-Regular.ttf`

### For Hebrew
1. Download: https://fonts.google.com/noto/specimen/Noto+Sans+Hebrew
2. Place: `NotoSansHebrew-Regular.ttf`

### For Georgian
1. Download: https://fonts.google.com/noto/specimen/Noto+Sans+Georgian
2. Place: `NotoSansGeorgian-Regular.ttf`

## Fallback
If a required font is not found, the exporter will attempt to use `DejaVuSans.ttf` as a fallback. 
Download it from: https://dejavu-fonts.github.io/

## Notes
- Files must be named exactly as shown above
- Only add fonts for languages you actually use
- TTF files range from 100–500 KB depending on the font
- Restart the app after adding fonts

See `src/MD/MULTI_LANGUAGE_PDF_SUPPORT.md` for detailed documentation.


"<h1 style="max-width: 100%;">Hello H1</h1><h2 style="max-width: 100%;">Hello H2</h2><h3 style="max-width: 100%;">Hello H3</h3><h4 style="max-width: 100%;">Hello H4</h4><h5 style="max-width: 100%;">Hello H5</h5><h6 style="max-width: 100%;">Hello H6</h6><p style="max-width: 100%;"><b style="max-width: 100%;"><i style="max-width: 100%;">asfssd</i></b></p><div style="background:#f0f0f0;border:1px solid #ddd;border-radius:4px;padding:10px;margin:8px 0;font-size:11px;white-space:pre-wrap;"><span style="background:#f0f0f0;padding:2px 5px;border-radius:3px;font-size:11px;">Write code here...</span></div><div style="background:#f0f0f0;border:1px solid #ddd;border-radius:4px;padding:10px;margin:8px 0;font-size:11px;white-space:pre-wrap;"><span style="background:#f0f0f0;padding:2px 5px;border-radius:3px;font-size:11px;">Hello there</span></div><p style="max-width: 100%;"><code style="max-width: 100%; white-space-collapse: preserve; overflow-wrap: break-word;"><a target="_blank" rel="noopener noreferrer" style="max-width: 100%;">My Link</a></code></p><p style="max-width: 100%;"><u style="max-width: 100%;">Underline</u></p><p style="max-width: 100%;"><strike style="max-width: 100%;">Cut</strike></p><p style="max-width: 100%;"><input type="checkbox" style="margin-right: 5px; max-width: 100%;" checked="" data-readonly="">sasdsf</p><div style="max-width: 100%;"><input type="checkbox" style="margin-right: 5px; max-width: 100%;" data-readonly="">sfsdfs</div><div style="max-width: 100%;"><span style="color: green; font-weight: bold; font-style: italic; max-width: 100%;">​Hello Green</span><br style="max-width: 100%;"><div style="max-width: 100%;"><span style="background-color: yellow; max-width: 100%;"><span style="color: brown; max-width: 100%;"><span style="font-weight: bold; font-style: italic; max-width: 100%;">​Hihlighting</span></span></span></div></div><div style="max-width: 100%;"><ul style="max-width: 100%;"><li style="max-width: 100%;">asdassa&nbsp;</li></ul><ul style="max-width: 100%;"><li style="max-width: 100%;">sdfdsfdsf</li><li style="max-width: 100%;">fsdfs</li></ul><ol style="max-width: 100%;"><li style="max-width: 100%;"><span style="font-size: 36.621px; max-width: 100%;">sadsf</span></li><li style="max-width: 100%;"><span style="font-size: 36.621px; max-width: 100%;">adas</span></li><li style="max-width: 100%;"><span style="font-size: 36.621px; max-width: 100%;">sdfsdf</span></li><li style="max-width: 100%;"><span style="font-size: 36.621px; max-width: 100%;">sdfdsf</span></li></ol></div><p style="max-width: 100%;"></p><blockquote style="max-width: 100%;">asdadasafsdfsdfsdf</blockquote><h6 style="max-width: 100%;"><br style="max-width: 100%;"></h6><br><b>Screenshot from 2025-11-18 07-39-11.png</b>"