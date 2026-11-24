# Workouts (S3) frontend map

Pages in `src/pages/` (`Workouts`, `PlanDetail`, `DayEditor`, `WorkoutSession`) read the URL and render the views from here. `pages/Workouts.tsx` also has the "start an empty workout" button.

## One click, start to end

```text
tick a set
  → SetRowSession (fills empty boxes from the plan, parses the text)
  → useWorkoutSession().completeSet
  → updateSessionSet (workout-session.api.ts) → PATCH /api/workout-sessions/:id/sets/:setId
  → dispatch({ type: "setSaved", ... }) with the set the server returned
  → sessionReducer puts it in the workout
  → WorkoutSessionView re-renders; the cards and rows read the new data
```

The day editor works the same way without the API step: a click dispatches a `DraftAction`, `draftReducer` returns the new draft, and nothing is sent until Save.

## Files

### plans/ — the `/workouts` page
- `WorkoutPlanCatalog.tsx`: the user's plans and the create plan button.
- `WorkoutPlanCard.tsx`: one plan in the list.
- `CreatePlanDialog.tsx`: name and description of a new plan.
- `plans.api.ts`: list and create plans.
- `plans.types.ts`: `WorkoutPlan` from `shared/workouts.d.ts`.

### plan-details/ — `/workouts/plans/:planId`
- `PlanDetailView.tsx`: loads the plan (`useReducer(planReducer)`), shows its days, opens the day dialogs.
- `plan-details.reducer.ts`: the page state and every change to it (`PlanAction`, `planReducer`).
- `PlanHeader.tsx`: plan name, description, and the Rename / Delete plan menu.
- `DayRow.tsx`: one day: its number and name open the editor (Edit button from `md`), Start, or Add exercises when the day is empty, Rename / Delete menu.
- `AddDayForm.tsx`: add a day at the end.
- `RenamePlanDialog.tsx`, `DeletePlanDialog.tsx`, `RenameDayDialog.tsx`, `DeleteDayDialog.tsx`: one dialog each.
- `plan-details.api.ts`: plan and day requests.

### day-editor/ — `/workouts/plans/:planId/days/:dayId`
- `DayEditorView.tsx`: loads the day, holds the draft (`useReducer(draftReducer)`), Save, Discard, the leave dialog.
- `day-editor.draft.ts`: the draft and every change to it (`DraftAction`, `draftReducer`), validation, and the save body.
- `WorkoutExerciseCard.tsx`: one exercise of the day: sets, move, remove.
- `SetRow.tsx`: one planned set: type menu and target boxes.
- `day-editor.api.ts`: load and save the day.
- `day-editor.types.ts`: `DraftExercise` and `DraftSet` (text while typing), plus the shared day types.

### workout-session/ — `/workouts/session/:sessionId`
- `WorkoutSessionView.tsx`: loads the workout (`useReducer(sessionReducer)`), runs every request, gives the actions to the cards through the context, finish, discard, add exercises.
- `workout-session.reducer.ts`: the page state and every change to it (`SessionAction`, `sessionReducer`).
- `WorkoutSessionContext.ts`: what the cards and rows get from the page (`useWorkoutSession()`).
- `ExerciseSessionCard.tsx`: one exercise: move, remove, its sets, add set.
- `SetRowSession.tsx`: one set: type menu, value boxes, tick, PR badge.
- `SessionHeader.tsx`: name, timer, sets done, Add exercise, Finish and Discard.
- `SessionSummaryCard.tsx`: the summary and the XP after finishing.
- `FinishingDialog.tsx`: "finish with unticked sets?".
- `DiscardWorkoutDialog.tsx`: confirm discard, then delete the workout.
- `workout-session.helpers.ts`: pure functions: replace a set or an exercise, reorder, live PR badge, timer text.
- `workout-session.api.ts`: every workout request.
- `workout-session.types.ts`: `PerformedValues` (what a tick sends) and `SetPatch` (the PATCH body).

### shared/ — used by more than one page
- `set-values.ts`: `FIELDS`, one definition per set value (weight, reps, duration, distance): label, where it is stored, text ↔ number, rule and message. `FIELDS_BY_UNIT` swaps weight and distance to lb and mi for imperial users; the stored values stay kg and meters.
- `use-unit-system.ts`: `useUnitSystem()`, the user's METRIC / IMPERIAL setting from the profile.
- `exercise-fields.ts`: which value boxes each exercise type shows, set type names and letters.
- `SetValueInput.tsx`: one value box with its error.
- `SetColumnsHeader.tsx`: the SET / KG / REPS titles (LB / MI for imperial users).
- `ExerciseCardHeader.tsx`: number, image, name, type of an exercise card.
- `ExerciseCardActions.tsx`: move up / down and remove, shared by the day editor and the workout.
- `SetTypeMenu.tsx`: the set type menu (Normal, Heavy, ..., Remove set).
- `ActiveWorkoutDialog.tsx`: "you have a workout in progress": resume or discard it.
- `start-workout.ts`: start a workout; turns the 409 into `ActiveWorkoutError`.
- `StartDayButton.tsx`: Start for one day (plan page and Home), with the "workout in progress" dialog.
- `NextWorkoutCard.tsx`: the Home next workout card: Start, Resume or Add exercises, and the last time this day was finished with the target to beat.
- `get-plan-details.ts`: load one plan (plan page and day editor), and `getNextDay` for Home.
- `api-error.ts`: turns a failed request into a message to show.
- `limits.ts`: the same limits as the backend, and the plan name / day name checks (`planInputError`, `dayNameError`) used by the create, rename and add-day forms.
- `workouts.types.ts`: the workout types from `shared/workouts.d.ts`, plus `WorkoutPlanInput`.
- `exercise-picker/`: the exercise picker (search, filters, sort, gym, pages): a drawer in the workout and below `xl` in the day editor, a docked panel beside the day from `xl`.
  - `ExercisePicker.tsx`: the search box, filters, list, Load more and the selection.
  - `ExerciseRow.tsx`: one exercise: image, name, muscle and equipment, "Not at your gym" or "In this day / workout".
  - `exercise.api.ts`: `getExercises` and `getExerciseFilter`.
  - `exercise.types.ts`: `ExerciseQuery` and the shared exercise types.
