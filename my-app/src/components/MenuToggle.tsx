interface MenuToggleProps {
  isOpen: boolean
  onClick: () => void
}

export function MenuToggle({ isOpen, onClick }: MenuToggleProps) {
  return (
    <button className={`menu-toggle ${isOpen ? 'open' : ''}`} onClick={onClick} aria-label="Toggle sidebar">
      <span />
      <span />
      <span />
    </button>
  )
}