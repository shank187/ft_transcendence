import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axiosInstance';

const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const TRAINING_GOALS = [
    'BUILD_MUSCLE',
    'GAIN_STRENGTH',
    'LOSE_FAT',
    'IMPROVE_GENERAL_FITNESS',
    'IMPROVE_ENDURANCE',
    'MAINTAIN_FITNESS',
];

function Onboarding() {
    const [step, setStep] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        experienceLevel: '',
        primaryGoal: '',
        heightCm: '',
        weightKg: '',
    });

    const navigate = useNavigate();

    function handleNext() {
        setErrorMessage('');

        if (step === 1 && !formData.displayName.trim()) {
            setErrorMessage("Display name is required");
            return;
        }

        if (step === 2 && (!formData.experienceLevel || !formData.primaryGoal)) {
            setErrorMessage("Please select your experience level and goal");
            return;
        }

        setStep(step + 1);
    }

    function handleBack() {
        setErrorMessage('');
        setStep(step - 1);
    }

    async function handleSubmit() {
        setErrorMessage('');
        setIsSubmitting(true);

        let heightCm;
        if (formData.heightCm)
            heightCm = Number(formData.heightCm);
        else
            heightCm = undefined;

        let weightKg;
        if (formData.weightKg)
            weightKg = Number(formData.weightKg);
        else
            weightKg = undefined;
        
        try {
            await api.patch('/api/users/onboarding', {
                displayName: formData.displayName.trim(),
                bio: formData.bio.trim() || undefined,
                experienceLevel: formData.experienceLevel,
                primaryGoal: formData.primaryGoal,
                unitSystem: 'METRIC',
                heightCm: heightCm,
                weightKg: weightKg,
            });

            navigate('/home');

        } catch (error) {
            console.error("Onboarding failed:", error);
            setErrorMessage("Could not save your profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }



    let buttonText;
    if (isSubmitting) {
        buttonText = 'Saving...';
    } else {
        buttonText = 'Go to Home';
    }

    return (
        <div>
            <p>Step {step} of 4</p>

            {step === 1 && (
                <div>
                    <h2>Tell us about you</h2>
                    <div>
                        <label htmlFor="displayName">Display name</label>
                        <input
                            id="displayName"
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="bio">Short bio (optional)</label>
                        <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2>Your training profile</h2>
                    <div>
                        <label htmlFor="experienceLevel">Experience level</label>
                        <select
                            id="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                        >
                            <option value="">Select an option</option>
                            {EXPERIENCE_LEVELS.map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="primaryGoal">Primary goal</label>
                        <select
                            id="primaryGoal"
                            value={formData.primaryGoal}
                            onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                        >
                            <option value="">Select an option</option>
                            {TRAINING_GOALS.map((goal) => (
                                <option key={goal} value={goal}>{goal}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h2>Body & units</h2>
                    <p>These are optional, you can change them later in Settings.</p>

                    <div>
                        <label htmlFor="heightCm">Height (cm)</label>
                        <input
                            id="heightCm"
                            type="number"
                            value={formData.heightCm}
                            onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="weightKg">Current weight (kg)</label>
                        <input
                            id="weightKg"
                            type="number"
                            value={formData.weightKg}
                            onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {step === 4 && (
                <div>
                    <h2>You're ready</h2>
                    <ul>
                        <li>Display name: {formData.displayName}</li>
                        <li>Experience: {formData.experienceLevel}</li>
                        <li>Goal: {formData.primaryGoal}</li>
                        <li>Units: Metric (kg/cm)</li>
                    </ul>
                </div>
            )}

            {errorMessage && <p>{errorMessage}</p>}

            <div>
                {step > 1 && <button type="button" onClick={handleBack}>Back</button>}
                {step < 4 && <button type="button" onClick={handleNext}>Next</button>}
                {step === 4 && (
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
}

export default Onboarding;