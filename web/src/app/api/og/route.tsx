import { APP_NAME } from '@/metadata'
import { InstrumentSerifFontData } from '@/font'
import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        background: 'white',
        width: '100%',
        height: '100%',
        padding: '50px 200px',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}
    >
      <span
        style={{
          fontFamily: 'Instrument Serif',
          fontSize: 80,
          fontWeight: 'bold',
          color: 'black'
        }}
      >
        {APP_NAME}
      </span>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Instrument Serif',
          data: InstrumentSerifFontData,
          style: 'normal'
        }
      ]
    }
  )
}
