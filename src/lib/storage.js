// LocalStorage Utility Functions

const STORAGE_KEYS = {
  HIERARCHY: 'coe_hierarchy',
  EVALUATIONS: 'coe_evaluations',
  POINTS: 'coe_points',
  RSO_REPORTS: 'coe_rso_reports', 
  OPERATIONAL_SHIFTS: 'coe_operational_shifts',
  HOME_DATA: 'coe_home_data',
  ABOUT_DATA: 'coe_about_data',
  REGULATIONS: 'coe_regulations',
  USERS: 'coe_users',
  TRANSFER_EDICTS: 'coe_transfer_edicts'
};

const DEFAULT_HIERARCHY = [
  { id: 1, gameId: '94001', serial: 'ABC-123', name: 'Comandante Exemplo', rank: 'Coronel', status: 'Operacional', badges: [], laurels: [] },
  { id: 2, gameId: '94002', serial: 'DEF-456', name: 'Subcomandante Teste', rank: 'Tenente-Coronel', status: 'Administrativo', badges: [], laurels: [] },
  { id: 3, gameId: '94003', serial: 'GHI-789', name: 'Operador Padrão', rank: 'Cabo', status: 'Operacional', badges: ['COESP'], laurels: [] }
];

const DEFAULT_REGULATIONS = [
  {
    id: 'internal',
    title: 'Regulamento Interno',
    description: 'Normas e diretrizes gerais de conduta e procedimentos do batalhão.',
    url: 'https://docs.google.com/document/d/1SXn0asD8kM-bwUulK9o3gREunvgxxqYe5E-lzguDdPM/edit?tab=t.0',
    category: 'Geral'
  },
  {
    id: 'vehicle',
    title: 'Manual de Viatura',
    description: 'Procedimentos para utilização, manutenção e conduta em viaturas.',
    url: 'https://www.canva.com/design/DAG0OnfOD9U/tWZfQlhMMP8QCE1aZflZgQ/view?utm_content=DAG0OnfOD9U&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he76cb63f9a',
    category: 'Operacional'
  },
  {
    id: 'uniform',
    title: 'Regulamento de Fardamento',
    description: 'Guia visual e normativo sobre os uniformes permitidos e sua composição.',
    url: 'https://www.canva.com/design/DAGxxNHpBKQ/C9pb7XHJFrlGPHCtQNzYsA/view?utm_content=DAGxxNHpBKQ&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h520893ca33',
    category: 'Geral'
  }
];

const DEFAULT_HOME_DATA = {
  heroTitle: '4° BPCHQ - COE',
  heroSubtitle: 'Comandos e Operações Especiais',
  heroImage: 'https://images.unsplash.com/photo-1700774606243-e7b44df0db9f'
};

const DEFAULT_ABOUT_DATA = {
  title: 'Sobre o COE',
  description: 'Comandos e Operações Especiais. A elite tática preparada para as missões mais complexas.',
  history: 'O Comandos e Operações Especiais (COE) foi criado em 1970...',
  heroImage: 'https://horizons-cdn.hostinger.com/49a93bbb-0c2b-4650-8b15-f695eaab0ba3/ae7323cec73b8fee327c81c2bf538f6f-kPcJA.jpg'
};

// --- Hierarchy ---
export const loadHierarchy = () => {
  const data = localStorage.getItem(STORAGE_KEYS.HIERARCHY);
  return data ? JSON.parse(data) : DEFAULT_HIERARCHY;
};

export const saveHierarchy = (data) => {
  localStorage.setItem(STORAGE_KEYS.HIERARCHY, JSON.stringify(data));
};

// --- Evaluations ---
export const loadEvaluations = () => {
  const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
  return data ? JSON.parse(data) : [];
};

export const saveEvaluations = (data) => {
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(data));
};

// --- Points ---
export const loadPoints = () => {
  const data = localStorage.getItem(STORAGE_KEYS.POINTS);
  return data ? JSON.parse(data) : [];
};

export const savePoints = (data) => {
  localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(data));
};

// --- RSO ---
export const loadRSOData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.RSO_REPORTS);
  return data ? JSON.parse(data) : [];
};

export const saveRSOData = (data) => {
  localStorage.setItem(STORAGE_KEYS.RSO_REPORTS, JSON.stringify(data));
};

// --- Operational Check-In ---
export const loadOperationalCheckIn = () => {
  const data = localStorage.getItem(STORAGE_KEYS.OPERATIONAL_SHIFTS);
  return data ? JSON.parse(data) : [];
};

export const saveOperationalCheckIn = (data) => {
  localStorage.setItem(STORAGE_KEYS.OPERATIONAL_SHIFTS, JSON.stringify(data));
};

// --- Content Management ---
export const loadHomePageData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.HOME_DATA);
  return data ? JSON.parse(data) : DEFAULT_HOME_DATA;
};

export const saveHomePageData = (data) => {
  localStorage.setItem(STORAGE_KEYS.HOME_DATA, JSON.stringify(data));
};

export const loadAboutPageData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ABOUT_DATA);
  return data ? JSON.parse(data) : DEFAULT_ABOUT_DATA;
};

export const saveAboutPageData = (data) => {
  localStorage.setItem(STORAGE_KEYS.ABOUT_DATA, JSON.stringify(data));
};

// --- Regulations ---
export const loadRegulations = () => {
  const data = localStorage.getItem(STORAGE_KEYS.REGULATIONS);
  return data ? JSON.parse(data) : DEFAULT_REGULATIONS;
};

export const saveRegulations = (data) => {
  localStorage.setItem(STORAGE_KEYS.REGULATIONS, JSON.stringify(data));
};

// --- Users (Access Management) ---
export const loadUsers = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  try {
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveUsers = (data) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data));
};

// --- Transfer Edicts ---
export const loadTransferEdicts = () => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSFER_EDICTS);
  return data ? JSON.parse(data) : [];
};

export const saveTransferEdicts = (data) => {
  localStorage.setItem(STORAGE_KEYS.TRANSFER_EDICTS, JSON.stringify(data));
};