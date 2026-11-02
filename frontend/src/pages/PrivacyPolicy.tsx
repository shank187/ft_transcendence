import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";


function PrivacyPolicy() {

    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-app-bg px-6 py-12 text-app-text">
      <div className="mx-auto max-w-3xl">

        <Button variant="secondary"  onClick={() => navigate("/home")}>
          ← Back
        </Button>

        <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>

        <p className="mb-8 text-sm text-app-text-secondary">
          Last updated: November 2, 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="mb-2 text-xl font-semibold">
              1. Information We Collect
            </h2>

            <p className="text-app-text-secondary">
              We collect information needed to provide the features of our
              fitness platform, including account information such as your
              username and email address, profile information, authentication
              information, and fitness-related data that you choose to provide.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              2. Account and Profile Information
            </h2>

            <p className="text-app-text-secondary">
              Your account may contain information such as your username, email
              address, display name, biography, profile picture, experience
              level, training goal, preferred unit system, and optional body
              information.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              3. Authentication Information
            </h2>

            <p className="text-app-text-secondary">
              Passwords are stored securely using hashing and are never stored
              as plain text. We also use authentication tokens and session
              cookies to keep users signed in securely.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              4. Google Authentication
            </h2>

            <p className="text-app-text-secondary">
              If you choose to sign in with Google, we may receive basic account
              information from Google, such as your verified email address and
              account identifier, for authentication purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              5. Fitness and Activity Data
            </h2>

            <p className="text-app-text-secondary">
              The application may store information related to your workouts,
              training plans, workout history, progress, achievements, selected
              gym, and other fitness activity necessary to provide application
              features.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              6. How We Use Your Information
            </h2>

            <p className="text-app-text-secondary">
              We use your information to authenticate your account, provide
              profile and fitness features, save your progress, support social
              features, improve application functionality, and protect the
              security of the platform.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              7. Public and Private Information
            </h2>

            <p className="text-app-text-secondary">
              Some profile information may be visible to other users through
              public profile features. Sensitive or private information, such
              as authentication credentials and private fitness information,
              is not intended to be publicly displayed.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              8. Data Security
            </h2>

            <p className="text-app-text-secondary">
              We use security measures such as password hashing, authenticated
              API routes, access controls, and secure session handling to
              protect user information.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              9. Cookies
            </h2>

            <p className="text-app-text-secondary">
              The application uses cookies when necessary for authentication
              and session management. Authentication cookies may be configured
              as HttpOnly so they cannot be accessed directly by browser
              JavaScript.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              10. Changes to This Policy
            </h2>

            <p className="text-app-text-secondary">
              This Privacy Policy may be updated when the application changes.
              The latest version will remain available on this page.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              11. Contact
            </h2>

            <p className="text-app-text-secondary">
              This application was created as part of the 42 ft_transcendence
              educational project. Questions about privacy can be directed to
              the project team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;