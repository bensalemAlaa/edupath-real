"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { AssessmentContent } from "@/app/components/assessment-content";
import { api } from "@/lib/api";

const WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Bejaia",
  "Biskra",
  "Bechar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tebessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Algiers",
  "Djelfa",
  "Jijel",
  "Setif",
  "Saida",
  "Skikda",
  "Sidi Bel Abbes",
  "Annaba",
  "Guelma",
  "Constantine",
  "Medea",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arreridj",
  "Boumerdes",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Ain Defla",
  "Naama",
  "Ain Temouchent",
  "Ghardaia",
  "Relizane",
];

function getBranchSubjectConfig(stream: string) {
  const s = (stream || "").toLowerCase();
  if (s.includes("lettres") || s.includes("philo")) {
    return {
      subject1Label: "Literature Grade",
      subject2Label: "Philosophy Grade",
      subject3Label: "History-Geography Grade",
      subject1Hint: "Key subject for this BAC branch",
      subject2Hint: "Key subject for this BAC branch",
      subject3Hint: "Supporting subject for this BAC branch",
    };
  }
  if (s.includes("technique")) {
    return {
      subject1Label: "Technical Science Grade",
      subject2Label: "Physics Grade",
      subject3Label: "Mathematics Grade",
      subject1Hint: "Main technical module for this branch",
      subject2Hint: "Main scientific module for this branch",
      subject3Hint: "Supporting quantitative module",
    };
  }
  if (s.includes("science") && !s.includes("math")) {
    return {
      subject1Label: "Natural Science Grade",
      subject2Label: "Physics Grade",
      subject3Label: "Mathematics Grade",
      subject1Hint: "Core science subject for this branch",
      subject2Hint: "Core science subject for this branch",
      subject3Hint: "Core science subject for this branch",
    };
  }
  return {
    subject1Label: "Mathematics Grade",
    subject2Label: "Physics Grade",
    subject3Label: "Subject 3 Grade",
    subject1Hint: "Core quantitative subject",
    subject2Hint: "Core scientific subject",
    subject3Hint: "Supporting subject grade",
  };
}

type SpecialityTrack =
  | "Computing"
  | "Engineering"
  | "Health"
  | "Business"
  | "Humanities"
  | "SocialLaw"
  | "Other";

function getSpecialityTrack(name: string): SpecialityTrack {
  const n = (name || "").toLowerCase();
  if (
    n.includes("computer") ||
    n.includes("software") ||
    n.includes("ai") ||
    n.includes("data") ||
    n.includes("cyber")
  )
    return "Computing";
  if (
    n.includes("electrical") ||
    n.includes("electronics") ||
    n.includes("telecom") ||
    n.includes("mechanical") ||
    n.includes("industrial") ||
    n.includes("civil") ||
    n.includes("chemical")
  )
    return "Engineering";
  if (
    n.includes("medicine") ||
    n.includes("pharmacy") ||
    n.includes("dentistry") ||
    n.includes("biotech")
  )
    return "Health";
  if (
    n.includes("finance") ||
    n.includes("marketing") ||
    n.includes("management") ||
    n.includes("commerce") ||
    n.includes("economics")
  )
    return "Business";
  if (
    n.includes("literature") ||
    n.includes("language") ||
    n.includes("translation") ||
    n.includes("philosophy") ||
    n.includes("history") ||
    n.includes("communication") ||
    n.includes("journalism")
  )
    return "Humanities";
  if (
    n.includes("law") ||
    n.includes("droit") ||
    n.includes("sociology") ||
    n.includes("psychology") ||
    n.includes("political")
  )
    return "SocialLaw";
  return "Other";
}

