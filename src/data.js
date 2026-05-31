export const EXAMS = [
  { i:'c1', l:'⚡ CDS I',    d:'2026-04-12', c:'#ffd700' },
  { i:'af', l:'✈ AFCAT',    d:null,          c:'#00d4ff' },
  { i:'c2', l:'🟢 CDS II',  d:'2026-09-13', c:'#39ff14' },
  { i:'c3', l:'🟣 CDS 2027',d:'2027-04-11', c:'#bf80ff' },
]

export const CDS_PAPER = {
  subjects: [
    { id: 'english', label: 'English', questions: 120, marks: 100, correct: 0.833, penalty: 0.277 },
    { id: 'gk', label: 'General Knowledge', questions: 120, marks: 100, correct: 0.833, penalty: 0.277 },
    { id: 'maths', label: 'Elem. Maths', questions: 100, marks: 100, correct: 1.0, penalty: 0.333 },
  ],
  totalQuestions: 340,
  totalMarks: 300
}

export const AFCAT_PAPER = {
  subjects: [
    { id: 'english', label: 'English', questions: 50, marks: 150, correct: 3, penalty: 1 },
    { id: 'maths', label: 'Numerical Ability', questions: 15, marks: 45, correct: 3, penalty: 1 },
    { id: 'reasoning', label: 'Reasoning & Military Aptitude', questions: 15, marks: 45, correct: 3, penalty: 1 },
    { id: 'mil_apt', label: 'Military Aptitude', questions: 10, marks: 30, correct: 3, penalty: 1 },
    { id: 'gk', label: 'General Awareness', questions: 35, marks: 105, correct: 3, penalty: 1 },
  ],
  totalQuestions: 125,
  totalMarks: 375
}

