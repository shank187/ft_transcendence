import { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../features/auth/axiosInstance';
import { useAuth } from '../features/auth/AuthContext';
import Form_input from '../components/ui/Form_input';
import Button from '../components/ui/Button';
// import Or_divider from '../components/ui/Or_divider';
import Form_select from "../components/ui/Form_select";

const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const TRAINING_GOALS = [
    'BUILD_MUSCLE',
    'GAIN_STRENGTH',
    'LOSE_FAT',
    'IMPROVE_GENERAL_FITNESS',
    'IMPROVE_ENDURANCE',
    'MAINTAIN_FITNESS',
];

function Onboarding(){
    const [step, set_step] = useState(1);
    const [err_msg, set_err_msg] = useState('');
    const [is_submitting, set_is_submitting] = useState(false);

    const [form_data, set_form_data] = useState({displayName: '', bio: '', experienceLevel: '', primaryGoal: '', heightCm: '', weightKg: ''});
    const { setUser } = useAuth();
    const navigate = useNavigate();

    function handle_next() {
        set_err_msg('');

        if (step === 1 && !form_data.displayName.trim()) {
            set_err_msg("Display name is required");
            return;
        }

        if (step === 2 && (!form_data.experienceLevel || !form_data.primaryGoal))
        {
            set_err_msg("Please select your experience level and goal");
            return;
        }

        set_step(step + 1);
    }

    function handle_back()
    {
        set_err_msg('');
        set_step(step - 1);
    }

    async function handle_submit()
    {
        set_err_msg('');
        set_is_submitting(true);

        let heightCm;
        if (form_data.heightCm)
            heightCm = Number(form_data.heightCm);
        else
            heightCm = undefined;

        let weightKg;
        if (form_data.weightKg)
            weightKg = Number(form_data.weightKg);
        else
            weightKg = undefined;
        
        try {
            await api.patch('/api/users/onboarding', {
                displayName: form_data.displayName.trim(),
                bio: form_data.bio.trim() || undefined,
                experienceLevel: form_data.experienceLevel,
                primaryGoal: form_data.primaryGoal,
                unitSystem: 'METRIC',
                heightCm: heightCm,
                weightKg: weightKg,
            });

            const me = await api.get('/api/users/me');
            setUser(me.data);
            navigate('/home', { replace: true });

        } catch (error) {
            // console.error("Onboarding failed:", error);
            set_err_msg("Could not save your profile. Please try again.");
        } finally {
            set_is_submitting(false);
        }
    }


    useEffect(() => {
        async function checkOnboarding()
        {
            const response = await api.get('/api/users/me');

            if (response.data.onboardingCompletedAt)
                navigate('/home');
        }

        checkOnboarding();
    }, []);

    let buttonText;
    if (is_submitting) {
        buttonText = 'Saving...';
    } else {
        buttonText = 'Go to Home';
    }

    return (
        <div className="mx-auto w-full max-w-xl px-5 py-10">
            <p className="mb-6 text-sm text-gray-500">Step {step} of 4</p>
            {step === 1 && (
                <div className="space-y-5">
                    <h2 className="text-xl font-semibold">Tell us about you</h2>
                    <Form_input id="displayName" label="Display name" type="text" value={form_data.displayName} onChange={(value) => set_form_data({ ...form_data, displayName: value })}/>
                    <Form_input id="bio" label="Short bio (optional)" type="text" value={form_data.bio} onChange={(value) => set_form_data({ ...form_data, bio: value })}/>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-5">
                    <h2 className="text-xl font-semibold">Your training profile</h2>
                    <Form_select id="experienceLevel" label="Experience level" value={form_data.experienceLevel} options={EXPERIENCE_LEVELS} onChange={(value) => set_form_data({ ...form_data, experienceLevel: value })}/>
                    <Form_select id="primaryGoal" label="Primary goal" value={form_data.primaryGoal} options={TRAINING_GOALS} onChange={(value) => set_form_data({ ...form_data, primaryGoal: value }) }/>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-5">
                    <h2 className="text-xl font-semibold text-gray-900"> Optional details </h2>
                    <p className="text-sm text-gray-600"> You can leave these empty and update them later.</p>

                    <Form_input id="heightCm" label="Height (cm)" type="text" value={form_data.heightCm} onChange={(value) => set_form_data({ ...form_data, heightCm: value })}/>
                    <Form_input id="weightKg" label="Current weight (kg)" type="text" value={form_data.weightKg} onChange={(value) =>set_form_data({ ...form_data, weightKg: value })}/>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-5">
                    <h2 className="text-xl font-semibold text-gray-900"> Review your details</h2>
                    <p className="text-sm text-gray-600"> Check your information before continuing.</p>

                    <ul className="space-y-2 text-gray-700">
                        <li>Display name: {form_data.displayName}</li>
                        <li>Experience: {form_data.experienceLevel}</li>
                        <li>Goal: {form_data.primaryGoal.replaceAll('_', ' ')}</li>
                        <li>Units: Metric (kg/cm)</li>
                    </ul>
                </div>
            )}
            {err_msg && (
                <p className="mt-4 text-sm text-red-600">
                    {err_msg}
                </p>
            )}
            <div className="mt-8 flex gap-3">
                {step > 1 && (
                    <Button variant="secondary" onClick={handle_back}>
                        Back
                    </Button>
                )}

                {step < 4 && (
                    <Button onClick={handle_next}>
                        Next
                    </Button>
                )}

                {step === 4 && (
                    <Button onClick={handle_submit} disabled={is_submitting}>
                        {buttonText}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default Onboarding;