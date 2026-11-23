import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";

import type { Request, Response, NextFunction, RequestHandler } from "express";
import sharp from "sharp";
import { unlink } from "node:fs/promises";




const upload_folder = path.resolve("uploads/avatars");



const storage = multer.diskStorage({

    destination: (req, file, callback)=>
    {
        callback(null, upload_folder);
    },
    filename : (req, file, callback)=>
    {
        let extention = ".jpg";
        if (file.mimetype === "image/png")
            extention = ".png";

        const filename = randomUUID() + extention;
        callback(null, filename);
    }

});


const upload = multer({
    storage: storage,
    limits: {
        fileSize : 2*1024*1024, 
        files:1
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
            callback(null, true);
        else
            callback(new Error("Choose a JPG or PNG image."));
    }
});


const uploadSingle = upload.single("avatar");

export async function handle_image_upload(req: Request, res: Response, next: NextFunction,error: Error | null | undefined)
{
    if (!error)
    {
        if (!req.file) {
            res.status(400).json({ message: "Please select an image." });
            return;
        }

        try {
            const image = sharp(req.file.path);

            const metadata = await image.metadata();

            if ((metadata.format !== "jpeg" && metadata.format !== "png") || req.file.mimetype !== `image/${metadata.format}`)
                throw new Error("Invalid image format.");

            // Force Sharp to decode the image, not just read its headers.
            await image.toBuffer();
        } catch {
            try {
                await unlink(req.file.path);
            } catch (delete_error) {
                if (typeof delete_error !== "object" || delete_error === null || !("code" in delete_error) || delete_error.code !== "ENOENT") {
                    console.log("error :", delete_error);
                    res.status(500).json({message: "Could not remove the invalid upload."});
                    return;
                }
            }

            res.status(400).json({message: "Choose a valid JPG or PNG image."});
            return;
        }

        next();
        return;
    }

    if (error instanceof multer.MulterError)
    {
        if (error.code === "LIMIT_FILE_SIZE")
        {
            res.status(413).json({message: "Image must not exceed 2 MB."});
            return;
        }

        res.status(400).json({message: "Invalid image upload."});
        return;
    }

    if (error.message === "Choose a JPG or PNG image.")
    {
        res.status(400).json({message: error.message});
        return;
    }

    console.log("error :", error);
    res.status(500).json({message: "Could not upload your image."});
}

export const upload_avatar: RequestHandler = (req, res, next) => {
    uploadSingle(req, res, async (error) => {
        await handle_image_upload(req, res, next, error);
    });
};
