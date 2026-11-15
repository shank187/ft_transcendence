import { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../features/auth/axiosInstance';
import { useAuth } from '../features/auth/AuthContext';
import Form_input from '../components/ui/Form_input';
import Button from '../components/ui/Button';
import Form_select from "../components/ui/Form_select";
import { isAxiosError } from 'axios';

export const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const TRAINING_GOALS = [
    'BUILD_MUSCLE',
    'GAIN_STRENGTH',
    'LOSE_FAT',
    'IMPROVE_GENERAL_FITNESS',
];

function Onboarding(){
    const [step, set_step] = useState(1);
    const [err_msg, set_err_msg] = useState('');
    const [is_submitting, set_is_submitting] = useState(false);

    const [form_data, set_form_data] = useState({displayName: '', bio: '', experienceLevel: '', primaryGoal: '', unitSystem: 'METRIC', weightKg: ''});
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

        if (step === 3 && !form_data.unitSystem)
        {
            set_err_msg("Please select a unit system");
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

        let weightKg: number | undefined;
        if (form_data.weightKg.trim() === '') {
            weightKg = undefined;
        } else {
            weightKg = Number(form_data.weightKg);
            if (form_data.unitSystem === 'IMPERIAL')
                weightKg = weightKg * 0.453592;
            if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 500) {
                set_err_msg('Invalid weight value');
                return;
            }
        }

        set_is_submitting(true);

      
        try {
            await api.patch('/api/users/onboarding', {
                displayName: form_data.displayName.trim(),
                bio: form_data.bio.trim() || undefined,
                experienceLevel: form_data.experienceLevel,
                primaryGoal: form_data.primaryGoal,
                unitSystem: form_data.unitSystem,
                weightKg: weightKg,
            });

            const me = await api.get('/api/users/me');
            setUser(me.data);
            navigate('/home', { replace: true });

        } catch (error) {
            set_err_msg(isAxiosError(error)
                ? error.response?.data?.message || "Could not save your profile. Please try again."
                : "Could not save your profile. Please try again.");
        } finally {
            set_is_submitting(false);
        }
    }


    useEffect(() => {
        async function checkOnboarding()
        {
           try {
                const response = await api.get('/api/users/me');

                if (response.data.onboardingCompletedAt)
                    navigate('/home', { replace: true });
            } catch (error) {
                if (isAxiosError(error))
                    set_err_msg(error.response?.data?.message || 'Could not check your onboarding status. Please try again.');
                else
                    set_err_msg('Could not check your onboarding status. Please try again.');
            }
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
        <div className="flex min-h-screen flex-col p-4">
        <div className="m-auto w-full max-w-md rounded-xl border border-app-border p-6 [&_input]:py-3 [&_select]:py-3">
            <p className="mb-6 text-sm text-app-text-muted">Step {step} of 4</p>
            {step === 1 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Tell us about you</h2>
                    <Form_input id="displayName" label="Display name" type="text" value={form_data.displayName} onChange={(value) => set_form_data({ ...form_data, displayName: value })}/>
                    <Form_input id="bio" label="Short bio (optional)" type="text" value={form_data.bio} onChange={(value) => set_form_data({ ...form_data, bio: value })} required={false}/>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Your training profile</h2>
                    <Form_select id="experienceLevel" label="Experience level" value={form_data.experienceLevel} options={EXPERIENCE_LEVELS} onChange={(value) => set_form_data({ ...form_data, experienceLevel: value })}/>
                    <Form_select id="primaryGoal" label="Primary goal" value={form_data.primaryGoal} options={TRAINING_GOALS} onChange={(value) => set_form_data({ ...form_data, primaryGoal: value }) }/>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold"> Optional details </h2>
                    <p className="text-sm text-app-text-secondary"> You can leave these empty and update them later.</p>

                    <Form_select id="unitSystem" label="Unit system" value={form_data.unitSystem} options={['METRIC', 'IMPERIAL']} onChange={(value) =>set_form_data({ ...form_data, unitSystem: value })}/>
                    <Form_input id="weightKg" label={form_data.unitSystem === 'IMPERIAL' ? 'Current weight (lb)' : 'Current weight (kg)'} type="number" value={form_data.weightKg} onChange={(value) =>set_form_data({ ...form_data, weightKg: value })} required={false}/>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold"> Review your details</h2>
                    <p className="text-sm text-app-text-secondary"> Check your information before continuing.</p>

                    <ul className="space-y-3  text-sm text-app-text-secondary">
                        <li>Display name: {form_data.displayName}</li>
                        <li>Experience: {form_data.experienceLevel}</li>
                        <li>Goal: {form_data.primaryGoal.replaceAll('_', ' ')}</li>
                        <li>Units: {form_data.unitSystem}</li>
                    </ul>
                </div>
            )}
            {err_msg && (
                <p className="mt-4 text-sm text-app-danger">
                    {err_msg}
                </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {step > 1 && (
                    <Button variant="secondary" className="flex-1 border border-app-border" onClick={handle_back}>
                        Back
                    </Button>
                )}

                {step < 4 && (
                    <Button className="flex-1" onClick={handle_next}>
                        Next
                    </Button>
                )}

                {step === 4 && (
                    <Button className="flex-1" onClick={handle_submit} disabled={is_submitting}>
                        {buttonText}
                    </Button>
                )}
            </div>
        </div>
        </div>
    );
}

export default Onboarding;
