export const EXAMS = [
  { i:'c1', l:'⚡ CDS I',    d:'2026-04-12', c:'#ffd700' },
  { i:'af', l:'✈ AFCAT',    d:null,          c:'#00d4ff' },
  { i:'c2', l:'🟢 CDS II',  d:'2026-09-13', c:'#39ff14' },
  { i:'c3', l:'🟣 CDS 2027',d:'2027-04-11', c:'#bf80ff' },
]

export const RAW_SYLLABUS = [
  [1,'Maths','Number System','H',['Divisibility Rules','LCM & HCF','Remainder Theorem','Unit Digit','Factors & Multiples'], "Foundation of arithmetic, high weightage in CDS/NDA.", ["What is the remainder when 2^31 is divided by 7?", "Find the HCF of 108, 288 and 360."]],
  [2,'Maths','Simplification','H',['BODMAS','Fractions & Decimals','Surds & Indices','Approximation'], "Essential for speed in AFCAT/CDS.", ["Simplify: (0.1)^2 - (0.01)^2", "Calculate the value of sqrt(2 + sqrt(2 + ...))"]],
  [3,'Maths','Ratio & Proportion','H',['Basic Ratio','Partnership','Direct & Inverse Proportion','Alligation']],
  [4,'Maths','Percentage','H',['% Basics','Fraction↔% Conversion','% Change & Applications','Population Problems']],
  [5,'Maths','Profit & Loss','H',['CP & SP','Discount & Markup','Successive Discount','Profit % Problems']],
  [6,'Maths','SI & CI','H',['Simple Interest','Compound Interest','CI vs SI Difference','Installments']],
  [7,'Maths','Time & Work','H',['Work Efficiency','Combined Work','Pipes & Cisterns','Wages Problems']],
  [8,'Maths','Time Speed Distance','H',['Basic TSD','Train Problems','Boats & Streams','Relative Speed']],
  [9,'Maths','Algebra','M',['Linear Equations','Quadratic Equations','Identities','Polynomials']],
  [10,'Maths','Geometry','M',['Triangles','Circles','Angles & Lines','Coordinate Basics']],
  [11,'Maths','Mensuration','M',['2D Areas — Triangle & Circle','2D Areas — Quad & Polygon','3D Volumes','Surface Areas']],
  [12,'Maths','Trigonometry','M',['Basic Ratios','Trig Identities','Heights & Distances','Complementary Angles']],
  [13,'Maths','Statistics','L',['Mean','Median & Mode','Weighted Average','Frequency Distribution']],
  [14,'Maths','Miscellaneous','L',['Mixtures & Alligation','Number Series','Probability','Permutation & Combination']],
  [15,'English','Spotting Errors','H',['Subject-Verb Agreement','Tense Errors','Article Usage','Preposition Errors']],
  [16,'English','Sentence Improvement','H',['Correction Techniques','Phrase Restructuring','Voice & Narration']],
  [17,'English','Selecting Words','H',['Fill in Blanks','Contextual Usage','Phrasal Verbs']],
  [18,'English','Ordering of Words','H',['Jumbled Words in Sentence','Logical Word Order']],
  [19,'English','Ordering of Sentences','H',['Para Jumbles','Opening & Closing Sentences','Logical Flow']],
  [20,'English','Reading Comprehension','H',['Main Idea','Inference Questions','Vocab in Context','Tone & Purpose']],
  [21,'English','Synonyms & Antonyms','M',['Root Words','High-Freq PYQ Pairs','Contextual Synonyms']],
  [22,'English','Vocabulary','M',['One-Word Substitution','Idioms & Phrases','Proverbs']],
  [23,'GS','Polity & Constitution','H',['Preamble & Features','Fundamental Rights','DPSP & Duties','Parliament','President & PM'], "Core of UPSC/CDS GS paper. 15-20 questions expected.", ["Which article deals with the right to privacy?", "Who is the ex-officio chairman of Rajya Sabha?"]],
  [24,'GS','Modern History','H',['1857 Revolt','Nationalist Movement','Freedom Leaders','Partition & Independence'], "Focus on chronology and key figures for CDS/NDA.", ["Who started the Home Rule Movement?", "Which event led to the Non-Cooperation movement?"]],
  [25,'GS','Ancient & Medieval','M',['Indus Valley','Vedic Period','Maurya & Gupta','Medieval Dynasties','Mughal Empire']],
  [26,'GS','Indian Geography','H',['Rivers & Drainage','Climate & Monsoon','Mountains & Passes','Soils & Vegetation','Maps & Location']],
  [27,'GS','World Geography','M',['Continents','Oceans & Seas','Important Straits & Passes','Natural Phenomena']],
  [28,'GS','Physics','H',['Laws of Motion','Optics & Light','Electricity & Magnetism','SI Units & Measurement']],
  [29,'GS','Chemistry','M',['Periodic Table','Acids Bases & Salts','Important Reactions','Common Compounds']],
  [30,'GS','Biology','H',['Cell Structure','Human Body Systems','Nutrition & Diseases','Plant Biology']],
  [31,'GS','Environment','M',['Ecology Basics','Biodiversity','Pollution Types','Environmental Laws & Acts']],
  [32,'GS','Economy','M',['GDP & GNP','Inflation & Deflation','RBI & Banking','Budget & Fiscal Policy','Govt Schemes']],
  [33,'GS','Defence & Military','H',['Army/Navy/AF Ranks','Weapons & Systems','Major Operations','Gallantry Awards'], "Directly relevant for SSB and written exams.", ["What is the highest gallantry award in India?", "Identify the equivalent rank of Captain in the Navy."]],
  [34,'GS','Science & Tech','M',['Space Missions (ISRO)','DRDO Projects','Recent Discoveries','Tech in News']],
  [35,'GS','Sports & Awards','L',['Olympics & Asian Games','National Awards','Padma Awards','Sports Personalities']],
  [36,'GS','Current Affairs','H',['Defence News','Polity & Governance','International Events','Economy News']],
  [37,'AFCAT','Series Completion','H',['Number Series','Letter Series','Mixed Series']],
  [38,'AFCAT','Coding-Decoding','H',['Letter Coding','Number Coding','Symbol Coding']],
  [39,'AFCAT','Analogy & Classification','H',['Word Analogy','Number Analogy','Odd One Out']],
  [40,'AFCAT','Blood Relations','M',['Family Tree','Coded Relations','Generation Problems']],
  [41,'AFCAT','Directions & Distance','M',['Direction Sense','Distance Calculation','Map Reading']],
  [42,'AFCAT','Logical Puzzles','H',['Seating Arrangement','Scheduling','Ranking Problems']],
  [43,'AFCAT','Venn Diagrams','M',['Set Relations','3-Circle Problems','Euler Diagrams']],
  [44,'AFCAT','Statement & Assumptions','H',['Identify Assumptions','Conclusions','Arguments']],
  [45,'AFCAT','Data Interpretation','H',['Tables','Bar & Line Charts','Pie Charts']],
  [46,'AFCAT','Syllogisms','M',['All/Some/None Patterns','Definite Conclusions']],
  [47,'AFCAT','Number Puzzles','M',['Grid Completion','Missing Number','Magic Squares']],
  [48,'AFCAT','Clock & Calendar','L',['Clock Angle Problems','Day/Date Calculation']],
  [49,'AFCAT','Mirror & Water Images','L',['Mirror Images','Water Images','Embedded Figures']],
  [50,'AFCAT','Figure Matrix','M',['Pattern Completion','Matrix Reasoning']],
]

