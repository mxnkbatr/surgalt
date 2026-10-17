type Props = {
  size?: number
  className?: string
}

export function Logo({ size = 36, className = '' }: Props) {
  return (
    <img
      src="/logo.svg"
      alt="surgalt"
      width={size}
      height={size}
      className={`brand-logo ${className}`.trim()}
      draggable={false}
    />
  )
}
