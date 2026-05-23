import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.services.js";

const knownSkills = [
  "Java", "C", "C++", "C#", "Python", "HTML", "CSS", "JavaScript", "TypeScript",
  "Node.js", "Express.js", "React.js", "Next.js", "Vue.js", "Angular", "MongoDB",
  "Mongoose", "MySQL", "PostgreSQL", "Firebase", "Git", "Github", "Docker",
  "Tailwind CSS", "Bootstrap", "Redux", "REST API", "GraphQL"
];

const knownRoles = [
  "Frontend Developer", "React Developer", "Full Stack Developer", "Backend Developer",
  "MERN Stack Developer", "Java Developer", "Python Developer", "Software Developer",
  "Web Developer", "UI Developer", "Mobile App Developer", "Data Analyst",
  "Machine Learning Engineer", "DevOps Engineer"
];

const normalizeText = (value) => String(value || "").trim();

const normalizeList = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((current) => current.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, 12);
};

const normalizeValue = (value) => normalizeText(value).slice(0, 80);

const parseJsonFromAi = (content) => {
  const jsonText = content.match(/\{[\s\S]*\}/)?.[0] || content;
  return JSON.parse(jsonText);
};

const extractTextFromPdf = async (buffer) => {
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
  });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    pages.push(textContent.items.map((item) => item.str).join(" "));
  }

  return pages.join("\n").replace(/\s+/g, " ").trim();
};

const fallbackAnalysis = (resumeText) => {
  const lines = resumeText
    .split(/(?<=\.|\:)|\n|\u2022|-/)
    .map((line) => line.trim())
    .filter((line) => line.length > 3);

  const projectSection = resumeText.match(/projects?([\s\S]*?)(skills?|education|experience|certifications?|$)/i)?.[1] || resumeText;
  const projects = projectSection
    .split(/\u2022|\n|(?=\b[A-Z][A-Za-z0-9\s-]{4,}\b)/)
    .map((line) => line.replace(/projects?:?/i, "").trim())
    .filter((line) => /project|app|application|website|portal|system|clone|platform/i.test(line))
    .map((line) => line.split(/[.:|]/)[0].trim())
    .filter(Boolean)
    .slice(0, 6);

  const skills = knownSkills.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("\\.", "\\.?");
    return new RegExp(`\\b${escaped}\\b`, "i").test(resumeText);
  });

  const lowerResumeText = resumeText.toLowerCase();
  const role =
    knownRoles.find((knownRole) => lowerResumeText.includes(knownRole.toLowerCase())) ||
    (skills.some((skill) => /react|html|css|javascript|tailwind/i.test(skill)) ? "Frontend Developer" : "") ||
    (skills.some((skill) => /node|express|mongodb|mongoose/i.test(skill)) ? "Backend Developer" : "");

  const yearMatches = [...resumeText.matchAll(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/gi)];
  const directExperience = yearMatches
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0];

  const dateRangeMatches = [
    ...resumeText.matchAll(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*(20\d{2})\s*(?:-|to|\u2013)\s*(?:present|current|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*(20\d{2}))/gi),
  ];
  const dateRangeExperience = dateRangeMatches.reduce((total, match) => {
    const startYear = Number(match[1]);
    const endYear = match[2] ? Number(match[2]) : new Date().getFullYear();
    if (!Number.isFinite(startYear) || !Number.isFinite(endYear) || endYear < startYear) return total;
    return total + Math.max(1, endYear - startYear);
  }, 0);

  const experienceYears = directExperience || dateRangeExperience;
  const experience = experienceYears ? `${experienceYears}+ years` : "";

  return {
    role: normalizeValue(role),
    experience: normalizeValue(experience),
    projects: normalizeList(projects.length ? projects : lines.slice(0, 4)),
    skills: normalizeList(skills),
  };
};

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF resume" });
    }

    const resumeText = await extractTextFromPdf(req.file.buffer);

    if (!resumeText) {
      return res.status(400).json({ message: "Could not read text from this PDF. Please upload a text-based resume PDF." });
    }

    let analysis = fallbackAnalysis(resumeText);

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const aiResponse = await askAi([
          {
            role: "system",
            content:
              "Extract resume details. Return only valid JSON with keys role, experience, projects, and skills. role and experience must be short strings. projects and skills must be arrays of short strings.",
          },
          {
            role: "user",
            content: resumeText.slice(0, 12000),
          },
        ]);

        const parsed = parseJsonFromAi(aiResponse);
        analysis = {
          role: normalizeValue(parsed.role) || analysis.role,
          experience: normalizeValue(parsed.experience) || analysis.experience,
          projects: normalizeList(parsed.projects),
          skills: normalizeList(parsed.skills),
        };
      } catch (error) {
        console.warn("AI resume extraction failed, using fallback:", error.message);
      }
    }

    return res.status(200).json({
      ...analysis,
      resumeText: resumeText.slice(0, 12000),
    });
  } catch (error) {
    console.error("Resume analysis failed:", error.message);
    return res.status(500).json({ message: "Resume analysis failed. Please try another PDF." });
  }
};