function recommendationVisual(track: SpecialityTrack): {
  gradient: string;
  icon: string;
  area: string;
} {
  if (track === "Computing")
    return {
      gradient: "from-blue-600/40 to-blue-800/30",
      icon: "💻",
      area: "Engineering & Computing",
    };
  if (track === "Engineering")
    return {
      gradient: "from-indigo-600/40 to-indigo-800/30",
      icon: "⚙️",
      area: "Engineering",
    };
  if (track === "Health")
    return {
      gradient: "from-green-600/40 to-green-800/30",
      icon: "🏥",
      area: "Health Sciences",
    };
  if (track === "Business")
    return {
      gradient: "from-cyan-600/40 to-cyan-800/30",
      icon: "💼",
      area: "Business & Economics",
    };
  if (track === "Humanities")
    return {
      gradient: "from-violet-600/40 to-violet-800/30",
      icon: "📚",
      area: "Humanities",
    };
  if (track === "SocialLaw")
    return {
      gradient: "from-amber-600/40 to-amber-800/30",
      icon: "⚖️",
      area: "Law & Social Sciences",
    };
  return {
    gradient: "from-slate-600/40 to-slate-800/30",
    icon: "🎓",
    area: "General Studies",
  };
}

function inferUniversityField(
  univ: UniversityCard,
): "Engineering" | "Medicine" | "Business" | "Other" {
  const text =
    `${univ.name} ${univ.desc} ${univ.specialities.map((s) => s.name).join(" ")}`.toLowerCase();
  if (
    text.includes("medicine") ||
    text.includes("pharmacy") ||
    text.includes("dentistry")
  )
    return "Medicine";
  if (
    text.includes("commerce") ||
    text.includes("business") ||
    text.includes("finance") ||
    text.includes("marketing")
  )
    return "Business";
  if (
    text.includes("engineering") ||
    text.includes("computer") ||
    text.includes("science")
  )
    return "Engineering";
  return "Other";
}

type UniversitySpeciality = {
  name: string;
  minScore: string;
  minScore1?: string;
  minScore2?: string;
  minScore3?: string;
  modules: string[];
};

type UniversityCard = {
  name: string;
  desc: string;
  score: string;
  type: string;
  city: string;
  gradient: string;
  icon: string;
  image?: string;
  imageMode?: "photo" | "logo";
  logoText?: string;
  logoBackground?: string;
  website?: string;
  badge: string;
  specialities: UniversitySpeciality[];
};

const UNIVERSITY_MEDIA: Record<
  string,
  {
    image?: string;
    imageMode?: "photo" | "logo";
    logoText?: string;
    logoBackground?: string;
  }
> = {
  ENP: {
    image: "https://www.enp.edu.dz/storage/2020/06/logoBlanc-300x262.png",
    imageMode: "logo",
    logoText: "ENP",
    logoBackground: "linear-gradient(145deg, #12457d 0%, #1f6ec0 100%)",
  },
  ESI: {
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/ESI_Logo.png",
    imageMode: "logo",
    logoText: "ESI",
  },
  "HEC Algiers": {
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_hec.jpg",
    imageMode: "logo",
    logoText: "HEC",
  },
  USTHB: {
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/USTHB.JPG",
    imageMode: "photo",
    logoText: "USTHB",
  },
  "USTO-MB": {
    image:
      "https://www.univ-usto.dz/wp-content/uploads/2023/11/cropped-cropped-cropped-USTOLOGO-1-scaled-1.png",
    imageMode: "logo",
    logoText: "USTO-MB",
  },
  "University of Algiers 1": {
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Med%20Alger.jpg",
    imageMode: "photo",
    logoText: "UA1",
  },
};

function attachUniversityImage(univ: UniversityCard): UniversityCard {
  const media = UNIVERSITY_MEDIA[univ.name];
  const websites: Record<string, string> = {
    ENP: "https://www.enp.edu.dz/en/",
    ESI: "https://www.esi.dz/en/home/",
    "HEC Algiers": "https://hec.dz/newsite/?lang=en",
    USTHB: "https://www.usthb.dz/",
    "USTO-MB": "https://www.univ-usto.dz/en/",
    "University of Algiers 1": "https://www.univ-alger.dz/",
  };
  return {
    ...univ,
    image: media?.image || univ.image,
    imageMode: media?.imageMode || univ.imageMode,
    logoText: media?.logoText || univ.logoText,
    logoBackground: media?.logoBackground || univ.logoBackground,
    website: websites[univ.name] || univ.website,
  };
}

