import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { handle_image_upload } from "./upload_avatar";




const upload_folder = path.resolve("uploads/gyms");



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


export const upload_gym_image: RequestHandler = (req, res, next) => {
    upload.single("image")(req, res, async (error) => {
        await handle_image_upload(req, res, next, error);
    });
};
