import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeMatch = async (resumeText, jobDescription) => {
  try {
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Act as an expert Technical Recruiter. Analyze the match between the Resume and Job Description below.
      
      RESUME:
      "${resumeText.substring(0, 10000)}"
      
      JOB DESCRIPTION:
      "${jobDescription.substring(0, 10000)}"
      
      Output strictly valid JSON (no markdown formatting) with these fields:
      {
        "matchScore": number (0-100),
        "summary": "1 sentence explanation of the fit",
        "missingSkills": ["skill1", "skill2"],
        "status": "Strong" | "Moderate" | "Weak"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
   
    const cleanJson = text.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("❌ AI Analysis Failed:", error.message);
    return null;
  }
};