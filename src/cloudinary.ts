import { v2 as cloudinary } from "cloudinary";
import multer, { Multer } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v4 as uuidv4 } from "uuid";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    public_id: (req, file) => uuidv4(),
    // likely a library typing issue
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    folder: "proofs",
  },
});

const uploader: Multer = multer({ storage: storage });

export default uploader;
