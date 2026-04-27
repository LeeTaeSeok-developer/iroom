import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const imageRef = ref(storage, `${folder}/${fileName}`);

  await uploadBytes(imageRef, file, {
    contentType: file.type,
  });

  return await getDownloadURL(imageRef);
}