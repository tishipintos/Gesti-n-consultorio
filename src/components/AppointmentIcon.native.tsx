import Svg, { Path } from 'react-native-svg'

export function AppointmentIcon({ size = 24 }: { size?: number }) {
  return <Svg accessible={false} width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 3v4m8-4v4M4 10h16m0 2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h6m5-2h6m-3-3v6" stroke="white" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
}
