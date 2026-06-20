import { ModeToggle } from './mode-toggle'
import Brand from './brand'

const Header = () => {
  return (
    <header className="h-(--header-height) flex items-center justify-between px-4 backdrop-blur-md bg-background/60 sticky top-0 left-0 z-10">
      <div className="header-left">
        <Brand />
      </div>
      <div className="header-right">
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
