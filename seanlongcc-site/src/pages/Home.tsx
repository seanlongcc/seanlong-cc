import { useState } from 'react'
import WarpSpeed from '../components/WarpSpeed'
import TextWarp from '../components/TextWarp'

const Home = () => {
  const [isWarpHover, setIsWarpHover] = useState(false)
  const normalTextSpeed = 50
  const hoverTextSpeed  = 300

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <WarpSpeed
        starCount={1000}
        speed={5}
        speedOnHover={75}
        hoverRadius={100}
        onHoverChange={setIsWarpHover}
      />
      <TextWarp speed={isWarpHover ? hoverTextSpeed : normalTextSpeed} />
    </div>
  )
}

export default Home
