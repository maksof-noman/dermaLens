export interface ScanResponse {
  scanId: number;
  imageUrl: string;
  analysis: any | null;
  success: boolean;
  confidence: number;
  skinConcerns: string[];
  recommendedProducts: any[];
  promptVersion: string;
  message: string;
}

export const scanFaceApi = async (
  imageFile: File,
  promptVersion: string = "v1"
): Promise<ScanResponse> => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("promptVersion", promptVersion);

  // Force local API
  const response = await fetch("http://localhost:3000/api/dermaLens/scanFace", {
    method: "POST",
    body: formData,
  });
  console.log(response,"response")

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Scan failed");
  }

  return response.json();
};
