export default function PlanHeader(props: {
  name: string
  description: string | null
  type: string
  dayCount: number
}) {
  return (
    <header>
      <h1>{props.name}</h1>
      {props.description && <p>{props.description}</p>}
      <p>{props.type} · {props.dayCount} {props.dayCount === 1 ? "day" : "days"}</p>
    </header>
  )
}