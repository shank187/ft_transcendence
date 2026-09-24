import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

const uploadDirectory = path.join(
        process.cwd(),
        "uploads",
        "avatars",
    );

fs.mkdirSync(uploadDirectory,{recursive: true});



function getExtension(mimetype: string)
{
    if (mimetype === "image/jpeg")
        return ".jpg";


    if (mimetype === "image/png")
        return ".png";

    if (mimetype === "image/webp")
        return ".webp";

    return null;
}

const storage = multer.diskStorage({
    destination: ( req , file, callback) => {
        callback(null,uploadDirectory);
    },

    filename: (req,file,callback) => {
        const extension = getExtension(file.mimetype);

        if (extension === null)
        {
            callback(new Error("Invalid image type"),"");
            return;
        }

        const generatedName = randomUUID() + extension;

        callback(null, generatedName);
    },
});

export const uploadAvatarFile =
    multer({
        storage: storage,

        limits: {
            fileSize: 2 * 1024 * 1024,
        },

        fileFilter: (req, file, callback) => {
            const extension = getExtension(file.mimetype);

            if (extension === null)
            {
                callback(new Error("Only JPG, PNG and WEBP are allowed"));
                return;
            }

            callback(null, true);
        }
    });