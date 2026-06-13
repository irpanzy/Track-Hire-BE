import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import { JobType, ApplicationSource } from "../../generated/prisma/enums";

export interface ExtractedJobDetails {
  companyName: string;
  companyWebsite: string | null;
  companyLocation: string | null;
  position: string;
  jobType: JobType;
  location: string | null;
  source: ApplicationSource;
  description: string | null;
  requirements: string | null;
  salaryRange: string | null;
  deadlineDate: string | null;
}

export async function extractJobDetails(
  text: string,
  url: string
): Promise<ExtractedJobDetails> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured on the server. Please set the GEMINI_API_KEY environment variable."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are a helpful assistant specialized in extracting structured job details from raw job posting page content.
Analyze the following text scraped from a job listing page (source URL: ${url}) and extract the requested fields.

Rules:
1. Extract the company name, job position, job type, location, and other metadata.
2. Determine the source based on the URL domain. If the domain is linkedin.com, source is LINKEDIN. If glints.com, GLINTS. If jobstreet.com, JOBSTREET. If upwork.com, UPWORK. If indeed.com, INDEED. If instagram.com, INSTAGRAM. If x.com, X. If it is a company's own website or career page, source is WEBSITE. Otherwise, use OTHER.
3. If jobType is not explicitly mentioned or is hard to match, default it to FULL_TIME. Match values strictly to the enum.
4. Try to output clean, concise formatting for description and requirements.
5. If any optional field is not found in the text, return null for that field.

Job listing text:
${text}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            companyName: {
              type: "STRING",
              description: "The name of the company hiring for the position.",
            },
            companyWebsite: {
              type: "STRING",
              description:
                "The official website of the company if mentioned, otherwise null.",
              nullable: true,
            },
            companyLocation: {
              type: "STRING",
              description:
                "The company headquarters location if mentioned, otherwise null.",
              nullable: true,
            },
            position: {
              type: "STRING",
              description: "The job title / position name.",
            },
            jobType: {
              type: "STRING",
              enum: Object.values(JobType),
              description:
                "The type of employment. Must be one of the enum values.",
            },
            location: {
              type: "STRING",
              description:
                "Specific job location (e.g. City, Country or Remote) if mentioned, otherwise null.",
              nullable: true,
            },
            source: {
              type: "STRING",
              enum: Object.values(ApplicationSource),
              description: "The platform where this job post was hosted.",
            },
            description: {
              type: "STRING",
              description: "A summary of the job role and duties.",
              nullable: true,
            },
            requirements: {
              type: "STRING",
              description:
                "Key qualifications, requirements, and required skills.",
              nullable: true,
            },
            salaryRange: {
              type: "STRING",
              description:
                "The salary range or salary details if mentioned, otherwise null.",
              nullable: true,
            },
            deadlineDate: {
              type: "STRING",
              description:
                "The job application deadline date in ISO format YYYY-MM-DD if mentioned, otherwise null.",
              nullable: true,
            },
          },
          required: ["companyName", "position", "jobType", "source"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini API.");
    }

    return JSON.parse(responseText) as ExtractedJobDetails;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `AI extraction failed: ${error.message}`
        : "AI extraction failed with an unknown error."
    );
  }
}
