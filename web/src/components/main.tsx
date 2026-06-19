import { cn } from '@/lib/utils'

type Props = React.ComponentProps<'main'>

const Main = ({ className, ...props }: Props) => {
  return (
    <main className={cn('min-h-[calc(100vh-var(--header-height))] h-full', className)} {...props} />
  )
}

export default Main
