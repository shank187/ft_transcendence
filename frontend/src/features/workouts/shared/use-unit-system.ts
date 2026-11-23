import { useAuth } from "../../auth/AuthContext"
import type { UnitSystem } from "./set-values"

// S3 pages render only after /api/users/me has loaded (ProtectedRoute needs the user),
// so the first render already has the profile's unit.
export function useUnitSystem(): UnitSystem
{
    return useAuth().user?.unitSystem ?? "METRIC"
}
