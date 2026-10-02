import Profile_fields from "../components/profile/Profile_fields";







export default function Edit_profile() {
    return (
        <div className="mx-auto max-w-md space-y-4 p-6">
            <div className="text-xl font-bold">
                Edit your profile
            </div>
            <Profile_fields/>
        </div>
    )
}