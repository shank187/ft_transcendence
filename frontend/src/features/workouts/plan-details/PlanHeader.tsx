import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, EllipsisVertical, Pencil, Trash2 } from "lucide-react"
import DropDownMenu from "../../../components/ui/DropdownMenu"
import type { PlanDetail } from "../shared/workouts.types"
import RenamePlanDialog from "./RenamePlanDialog"
import DeletePlanDialog from "./DeletePlanDialog"

interface PlanHeaderProps {
  planId: string
  name: string
  description: string | null
  onRenamed: (plan: PlanDetail) => void
}

const headerButtonClasses = "flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-app-border bg-app-surface text-sm font-semibold hover:bg-app-surface-hover"

export default function PlanHeader(props: PlanHeaderProps)
{
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
    <header className="flex flex-col gap-3">
      <Link to="/workouts" className="-ml-1.5 flex h-11 items-center gap-1 self-start text-sm font-medium text-app-text-secondary hover:text-app-text">
        <ChevronLeft aria-hidden="true" className="size-5" />
        Workouts
      </Link>
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1 className="text-[26px] font-bold tracking-tight wrap-break-word md:text-[32px]">{props.name}</h1>
          {props.description && <p className="text-sm leading-relaxed text-app-text-secondary md:text-[15px]">{props.description}</p>}
        </div>

        {/* Phones: one ⋮ menu. From md there is room for both buttons. */}
        <div ref={menuWrapper} className="relative md:hidden">
          <button
          type="button"
          aria-label={`Actions for ${props.name}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className={`${headerButtonClasses} w-11`}
          >
            <EllipsisVertical aria-hidden="true" className="size-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 rounded-xl border border-app-border bg-app-surface-raised p-1.5 shadow-2xl shadow-black/50">
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
        <button type="button" onClick={() => setRenaming(true)} className={`${headerButtonClasses} hidden px-3.5 md:flex`}>
          <Pencil aria-hidden="true" className="size-4" />
          Rename
        </button>
        <button type="button" aria-label={`Delete ${props.name}`} onClick={() => setDeleting(true)} className={`${headerButtonClasses} hidden w-11 text-app-danger md:flex`}>
          <Trash2 aria-hidden="true" className="size-4.5" />
        </button>
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
