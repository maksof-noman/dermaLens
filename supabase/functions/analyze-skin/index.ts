import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SkinAnalysisRequest {
  imageData: string;
}

interface SkinAnalysisResult {
  skinType: string;
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
  detailedAnalysis: string;
  recommendations: string;
  concerns: string[];
  confidence: number;
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { imageData }: SkinAnalysisRequest = await req.json();

    if (!imageData) {
      await supabase.from("scan_logs").insert({
        error_message: "Image data is required",
        success: false,
        processing_time_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const imageSizeBytes = Math.round((imageData.length * 3) / 4);
    console.log("Image size (bytes):", imageSizeBytes);

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      await supabase.from("scan_logs").insert({
        image_size_bytes: imageSizeBytes,
        error_message: "OpenAI API key not configured",
        success: false,
        processing_time_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `You are a cosmetic skincare consultant AI. Analyze this facial skin image and provide beauty and skincare insights. Score each cosmetic attribute from 0-100 where 0 means optimal appearance and 100 means needs attention.

This is for personal beauty and skincare routine optimization purposes only. Provide general cosmetic observations.

Return ONLY valid JSON with this exact structure:
{
  "skinType": "dry" or "oily" or "combination" or "normal" or "sensitive",
  "spots": 0-100 (visible spots or uneven tone),
  "wrinkles": 0-100 (visible lines and creases),
  "texture": 0-100 (skin surface smoothness),
  "acne": 0-100 (visible blemishes),
  "darkCircles": 0-100 (under-eye area appearance),
  "redness": 0-100 (skin color evenness),
  "oiliness": 0-100 (shine and sebum appearance),
  "moisture": 0-100 (hydration appearance, 0=looks hydrated, 100=looks dry),
  "pores": 0-100 (pore visibility),
  "eyeBags": 0-100 (under-eye puffiness appearance),
  "radiance": 0-100 (skin brightness, 0=glowing, 100=dull),
  "firmness": 0-100 (skin appearance, 0=looks firm, 100=looks loose),
  "droopyUpperEyelid": 0-100 (upper eyelid appearance),
  "droopyLowerEyelid": 0-100 (lower eyelid appearance),
  "detailedAnalysis": "2-3 sentences about overall skin appearance and beauty characteristics",
  "recommendations": "2-3 general skincare and beauty routine suggestions",
  "confidence": 0-100 (confidence in these observations)
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a beauty and skincare consultant AI that provides cosmetic observations about skin appearance for personal beauty routine optimization. You analyze images to help users understand their skin characteristics and suggest general skincare approaches. Always return ONLY valid JSON responses with no additional text or markdown."
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageData,
                  detail: "high"
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);

      await supabase.from("scan_logs").insert({
        image_size_bytes: imageSizeBytes,
        prompt_sent: prompt,
        openai_model: "gpt-4o",
        error_message: `OpenAI API error: ${errorData}`,
        success: false,
        processing_time_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ error: "Failed to analyze image", details: errorData }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log("OpenAI response received:", JSON.stringify(data, null, 2));

    const tokenUsage = data.usage || {};
    console.log("Token usage:", tokenUsage);

    const message = data.choices[0]?.message;
    const content = message?.content;
    const refusal = message?.refusal;

    if (refusal) {
      console.error("OpenAI refused the request:", refusal);

      await supabase.from("scan_logs").insert({
        image_size_bytes: imageSizeBytes,
        prompt_sent: prompt,
        openai_model: "gpt-4o",
        openai_response: data,
        tokens_used: tokenUsage,
        error_message: `OpenAI refused: ${refusal}`,
        success: false,
        processing_time_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({
          error: "Image analysis unavailable",
          details: "The AI service declined to analyze this image. Please try with a different image or use the camera capture feature.",
          refusal: refusal
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!content) {
      console.error("No content in OpenAI response:", JSON.stringify(data));

      await supabase.from("scan_logs").insert({
        image_size_bytes: imageSizeBytes,
        prompt_sent: prompt,
        openai_model: "gpt-4o",
        openai_response: data,
        tokens_used: tokenUsage,
        error_message: "No content returned from OpenAI API",
        success: false,
        processing_time_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ error: "No analysis returned from AI", details: "Empty response content" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let analysis: SkinAnalysisResult;

    try {
      let cleanedContent = content.trim();

      cleanedContent = cleanedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();

      if (!cleanedContent.startsWith('{')) {
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[0];
        }
      }

      if (!cleanedContent || !cleanedContent.startsWith('{')) {
        console.error("No valid JSON found. Content:", content);

        await supabase.from("scan_logs").insert({
          image_size_bytes: imageSizeBytes,
          prompt_sent: prompt,
          openai_model: "gpt-4o",
          openai_response: data,
          tokens_used: tokenUsage,
          error_message: "Failed to parse analysis - invalid JSON format",
          success: false,
          processing_time_ms: Date.now() - startTime,
        });

        return new Response(
          JSON.stringify({
            error: "Failed to parse analysis - invalid JSON format",
            details: "The AI response did not contain valid JSON"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      analysis = JSON.parse(cleanedContent);

      if (!analysis.skinType || typeof analysis.spots !== 'number') {
        console.error("Invalid analysis structure:", analysis);

        await supabase.from("scan_logs").insert({
          image_size_bytes: imageSizeBytes,
          prompt_sent: prompt,
          openai_model: "gpt-4o",
          openai_response: data,
          tokens_used: tokenUsage,
          analysis_result: analysis,
          error_message: "Analysis data is incomplete or invalid",
          success: false,
          processing_time_ms: Date.now() - startTime,
        });

        return new Response(
          JSON.stringify({
            error: "Analysis data is incomplete or invalid",
            details: "Missing required fields in response"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", content);

      await supabase.from("scan_logs").insert({
        image_size_bytes: imageSizeBytes,
        prompt_sent: prompt,
        openai_model: "gpt-4o",
        openai_response: data,
        tokens_used: tokenUsage,
        error_message: `JSON parse error: ${parseError.message}`,
        success: false,
        processing_time_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({
          error: "Failed to parse analysis response",
          details: parseError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const concerns: string[] = [];
    if (analysis.acne > 40) concerns.push("acne", "blemishes");
    if (analysis.wrinkles > 40) concerns.push("wrinkles", "fine_lines");
    if (analysis.spots > 40) concerns.push("dark_spots");
    if (analysis.darkCircles > 40) concerns.push("dark_circles");
    if (analysis.redness > 40) concerns.push("redness", "sensitivity");
    if (analysis.moisture > 50) concerns.push("dryness");
    if (analysis.oiliness > 50) concerns.push("oiliness", "shine");
    if (analysis.pores > 40) concerns.push("large_pores");
    if (analysis.radiance > 50) concerns.push("dullness");
    if (analysis.texture > 40) concerns.push("texture");
    if (analysis.eyeBags > 40) concerns.push("puffiness");
    if (concerns.length === 0) concerns.push("maintenance");

    analysis.concerns = [...new Set(concerns)];

    const processingTime = Date.now() - startTime;

    await supabase.from("scan_logs").insert({
      image_size_bytes: imageSizeBytes,
      prompt_sent: prompt,
      openai_model: "gpt-4o",
      openai_response: data,
      tokens_used: tokenUsage,
      analysis_result: analysis,
      success: true,
      processing_time_ms: processingTime,
    });

    console.log(`Scan completed successfully in ${processingTime}ms`);
    console.log("Tokens used:", tokenUsage);

    return new Response(JSON.stringify(analysis), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in analyze-skin function:", error);

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

      await supabase.from("scan_logs").insert({
        error_message: error.message || "Internal server error",
        success: false,
        processing_time_ms: Date.now() - startTime,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});