const universityCards: UniversityCard[] = [
  {
    name: "USTHB",
    desc: "University of Science and Technology Houari Boumediene",
    score: "14.50",
    type: "University",
    city: "Algiers",
    gradient: "from-blue-500 to-blue-700",
    icon: "🏛️",
    badge: "bg-blue-500/30",
    specialities: [
      {
        name: "Computer Science",
        minScore: "16.00",
        modules: [
          "Algorithms",
          "Data Structures",
          "Operating Systems",
          "Databases",
        ],
      },
      {
        name: "Telecommunications",
        minScore: "15.20",
        modules: ["Signals", "Network Protocols", "Wireless Systems"],
      },
    ],
  },
  {
    name: "University of Algiers 1",
    desc: "Faculty of Medicine - Benyoucef Benkhedda",
    score: "16.00",
    type: "University",
    city: "Algiers",
    gradient: "from-green-500 to-green-700",
    icon: "🏥",
    badge: "bg-green-500/30",
    specialities: [
      {
        name: "Medicine",
        minScore: "17.00",
        modules: ["Anatomy", "Physiology", "Biochemistry"],
      },
    ],
  },
  {
    name: "ENP",
    desc: "National Polytechnic School - Engineering",
    score: "17.00",
    type: "Grande Ecole",
    city: "Algiers",
    gradient: "from-purple-500 to-purple-700",
    icon: "⚡",
    badge: "bg-purple-500/30",
    specialities: [
      {
        name: "Electrical Engineering",
        minScore: "17.00",
        modules: ["Circuit Theory", "Power Systems", "Control Systems"],
      },
    ],
  },
  {
    name: "ESI",
    desc: "Higher School of Computer Science",
    score: "16.50",
    type: "Grande Ecole",
    city: "Algiers",
    gradient: "from-orange-500 to-orange-700",
    icon: "💻",
    badge: "bg-orange-500/30",
    specialities: [
      {
        name: "Software Engineering",
        minScore: "16.80",
        modules: ["Software Design", "Web Development", "DevOps"],
      },
    ],
  },
].map(attachUniversityImage);

