import * as ImagePicker from "expo-image-picker";

function toDataUrl(asset: ImagePicker.ImagePickerAsset) {
  if (!asset.base64) {
    throw new Error("image-read-failed");
  }

  return `data:${asset.mimeType?.trim() || "image/jpeg"};base64,${asset.base64}`;
}

async function pickImage(source: "camera" | "library") {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error(source === "camera" ? "camera-permission" : "photo-permission");
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({
          base64: true,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8
        })
      : await ImagePicker.launchImageLibraryAsync({
          base64: true,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          selectionLimit: 1
        });

  if (result.canceled) {
    return null;
  }

  return toDataUrl(result.assets[0]);
}

export function chooseProfilePhoto() {
  return pickImage("library");
}

export function takeProfilePhoto() {
  return pickImage("camera");
}