export const HABITS = [
  { i:'ms', l:'Morning Study', e:'📖' },
  { i:'ns', l:'Night Study',   e:'📚' },
  { i:'pq', l:'PYQ Done',      e:'✏️' },
  { i:'mr', l:'Mock/Rev',      e:'🎯' },
  { i:'gm', l:'Gym',           e:'💪' },
  { i:'sl', l:'Sleep <12AM',   e:'🌙' },
]

export const SUBC = { Maths:'#ffd700', English:'#00d4ff', GS:'#39ff14', AFCAT:'#bf80ff' }
export const SC   = { 'Not Started':'#4a4a4a', 'In Progress':'#ffd700', Done:'#39ff14' }
export const PRICC= { H:'#ef4444', M:'#f59e0b', L:'#10b981' }
export const SUBTOTALS = { Maths:14, English:8, GS:14, AFCAT:14 }

export const TABS = [
  { id:'dash',     label:'Dashboard',    icon:'📊',  short:'DSH' },
  { id:'daily',    label:'Study Log',    icon:'📅',  short:'LOG' },
  { id:'habits',   label:'Daily Routine', icon:'🔥',  short:'HAB' },
  { id:'syl',      label:'Course Map',   icon:'📚',  short:'SYL' },
  { id:'mocks',    label:'Test Series',  icon:'📝',  short:'TST' },
  { id:'pyq',      label:'Exam Archive', icon:'📋',  short:'PYQ' },
  { id:'rev',      label:'Smart Revision', icon:'🔄',  short:'REV' },
  { id:'vocab',    label:'Word Power',   icon:'📖',  short:'VOC' },
  { id:'quiz',     label:'Daily Quiz',   icon:'🧠',  short:'QIZ' },
  { id:'planner',  label:'Schedule',     icon:'📋',  short:'PLN' },
  { id:'analytics',label:'Performance',  icon:'📈',  short:'ANL' },
  { id:'simulator',label:'Simulator',    icon:'🎮',  short:'SIM' },
  { id:'profile',  label:'Profile',      icon:'👤',  short:'PRO' },
  { id:'settings', label:'Settings',     icon:'⚙',   short:'SET' },
]

export const MOB_TAB_ORDER = ['dash','daily','syl','mocks','habits','pyq','rev','vocab','quiz','planner','analytics','simulator','profile','settings']

export function makeSyl() {
  return RAW_SYLLABUS.map(([id,sub,topic,pri,subs, why, questions]) => ({
    id, sub, topic, pri, subs,
    why: why || "Key topic for exam preparation.",
    questions: questions || ["Sample question for this topic?"],
    status: 'Not Started',
    conf: 0, done: {}, lastStudied: null
  }))
}

export const td = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
