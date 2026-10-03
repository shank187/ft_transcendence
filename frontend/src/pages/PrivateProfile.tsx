import Profile_fields from "../components/profile/Profile_fields";







export default function Edit_profile() {
    return (
    <div className="w-full max-w-5xl py-6 pl-12 pr-6">
        <div className="mb-6 text-xl font-bold">
            Edit your profile
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
                <Profile_fields />
            </div>

            <div className="w-full md:w-64 md:shrink-0">
                {/* <Avatar_upload /> */}
            </div>
        </div>
    </div>
);
}