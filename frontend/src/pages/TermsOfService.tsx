import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-bg px-6 py-12 text-app-text">
      <div className="mx-auto max-w-3xl">

        <Button
          variant="secondary" onClick={() => navigate("/home")}>
          ← Back
        </Button>

        <h1 className="mb-2 text-3xl font-bold">
          Terms of Service
        </h1>

        <p className="mb-8 text-sm text-gray-400">
          Last updated: November 2026
        </p>

        <div className="space-y-8">

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              1. About the Service
            </h2>

            <p className="text-gray-300">
              This application is a fitness platform that allows users to
              manage their profile, discover gyms, create and track workouts,
              monitor progress, and interact with other users.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              2. User Accounts
            </h2>

            <p className="text-gray-300">
              Some features require a user account. You are responsible for
              providing accurate account information and for keeping access to
              your account secure.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              3. Acceptable Use
            </h2>

            <p className="text-gray-300">
              You must use the application responsibly. You must not attempt
              to interfere with the service, access another user's account
              without permission, abuse other users, or use the application
              for unlawful purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              4. Fitness Information
            </h2>

            <p className="text-gray-300">
              Workout, exercise, and progress information provided by the
              application is intended for general fitness purposes only. It
              should not be considered professional medical advice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              5. User Content and Profile Information
            </h2>

            <p className="text-gray-300">
              Users are responsible for the information they add to their
              profile and for their interactions with other users. Profile
              information should not be used to impersonate, harass, or harm
              another person.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              6. Service Availability
            </h2>

            <p className="text-gray-300">
              The application may be updated, modified, or temporarily
              unavailable while features are developed, maintained, or fixed.
              We do not guarantee uninterrupted availability of the service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              7. Privacy
            </h2>

            <p className="text-gray-300">
              Information about how user data is collected and used is
              described in our Privacy Policy.
            </p>

            <button
              type="button"
              onClick={() => navigate("/privacy")}
              className="mt-2 underline hover:opacity-80"
            >
              View Privacy Policy
            </button>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              8. Changes to These Terms
            </h2>

            <p className="text-gray-300">
              These Terms may be updated when the application or its features
              change. The latest version will always be available on this
              page.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default TermsOfService;