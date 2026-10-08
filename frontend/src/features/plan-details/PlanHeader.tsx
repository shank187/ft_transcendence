import { Link } from "react-router-dom"

export default function PlanHeader(props: {
  name: string
  description: string | null
}) {
  return (
    <header className="flex flex-col gap-5">
      <Link to="/workouts" className="self-start text-sm text-app-text-secondary hover:text-app-text">
        <span aria-hidden="true">‹ </span>Workouts
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold">{props.name}</h1>
        {props.description && <p className="text-sm text-app-text-secondary">{props.description}</p>}
      </div>
    </header>
  )
}
