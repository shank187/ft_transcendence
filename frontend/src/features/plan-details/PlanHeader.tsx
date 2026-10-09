import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import Button from "../../components/ui/Button"
import DropDownMenu from "../../components/ui/DropdownMenu"
import type { PlanDetail } from "./plan-detail.types"
import RenamePlanDialog from "./RenamePlanDialog"
import DeletePlanDialog from "./DeletePlanDialog"

export default function PlanHeader(props: {
  planId: string
  name: string
  description: string | null
  onRenamed: (plan: PlanDetail) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuWrapper = useRef<HTMLDivElement>(null)

  // close the menu on a press outside the ⋮ button and the menu
  useEffect(() => {
    if (!menuOpen) return

    const closeOnOutsidePress = (event: PointerEvent) => {
      const wrapper = menuWrapper.current
      if (wrapper && !wrapper.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress)

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress)
    }
  }, [menuOpen])

  return (
    <header className="flex flex-col gap-5">
      <Link to="/workouts" className="self-start text-sm text-app-text-secondary hover:text-app-text">
        <span aria-hidden="true">‹ </span>Workouts
      </Link>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="break-words text-[28px] font-semibold">{props.name}</h1>
          {props.description && <p className="text-sm text-app-text-secondary">{props.description}</p>}
        </div>
        <div ref={menuWrapper} className="relative">
          <Button
            variant="ghost"
            aria-label={`Actions for ${props.name}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ⋮
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 rounded-md border border-app-border bg-app-surface-raised p-1">
              <DropDownMenu
                actions={[
                  { id: "rename-plan", label: "Rename", onSelect: () => { setMenuOpen(false); setRenaming(true) } },
                  { id: "delete-plan", label: "Delete plan", onSelect: () => { setMenuOpen(false); setDeleting(true) }, danger: true },
                ]}
                onClose={() => setMenuOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
      {renaming && (
        <RenamePlanDialog
          planId={props.planId}
          name={props.name}
          description={props.description}
          onClose={() => setRenaming(false)}
          onRenamed={props.onRenamed}
        />
      )}
      {deleting && (
        <DeletePlanDialog
          planId={props.planId}
          name={props.name}
          onClose={() => setDeleting(false)}
        />
      )}
    </header>
  )
}
