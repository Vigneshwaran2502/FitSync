import { GoogleGenAI } from "@google/genai";
import { GYM_LOCATION } from "../config/constants.js";
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
const COACH_ROLES = {
  general: {
    id: "general",
    name: "FitSync Elite Coach",
    modelDefault: "gemini-3.8-flash",
    description: "Comprehensive fitness, exercise execution, progressive overload & periodization",
    systemInstruction: `You are the Lead Fitness Coach for FitSync, an elite fitness management platform.
The flagship gym center is located at 1000 Market Street, San Francisco, CA 94102.
You provide evidence-based, encouraging, and technically rigorous fitness advice.
You understand biomechanics, compound lifts (Squat, Bench, Deadlift, Overhead Press), hypertrophy rep ranges, RPE/RIR tracking, and fatigue management.
Structure your answers with clear actionable steps, bullet points, and safety cues where appropriate.`
  },
  nutrition: {
    id: "nutrition",
    name: "Sports Nutritionist & Dietitian",
    modelDefault: "gemini-3.8-flash",
    description: "Caloric calculations, macronutrient breakdowns, meal timing & supplementation",
    systemInstruction: `You are FitSync's Sports Nutrition Specialist and Registered Dietitian.
You provide scientifically validated nutritional guidance for muscle hypertrophy, fat loss, athletic performance, and metabolic health.
You accurately calculate daily protein targets (1.6 - 2.2g per kg of bodyweight), carbohydrate periodization around training windows, hydration, and evidence-backed supplements like Creatine Monohydrate and Whey Isolate.
Always remind users that clinical dietary conditions should be reviewed with their personal physician.`
  },
  recovery: {
    id: "recovery",
    name: "Recovery & Physical Rehab Specialist",
    modelDefault: "gemini-3.8-flash",
    description: "Mobility protocols, active recovery, sleep optimization & injury prevention",
    systemInstruction: `You are FitSync's Athletic Recovery and Mobility Specialist.
You guide athletes through joint mobility, soft tissue recovery, deload strategies, sleep hygiene, and injury risk mitigation.
Offer specific warm-up routines, foam rolling, dynamic stretching, and advice on listening to pain signals vs normal delayed-onset muscle soreness (DOMS).`
  },
  complex: {
    id: "complex",
    name: "Advanced Biomechanics & Programming (Deep Reasoner)",
    modelDefault: "gemini-3.1-pro-preview",
    description: "Deep periodization cycles, biomechanical leverage analysis & multi-week macrocycles",
    systemInstruction: `You are FitSync's Master Sports Scientist specializing in deep periodization, biomechanical moment arms, velocity-based training, and advanced macrocycle program design.
You analyze fatigue curves, volume tolerances, joint stress vectors, and calculate progressive load progressions.
Provide structured, in-depth analytical programming with clear progression formulas.`
  },
  fast: {
    id: "fast",
    name: "Speed Coach (Rapid Cues)",
    modelDefault: "gemini-3.1-flash-lite",
    description: "Rapid-fire form cues, quick substitute exercises & immediate workout adjustments",
    systemInstruction: `You are FitSync's Quick-Response Training Coach.
Provide concise, immediate, high-impact bulleted answers (under 150 words).
Focus on quick exercise substitutions, immediate form cues, and instant workout modifications without long preambles.`
  }
};
async function chatWithGemini(req, res) {
  try {
    const {
      messages,
      role = "general",
      taskType = "general",
      // 'general' | 'complex' | 'fast'
      enableSearchGrounding = false,
      customSystemInstruction
    } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages array is required for conversation." });
    }
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        message: "Gemini API key is not configured in environment variables. Please check the Secrets panel in AI Studio."
      });
    }
    let selectedModel = "gemini-3.8-flash";
    if (enableSearchGrounding) {
      selectedModel = "gemini-3.8-flash";
    } else if (taskType === "complex" || role === "complex") {
      selectedModel = "gemini-3.1-pro-preview";
    } else if (taskType === "fast" || role === "fast") {
      selectedModel = "gemini-3.1-flash-lite";
    } else {
      selectedModel = "gemini-3.8-flash";
    }
    const roleConfig = COACH_ROLES[role] || COACH_ROLES.general;
    const systemInstruction = customSystemInstruction || roleConfig.systemInstruction;
    const contents = messages.map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    const config = {
      systemInstruction
    };
    if (enableSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }
    let response;
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config
      });
    } catch (modelErr) {
      const errMsg = modelErr.message || "";
      if ((modelErr.status === 503 || modelErr.status === 429 || errMsg.includes("high demand") || errMsg.includes("temporarily")) && selectedModel !== "gemini-3.1-flash-lite") {
        console.warn(`[Gemini API] Primary model ${selectedModel} experiencing high demand, falling back to gemini-3.1-flash-lite...`);
        selectedModel = "gemini-3.1-flash-lite";
        response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config
        });
      } else {
        throw modelErr;
      }
    }
    const generatedText = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
    const sources = [];
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri
          });
        }
      }
    }
    res.json({
      role: "model",
      content: generatedText,
      modelUsed: selectedModel,
      groundingSources: sources,
      webSearchQueries,
      roleUsed: roleConfig.name
    });
  } catch (err) {
    console.error("[Gemini API Error]:", err);
    let errorMessage = err.message || "Error communicating with Gemini model.";
    try {
      if (typeof errorMessage === "string" && errorMessage.includes('"code":429')) {
        errorMessage = "Gemini API quota or rate limit reached. Please check your API quota or billing settings in Google AI Studio.";
      } else if (typeof errorMessage === "string" && errorMessage.startsWith("{")) {
        const parsed = JSON.parse(errorMessage);
        if (parsed?.error?.message) {
          errorMessage = parsed.error.message;
        }
      }
    } catch {
    }
    res.status(err.status || 500).json({
      message: errorMessage,
      error: true
    });
  }
}
async function getCoachRoles(req, res) {
  res.json({
    roles: Object.values(COACH_ROLES),
    gymInfo: {
      name: GYM_LOCATION.name,
      address: GYM_LOCATION.formattedAddress,
      coordinates: `${GYM_LOCATION.latitude}\xB0 N, ${GYM_LOCATION.longitude}\xB0 W`
    }
  });
}
export {
  COACH_ROLES,
  chatWithGemini,
  getCoachRoles
};
