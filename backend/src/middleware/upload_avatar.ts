import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";

import type { RequestHandler } from "express";




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

export const upload_avatar: RequestHandler = (req, res, next) => {
    uploadSingle(req, res, (error) => {
        if (!error)
        {
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

            res.status(400).json({message: "Invalid avatar upload."});
            return;
        }

        if (error.message === "Choose a JPG or PNG image.")
        {
            res.status(400).json({message: error.message});
            return;
        }

        next(error);
    });
};