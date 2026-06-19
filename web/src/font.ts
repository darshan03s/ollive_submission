import { readFileSync } from 'fs'
import { join } from 'path'

export const InstrumentSerifFontData = readFileSync(
  join(process.cwd(), 'public/fonts/Instrument_Serif/InstrumentSerif-Regular.ttf')
)