export const MASTER_TOPICS = {
  "Mathematics": {
    exam_tags: ["CDS", "AFCAT"],
    categories: {
      "⭐ Number System": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ LCM and HCF", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Simplification (BODMAS)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Divisibility Rules", exam_tags: ["CDS", "AFCAT"] },
          { name: "Types of Numbers (Natural, Whole, Integer, Rational, Irrational)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Prime & Composite Numbers", exam_tags: ["CDS", "AFCAT"] },
          { name: "Factors & Multiples", exam_tags: ["CDS", "AFCAT"] },
          { name: "LCM & HCF of Algebraic Expressions", exam_tags: ["CDS", "AFCAT"] },
          { name: "Surds & Indices", exam_tags: ["CDS", "AFCAT"] },
          { name: "Unit Digit & Remainders", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Arithmetic": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Percentage", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Profit and Loss", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Simple & Compound Interest", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Ratio and Proportion", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Time and Work", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Time, Speed and Distance", exam_tags: ["CDS", "AFCAT"] },
          { name: "Average", exam_tags: ["CDS", "AFCAT"] },
          { name: "Pipes and Cisterns", exam_tags: ["CDS", "AFCAT"] },
          { name: "Boats and Streams", exam_tags: ["CDS", "AFCAT"] },
          { name: "Mixture and Alligation", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Algebra": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Linear Equations (One & Two Variables)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Quadratic Equations", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Algebraic Identities", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Sets (Union, Intersection, Venn Diagrams)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Logarithms", exam_tags: ["CDS", "AFCAT"] },
          { name: "Polynomials & Factorisation", exam_tags: ["CDS", "AFCAT"] },
          { name: "Inequalities", exam_tags: ["CDS", "AFCAT"] },
          { name: "Sequence & Series (AP & GP)", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Geometry": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Triangles (Congruence, Similarity, Properties)", exam_tags: ["CDS"] },
          { name: "⭐ Circles (Chords, Tangents, Arcs)", exam_tags: ["CDS"] },
          { name: "Lines & Angles", exam_tags: ["CDS"] },
          { name: "Quadrilaterals & Polygons", exam_tags: ["CDS"] },
          { name: "Coordinate Geometry (Distance, Section, Slope)", exam_tags: ["CDS"] },
          { name: "Loci", exam_tags: ["CDS"] },
        ]
      },
      "Mensuration": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Area — Triangle, Rectangle, Square, Circle", exam_tags: ["CDS"] },
          { name: "⭐ Surface Area & Volume — Cylinder, Cone, Sphere", exam_tags: ["CDS"] },
          { name: "⭐ Surface Area & Volume — Cube & Cuboid", exam_tags: ["CDS"] },
          { name: "Area — Trapezium, Rhombus, Parallelogram", exam_tags: ["CDS"] },
          { name: "Frustum of a Cone", exam_tags: ["CDS"] },
        ]
      },
      "⭐ Trigonometry": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Trigonometric Ratios & Standard Angle Values", exam_tags: ["CDS"] },
          { name: "⭐ Height and Distance (Elevation & Depression)", exam_tags: ["CDS"] },
          { name: "⭐ Trigonometric Identities", exam_tags: ["CDS"] },
          { name: "Complementary Angles", exam_tags: ["CDS"] },
        ]
      },
      "⭐ Statistics": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Mean, Median, Mode", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Data Interpretation (Tables, Bar, Pie, Line)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Range & Standard Deviation (basic)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Frequency Distribution", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Miscellaneous": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "Permutation & Combination (introductory)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Probability (basic)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Number Series / Patterns", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
    }
  },

  "English": {
    exam_tags: ["CDS", "AFCAT"],
    categories: {
      "Parts of Speech & Grammar": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Noun, Pronoun, Verb — Types & Usage", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Tenses — All 12 Forms", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Subject-Verb Agreement", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Modals", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Articles (a, an, the — rules)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Prepositions", exam_tags: ["CDS", "AFCAT"] },
          { name: "Adjective & Adverb", exam_tags: ["CDS", "AFCAT"] },
          { name: "Conjunction", exam_tags: ["CDS", "AFCAT"] },
          { name: "Interjection", exam_tags: ["CDS", "AFCAT"] },
          { name: "Question Tag", exam_tags: ["CDS", "AFCAT"] },
          { name: "Punctuation", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Sentence & Voice": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Active & Passive Voice", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Direct & Indirect Speech (Narration)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Transformation of Sentences", exam_tags: ["CDS", "AFCAT"] },
          { name: "Degrees of Comparison", exam_tags: ["CDS", "AFCAT"] },
          { name: "Conditional Sentences", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Sentence Correction", exam_tags: ["CDS", "AFCAT"] },
          { name: "Miscellaneous Grammar Rules", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Vocabulary": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Synonyms", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Antonyms", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ One Word Substitution", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Idioms & Phrases", exam_tags: ["CDS", "AFCAT"] },
          { name: "Phrasal Verbs", exam_tags: ["CDS", "AFCAT"] },
          { name: "Spelling Correction", exam_tags: ["CDS", "AFCAT"] },
          { name: "Homophones & Confusing Words", exam_tags: ["CDS", "AFCAT"] },
          { name: "Paired Words", exam_tags: ["CDS", "AFCAT"] },
          { name: "Foreign Words & Phrases", exam_tags: ["CDS", "AFCAT"] },
          { name: "Proverbs", exam_tags: ["CDS", "AFCAT"] },
          { name: "Word Usage in Context", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Comprehension & Passage Based": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Reading Comprehension", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Cloze Test", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Para Jumbles / Jumbled Sentences", exam_tags: ["CDS", "AFCAT"] },
          { name: "Para Completion", exam_tags: ["CDS", "AFCAT"] },
          { name: "Ordering of Sentences", exam_tags: ["CDS", "AFCAT"] },
          { name: "Ordering of Words in a Sentence", exam_tags: ["CDS", "AFCAT"] },
          { name: "Comprehension Vocabulary Questions", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Error & Sentence Based": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Error Spotting", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Fill in the Blanks", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Sentence Improvement", exam_tags: ["CDS", "AFCAT"] },
          { name: "Sentence Completion", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
    }
  },

  "⭐ GS — History": {
    exam_tags: ["CDS"],
    categories: {
      "Ancient History": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Mauryan Empire (Ashoka, Chandragupta)", exam_tags: ["CDS"] },
          { name: "Indus Valley Civilisation", exam_tags: ["CDS"] },
          { name: "Vedic Age (Early & Later)", exam_tags: ["CDS"] },
          { name: "Gupta Empire — Golden Age", exam_tags: ["CDS"] },
          { name: "Buddhism & Jainism", exam_tags: ["CDS"] },
          { name: "Sangam Age", exam_tags: ["CDS"] },
        ]
      },
      "Medieval History": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Mughal Empire (Akbar to Aurangzeb)", exam_tags: ["CDS"] },
          { name: "⭐ Delhi Sultanate", exam_tags: ["CDS"] },
          { name: "Bhakti & Sufi Movement", exam_tags: ["CDS"] },
          { name: "Maratha Empire", exam_tags: ["CDS"] },
          { name: "Vijayanagara & Bahmani Kingdoms", exam_tags: ["CDS"] },
        ]
      },
      "⭐ Modern History": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Gandhi's Movements (NCM, CDM, Quit India)", exam_tags: ["CDS"] },
          { name: "⭐ 1857 Revolt — First War of Independence", exam_tags: ["CDS"] },
          { name: "⭐ Partition & Independence 1947", exam_tags: ["CDS"] },
          { name: "Indian National Congress & Freedom Struggle", exam_tags: ["CDS"] },
          { name: "British East India Company & Expansion", exam_tags: ["CDS"] },
          { name: "Revolutionary Movements (Bhagat Singh etc.)", exam_tags: ["CDS"] },
          { name: "Socio-Religious Reform Movements", exam_tags: ["CDS"] },
          { name: "Governors-General & Viceroys", exam_tags: ["CDS"] },
          { name: "Important Acts & Constitutional Milestones", exam_tags: ["CDS"] },
        ]
      },
      "World History": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ World War I — Causes & Consequences", exam_tags: ["CDS"] },
          { name: "⭐ World War II — Causes & Consequences", exam_tags: ["CDS"] },
          { name: "French Revolution", exam_tags: ["CDS"] },
          { name: "Industrial Revolution", exam_tags: ["CDS"] },
          { name: "Cold War & Decolonisation", exam_tags: ["CDS"] },
        ]
      },
    }
  },

  "GS — Geography": {
    exam_tags: ["CDS"],
    categories: {
      "Physical Geography — World": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Latitude, Longitude & International Date Line", exam_tags: ["CDS"] },
          { name: "⭐ Atmosphere — Layers, Winds, Pressure Belts", exam_tags: ["CDS"] },
          { name: "⭐ Climate Zones & World Biomes", exam_tags: ["CDS"] },
          { name: "Earth — Shape, Rotation, Revolution, Time Zones", exam_tags: ["CDS"] },
          { name: "Landforms — Mountains, Plateaus, Plains", exam_tags: ["CDS"] },
          { name: "Oceans, Seas, Straits & Gulfs", exam_tags: ["CDS"] },
          { name: "Earthquakes & Volcanoes", exam_tags: ["CDS"] },
          { name: "Rocks & Minerals", exam_tags: ["CDS"] },
        ]
      },
      "Physical Geography — India": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Physiographic Divisions of India", exam_tags: ["CDS"] },
          { name: "⭐ Major Rivers (Himalayan & Peninsular)", exam_tags: ["CDS"] },
          { name: "⭐ Soils of India", exam_tags: ["CDS"] },
          { name: "Himalayan System — Major Peaks & Passes", exam_tags: ["CDS"] },
          { name: "Natural Vegetation & Forest Types", exam_tags: ["CDS"] },
          { name: "Drainage Basins", exam_tags: ["CDS"] },
          { name: "Coastal Features — West & East Coast", exam_tags: ["CDS"] },
        ]
      },
      "Human & Economic Geography": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Indian Agriculture — Crops & Seasons", exam_tags: ["CDS"] },
          { name: "Indian Minerals & Industries", exam_tags: ["CDS"] },
          { name: "Transport — Railways, Roadways, Ports, Airports", exam_tags: ["CDS"] },
          { name: "Census & Population", exam_tags: ["CDS"] },
          { name: "World Economic Geography (key regions)", exam_tags: ["CDS"] },
        ]
      },
    }
  },

  "⭐ GS — Indian Polity": {
    exam_tags: ["CDS"],
    categories: {
      "Constitution & Fundamentals": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Fundamental Rights (Articles 12–35)", exam_tags: ["CDS"] },
          { name: "⭐ Preamble — Keywords & Amendments", exam_tags: ["CDS"] },
          { name: "⭐ Parts, Articles & Schedules", exam_tags: ["CDS"] },
          { name: "⭐ Constitutional Amendments — Key ones", exam_tags: ["CDS"] },
          { name: "Directive Principles & Fundamental Duties", exam_tags: ["CDS"] },
          { name: "Making of the Constitution", exam_tags: ["CDS"] },
          { name: "Citizenship", exam_tags: ["CDS"] },
        ]
      },
      "Union Executive & Legislature": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ President — Election, Powers, Functions", exam_tags: ["CDS"] },
          { name: "⭐ Parliament — Lok Sabha & Rajya Sabha", exam_tags: ["CDS"] },
          { name: "⭐ Emergency Provisions (352, 356, 360)", exam_tags: ["CDS"] },
          { name: "Prime Minister & Council of Ministers", exam_tags: ["CDS"] },
          { name: "Vice-President & Rajya Sabha", exam_tags: ["CDS"] },
          { name: "Bills — Ordinary, Money, Constitution Amendment", exam_tags: ["CDS"] },
          { name: "CAG, Attorney General", exam_tags: ["CDS"] },
        ]
      },
      "Judiciary & Elections": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Supreme Court — Composition & Jurisdiction", exam_tags: ["CDS"] },
          { name: "⭐ Writs (Habeas Corpus, Mandamus etc.)", exam_tags: ["CDS"] },
          { name: "⭐ Election Commission", exam_tags: ["CDS"] },
          { name: "High Courts & Subordinate Courts", exam_tags: ["CDS"] },
          { name: "Judicial Review & PIL", exam_tags: ["CDS"] },
          { name: "UPSC & State PSC", exam_tags: ["CDS"] },
        ]
      },
      "State & Local Bodies": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Panchayati Raj (73rd Amendment)", exam_tags: ["CDS"] },
          { name: "Urban Local Bodies (74th Amendment)", exam_tags: ["CDS"] },
          { name: "Governor — Powers & Functions", exam_tags: ["CDS"] },
          { name: "State Legislature", exam_tags: ["CDS"] },
          { name: "Centre-State Relations", exam_tags: ["CDS"] },
        ]
      },
    }
  },

  "GS — Economics": {
    exam_tags: ["CDS"],
    categories: {
      "Indian Economy": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Banking — RBI, Monetary Policy, Repo Rate", exam_tags: ["CDS"] },
          { name: "⭐ Inflation — Types, WPI, CPI", exam_tags: ["CDS"] },
          { name: "⭐ Union Budget — Revenue, Capital, Fiscal Deficit", exam_tags: ["CDS"] },
          { name: "⭐ Taxes — Direct, Indirect & GST", exam_tags: ["CDS"] },
          { name: "Five-Year Plans & NITI Aayog", exam_tags: ["CDS"] },
          { name: "Agriculture & Green Revolution", exam_tags: ["CDS"] },
          { name: "Poverty & Unemployment Measures", exam_tags: ["CDS"] },
          { name: "Flagship Govt Schemes (PM Awas, Mudra etc.)", exam_tags: ["CDS"] },
        ]
      },
      "Basic Concepts": {
        exam_tags: ["CDS"],
        topics: [
          { name: "Demand, Supply & Market Equilibrium", exam_tags: ["CDS"] },
          { name: "National Income — GDP, GNP, NNP, GVA", exam_tags: ["CDS"] },
          { name: "Types of Economies", exam_tags: ["CDS"] },
        ]
      },
      "International Economics": {
        exam_tags: ["CDS"],
        topics: [
          { name: "World Trade Organisation (WTO)", exam_tags: ["CDS"] },
          { name: "IMF & World Bank", exam_tags: ["CDS"] },
          { name: "Balance of Payments", exam_tags: ["CDS"] },
          { name: "Foreign Exchange & Forex Reserves", exam_tags: ["CDS"] },
        ]
      },
    }
  },

  "GS — Physics": {
    exam_tags: ["CDS"],
    categories: {
      "Mechanics": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Laws of Motion (Newton's 3 Laws)", exam_tags: ["CDS"] },
          { name: "⭐ Work, Energy & Power", exam_tags: ["CDS"] },
          { name: "Gravitation — Kepler's Laws, Satellites", exam_tags: ["CDS"] },
          { name: "Simple Harmonic Motion", exam_tags: ["CDS"] },
          { name: "Waves & Sound", exam_tags: ["CDS"] },
        ]
      },
      "Heat & Light": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Reflection & Refraction", exam_tags: ["CDS"] },
          { name: "⭐ Human Eye & Optical Instruments", exam_tags: ["CDS"] },
          { name: "Heat Transfer (Conduction, Convection, Radiation)", exam_tags: ["CDS"] },
          { name: "Lenses & Mirrors", exam_tags: ["CDS"] },
          { name: "Dispersion of Light", exam_tags: ["CDS"] },
        ]
      },
      "Electricity & Magnetism": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Ohm's Law, Resistance, Series & Parallel Circuits", exam_tags: ["CDS"] },
          { name: "Magnetic Effects of Current", exam_tags: ["CDS"] },
          { name: "Electromagnetic Induction", exam_tags: ["CDS"] },
        ]
      },
      "Modern Physics": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Nuclear Physics — Fission, Fusion, Radioactivity", exam_tags: ["CDS"] },
          { name: "⭐ Space Science & ISRO Missions", exam_tags: ["CDS"] },
          { name: "Photoelectric Effect", exam_tags: ["CDS"] },
        ]
      },
    }
  },

  "GS — Chemistry": {
    exam_tags: ["CDS"],
    categories: {
      "Basic Chemistry": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Periodic Table — Groups, Periods, Trends", exam_tags: ["CDS"] },
          { name: "⭐ Acids, Bases & Salts — pH scale", exam_tags: ["CDS"] },
          { name: "Chemical Reactions & Equations", exam_tags: ["CDS"] },
          { name: "Chemical Bonding (Ionic, Covalent)", exam_tags: ["CDS"] },
          { name: "Oxidation & Reduction", exam_tags: ["CDS"] },
        ]
      },
      "Applied Chemistry": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Metals & Non-Metals — Properties & Uses", exam_tags: ["CDS"] },
          { name: "⭐ Important Alloys (Steel, Bronze, Brass etc.)", exam_tags: ["CDS"] },
          { name: "⭐ Common Organic Compounds & Polymers", exam_tags: ["CDS"] },
          { name: "Chemicals in Daily Life", exam_tags: ["CDS"] },
          { name: "Environmental Chemistry (Pollution, Acid Rain)", exam_tags: ["CDS"] },
        ]
      },
      "Physical Chemistry": {
        exam_tags: ["CDS"],
        topics: [
          { name: "States of Matter", exam_tags: ["CDS"] },
          { name: "Solutions — Solubility, Concentration", exam_tags: ["CDS"] },
          { name: "Electrochemistry (basic)", exam_tags: ["CDS"] },
        ]
      },
    }
  },

  "GS — Biology": {
    exam_tags: ["CDS"],
    categories: {
      "Human Physiology": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Circulatory System — Heart, Blood, Blood Groups", exam_tags: ["CDS"] },
          { name: "⭐ Vitamins & Minerals — Sources & Deficiencies", exam_tags: ["CDS"] },
          { name: "⭐ Communicable Diseases — Bacterial, Viral, Parasitic", exam_tags: ["CDS"] },
          { name: "Digestive System", exam_tags: ["CDS"] },
          { name: "Respiratory System", exam_tags: ["CDS"] },
          { name: "Nervous System & Brain", exam_tags: ["CDS"] },
          { name: "Excretory System", exam_tags: ["CDS"] },
          { name: "Endocrine System — Hormones & Glands", exam_tags: ["CDS"] },
        ]
      },
      "Cell Biology & Genetics": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Cell Structure — Plant vs Animal Cell", exam_tags: ["CDS"] },
          { name: "DNA, RNA & Protein Synthesis (basics)", exam_tags: ["CDS"] },
          { name: "Genetics — Mendel's Laws, Heredity", exam_tags: ["CDS"] },
          { name: "Cell Division — Mitosis & Meiosis", exam_tags: ["CDS"] },
        ]
      },
      "Ecology & Environment": {
        exam_tags: ["CDS"],
        topics: [
          { name: "⭐ Environmental Pollution — Types & Effects", exam_tags: ["CDS"] },
          { name: "⭐ Climate Change & Global Warming", exam_tags: ["CDS"] },
          { name: "Ecosystem — Food Chain, Food Web, Trophic Levels", exam_tags: ["CDS"] },
          { name: "Biodiversity & Conservation", exam_tags: ["CDS"] },
          { name: "Wildlife Protection Acts & National Parks", exam_tags: ["CDS"] },
        ]
      },
      "Plant Biology": {
        exam_tags: ["CDS"],
        topics: [
          { name: "Photosynthesis & Respiration in Plants", exam_tags: ["CDS"] },
          { name: "Plant Tissues & Classification", exam_tags: ["CDS"] },
          { name: "Economic Importance of Plants", exam_tags: ["CDS"] },
        ]
      },
    }
  },

  "GS — Current Affairs & Static GK": {
    exam_tags: ["CDS", "AFCAT"],
    categories: {
      "⭐ Defence & Military Awareness": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Joint Military Exercises (Bilateral & Multilateral)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Missile Systems & Nuclear Doctrine (Agni, BrahMos etc.)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Gallantry Awards (PVC, MVC, VrC)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Indigenous Defence Projects (DRDO, HAL, LCA Tejas)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Indian Army — Structure, Commands", exam_tags: ["CDS", "AFCAT"] },
          { name: "Indian Navy — Ships, Commands", exam_tags: ["CDS", "AFCAT"] },
          { name: "Indian Air Force — Aircraft, Bases", exam_tags: ["CDS", "AFCAT"] },
          { name: "Defence Acquisitions", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Science & Technology": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ ISRO Missions (Chandrayaan, Gaganyaan etc.)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Recent Technological Developments (AI, Semiconductors)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Biotechnology & Genetic Engineering", exam_tags: ["CDS", "AFCAT"] },
          { name: "Nanotechnology", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Awards & Honours": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Bharat Ratna & Padma Awards", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Nobel Prize — Recent Winners", exam_tags: ["CDS", "AFCAT"] },
          { name: "Gallantry Awards", exam_tags: ["CDS", "AFCAT"] },
          { name: "International Awards (Booker, Pulitzer)", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Art & Culture": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Classical Dance Forms of India", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ UNESCO World Heritage Sites in India", exam_tags: ["CDS", "AFCAT"] },
          { name: "Classical Music — Hindustani & Carnatic", exam_tags: ["CDS", "AFCAT"] },
          { name: "Festivals & Fairs", exam_tags: ["CDS", "AFCAT"] },
          { name: "Architecture — Temple Styles, Monuments", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Sports GK": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Olympics & Major International Games", exam_tags: ["CDS", "AFCAT"] },
          { name: "Bharat Ratna & Arjuna Award Winners (Sports)", exam_tags: ["CDS", "AFCAT"] },
          { name: "Cricket, Hockey, Football — Key Tournaments", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Important Days & International Orgs": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ United Nations — Bodies & Functions", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Important National & International Days", exam_tags: ["CDS", "AFCAT"] },
          { name: "G7, G20, BRICS, SCO, ASEAN", exam_tags: ["CDS", "AFCAT"] },
          { name: "Other International Organizations (WTO, WHO, NATO)", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Books & Authors": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "Books by Political Leaders & Military Figures", exam_tags: ["CDS", "AFCAT"] },
          { name: "Recent Books by Notable Indians", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
      "Static GK": {
        exam_tags: ["CDS", "AFCAT"],
        topics: [
          { name: "⭐ Borders & Boundary Lines (McMahon, Radcliffe, Durand)", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Indian States — Capitals, GI Tags, Dance Forms", exam_tags: ["CDS", "AFCAT"] },
          { name: "⭐ Largest, Highest, Longest — India & World", exam_tags: ["CDS", "AFCAT"] },
          { name: "Capitals & Currencies of Countries", exam_tags: ["CDS", "AFCAT"] },
          { name: "Famous Personalities — Firsts in India & World", exam_tags: ["CDS", "AFCAT"] },
          { name: "Dams, Rivers, Waterfalls", exam_tags: ["CDS", "AFCAT"] },
        ]
      },
    }
  },

  "AFCAT — Reasoning": {
    exam_tags: ["AFCAT"],
    categories: {
      "Verbal Reasoning": {
        exam_tags: ["AFCAT"],
        topics: [
          { name: "⭐ Number & Letter Series", exam_tags: ["AFCAT"] },
          { name: "⭐ Analogies (Word & Number)", exam_tags: ["AFCAT"] },
          { name: "⭐ Coding-Decoding", exam_tags: ["AFCAT"] },
          { name: "⭐ Blood Relations", exam_tags: ["AFCAT"] },
          { name: "⭐ Direction Sense", exam_tags: ["AFCAT"] },
          { name: "Logical Deduction", exam_tags: ["AFCAT"] },
          { name: "Syllogisms", exam_tags: ["AFCAT"] },
          { name: "Statement & Assumption / Conclusion", exam_tags: ["AFCAT"] },
        ]
      },
      "Non-Verbal Reasoning": {
        exam_tags: ["AFCAT"],
        topics: [
          { name: "⭐ Figure Series & Pattern Completion", exam_tags: ["AFCAT"] },
          { name: "⭐ Mirror & Water Image", exam_tags: ["AFCAT"] },
          { name: "⭐ Spatial Visualisation", exam_tags: ["AFCAT"] },
          { name: "Embedded Figures", exam_tags: ["AFCAT"] },
          { name: "Cubes & Dice", exam_tags: ["AFCAT"] },
        ]
      },
      "Military Aptitude": {
        exam_tags: ["AFCAT"],
        topics: [
          { name: "⭐ Mechanical Aptitude (Gears, Pulleys, Levers)", exam_tags: ["AFCAT"] },
          { name: "⭐ OIR — Officer Intelligence Rating questions", exam_tags: ["AFCAT"] },
          { name: "Spatial Ability", exam_tags: ["AFCAT"] },
        ]
      },
    }
  },
}

export const TABS = [
  { id:'hq',       label:'HQ Dashboard', icon:'🏰',  short:'HQ' },
  { id:'log',      label:'Session Log',  icon:'📝',  short:'LOG' },
  { id:'pomo',     label:'Pomodoro',     icon:'🍅',  short:'POM' },
  { id:'queue',    label:'Revision Q',   icon:'🔄',  short:'QUE' },
  { id:'mocks_new',label:'Mock Tests',   icon:'🎯',  short:'MCK' },
  { id:'topics',   label:'Topic Map',    icon:'🗺',  short:'MAP' },
  { id:'sitrep',   label:'Weekly SITREP',icon:'📡',  short:'REP' },
  { id:'analytics',label:'Performance',   icon:'📈',  short:'ANL' },
  { id:'targets',  label:'Daily Targets', icon:'🎯',  short:'TGT' },
  { id:'features', label:'Tactical Tools',icon:'🛠',  short:'TLS' },
  { id:'profile',  label:'Profile',       icon:'👤',  short:'PRO' },
  { id:'settings', label:'Settings',      icon:'⚙',   short:'SET' },
]

export const MOB_TAB_ORDER = ['hq','log','pomo','queue','mocks_new','topics','sitrep','analytics','targets','features','profile','settings']

export const RANKS = [
  { level: 0, title: 'Recruit', minXP: 0, icon: '🔰' },
  { level: 1, title: 'Cadet', minXP: 100, icon: '🎓' },
  { level: 2, title: 'Officer Trainee', minXP: 500, icon: '🎖' },
  { level: 3, title: 'JCO', minXP: 1500, icon: '🔱' },
  { level: 4, title: 'Commissioned Officer', minXP: 4000, icon: '⭐' },
]

export const WEEKLY_ROTATION = {
  1: { block1: 'Mathematics', block2: 'English' }, // Mon
  2: { block1: 'GS — History', block2: 'GS — Physics' }, // Tue
  3: { block1: 'Mathematics', block2: 'GS — Geography' }, // Wed
  4: { block1: 'English', block2: 'GS — Chemistry' }, // Thu
  5: { block1: 'Mathematics', block2: 'GS — Biology' }, // Fri
  6: { block1: 'AFCAT — Reasoning', block2: 'GS — Indian Polity' }, // Sat
  0: { block1: 'Revision', block2: 'Mock Test' }, // Sun
}

export const XP_VALUES = {
  SESSION_COMPLETE: 10,
  MOCK_LOGGED: 25,
  ERROR_LOGGED: 5,
  STREAK_MAINTAINED: 15,
  DOUBT_RESOLVED: 10,
  POMO_COMPLETE: 8,
  WEEKLY_REVIEW: 30
}

export const MILESTONES = [
  { id: 'first_mock', label: 'First Strike', desc: 'First mock test logged', icon: '🎯' },
  { id: '10_sessions', label: 'Dedicated', desc: '10 study sessions completed', icon: '📚' },
  { id: '30_streak', label: 'Unstoppable', desc: '30-day study streak', icon: '🔥' },
  { id: '50_errors', label: 'Self-Correcting', desc: '50 errors resolved', icon: '🛠' },
  { id: '100_pomos', label: 'Focus Master', desc: '100 pomodoros completed', icon: '🍅' },
  { id: 'first_weekly', label: 'Strategist', desc: 'First weekly review done', icon: '📋' },
]

export const RADAR_SUBJECTS = [
  'Maths', 'English', 'History', 'Polity', 'Science', 'Geography', 'Economics', 'Defence GK', 'Reasoning'
]

export const td = () => new Date().toISOString().split('T')[0]
