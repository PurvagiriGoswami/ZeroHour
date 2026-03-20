export const EXAMS = [
  { i:'c1', l:'⚡ CDS I',    d:'2026-04-12', c:'#ffd700' },
  { i:'af', l:'✈ AFCAT',    d:null,          c:'#00d4ff' },
  { i:'c2', l:'🟢 CDS II',  d:'2026-09-13', c:'#39ff14' },
  { i:'c3', l:'🟣 CDS 2027',d:'2027-04-11', c:'#bf80ff' },
]

export const RAW_SYLLABUS = [
  [1,'Maths','Number System','H',['Divisibility Rules','LCM & HCF','Remainder Theorem','Unit Digit','Factors & Multiples']],
  [2,'Maths','Simplification','H',['BODMAS','Fractions & Decimals','Surds & Indices','Approximation']],
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
  [23,'GS','Polity & Constitution','H',['Preamble & Features','Fundamental Rights','DPSP & Duties','Parliament','President & PM']],
  [24,'GS','Modern History','H',['1857 Revolt','Nationalist Movement','Freedom Leaders','Partition & Independence']],
  [25,'GS','Ancient & Medieval','M',['Indus Valley','Vedic Period','Maurya & Gupta','Medieval Dynasties','Mughal Empire']],
  [26,'GS','Indian Geography','H',['Rivers & Drainage','Climate & Monsoon','Mountains & Passes','Soils & Vegetation','Maps & Location']],
  [27,'GS','World Geography','M',['Continents','Oceans & Seas','Important Straits & Passes','Natural Phenomena']],
  [28,'GS','Physics','H',['Laws of Motion','Optics & Light','Electricity & Magnetism','SI Units & Measurement']],
  [29,'GS','Chemistry','M',['Periodic Table','Acids Bases & Salts','Important Reactions','Common Compounds']],
  [30,'GS','Biology','H',['Cell Structure','Human Body Systems','Nutrition & Diseases','Plant Biology']],
  [31,'GS','Environment','M',['Ecology Basics','Biodiversity','Pollution Types','Environmental Laws & Acts']],
  [32,'GS','Economy','M',['GDP & GNP','Inflation & Deflation','RBI & Banking','Budget & Fiscal Policy','Govt Schemes']],
  [33,'GS','Defence & Military','H',['Army/Navy/AF Ranks','Weapons & Systems','Major Operations','Gallantry Awards']],
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
export const PRICC= { H:'#ff8888', M:'#ffd700', L:'#4a7a4a' }
export const SUBTOTALS = { Maths:14, English:8, GS:14, AFCAT:14 }

export const DAILY_PLANS = {
  '2026-03-20':'[M] Number System · [E] Spotting Errors · [GS] Polity',
  '2026-03-21':'[M] Profit & Loss + SI/CI · [E] Sentence Improvement',
  '2026-03-22':'[M] Time & Work + Pipes · [E] Sentence Improvement cont.',
  '2026-03-23':'[M] TSD — Trains & Boats · [GS] Parliament + President',
  '2026-03-24':'[M] Algebra + Geometry · [GS] Parliament cont.',
  '2026-03-25':'[E] RC — 2 PYQ passages · [GS] Modern History',
  '2026-03-26':'[E] Ordering of Sentences · [GS] Ancient + Medieval',
  '2026-03-27':'[E] Synonyms + Vocab · [GS] Indian Geography',
  '2026-03-28':'🔴 MOCK #1 — OSW360 full paper · 2.5 hrs strict',
  '2026-03-29':'[ALL] Error Log review from Mock #1',
  '2026-03-30':'[GS] Physics — motion, optics, electricity',
  '2026-03-31':'🔴 MOCK #2 — FOLD past paper · strict timing',
}

export const DEFAULT_FORMULAS = [
  { id:'f1', sub:'Maths', topic:'SI & CI',             formula:'SI = P×R×T/100\nCI = P(1+R/100)ᵀ − P',        note:'CI−SI for 2 yrs = P(R/100)²',               learned:false },
  { id:'f2', sub:'Maths', topic:'Time Speed Distance', formula:'Distance = Speed × Time\nSpeed = D/T  Time = D/S', note:'1 km/h = 5/18 m/s  |  1 m/s = 18/5 km/h', learned:false },
  { id:'f3', sub:'Maths', topic:'Time & Work',         formula:'Rate = 1/A + 1/B\nTime = AB/(A+B)',             note:'Pipes: filling +, emptying −',               learned:false },
  { id:'f4', sub:'Maths', topic:'Profit & Loss',       formula:'Profit% = (SP−CP)/CP × 100\nDiscount% = D/MP × 100', note:'SP = CP(100+P%)/100',                  learned:false },
  { id:'f5', sub:'Maths', topic:'Ratio & Proportion',  formula:'a:b :: c:d → ad = bc',                         note:'Alligation: cheap/(costly−mean) = mean ratio', learned:false },
  { id:'f6', sub:'Maths', topic:'Mensuration 2D',      formula:'Circle: πr²  |  Triangle: ½bh\nTrapezium: ½(a+b)h', note:'Equilateral △: (√3/4)a²',              learned:false },
  { id:'f7', sub:'Maths', topic:'Mensuration 3D',      formula:'Sphere: 4πr³/3  |  Cylinder: πr²h\nCone: πr²h/3', note:'SA(sphere)=4πr²  SA(cyl)=2πr(r+h)',       learned:false },
  { id:'f8', sub:'Maths', topic:'Trigonometry',        formula:'sin²θ+cos²θ=1\n1+tan²θ=sec²θ',                note:'sin30=½  cos30=√3/2  tan45=1',               learned:false },
  { id:'f9', sub:'Maths', topic:'Algebra Identities',  formula:'(a+b)²=a²+2ab+b²\na²−b²=(a+b)(a−b)',         note:'(a+b)³=a³+3a²b+3ab²+b³',                   learned:false },
  { id:'f10',sub:'Maths', topic:'Percentage',          formula:'X% of Y = Y×X/100\n% change=(new−old)/old×100',note:'a% of b = b% of a  (key trick!)',            learned:false },
]

export const TABS = [
  { id:'dash',     label:'⬡ COMMAND',   icon:'⬡',  short:'CMD' },
  { id:'daily',    label:'📅 DAILY',    icon:'📅', short:'LOG' },
  { id:'habits',   label:'🔥 HABITS',   icon:'🔥', short:'HAB' },
  { id:'syl',      label:'📚 SYLLABUS', icon:'📚', short:'SYL' },
  { id:'mocks',    label:'📝 MOCKS',    icon:'📝', short:'MCK' },
  { id:'pyq',      label:'📋 PYQ',      icon:'📋', short:'PYQ' },
  { id:'errors',   label:'🔴 ERRORS',   icon:'🔴', short:'ERR' },
  { id:'rev',      label:'🔄 REVISION', icon:'🔄', short:'REV' },
  { id:'pomo',     label:'⏱ POMO',      icon:'⏱', short:'TMR' },
  { id:'vocab',    label:'📖 VOCAB',    icon:'📖', short:'VOC' },
  { id:'formulas', label:'📐 FORMULAS', icon:'📐', short:'FRM' },
  { id:'calc',     label:'📊 CALC',     icon:'📊', short:'CAL' },
  { id:'settings', label:'⚙ SETTINGS',  icon:'⚙',  short:'SET' },
]

export const MOB_TAB_ORDER = ['dash','daily','syl','mocks','pomo','habits','errors','formulas','pyq','rev','vocab','calc','settings']

export function makeSyl() {
  return RAW_SYLLABUS.map(([id,sub,topic,pri,subs]) => ({
    id, sub, topic, pri, subs,
    status: 'Not Started',
    conf: 0, done: {}, lastStudied: null
  }))
}

export const td = () => new Date().toISOString().split('T')[0]
