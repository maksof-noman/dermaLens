import { compressImage } from '../utils/imageCompression';

export interface SkinAnalysisResult {
  skinType: string;
  concerns: string[];
  confidence: number;
  details: {
    spots: number;
    wrinkles: number;
    texture: number;
    acne: number;
    darkCircles: number;
    redness: number;
    oiliness: number;
    moisture: number;
    pores: number;
    eyeBags: number;
    radiance: number;
    firmness: number;
    droopyUpperEyelid: number;
    droopyLowerEyelid: number;
  };
  detailedAnalysis: string;
  recommendations: string;
}

export const analyzeSkinFromImage = async (imageData: string): Promise<SkinAnalysisResult> => {
  // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  // const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // if (!supabaseUrl) {
  //   throw new Error('Supabase URL not configured');
  // }

  // const apiUrl = `${supabaseUrl}/functions/v1/analyze-skin`;

  const api = `http://localhost:3000/api/dermaLens/scanFace`


  try {
    console.log('Compressing image before analysis...');
    const compressedImage = await compressImage(imageData, 1024, 1024, 0.85);

    const response = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ imageData: compressedImage }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.details || errorData.error || 'Failed to analyze image';
      console.error('Analysis error:', errorData);
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from analysis service');
    }

    return {
      skinType: result.skinType,
      concerns: result.concerns || [],
      confidence: result.confidence || 85,
      details: {
        spots: result.spots || 0,
        wrinkles: result.wrinkles || 0,
        texture: result.texture || 0,
        acne: result.acne || 0,
        darkCircles: result.darkCircles || 0,
        redness: result.redness || 0,
        oiliness: result.oiliness || 0,
        moisture: result.moisture || 0,
        pores: result.pores || 0,
        eyeBags: result.eyeBags || 0,
        radiance: result.radiance || 0,
        firmness: result.firmness || 0,
        droopyUpperEyelid: result.droopyUpperEyelid || 0,
        droopyLowerEyelid: result.droopyLowerEyelid || 0,
      },
      detailedAnalysis: result.detailedAnalysis || '',
      recommendations: result.recommendations || '',
    };
  } catch (error) {
    console.error('Error analyzing skin:', error);
    throw error;
  }
};

export const concernLabels: Record<string, string> = {
  acne: 'Acne',
  blemishes: 'Blemishes',
  wrinkles: 'Wrinkles',
  fine_lines: 'Fine Lines',
  dark_spots: 'Dark Spots',
  dark_circles: 'Dark Circles',
  redness: 'Redness',
  sensitivity: 'Sensitivity',
  dryness: 'Dryness',
  oiliness: 'Oiliness',
  large_pores: 'Large Pores',
  shine: 'Shine',
  dullness: 'Dullness',
  texture: 'Uneven Texture',
  puffiness: 'Puffiness',
  sun_damage: 'Sun Damage',
  maintenance: 'General Maintenance'
};

export const metricLabels: Record<string, string> = {
  spots: 'Dark Spots',
  wrinkles: 'Wrinkles',
  texture: 'Skin Texture',
  acne: 'Acne',
  darkCircles: 'Dark Circles',
  redness: 'Redness',
  oiliness: 'Oiliness',
  moisture: 'Moisture Level',
  pores: 'Pore Size',
  eyeBags: 'Eye Bags',
  radiance: 'Radiance',
  firmness: 'Firmness',
  droopyUpperEyelid: 'Upper Eyelid',
  droopyLowerEyelid: 'Lower Eyelid'
};
