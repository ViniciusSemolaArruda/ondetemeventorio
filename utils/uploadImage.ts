export async function uploadImageToCloudinary(uri: string): Promise<string> {
  const formData = new FormData()

  const fileName = uri.split("/").pop() || "image.jpg"
  const image = {
    uri,
    type: "image/jpeg", // ou image/png se necessário
    name: fileName,
  }

  formData.append("file", image as any)
  formData.append("upload_preset", "ondetemeventorio")
  formData.append("folder", "eventos")

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dulsljbxu/image/upload",
    {
      method: "POST",
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error("Erro ao enviar imagem")
  }

  const data = await response.json()
  return data.secure_url
}
