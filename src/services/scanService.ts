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

  const response = await fetch("http://localhost:3000/api/dermaLens/scanFace", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if(data){
    const recommendedProducts = data.recommendedProducts;
    console.log(recommendedProducts);
  }

  if (!response.ok) {
    throw new Error(data.error || "Scan failed");
  }

  return data;
};

