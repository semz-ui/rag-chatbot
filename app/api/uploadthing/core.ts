import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    pdfUpload: f({
        pdf: {
            maxFileSize: "2MB", maxFileCount: 1
        }
    }).onUploadComplete(async ({ metadata, file }) => {
        console.log("file url: ", file.url);
        return { uploadedBy: "Michael" }
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
