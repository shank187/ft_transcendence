export function format_weight(weightKg: number | null, unitSystem: string) {
    if (weightKg === null)
        return "";

    let weight = weightKg;

    if (unitSystem === "IMPERIAL")
        weight = weightKg / 0.45359237;

    return Number(weight.toFixed(2)).toString();
}

export function format_height(heightCm: number | null, unitSystem: string) {
    if (heightCm === null)
        return "";

    let height = heightCm;

    if (unitSystem === "IMPERIAL")
        height = heightCm / 2.54;

    return Number(height.toFixed(2)).toString();
}
