import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { prisma } from "../../lib/prisma";
import {
    approveSubmission,
    createGym,
    getALLEquip,
    getGymById,
    getSubmissions,
    rejectSubmission,
    searchForGyms,
    selectCurrentGym,
} from "./gym.service";

export async function searchGymsController(
    req: AuthenticatedRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.status(401).json({ message: "unauthorized" });
    }

    try {
        const search = typeof req.query.textSearched === "string"
            ? req.query.textSearched
            : undefined;
        const city = typeof req.query.city === "string"
            ? req.query.city
            : undefined;
        const page = Number(req.query.page) || 1;

        let isVerified: boolean | undefined;
        if (req.query.verified === "true") isVerified = true;
        if (req.query.verified === "false") isVerified = false;

        const gyms = await searchForGyms(search, city, isVerified, page);
        return res.status(200).json(gyms);
    } catch (error) {
        console.log("error fetching gyms", error);
        return res.status(500).json({ error: "server error" });
    }
}

export async function getGymByIdController(
    req: AuthenticatedRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.status(401).json({ message: "unauthorized" });
    }

    try {
        const id = req.params.id;
        const userId = req.userId;

        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid or missing gym ID" });
        }

        const gym = await getGymById(id, userId);

        if (!gym) {
            return res.status(404).json({ message: "Gym not found" });
        }

        if (gym.visibility === "PRIVATE" && gym.createdById !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        return res.status(200).json(gym);
    } catch (error) {
        console.log("error fetching this gym", error);
        return res.status(500).json({ error: "server error" });
    }
}

export async function getALLEquipController(
    req: AuthenticatedRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.status(401).json({ message: "unauthorized" });
    }

    try {
        const equip = await getALLEquip();
        return res.status(200).json(equip);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ e: "server error" });
    }
}

export async function createGymController(
    req: AuthenticatedRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.status(401).json({ message: "unauthorized" });
    }

    const {
        name,
        city,
        address,
        phone,
        website,
        description,
        imageUrl,
        isPrivate,
        equipment,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ e: "gym name is required" });
    }

    const data = {
        userID: req.userId,
        dataName: name.trim(),
        dataCity: typeof city === "string" && city.trim() !== "" ? city.trim() : undefined,
        dataAddress: typeof address === "string" && address.trim() !== "" ? address.trim() : undefined,
        dataPhone: typeof phone === "string" && phone.trim() !== "" ? phone.trim() : undefined,
        dataWebsite: typeof website === "string" && website.trim() !== "" ? website.trim() : undefined,
        dataDescription: typeof description === "string" && description.trim() !== "" ? description.trim() : undefined,
        dataImageUrl: typeof imageUrl === "string" ? imageUrl.trim() : undefined,
        dataIsPrivate: isPrivate === true,
        dataEquip: Array.isArray(equipment)
            ? equipment.filter((item) =>
                typeof item.equipmentId === "string" && item.equipmentId.trim() !== ""
            )
            : [],
    };

    try {
        const result = await createGym(data);
        const msg = isPrivate
            ? "Private gym created successfully"
            : "Gym submitted for admin approval";

        return res.status(201).json({ msg, result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ e: "server error" });
    }
}

export async function getSubmissionsController(
    req: AuthenticatedRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.status(401).json({ message: "unauthorized" });
    }

    try {
        const isAdmin = await prisma.userRole.findFirst({
            where: {
                userId: req.userId,
                role: { name: "ADMIN" },
            },
        });

        if (!isAdmin) {
            return res.status(403).json({ message: "Forbidden: admin access required." });
        }

        const submissions = await getSubmissions();
        return res.status(200).json(submissions);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ e: "server error" });
    }
}

export async function uploadGymImageController(
    req: AuthenticatedRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.status(401).json({ message: "unauthorized" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "Please select an image." });
    }

    // Multer saves the file. Return the URL the browser can use to display it.
    const imageUrl = "/uploads/gyms/" + req.file.filename;
    return res.status(200).json({ imageUrl });
}

export async function rejectSubmissionController(
    req: AuthenticatedRequest,
    res: Response,
) {
    const reviewerId = req.userId;
    const submissionId = req.params.id;
    const reason = typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!reviewerId) {
        return res.status(401).json({ message: "Sign in first." });
    }

    if (typeof submissionId !== "string" || !submissionId.trim() || !reason) {
        return res.status(400).json({ message: "A submission ID and reason are required." });
    }

    try {
        const adminRole = await prisma.userRole.findFirst({
            where: { userId: reviewerId, role: { name: "ADMIN" } },
        });

        if (!adminRole) {
            return res.status(403).json({ message: "Admin access required." });
        }

        const result = await rejectSubmission(submissionId, reviewerId, reason);

        switch (result) {
            case "rejected":
                return res.status(200).json({ id: submissionId, status: "REJECTED" });
            case "not-found":
                return res.status(404).json({ message: "Submission not found." });
            case "self-review":
                return res.status(403).json({ message: "You can’t review your own submission." });
            case "conflict":
                return res.status(409).json({ message: "This submission was already reviewed." });
        }
    } catch (error) {
        console.error("Could not reject gym submission", error);
        return res.status(500).json({ message: "Could not decline the submission." });
    }
}

export async function approveSubmissionController(
    req: AuthenticatedRequest,
    res: Response,
) {
    const reviewerId = req.userId;
    const submissionId = req.params.id;

    if (!reviewerId) {
        return res.status(401).json({ message: "Sign in first." });
    }

    if (typeof submissionId !== "string" || !submissionId.trim()) {
        return res.status(400).json({ message: "A submission ID is required." });
    }

    try {
        // Check admin access before changing the submission.
        const adminRole = await prisma.userRole.findFirst({
            where: { userId: reviewerId, role: { name: "ADMIN" } },
        });

        if (!adminRole) {
            return res.status(403).json({ message: "Admin access required." });
        }

        const result = await approveSubmission(submissionId, reviewerId);

        switch (result) {
            case "approved":
                return res.status(200).json({ id: submissionId, status: "APPROVED" });
            case "not-found":
                return res.status(404).json({ message: "Submission not found." });
            case "self-review":
                return res.status(403).json({ message: "You can’t review your own submission." });
            case "conflict":
                return res.status(409).json({ message: "This submission was already reviewed." });
            case "unsupported":
                return res.status(409).json({ message: "This submission type cannot be approved yet." });
        }
    } catch (error) {
        console.error("Could not approve gym submission", error);
        return res.status(500).json({ message: "Could not approve the submission." });
    }
}

export async function CurrentGymCOntroller(
    req: AuthenticatedRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.status(401).json({ message: "unauthorized" });
    }

    const gymId = req.body.gymId;
    if (!gymId || typeof gymId !== "string") {
        return res.status(400).json({ message: "gymId is required" });
    }

    try {
        await selectCurrentGym(gymId, req.userId);
        return res.status(200).json({ message: "Gym selected successfully" });
    } catch (error: any) {
        if (error.message === "Gym not found") {
            return res.status(404).json({ error: "Gym not found" });
        }
        if (error.message === "Access denied") {
            return res.status(403).json({ error: "Access denied" });
        }
        if (error.message === "Gym is unverified") {
            return res.status(422).json({ error: "Cannot select an unverified gym" });
        }

        console.log(error);
        return res.status(500).json({ error: "server error" });
    }
}