function RecommendationsSection() {
  const [stream, setStream] = useState("Sciences");
  const [average, setAverage] = useState<number>(15.5);
  const [math, setMath] = useState<number>(16.0);
  const [physics, setPhysics] = useState<number>(15.0);
  const [subject3, setSubject3] = useState<number>(15.5);
  const [wilaya, setWilaya] = useState("Oran");

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openCard, setOpenCard] = useState<string | null>(null);

  const subjectConfig = useMemo(() => getBranchSubjectConfig(stream), [stream]);

  async function getMatches() {
    if (
      average <= 0 ||
      average > 20 ||
      math < 0 ||
      physics < 0 ||
      subject3 < 0
    ) {
      setError("Please input numbers between 0 and 20.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bac_stream: stream,
          bac_average: average,
          math_grade: math,
          physics_grade: physics,
          subject3_grade: subject3,
          wilaya,
        }),
      });
      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        setError("Could not generate matches.");
      }
    } catch {
      setError(
        "AI connection failed. Ensure backend uvicorn server is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI University Recommendations
        </h1>
        <p className="text-blue-300 mt-1">
          Enter your Baccalaureate metrics to compute matches against system
          rules instantly.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-blue-200">
              BAC Branch
            </label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white"
            >
              <option value="Sciences">Sciences Expérimentales</option>
              <option value="Mathematiques">Mathématiques</option>
              <option value="Technique Math">Technique Math</option>
              <option value="Lettres Philo">Lettres & Philosophie</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-blue-200">
              BAC Average
            </label>
            <input
              type="number"
              step="0.01"
              value={average}
              onChange={(e) => setAverage(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-blue-200">
              Wilaya Preference
            </label>
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white"
            >
              {WILAYAS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
          <div>
            <label className="mb-2 block text-sm text-blue-200">
              {subjectConfig.subject1Label}
            </label>
            <input
              type="number"
              step="0.01"
              value={math}
              onChange={(e) => setMath(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-blue-200">
              {subjectConfig.subject2Label}
            </label>
            <input
              type="number"
              step="0.01"
              value={physics}
              onChange={(e) => setPhysics(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-blue-200">
              {subjectConfig.subject3Label}
            </label>
            <input
              type="number"
              step="0.01"
              value={subject3}
              onChange={(e) => setSubject3(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white"
            />
          </div>
        </div>

        <button
          onClick={getMatches}
          className="mt-5 w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
        >
          {loading
            ? "Analyzing thresholds..."
            : "✨ Calculate Best Recommendations"}
        </button>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => {
          const uniqueKey = `${rec.program.university}-${rec.program.name}`;
          const isOpen = openCard === uniqueKey;
          const visual = recommendationVisual(
            getSpecialityTrack(rec.program.name),
          );

          return (
            <div
              key={uniqueKey}
              className="rounded-3xl border border-white/8 bg-slate-900/40 p-5 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-3xl">{visual.icon}</span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold border ${rec.eligible ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-amber-500/15 text-amber-300 border-amber-500/30"}`}
                  >
                    {rec.recommendation_level}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {rec.program.name}
                </h3>
                <p className="text-sm text-blue-200 mt-1">
                  {rec.program.university}
                </p>
                <p className="text-xs text-blue-300/60 mt-1">
                  📍 {rec.program.city} • {visual.area}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-blue-300 uppercase block">
                      Required BAC
                    </span>
                    <span className="text-base font-bold text-white">
                      {rec.program.min_score}/20
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-blue-300 uppercase block">
                      Profile Fit
                    </span>
                    <span className="text-base font-bold text-white">
                      {Math.round(rec.match_percentage)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setOpenCard(isOpen ? null : uniqueKey)}
                  className="w-full text-xs text-cyan-200 border border-cyan-500/20 bg-cyan-500/5 py-2 rounded-xl hover:bg-cyan-500/10 transition"
                >
                  {isOpen ? "Hide breakdown" : "Why recommended?"}
                </button>
                {isOpen && (
                  <div className="bg-slate-950/60 border border-white/10 p-3 rounded-xl space-y-2 text-xs text-blue-100 leading-relaxed">
                    <p className="font-semibold text-cyan-300">{rec.reason}</p>
                    {rec.why_recommended?.map((line: string, index: number) => (
                      <p key={index}>• {line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function UniversitiesSection() {
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [universities, setUniversities] =
    useState<UniversityCard[]>(universityCards);
  const [wilayaFilter, setWilayaFilter] = useState("All Wilayas");
  const [fieldFilter, setFieldFilter] = useState("All Fields");
  const [minBacFilter, setMinBacFilter] = useState("");
  const [selectedUniversity, setSelectedUniversity] =
    useState<UniversityCard | null>(null);

  useEffect(() => {
    let active = true;
    api("/universities")
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0)
          setUniversities(data.map(attachUniversityImage));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedUniversity && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedUniversity]);

  const filteredUniversities = useMemo(() => {
    return universities.filter((univ) => {
      if (wilayaFilter !== "All Wilayas" && univ.city !== wilayaFilter)
        return false;
      if (
        fieldFilter !== "All Fields" &&
        inferUniversityField(univ) !== fieldFilter
      )
        return false;
      const minBac = Number(minBacFilter);
      if (
        !Number.isNaN(minBac) &&
        minBacFilter.trim() !== "" &&
        Number(univ.score) < minBac
      )
        return false;
      return true;
    });
  }, [universities, wilayaFilter, fieldFilter, minBacFilter]);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">University Explorer</h1>
        <p className="text-blue-300">
          Browse and sort institutions transparently across regional campuses.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Wilaya
            </label>
            <select
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white"
            >
              <option value="All Wilayas">All Wilayas</option>
              {WILAYAS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Field of Study
            </label>
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white"
            >
              <option value="All Fields">All Fields</option>
              <option value="Engineering">Engineering & Tech</option>
              <option value="Medicine">Medical Sciences</option>
              <option value="Business">Business Management</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-blue-200">
              Min. BAC Average
            </label>
            <input
              type="number"
              placeholder="14.00"
              value={minBacFilter}
              onChange={(e) => setMinBacFilter(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white placeholder-white/30"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUniversities.map((univ) => (
          <div
            key={univ.name}
            className="glass-panel rounded-3xl overflow-hidden card-hover flex flex-col justify-between"
          >
            <div
              className={`relative h-28 w-full bg-gradient-to-r ${univ.gradient} flex items-center justify-center`}
              style={
                univ.image
                  ? {
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${univ.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!univ.image && <span className="text-4xl">{univ.icon}</span>}
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${univ.badge}`}
                  >
                    {univ.type}
                  </span>
                  <span className="text-xs text-blue-300">📍 {univ.city}</span>
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {univ.name}
                </h3>
                <p className="text-sm text-blue-200/80 mt-2 line-clamp-2">
                  {univ.desc}
                </p>
              </div>
              <div className="mt-5 flex items-end justify-between pt-4 border-t border-white/5">
                <div>
                  <span className="text-xs text-blue-300 block">
                    Baseline Cutoff
                  </span>
                  <span className="text-2xl font-black text-green-400">
                    {univ.score}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedUniversity(univ)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold text-sm transition"
                >
                  View Specialties
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedUniversity && (
        <div
          ref={detailsRef}
          className="glass-panel rounded-3xl p-6 border border-blue-500/30 float-up"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedUniversity.name} — Program Catalogs
              </h2>
              <p className="text-sm text-blue-300 mt-1">
                {selectedUniversity.desc}
              </p>
            </div>
            <button
              onClick={() => setSelectedUniversity(null)}
              className="px-3 py-1 bg-white/10 text-xs rounded-lg hover:bg-white/20"
            >
              Hide
            </button>
          </div>
          <div className="space-y-3 mt-4">
            {selectedUniversity.specialities.map((sp) => (
              <div
                key={sp.name}
                className="p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="font-bold text-white text-base">{sp.name}</h4>
                  <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-300 font-medium">
                    Required Score: {sp.minScore}/20
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sp.modules.map((mod) => (
                    <span
                      key={mod}
                      className="text-xs px-2.5 py-1 bg-blue-500/15 border border-blue-500/20 text-blue-200 rounded-full"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface CareersSectionProps {
  bacAverage: number;
  bacStream: string;
  mathGrade: number;
  physicsGrade: number;
}

function CareersSection({
  bacAverage,
  bacStream,
  mathGrade,
  physicsGrade,
}: CareersSectionProps) {
  type CareerItem = {
    title: string;
    icon: string;
    desc: string;
    demand: string;
    salary: string;
    roadmap: string[];
    skills: string[];
    opportunities: string[];
    iconBg: string;
    fitScore: number;
  };

  const careers: CareerItem[] = [
    {
      title: "Software Engineering",
      icon: "💻",
      iconBg: "bg-blue-500/20",
      desc: "Design and code microservices, apps, and computational databases.",
      demand: "High Demand",
      salary: "120K-250K DZD",
      roadmap: ["Learn logic rules", "Build web stacks", "Deploy APIs"],
      skills: ["Problem Solving", "TypeScript", "Databases"],
      opportunities: ["Fullstack Dev", "AI Associate"],
      fitScore:
        bacStream === "Sciences" || bacStream === "Mathematiques" ? 88 : 55,
    },
    {
      title: "Medical Practitioner",
      icon: "🩺",
      iconBg: "bg-green-500/20",
      desc: "Diagnose, treat pathology, and run therapeutic labs.",
      demand: "Essential",
      salary: "150K-300K DZD",
      roadmap: ["Pre-med core", "Clinical rotations", "Residency"],
      skills: ["Diagnostics", "Biology", "Clinical Care"],
      opportunities: ["General Practitioner"],
      fitScore: bacStream === "Sciences" ? 92 : 45,
    },
    {
      title: "Electrical Specialist",
      icon: "⚡",
      iconBg: "bg-purple-500/20",
      desc: "Supervise automation logic matrices, distribution, and circuit layouts.",
      demand: "Growing",
      salary: "100K-200K DZD",
      roadmap: ["Circuits core", "PLC labs", "Field work"],
      skills: ["Circuits", "Automation", "Troubleshooting"],
      opportunities: ["Grid Planner"],
      fitScore: mathGrade >= 14 ? 82 : 60,
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Career Explorer</h1>
        <p className="text-blue-300">
          Discover vocational career alignment tracks corresponding to your
          technical criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {careers.map((c) => (
          <div
            key={c.title}
            className="glass-panel card-hover rounded-3xl p-5 flex flex-col justify-between"
          >
            <div>
              <div
                className={`h-12 w-12 rounded-xl ${c.iconBg} flex items-center justify-center text-2xl mb-4`}
              >
                {c.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{c.title}</h3>
              <p className="text-sm text-blue-200/80 mt-2 leading-relaxed">
                {c.desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300">
                  {c.demand}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-300">
                  {c.salary}
                </span>
              </div>
              <div className="flex justify-between text-xs text-blue-300 mt-2">
                <span>Profile Compatibility:</span>
                <span className="font-bold text-white">{c.fitScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface ComparisonSectionProps {
  bacAverage: number;
  bacStream: string;
}

function ComparisonSection({ bacAverage, bacStream }: ComparisonSectionProps) {
  const tableData = [
    {
      name: "ESI — Software Engineering",
      minBac: 16.8,
      duration: "5 Years",
      degree: "Engineer Diploma",
      market: "94%",
    },
    {
      name: "USTHB — Computer Science",
      minBac: 16.0,
      duration: "5 Years",
      degree: "Master's LMD",
      market: "89%",
    },
    {
      name: "Medical Faculty — Algiers 1",
      minBac: 17.0,
      duration: "7 Years",
      degree: "Doctor of Medicine",
      market: "96%",
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Program Comparison Matrix</h1>
        <p className="text-blue-300">
          Evaluate course timelines, cutoff deltas, and employable metrics
          horizontally.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/10 text-blue-200">
              <th className="pb-3 pr-4 font-semibold">Speciality Program</th>
              <th className="pb-3 px-4 font-semibold text-center">
                Required Cutoff
              </th>
              <th className="pb-3 px-4 font-semibold text-center">
                Your Delta
              </th>
              <th className="pb-3 px-4 font-semibold text-center">Duration</th>
              <th className="pb-3 px-4 font-semibold text-center">
                Degree Output
              </th>
              <th className="pb-3 pl-4 font-semibold text-right">
                Employment Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => {
              const delta = bacAverage - row.minBac;
              return (
                <tr
                  key={row.name}
                  className="border-b border-white/5 last:border-none text-white transition hover:bg-white/[0.02]"
                >
                  <td className="py-4 pr-4 font-medium">{row.name}</td>
                  <td className="py-4 px-4 text-center font-mono">
                    {row.minBac.toFixed(2)}
                  </td>
                  <td
                    className={`py-4 px-4 text-center font-mono font-bold ${delta >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-center text-blue-100">
                    {row.duration}
                  </td>
                  <td className="py-4 px-4 text-center text-blue-200">
                    {row.degree}
                  </td>
                  <td className="py-4 pl-4 text-right text-green-400 font-bold">
                    {row.market}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section") || "assessment";

  const [user] = useState({
    bac_stream: "Sciences",
    bac_average: 15.5,
    math_grade: 16.0,
    physics_grade: 15.0,
  });

  const active = useMemo(() => {
    if (section === "assessment") return "AI Assessment";
    if (section === "recommendations") return "University Matcher";
    if (section === "universities") return "Universities";
    if (section === "careers") return "Career Paths";
    if (section === "comparison") return "Compare Programs";
    return "AI Assessment";
  }, [section]);

  const content =
    section === "recommendations" ? (
      <RecommendationsSection />
    ) : section === "universities" ? (
      <UniversitiesSection />
    ) : section === "careers" ? (
      <CareersSection
        bacAverage={user.bac_average}
        bacStream={user.bac_stream}
        mathGrade={user.math_grade}
        physicsGrade={user.physics_grade}
      />
    ) : section === "comparison" ? (
      <ComparisonSection
        bacAverage={user.bac_average}
        bacStream={user.bac_stream}
      />
    ) : (
      <AssessmentContent />
    );

  return <AppShell active={active}>{content}</AppShell>;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="gradient-bg flex min-h-screen items-center justify-center">
          <div className="glass-panel rounded-2xl px-6 py-4 text-blue-200">
            Loading orientation workflow...
          </div>
        </main>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
