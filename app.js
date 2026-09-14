(function(){
"use strict";

/* ========================================================================
   DATA
   ======================================================================== */
const VESSEL_PRESETS = [
  {sistema:'esquerda', nivel:'principal', nome:'Tronco da Coronária Esquerda', sigla:'TCE'},
  {sistema:'esquerda', nivel:'principal', nome:'Artéria Descendente Anterior', sigla:'DA'},
  {sistema:'esquerda', nivel:'ramo', nome:'Primeiro ramo diagonal', sigla:'Dg1'},
  {sistema:'esquerda', nivel:'ramo', nome:'Segundo ramo diagonal', sigla:'Dg2'},
  {sistema:'esquerda', nivel:'ramo', nome:'Terceiro ramo diagonal', sigla:'Dg3'},
  {sistema:'esquerda', nivel:'ramo', nome:'Ramo septal', sigla:'Sept'},
  {sistema:'esquerda', nivel:'principal', nome:'Artéria Circunflexa', sigla:'CX'},
  {sistema:'esquerda', nivel:'ramo', nome:'Primeiro ramo marginal esquerdo', sigla:'MgE1'},
  {sistema:'esquerda', nivel:'ramo', nome:'Segundo ramo marginal esquerdo', sigla:'MgE2'},
  {sistema:'esquerda', nivel:'ramo', nome:'Terceiro ramo marginal esquerdo', sigla:'MgE3'},
  {sistema:'direita', nivel:'principal', nome:'Artéria Coronária Direita', sigla:'CD'},
  {sistema:'direita', nivel:'ramo', nome:'Ramo do cone', sigla:'Cone'},
  {sistema:'direita', nivel:'ramo', nome:'Ramo do nó sinusal', sigla:'Nó sinusal'},
  {sistema:'direita', nivel:'ramo', nome:'Marginal direita', sigla:'MgD'},
  {sistema:'direita', nivel:'ramo', nome:'Artéria Descendente Posterior', sigla:'DP'},
  {sistema:'direita', nivel:'ramo', nome:'Ramo Ventricular Posterior', sigla:'VP'},
];

/* vasos padrão por tipo de dominância — usados pelo botão "Carregar vasos padrão" */
const COMMON_LEFT_VESSELS = [
  {sistema:'esquerda', nivel:'principal', nome:'Tronco da Coronária Esquerda', sigla:'TCE'},
  {sistema:'esquerda', nivel:'principal', nome:'Artéria Descendente Anterior', sigla:'DA'},
  {sistema:'esquerda', nivel:'ramo', nome:'Primeiro ramo diagonal', sigla:'Dg1'},
  {sistema:'esquerda', nivel:'ramo', nome:'Segundo ramo diagonal', sigla:'Dg2'},
  {sistema:'esquerda', nivel:'ramo', nome:'Terceiro ramo diagonal', sigla:'Dg3'},
  {sistema:'esquerda', nivel:'principal', nome:'Artéria Circunflexa', sigla:'CX'},
  {sistema:'esquerda', nivel:'ramo', nome:'Primeiro ramo marginal esquerdo', sigla:'MgE1'},
  {sistema:'esquerda', nivel:'ramo', nome:'Segundo ramo marginal esquerdo', sigla:'MgE2'},
  {sistema:'esquerda', nivel:'ramo', nome:'Terceiro ramo marginal esquerdo', sigla:'MgE3'},
];
const CD_PRINCIPAL = {sistema:'direita', nivel:'principal', nome:'Artéria Coronária Direita', sigla:'CD'};
const DP_DIREITA = {sistema:'direita', nivel:'ramo', nome:'Artéria Descendente Posterior', sigla:'DP'};
const VP_DIREITA = {sistema:'direita', nivel:'ramo', nome:'Ramo Ventricular Posterior', sigla:'VP'};
const DP_ESQUERDA = {sistema:'esquerda', nivel:'ramo', nome:'Artéria Descendente Posterior', sigla:'DP'};
const VP_ESQUERDA = {sistema:'esquerda', nivel:'ramo', nome:'Ramo Ventricular Posterior', sigla:'VP'};

const DOMINANCE_SETS = {
  'Direita': [...COMMON_LEFT_VESSELS, CD_PRINCIPAL, DP_DIREITA, VP_DIREITA],
  'Esquerda': [...COMMON_LEFT_VESSELS, DP_ESQUERDA, VP_ESQUERDA, CD_PRINCIPAL],
  'Balanceada': [...COMMON_LEFT_VESSELS, VP_ESQUERDA, CD_PRINCIPAL, DP_DIREITA],
  'Revascularização miocárdica cirúrgica': [...COMMON_LEFT_VESSELS, CD_PRINCIPAL, DP_DIREITA, VP_DIREITA],
};

const ENXERTO_TIPOS = [
  {key:'safena', label:'Safena', sigla:'SF', alvos:[
    {code:'Mg', label:'Ramo marginal'}, {code:'Dg', label:'Ramo diagonal'},
    {code:'DP', label:'Descendente posterior'}, {code:'VP', label:'Ventricular posterior'},
  ]},
  {key:'radial', label:'Radial', sigla:'RD', alvos:[
    {code:'Mg', label:'Ramo marginal'}, {code:'Dg', label:'Ramo diagonal'},
    {code:'DP', label:'Descendente posterior'}, {code:'VP', label:'Ventricular posterior'},
  ]},
  {key:'mamaria_e', label:'Mamária esquerda', sigla:'MIE', alvos:[
    {code:'DA', label:'Descendente anterior'}, {code:'Dg', label:'Ramo diagonal'}, {code:'Mg', label:'Ramo marginal'},
  ]},
  {key:'mamaria_d', label:'Mamária direita', sigla:'MID', alvos:[
    {code:'CD', label:'Coronária direita'},
    {code:'DP', label:'Descendente posterior direita'},
    {code:'VP', label:'Ventricular posterior direita'},
    {code:'CX', label:'Circunflexa'},
    {code:'Mg', label:'Ramo marginal'},
    {code:'DA', label:'Descendente anterior (enxerto livre)'},
  ]},
];

const LESION_TYPES = ['Lesão focal','Lesão segmentar','Lesões difusas','Lesão ambígua','Lesão intra-stent',
  'Lesão sub-oclusiva','Lesão ocluída','Lesão de oclusão crônica','Lesão ulcerada','Lesão com dissecção',
  'Lesão iatrogênica','Lesão com compressão extrínseca'];

const LOCALIZACOES = ['Óstio','Proximal','Médio','Distal','Corpo'];
const IMPORTANCIAS = ['Pequena','Moderada','Grande'];

const LESION_FLAGS = [
  {key:'calcificada', label:'Calcificada', text:'calcificada'},
  {key:'excentrica', label:'Excêntrica', text:'excêntrica'},
  {key:'tortuosa', label:'Tortuosa', text:'em segmento tortuoso'},
  {key:'trombo', label:'Trombo', text:'com trombo'},
  {key:'ulcerada', label:'Ulcerada', text:'ulcerada'},
  {key:'bifurcacao', label:'Bifurcação', text:'envolvendo bifurcação'},
  {key:'ectasia', label:'Ectasia', text:'com ectasia associada'},
  {key:'fluxoLento', label:'Fluxo lento', text:'com fluxo lento a jusante'},
  {key:'ponte', label:'Ponte miocárdica', text:'sobre ponte miocárdica'},
];

const IVUS_PLACA_CARACTERISTICAS = ['Fibrótica','Calcificada','Atenuada','Lipídica'];
const OCT_PLACA_CARACTERISTICAS = ['Fibrótica','Lipídica','Calcificada','Rica em macrófagos','Neovascularização','Cristais de colesterol','Cap fibroso fino (TCFA)'];
const ARCO_CALCIO_LABEL = { gt270: 'maior que 270°', lt270: 'menor que 270°', '360': 'de 360° (circunferencial)' };
const SINAIS_MODIFICACAO_CALCIO = ['Fratura do cálcio','Discontinuidade acústica','Ganho luminal','Plaque Disruption','Outros'];

const MEDICACOES = ['AAS','Clopidogrel','Prasugrel','Ticagrelor','HBPM','Heparina não fracionada','Bivalirrudina',
  'Agrastat','Nitroglicerina','Papaverina','Dobutamina','Dopamina','Noradrenalina','Aramin',
  'Hidrocortisona','Difenidramina'];

const INTERCORRENCIAS = ['Alergia a contraste','AVC/AIT','Choque','Dissecção aórtica','Dissecção do sítio de acesso',
  'Embolia gasosa','Embolização de stent','Hematoma no sítio de acesso','Isquemia do sítio de acesso',
  'Necessidade de CVE/desfibrilação','Necessidade de transfusão','Necessidade de BIA','Necessidade de intubação',
  'Necessidade de marcapasso','PCR revertida','Perfuração coronária','Perfuração do sítio de acesso',
  'Revascularização miocárdica de urgência','Tamponamento cardíaco','Trombose de stent','Óbito'];

const COMPLICACOES_VASO = ['Dissecção','Perfuração coronária','No-reflow','Perda de ramo lateral',
  'Espasmo coronário','Embolização distal','Trombose aguda de stent','Falha mecânica do dispositivo'];

const CATETER_GUIA_SUG = ['JL4','JL3.5','JR4','EBU 3.5','EBU 3.75','XB','Voda','AL1','AL2','Amplatz'];
const BALAO_SUG = ['Mini Trek','NC Trek Neo','Sprinter Legend','Quantum Apex','Emerge','Euphora'];
const STENT_SUG = ['Firehawk','Oxyx TruCor','Xience Sierra','Resolute Onyx','Synergy','Promus Element Plus'];

let uid = 1;
const nextId = () => 'v' + (uid++);

/* ========================================================================
   STATE
   ======================================================================== */
const state = {
  angiografia: {
    vasos: [],
    equipe: [
      {papel:'Responsável', nome:'', crm:''},
      {papel:'Executor', nome:'', crm:''},
      {papel:'Assistente 1', nome:'', crm:''},
      {papel:'Assistente 2', nome:'', crm:''},
    ],
    metodos: new Set(),
    metodosInfluencia: null,
  },
  angioplastia: {
    medicacao: new Set(),
    intercorrencias: new Set(),
    vasos: [],
    equipe: [
      {papel:'Responsável', nome:'', crm:''},
      {papel:'Executor', nome:'', crm:''},
      {papel:'Assistente 1', nome:'', crm:''},
      {papel:'Assistente 2', nome:'', crm:''},
      {papel:'Anestesista', nome:'', crm:''},
    ],
  },
};

function loadTeamFromStorage(){
  try{
    const raw = localStorage.getItem('laudos_equipe_v1');
    if(!raw) return;
    const saved = JSON.parse(raw);
    if(saved.angiografia) state.angiografia.equipe = saved.angiografia;
    if(saved.angioplastia) state.angioplastia.equipe = saved.angioplastia;
  }catch(e){}
}
function saveTeamToStorage(){
  try{
    localStorage.setItem('laudos_equipe_v1', JSON.stringify({
      angiografia: state.angiografia.equipe,
      angioplastia: state.angioplastia.equipe,
    }));
  }catch(e){}
}

/* ========================================================================
   PERSISTENCE — vasos, achados e campos do laudo em andamento
   (a equipe já é salva à parte, acima; o campo "Ref." do paciente é
   propositalmente NUNCA salvo aqui — é só uma etiqueta de tela, não deve
   sobreviver a um refresh por privacidade do paciente)
   ======================================================================== */
const PATIENT_STORAGE_KEY = 'hemolaudo_patient_v1';

const GA_FIELD_IDS = ['ga_descricao','ga_via','ga_puncao','ga_lado',
  'ga_introdutor','ga_introdutorCustom','ga_hemostasia','ga_hemostasiaCustom',
  'ga_contrasteTipo','ga_contrasteTipoCustom','ga_contrasteVolume',
  'ga_dominancia','ga_colateral','ga_colateralDetalhe','ga_colateralIncluir',
  'ga_padrao','ga_padraoCustom','ga_ventriculografia','ga_aortografia','ga_metodosAchados',
  'ga_ivus_arteria','ga_ivus_velocidade','ga_ivus_semLesao','ga_ivus_localizacao','ga_ivus_alm',
  'ga_ivus_dim1','ga_ivus_dim2','ga_ivus_cargaPlaca','ga_ivus_calcio','ga_ivus_calcioExtensao',
  'ga_ivus_calcioArco','ga_ivus_nodulo','ga_ivus_obs',
  'ga_oct_arteria','ga_oct_semLesao','ga_oct_localizacao','ga_oct_alm','ga_oct_dim1','ga_oct_dim2',
  'ga_oct_calcio','ga_oct_calcioEspessura','ga_oct_calcioExtensao','ga_oct_calcioArco','ga_oct_nodulo','ga_oct_obs'];

const AP_FIELD_IDS = ['ap_via','ap_puncao','ap_lado',
  'ap_introdutor','ap_introdutorCustom','ap_hemostasia','ap_hemostasiaCustom','ap_anestesia',
  'ap_contrasteTipo','ap_contrasteTipoCustom','ap_contrasteVolume',
  'ap_conclusaoExtra','ap_medicacaoOutras','ap_intercorrenciasObs'];

/* checkboxes need .checked, everything else needs .value — these two
   helpers keep capture/save/restore/reset agnostic to the field's type */
function getFieldValue(id){
  const el = document.getElementById(id);
  return el.type === 'checkbox' ? el.checked : el.value;
}
function setFieldValue(id, value){
  const el = document.getElementById(id);
  if(el.type === 'checkbox') el.checked = !!value; else el.value = value;
}

/* captured once, right after the HTML's own hardcoded defaults are parsed —
   used to restore a truly blank form when "Novo laudo" is clicked */
let GA_DEFAULTS = null;
let AP_DEFAULTS = null;
function captureFieldDefaults(){
  GA_DEFAULTS = {};
  GA_FIELD_IDS.forEach(id => { GA_DEFAULTS[id] = getFieldValue(id); });
  AP_DEFAULTS = {};
  AP_FIELD_IDS.forEach(id => { AP_DEFAULTS[id] = getFieldValue(id); });
}

let patientSaveTimer = null;
function schedulePatientSave(){
  clearTimeout(patientSaveTimer);
  patientSaveTimer = setTimeout(savePatientData, 400);
}
function savePatientData(){
  try{
    const fieldValues = ids => Object.fromEntries(ids.map(id => [id, getFieldValue(id)]));
    localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify({
      angiografia: {
        vasos: state.angiografia.vasos,
        metodos: Array.from(state.angiografia.metodos),
        metodosInfluencia: state.angiografia.metodosInfluencia,
        ivusCaracteristicas: Array.from(gaIvusCaracteristicas),
        octCaracteristicas: Array.from(gaOctCaracteristicas),
        fields: fieldValues(GA_FIELD_IDS),
      },
      angioplastia: {
        vasos: state.angioplastia.vasos.map(v => ({
          ...v,
          complicacoes: Array.from(v.complicacoes),
          devices: v.devices.map(d => ({
            ...d,
            caracteristicas: Array.from(d.caracteristicas || []),
            sinaisModificacao: Array.from(d.sinaisModificacao || []),
          })),
        })),
        medicacao: Array.from(state.angioplastia.medicacao),
        intercorrencias: Array.from(state.angioplastia.intercorrencias),
        fields: fieldValues(AP_FIELD_IDS),
      },
    }));
  }catch(e){}
}
function clearPatientData(){
  try{ localStorage.removeItem(PATIENT_STORAGE_KEY); }catch(e){}
}
/* returns true if a previously in-progress laudo was restored */
function loadPatientData(){
  let raw;
  try{ raw = localStorage.getItem(PATIENT_STORAGE_KEY); }catch(e){ return false; }
  if(!raw) return false;
  let saved;
  try{ saved = JSON.parse(raw); }catch(e){ return false; }

  const restoreFields = (ids, fields) => {
    if(!fields) return;
    ids.forEach(id => { if(id in fields) setFieldValue(id, fields[id]); });
  };

  if(saved.angiografia){
    state.angiografia.vasos = Array.isArray(saved.angiografia.vasos) ? saved.angiografia.vasos : [];
    state.angiografia.metodos = new Set(saved.angiografia.metodos || []);
    state.angiografia.metodosInfluencia = saved.angiografia.metodosInfluencia || null;
    gaIvusCaracteristicas.clear();
    (saved.angiografia.ivusCaracteristicas || []).forEach(c => gaIvusCaracteristicas.add(c));
    gaOctCaracteristicas.clear();
    (saved.angiografia.octCaracteristicas || []).forEach(c => gaOctCaracteristicas.add(c));
    restoreFields(GA_FIELD_IDS, saved.angiografia.fields);
  }
  if(saved.angioplastia){
    state.angioplastia.vasos = (Array.isArray(saved.angioplastia.vasos) ? saved.angioplastia.vasos : [])
      .map(v => ({
        ...v,
        complicacoes: new Set(v.complicacoes || []),
        devices: (v.devices || []).map(d => ({
          ...d,
          caracteristicas: new Set(d.caracteristicas || []),
          sinaisModificacao: new Set(d.sinaisModificacao || []),
        })),
      }));
    state.angioplastia.medicacao = new Set(saved.angioplastia.medicacao || []);
    state.angioplastia.intercorrencias = new Set(saved.angioplastia.intercorrencias || []);
    restoreFields(AP_FIELD_IDS, saved.angioplastia.fields);
  }

  /* ids like "v12" were minted by nextId() in the saved session — make sure
     new ids keep counting up from there instead of colliding with them */
  let maxN = 0;
  const scan = id => { const m = /^v(\d+)$/.exec(id || ''); if(m) maxN = Math.max(maxN, parseInt(m[1], 10)); };
  state.angiografia.vasos.forEach(v => { scan(v.id); (v.lesoes || []).forEach(l => scan(l.id)); });
  state.angioplastia.vasos.forEach(v => { scan(v.id); (v.devices || []).forEach(d => scan(d.id)); });
  if(maxN >= uid) uid = maxN + 1;

  return true;
}

/* ========================================================================
   HELPERS
   ======================================================================== */
/* HTML-escapes a value before it is interpolated into an attribute or text
   node built via a template string. Without this, a stray " typed into any
   free-text field (vessel name, technique, team member name...) truncates
   the surrounding attribute and corrupts the re-rendered form — see the
   `value="${...}"` call sites below, which all route through this. */
function esc(s){
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* keeps the visual .active class and the aria-pressed state of a toggle
   chip in sync, so screen readers announce whether it's selected. */
function setChipPressed(chip, pressed){
  chip.classList.toggle('active', pressed);
  chip.setAttribute('aria-pressed', pressed ? 'true' : 'false');
}

function joinList(arr, conj){
  conj = conj || 'e';
  arr = arr.filter(Boolean);
  if(arr.length === 0) return '';
  if(arr.length === 1) return arr[0];
  if(arr.length === 2) return arr[0] + ' ' + conj + ' ' + arr[1];
  return arr.slice(0,-1).join(', ') + ' ' + conj + ' ' + arr[arr.length-1];
}

function cap(s){ if(!s) return s; return s.charAt(0).toUpperCase() + s.slice(1); }

function localizacaoFrase(loc){
  if(!loc) return '';
  const l = loc.toLowerCase();
  if(l === 'óstio') return 'no óstio';
  if(l === 'corpo') return 'no corpo do vaso';
  return 'no terço ' + l;
}

function lesionPhrase(les, isFirst){
  let tipo = les.tipo || 'Lesão';
  let base = tipo.toLowerCase();
  if(les.percentual !== '' && les.percentual != null) base += ' de ' + les.percentual + '%';
  const locF = localizacaoFrase(les.localizacao);
  if(locF) base += ' ' + locF;
  const flags = LESION_FLAGS.filter(f => les.flags && les.flags[f.key]).map(f => f.text);
  if(flags.length) base += ', ' + flags.join(', ');
  return isFirst ? base : cap(base);
}

function vesselHeaderLabel(v){
  return v.sigla ? (v.nome + ' (' + v.sigla + ')') : v.nome;
}

function vesselFinding(v){
  let clauses = [];
  if(v.importancia) clauses.push(v.importancia + ' importância anatômica');
  if(v.semLesao){
    let s = 'sem lesões obstrutivas';
    if(v.extras && v.extras.trim()) s += ', mas ' + v.extras.trim().replace(/\.$/,'');
    clauses.push(s);
  } else if(v.lesoes && v.lesoes.length){
    const phrases = v.lesoes.map((l,i)=> lesionPhrase(l, i===0));
    let s = 'com ' + phrases[0];
    if(phrases.length > 1) s += '. ' + phrases.slice(1).join('. ');
    clauses.push(s);
  } else {
    clauses.push('sem achados registrados');
  }
  let result = clauses.join(', ') + '.';
  if(v.tecnica && v.tecnica.trim()){
    result += ' Técnica cirúrgica: ' + v.tecnica.trim().replace(/\.$/,'') + '.';
  }
  return result;
}

function equipeBlock(equipe){
  const filled = equipe.filter(e => e.nome && e.nome.trim());
  if(!filled.length) return '';
  return 'EQUIPE\n' + filled.map(e => {
    let line = e.papel + ': ' + e.nome.trim();
    if(e.crm && e.crm.trim()) line += ' — CRM ' + e.crm.trim();
    return line;
  }).join('\n');
}

/* ========================================================================
   RENDER: EQUIPE (shared shape)
   ======================================================================== */
function renderEquipe(container, equipe, onChange){
  container.innerHTML = equipe.map((e,i) => `
    <div class="field-grid" data-idx="${i}">
      <div class="field"><label>${e.papel}</label>
        <input type="text" data-team-field="nome" data-idx="${i}" placeholder="Nome do médico" value="${esc(e.nome)}">
      </div>
      <div class="field"><label>CRM/UF</label>
        <input type="text" data-team-field="crm" data-idx="${i}" placeholder="ex.: 123456/SP" value="${esc(e.crm)}">
      </div>
    </div>
  `).join('<hr class="divider">');
  container.querySelectorAll('input[data-team-field]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      const idx = +inp.dataset.idx;
      equipe[idx][inp.dataset.teamField] = inp.value;
      saveTeamToStorage();
      onChange();
    });
  });
}

/* ========================================================================
   ANGIOGRAFIA — vessel UI
   ======================================================================== */
const gaVesselPresetSel = document.getElementById('ga_vesselPreset');
gaVesselPresetSel.innerHTML =
  '<optgroup label="Sistema esquerdo">' +
  VESSEL_PRESETS.filter(p=>p.sistema==='esquerda').map((p,i)=>`<option value="esq_${i}">${p.nome}${p.sigla?' ('+p.sigla+')':''}</option>`).join('') +
  '</optgroup><optgroup label="Sistema direito">' +
  VESSEL_PRESETS.filter(p=>p.sistema==='direita').map((p,i)=>`<option value="dir_${i}">${p.nome}${p.sigla?' ('+p.sigla+')':''}</option>`).join('') +
  '</optgroup>';

function presetByValue(val){
  const [side, idxStr] = val.split('_');
  const idx = +idxStr;
  const pool = VESSEL_PRESETS.filter(p=>p.sistema === (side==='esq'?'esquerda':'direita'));
  return pool[idx];
}

function newVessel(preset){
  return {
    id: nextId(),
    sistema: preset ? preset.sistema : 'esquerda',
    nivel: preset ? preset.nivel : 'principal',
    nome: preset ? preset.nome : '',
    sigla: preset ? preset.sigla : '',
    importancia: '',
    semLesao: false,
    extras: '',
    tecnica: '',
    lesoes: [],
  };
}
function newLesion(){
  return { id: nextId(), tipo: LESION_TYPES[0], percentual:'', localizacao:'Proximal', flags:{} };
}

document.getElementById('ga_addPreset').addEventListener('click', ()=>{
  const preset = presetByValue(gaVesselPresetSel.value);
  state.angiografia.vasos.push(newVessel(preset));
  renderGaVessels();
  updateAngiografiaPreview();
});
document.getElementById('ga_addCustom').addEventListener('click', ()=>{
  const v = newVessel(null);
  v.lesoes.push(newLesion());
  state.angiografia.vasos.push(v);
  renderGaVessels();
  updateAngiografiaPreview();
});

function sistemaTag(sistema){
  if(sistema === 'esquerda') return 'Esq';
  if(sistema === 'direita') return 'Dir';
  return 'Enx';
}

function vesselCardHtml(v, prefix){
  const importOpts = ['', ...IMPORTANCIAS].map(o=>`<option value="${o}" ${v.importancia===o?'selected':''}>${o||'—'}</option>`).join('');
  return `
  <div class="subcard" data-vid="${v.id}">
    <div class="subcard-head">
      <span class="tag-pill ${v.sistema}">${sistemaTag(v.sistema)}</span>
      <div class="field-grid">
        <div class="field span-2"><label>Vaso</label>
          <input type="text" data-vfield="nome" value="${esc(v.nome)}" placeholder="Nome do vaso">
        </div>
        <div class="field"><label>Sigla</label>
          <input type="text" data-vfield="sigla" value="${esc(v.sigla)}" placeholder="ex.: DA">
        </div>
        <div class="field"><label>Sistema</label>
          <select data-vfield="sistema">
            <option value="esquerda" ${v.sistema==='esquerda'?'selected':''}>Esquerdo</option>
            <option value="direita" ${v.sistema==='direita'?'selected':''}>Direito</option>
            <option value="enxerto" ${v.sistema==='enxerto'?'selected':''}>Enxerto / ponte</option>
          </select>
        </div>
        <div class="field"><label>Nível</label>
          <select data-vfield="nivel">
            <option value="principal" ${v.nivel==='principal'?'selected':''}>Principal</option>
            <option value="ramo" ${v.nivel==='ramo'?'selected':''}>Ramo</option>
          </select>
        </div>
        <div class="field"><label>Importância</label>
          <select data-vfield="importancia">${importOpts}</select>
        </div>
      </div>
      <button class="icon-btn" data-remove-vessel title="Remover vaso">✕</button>
    </div>

    ${v.sistema === 'enxerto' ? `
      <div class="field"><label>Técnica cirúrgica (opcional)</label>
        <input type="text" data-vfield="tecnica" value="${esc(v.tecnica)}" placeholder="ex.: Sf-Dg1 em Y com Dg2">
      </div>
    ` : ''}

    <label class="checkline"><input type="checkbox" data-vfield="semLesao" ${v.semLesao?'checked':''}> Sem lesões obstrutivas</label>

    ${v.semLesao ? `
      <div class="field"><label>Observação (opcional)</label>
        <input type="text" data-vfield="extras" value="${esc(v.extras)}" placeholder="ex.: irregularidades parietais, vaso de fino calibre">
      </div>
    ` : `
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${(v.lesoes||[]).map(l => lesionRowHtml(v.id, l)).join('')}
        <button class="btn btn-sm btn-ghost" data-add-lesion>+ Lesão neste vaso</button>
      </div>
    `}
  </div>`;
}

function lesionRowHtml(vid, l){
  const tipoOpts = LESION_TYPES.map(t=>`<option ${l.tipo===t?'selected':''}>${t}</option>`).join('');
  const locOpts = LOCALIZACOES.map(o=>`<option ${l.localizacao===o?'selected':''}>${o}</option>`).join('');
  const chips = LESION_FLAGS.map(f => `<button class="chip ${l.flags&&l.flags[f.key]?'active':''}" aria-pressed="${l.flags&&l.flags[f.key]?'true':'false'}" data-lflag="${f.key}">${f.label}</button>`).join('');
  return `
  <div class="lesion-row" data-lid="${l.id}">
    <div class="row-top">
      <div class="field-grid">
        <div class="field span-2"><label>Tipo de lesão</label><select data-lfield="tipo">${tipoOpts}</select></div>
        <div class="field"><label>Estenose</label><div class="unit-field"><input type="number" min="0" max="100" data-lfield="percentual" value="${esc(l.percentual)}"><span>%</span></div></div>
        <div class="field"><label>Localização</label><select data-lfield="localizacao">${locOpts}</select></div>
      </div>
      <button class="icon-btn" data-remove-lesion title="Remover lesão">✕</button>
    </div>
    <div class="chip-group">${chips}</div>
  </div>`;
}

function renderGaVessels(){
  const container = document.getElementById('ga_vesselList');
  const vs = state.angiografia.vasos;
  if(!vs.length){
    container.innerHTML = '<p class="empty-note">Nenhum vaso adicionado ainda — use "Adicionar vaso" acima.</p>';
    return;
  }
  container.innerHTML = vs.map(v => vesselCardHtml(v)).join('');
  wireGaVesselEvents();
}

function findGaVessel(id){ return state.angiografia.vasos.find(v=>v.id===id); }

function wireGaVesselEvents(){
  const container = document.getElementById('ga_vesselList');
  container.querySelectorAll('[data-vid]').forEach(card=>{
    const vid = card.dataset.vid;
    const v = findGaVessel(vid);

    card.querySelectorAll('[data-vfield]').forEach(inp=>{
      inp.addEventListener(inp.tagName==='SELECT' || inp.type==='checkbox' ? 'change' : 'input', ()=>{
        const field = inp.dataset.vfield;
        if(inp.type === 'checkbox'){
          v[field] = inp.checked;
          renderGaVessels();
          updateAngiografiaPreview();
          return;
        }
        v[field] = inp.value;
        if(field === 'sistema'){ renderGaVessels(); }
        updateAngiografiaPreview();
      });
    });

    const removeBtn = card.querySelector('[data-remove-vessel]');
    if(removeBtn) removeBtn.addEventListener('click', ()=>{
      state.angiografia.vasos = state.angiografia.vasos.filter(x=>x.id!==vid);
      renderGaVessels();
      updateAngiografiaPreview();
    });

    const addLesionBtn = card.querySelector('[data-add-lesion]');
    if(addLesionBtn) addLesionBtn.addEventListener('click', ()=>{
      v.lesoes.push(newLesion());
      renderGaVessels();
      updateAngiografiaPreview();
    });

    card.querySelectorAll('[data-lid]').forEach(lrow=>{
      const lid = lrow.dataset.lid;
      const l = v.lesoes.find(x=>x.id===lid);

      lrow.querySelectorAll('[data-lfield]').forEach(inp=>{
        inp.addEventListener('input', ()=>{
          l[inp.dataset.lfield] = inp.value;
          updateAngiografiaPreview();
        });
      });
      const rmLesion = lrow.querySelector('[data-remove-lesion]');
      if(rmLesion) rmLesion.addEventListener('click', ()=>{
        v.lesoes = v.lesoes.filter(x=>x.id!==lid);
        renderGaVessels();
        updateAngiografiaPreview();
      });
      lrow.querySelectorAll('[data-lflag]').forEach(chip=>{
        chip.addEventListener('click', ()=>{
          const key = chip.dataset.lflag;
          l.flags = l.flags || {};
          l.flags[key] = !l.flags[key];
          setChipPressed(chip, !!l.flags[key]);
          updateAngiografiaPreview();
        });
      });
    });
  });
}

/* métodos adjuntos chips */
function syncGaMetodosWraps(){
  document.getElementById('ga_metodosInfluenciaWrap').style.display = state.angiografia.metodos.size ? 'flex' : 'none';
  document.getElementById('ga_metodosAchadosWrap').style.display = state.angiografia.metodos.size ? 'flex' : 'none';
  document.getElementById('ga_ivusBuilderWrap').style.display = state.angiografia.metodos.has('USIC') ? 'flex' : 'none';
  document.getElementById('ga_octBuilderWrap').style.display = state.angiografia.metodos.has('OCT') ? 'flex' : 'none';
}
document.querySelectorAll('#ga_metodos .chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    const key = chip.dataset.key;
    if(state.angiografia.metodos.has(key)) state.angiografia.metodos.delete(key);
    else state.angiografia.metodos.add(key);
    setChipPressed(chip, state.angiografia.metodos.has(key));
    syncGaMetodosWraps();
    updateAngiografiaPreview();
  });
});
document.querySelectorAll('#ga_metodosInfluenciaWrap .chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    state.angiografia.metodosInfluencia = chip.dataset.influencia;
    chip.parentElement.querySelectorAll('.chip').forEach(c=>setChipPressed(c, false));
    setChipPressed(chip, true);
    updateAngiografiaPreview();
  });
});

/* ========================================================================
   IVUS / OCT — construtor de frase padrão (dentro de Métodos adjuntos)
   ======================================================================== */
const gaIvusCaracteristicas = new Set();
const gaOctCaracteristicas = new Set();

function buildCaracteristicasChips(containerId, list, selectedSet, onChange){
  const container = document.getElementById(containerId);
  container.innerHTML = list.map(c => `<button type="button" class="chip" aria-pressed="false" data-carac="${esc(c)}">${esc(c)}</button>`).join('');
  container.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const c = chip.dataset.carac;
      if(selectedSet.has(c)) selectedSet.delete(c); else selectedSet.add(c);
      setChipPressed(chip, selectedSet.has(c));
      onChange();
    });
  });
}
buildCaracteristicasChips('ga_ivus_caracteristicas', IVUS_PLACA_CARACTERISTICAS, gaIvusCaracteristicas, updateAngiografiaPreview);
buildCaracteristicasChips('ga_oct_caracteristicas', OCT_PLACA_CARACTERISTICAS, gaOctCaracteristicas, updateAngiografiaPreview);

/* "sem lesão" / "presença de cálcio" toggles — same show/hide pattern as a vessel's "sem lesões obstrutivas" */
function wireDetailToggle(checkboxId, wrapId, onChange, invert){
  const chk = document.getElementById(checkboxId);
  const wrap = document.getElementById(wrapId);
  const sync = () => { wrap.style.display = (invert ? !chk.checked : chk.checked) ? 'block' : 'none'; };
  chk.addEventListener('change', ()=>{ sync(); onChange(); });
  sync();
  return sync;
}
const syncGaIvusDetalhes = wireDetailToggle('ga_ivus_semLesao', 'ga_ivus_detalhesWrap', updateAngiografiaPreview, true);
const syncGaIvusCalcio = wireDetailToggle('ga_ivus_calcio', 'ga_ivus_calcioWrap', updateAngiografiaPreview, false);
const syncGaOctDetalhes = wireDetailToggle('ga_oct_semLesao', 'ga_oct_detalhesWrap', updateAngiografiaPreview, true);
const syncGaOctCalcio = wireDetailToggle('ga_oct_calcio', 'ga_oct_calcioWrap', updateAngiografiaPreview, false);

const GA_IVUS_FIELD_IDS = ['ga_ivus_arteria','ga_ivus_velocidade','ga_ivus_localizacao','ga_ivus_alm',
  'ga_ivus_dim1','ga_ivus_dim2','ga_ivus_cargaPlaca','ga_ivus_calcioExtensao','ga_ivus_calcioArco','ga_ivus_nodulo','ga_ivus_obs'];
const GA_OCT_FIELD_IDS = ['ga_oct_arteria','ga_oct_localizacao','ga_oct_alm','ga_oct_dim1','ga_oct_dim2',
  'ga_oct_calcioEspessura','ga_oct_calcioExtensao','ga_oct_calcioArco','ga_oct_nodulo','ga_oct_obs'];
[...GA_IVUS_FIELD_IDS, ...GA_OCT_FIELD_IDS].forEach(id=>{
  const el = document.getElementById(id);
  el.addEventListener('input', updateAngiografiaPreview);
  el.addEventListener('change', updateAngiografiaPreview);
});

/* montam a frase de IVUS/OCT a partir dos campos estruturados — a mesma função
   serve para o construtor da coronariografia e (mais adiante) para os
   dispositivos "IVUS/OCT antes da ICP" no vaso tratado da angioplastia */
function buildImagingSentence(cfg){
  const arteria = (cfg.arteria || '').trim() || '***';
  let s = `Realizado ${cfg.modality} da artéria ${arteria} com cateter ${cfg.catheter}. `;
  s += cfg.velocidade
    ? `Aquisição de imagens utilizando recuo automático do cateter a ${cfg.velocidade} mm/s.`
    : `Aquisição de imagens utilizando recuo automático do cateter a 75 mm/s durante injeção de contraste.`;
  if(cfg.diametroReferencia) s += ` Diâmetro de referência do vaso distal de ${cfg.diametroReferencia} mm.`;

  if(cfg.semLesao){
    s += ' Não foi observada lesão significativa.';
  } else {
    const carac = (cfg.caracteristicas || []).join(', ').toLowerCase();
    s += ` Na porção ${(cfg.localizacao || '').toLowerCase()} da artéria, observada placa aterosclerótica${carac ? ' ' + carac : ''}`;
    if(cfg.alm) s += ` com área luminal mínima de ${cfg.alm} mm²`;
    if(cfg.dim1 && cfg.dim2) s += ` (${cfg.dim1} x ${cfg.dim2} mm)`;
    if(cfg.cargaPlaca) s += `, carga de placa de ${cfg.cargaPlaca}%`;
    if(cfg.calcio){
      s += ', com presença de cálcio';
      if(cfg.calcioEspessura) s += `, ${cfg.calcioEspessura} mm de espessura`;
      if(cfg.calcioExtensao) s += `, ${cfg.calcioExtensao} mm de extensão`;
      if(cfg.calcioArco && ARCO_CALCIO_LABEL[cfg.calcioArco]) s += ` e arco de cálcio ${ARCO_CALCIO_LABEL[cfg.calcioArco]}`;
      if(cfg.nodulo) s += ', com nódulo de cálcio associado';
      s += '.';
    } else {
      s += ', sem presença de cálcio.';
    }
  }
  if(cfg.obs && cfg.obs.trim()) s += ' ' + cfg.obs.trim();
  return s;
}

function readGaIvusBuilder(){
  return {
    modality: 'IVUS', catheter: 'OptiCross 40MHz',
    arteria: document.getElementById('ga_ivus_arteria').value,
    velocidade: document.getElementById('ga_ivus_velocidade').value,
    semLesao: document.getElementById('ga_ivus_semLesao').checked,
    localizacao: document.getElementById('ga_ivus_localizacao').value,
    caracteristicas: Array.from(gaIvusCaracteristicas),
    alm: document.getElementById('ga_ivus_alm').value,
    dim1: document.getElementById('ga_ivus_dim1').value,
    dim2: document.getElementById('ga_ivus_dim2').value,
    cargaPlaca: document.getElementById('ga_ivus_cargaPlaca').value,
    calcio: document.getElementById('ga_ivus_calcio').checked,
    calcioExtensao: document.getElementById('ga_ivus_calcioExtensao').value,
    calcioArco: document.getElementById('ga_ivus_calcioArco').value,
    nodulo: document.getElementById('ga_ivus_nodulo').checked,
    obs: document.getElementById('ga_ivus_obs').value,
  };
}
function readGaOctBuilder(){
  return {
    modality: 'OCT', catheter: 'C7 Dragonfly OpStar',
    arteria: document.getElementById('ga_oct_arteria').value,
    velocidade: null,
    semLesao: document.getElementById('ga_oct_semLesao').checked,
    localizacao: document.getElementById('ga_oct_localizacao').value,
    caracteristicas: Array.from(gaOctCaracteristicas),
    alm: document.getElementById('ga_oct_alm').value,
    dim1: document.getElementById('ga_oct_dim1').value,
    dim2: document.getElementById('ga_oct_dim2').value,
    cargaPlaca: null,
    calcio: document.getElementById('ga_oct_calcio').checked,
    calcioEspessura: document.getElementById('ga_oct_calcioEspessura').value,
    calcioExtensao: document.getElementById('ga_oct_calcioExtensao').value,
    calcioArco: document.getElementById('ga_oct_calcioArco').value,
    nodulo: document.getElementById('ga_oct_nodulo').checked,
    obs: document.getElementById('ga_oct_obs').value,
  };
}

/* colateral toggle */
const gaColateralSel = document.getElementById('ga_colateral');
gaColateralSel.addEventListener('change', ()=>{
  document.getElementById('ga_colateralDetalheWrap').style.display = gaColateralSel.value === 'Presente' ? 'flex' : 'none';
  updateAngiografiaPreview();
});

/* padrão obstrutivo custom */
const gaPadraoSel = document.getElementById('ga_padrao');
gaPadraoSel.addEventListener('change', ()=>{
  document.getElementById('ga_padraoCustomWrap').style.display = gaPadraoSel.value === 'custom' ? 'flex' : 'none';
  updateAngiografiaPreview();
});

/* "select com opção Personalizado…" pattern — introdutor, hemostasia, contraste.
   wireCustomSelect returns its sync() so a reset action can re-run it after
   restoring the select's value (setting .value doesn't fire 'change'). */
function wireCustomSelect(selectId, wrapId, onChange){
  const sel = document.getElementById(selectId);
  const wrap = document.getElementById(wrapId);
  const sync = () => { wrap.style.display = sel.value === 'custom' ? 'flex' : 'none'; };
  sel.addEventListener('change', ()=>{ sync(); onChange(); });
  sync();
  return sync;
}
function resolveCustomSelect(selectId, customId){
  const sel = document.getElementById(selectId);
  if(sel.value !== 'custom') return sel.value;
  return document.getElementById(customId).value.trim();
}
const syncGaIntrodutorWrap = wireCustomSelect('ga_introdutor', 'ga_introdutorCustomWrap', updateAngiografiaPreview);
const syncGaHemostasiaWrap = wireCustomSelect('ga_hemostasia', 'ga_hemostasiaCustomWrap', updateAngiografiaPreview);
const syncGaContrasteWrap = wireCustomSelect('ga_contrasteTipo', 'ga_contrasteTipoCustomWrap', updateAngiografiaPreview);
const syncApIntrodutorWrap = wireCustomSelect('ap_introdutor', 'ap_introdutorCustomWrap', updateAngioplastiaPreview);
const syncApHemostasiaWrap = wireCustomSelect('ap_hemostasia', 'ap_hemostasiaCustomWrap', updateAngioplastiaPreview);
const syncApContrasteWrap = wireCustomSelect('ap_contrasteTipo', 'ap_contrasteTipoCustomWrap', updateAngioplastiaPreview);

/* card-scoped "Limpar" — restores just the Técnica fields, leaves vasos/achados alone */
const GA_TECNICA_FIELD_IDS = ['ga_via','ga_puncao','ga_lado','ga_introdutor','ga_introdutorCustom',
  'ga_hemostasia','ga_hemostasiaCustom','ga_contrasteTipo','ga_contrasteTipoCustom','ga_contrasteVolume'];
const AP_TECNICA_FIELD_IDS = ['ap_via','ap_puncao','ap_lado','ap_introdutor','ap_introdutorCustom',
  'ap_hemostasia','ap_hemostasiaCustom','ap_anestesia','ap_contrasteTipo','ap_contrasteTipoCustom','ap_contrasteVolume'];

document.getElementById('ga_tecnicaClear').addEventListener('click', ()=>{
  GA_TECNICA_FIELD_IDS.forEach(id => setFieldValue(id, GA_DEFAULTS[id]));
  syncGaIntrodutorWrap(); syncGaHemostasiaWrap(); syncGaContrasteWrap();
  updateAngiografiaPreview();
});
document.getElementById('ap_tecnicaClear').addEventListener('click', ()=>{
  AP_TECNICA_FIELD_IDS.forEach(id => setFieldValue(id, AP_DEFAULTS[id]));
  syncApIntrodutorWrap(); syncApHemostasiaWrap(); syncApContrasteWrap();
  updateAngioplastiaPreview();
});

/* dominância — toggle ponte panel + carregar vasos padrão */
const gaDominanciaSel = document.getElementById('ga_dominancia');
const gaLoadDefaultsBtn = document.getElementById('ga_loadDefaults');
const GA_LOAD_DEFAULTS_LABEL = 'Carregar vasos padrão desta dominância';
function disarmLoadDefaults(){
  gaLoadDefaultsBtn.dataset.armed = '0';
  gaLoadDefaultsBtn.textContent = GA_LOAD_DEFAULTS_LABEL;
}
function syncPonteVisibility(){
  const isRevasc = gaDominanciaSel.value === 'Revascularização miocárdica cirúrgica';
  document.getElementById('ga_ponteWrap').style.display = isRevasc ? 'flex' : 'none';
  disarmLoadDefaults();
}
gaDominanciaSel.addEventListener('change', syncPonteVisibility);
syncPonteVisibility();

gaLoadDefaultsBtn.addEventListener('click', function(){
  const preset = DOMINANCE_SETS[gaDominanciaSel.value];
  if(!preset) return;
  if(state.angiografia.vasos.length && this.dataset.armed !== '1'){
    this.dataset.armed = '1';
    this.textContent = 'Confirma? Isso substitui os vasos atuais — clique de novo para continuar';
    return;
  }
  disarmLoadDefaults();
  state.angiografia.vasos = preset.map(p => newVessel(p));
  renderGaVessels();
  updateAngiografiaPreview();
});

/* ponte cirúrgica */
const gaPonteTipoSel = document.getElementById('ga_ponteTipo');
const gaPonteAlvoSel = document.getElementById('ga_ponteAlvo');
gaPonteTipoSel.innerHTML = ENXERTO_TIPOS.map(t=>`<option value="${t.key}">${t.label}</option>`).join('');
function syncPonteAlvos(){
  const tipo = ENXERTO_TIPOS.find(t=>t.key===gaPonteTipoSel.value) || ENXERTO_TIPOS[0];
  gaPonteAlvoSel.innerHTML = tipo.alvos.map(a=>`<option value="${a.code}">${a.label} (${a.code})</option>`).join('');
}
gaPonteTipoSel.addEventListener('change', syncPonteAlvos);
syncPonteAlvos();

document.getElementById('ga_addPonte').addEventListener('click', ()=>{
  const tipo = ENXERTO_TIPOS.find(t=>t.key===gaPonteTipoSel.value) || ENXERTO_TIPOS[0];
  const alvo = tipo.alvos.find(a=>a.code===gaPonteAlvoSel.value) || tipo.alvos[0];
  const v = newVessel({sistema:'enxerto', nivel:'principal', nome:`Ponte de ${tipo.label} para ${alvo.label}`, sigla:`${tipo.sigla}-${alvo.code}`});
  const tecnica = document.getElementById('ga_ponteTecnica').value.trim();
  if(tecnica) v.tecnica = tecnica;
  state.angiografia.vasos.push(v);
  document.getElementById('ga_ponteTecnica').value = '';
  renderGaVessels();
  updateAngiografiaPreview();
});

/* collapse toggle (adjunct card) */
document.querySelectorAll('.collapse-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const card = document.getElementById(btn.dataset.collapse);
    card.classList.toggle('collapsed');
    btn.textContent = card.classList.contains('collapsed') ? '+' : '–';
  });
});

/* generic inputs -> preview refresh */
['ga_descricao','ga_via','ga_puncao','ga_lado','ga_introdutor','ga_introdutorCustom','ga_hemostasia','ga_hemostasiaCustom',
 'ga_contrasteTipo','ga_contrasteTipoCustom','ga_contrasteVolume',
 'ga_dominancia','ga_colateralDetalhe','ga_colateralIncluir','ga_padraoCustom','ga_ventriculografia','ga_aortografia','ga_metodosAchados'
].forEach(id=>{
  const el = document.getElementById(id);
  el.addEventListener('input', updateAngiografiaPreview);
  el.addEventListener('change', updateAngiografiaPreview);
});

/* ========================================================================
   ANGIOGRAFIA — text generation
   ======================================================================== */
function buildAngiografiaText(){
  const s = state.angiografia;
  const g = id => document.getElementById(id).value;

  let out = [];

  out.push('PROCEDIMENTO');
  out.push('Coronariografia');
  const desc = g('ga_descricao').trim();
  if(desc) out.push('\n' + desc);

  out.push('\nTÉCNICA');
  const gaIntrodutorVal = resolveCustomSelect('ga_introdutor', 'ga_introdutorCustom');
  const gaHemostasiaVal = resolveCustomSelect('ga_hemostasia', 'ga_hemostasiaCustom');
  const gaContrasteVal = resolveCustomSelect('ga_contrasteTipo', 'ga_contrasteTipoCustom');
  let tecLine = `Via de Acesso: ${g('ga_via')}, punção ${g('ga_puncao').toLowerCase()} ${g('ga_lado').toLowerCase()}`;
  if(gaIntrodutorVal.trim()) tecLine += `, introdutor ${gaIntrodutorVal.trim()}`;
  if(gaHemostasiaVal.trim()) tecLine += `, hemostasia com ${gaHemostasiaVal.trim().toLowerCase()}`;
  out.push(tecLine + '.');
  out.push(`Contraste: ${gaContrasteVal.trim()}, volume (ml) = ${g('ga_contrasteVolume') || '0'}.`);

  out.push('\nCORONARIOGRAFIA');

  const esquerda = s.vasos.filter(v=>v.sistema==='esquerda');
  const direita = s.vasos.filter(v=>v.sistema==='direita');
  const enxertos = s.vasos.filter(v=>v.sistema==='enxerto');

  function renderSide(list, label){
    if(!list.length) return;
    out.push('\nArtéria Coronária ' + label + ':\n');
    list.forEach(v=>{
      const line = vesselHeaderLabel(v) + ': ' + vesselFinding(v);
      out.push((v.nivel === 'ramo' ? '-' : '') + line);
    });
  }
  renderSide(esquerda, 'Esquerda');
  renderSide(direita, 'Direita');

  if(enxertos.length){
    out.push('\nPontes de Revascularização Miocárdica:\n');
    enxertos.forEach(v=>{
      out.push(vesselHeaderLabel(v) + ': ' + vesselFinding(v));
    });
  }

  if(!esquerda.length && !direita.length && !enxertos.length){
    out.push('\nNenhum vaso adicionado.');
  }

  if(document.getElementById('ga_colateralIncluir').checked){
    const colVal = document.getElementById('ga_colateral').value;
    let colLine = 'Circulação colateral ' + colVal.toLowerCase();
    const colDet = document.getElementById('ga_colateralDetalhe').value.trim();
    if(colVal === 'Presente' && colDet) colLine += ' (' + colDet + ')';
    out.push('\n' + colLine + '.');
  }

  out.push('\nDADOS DO CATETERISMO');
  out.push('Dominância: ' + document.getElementById('ga_dominancia').value + '.');
  const padraoSel = document.getElementById('ga_padrao');
  const padraoTxt = padraoSel.value === 'custom' ? document.getElementById('ga_padraoCustom').value.trim() : padraoSel.value;
  if(padraoTxt) out.push('Padrão obstrutivo: ' + padraoTxt + '.');

  if(s.metodos.size){
    let line = 'Métodos adjuntos utilizados: ' + Array.from(s.metodos).join(', ') + '.';
    if(s.metodosInfluencia) line += ' ' + (s.metodosInfluencia === 'Sim' ? 'Influenciaram' : 'Não influenciaram') + ' a conduta terapêutica.';
    out.push('\n' + line);
    if(s.metodos.has('USIC')) out.push(buildImagingSentence(readGaIvusBuilder()));
    if(s.metodos.has('OCT')) out.push(buildImagingSentence(readGaOctBuilder()));
    const achados = document.getElementById('ga_metodosAchados').value.trim();
    if(achados) out.push(achados);
  }

  const ventric = document.getElementById('ga_ventriculografia').value.trim();
  if(ventric){ out.push('\nVENTRICULOGRAFIA ESQUERDA'); out.push(ventric); }
  const aorto = document.getElementById('ga_aortografia').value.trim();
  if(aorto){ out.push('\nAORTOGRAFIA'); out.push(aorto); }

  const eq = equipeBlock(s.equipe);
  if(eq) out.push('\n' + eq);

  return out.join('\n');
}

function updateAngiografiaPreview(){
  const ta = document.getElementById('ga_output');
  const hadFocus = document.activeElement === ta;
  const pos = ta.selectionStart;
  if(!hadFocus) ta.value = buildAngiografiaText();
  else { /* don't clobber manual edits while user is typing in the preview itself */ }
  const n = state.angiografia.vasos.length;
  document.getElementById('ga_meta').textContent = n ? (n + (n===1?' vaso avaliado':' vasos avaliados')) : 'nenhum vaso ainda';
  schedulePatientSave();
}
document.getElementById('ga_output').dataset.manual = '0';

/* ========================================================================
   ANGIOPLASTIA — chip lists
   ======================================================================== */
const apMedWrap = document.getElementById('ap_medicacao');
apMedWrap.innerHTML = MEDICACOES.map(m=>`<button class="chip" aria-pressed="false" data-med="${m}">${m}</button>`).join('');
apMedWrap.querySelectorAll('.chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    const m = chip.dataset.med;
    if(state.angioplastia.medicacao.has(m)) state.angioplastia.medicacao.delete(m);
    else state.angioplastia.medicacao.add(m);
    setChipPressed(chip, state.angioplastia.medicacao.has(m));
    updateAngioplastiaPreview();
  });
});

const apIntWrap = document.getElementById('ap_intercorrencias');
apIntWrap.innerHTML = INTERCORRENCIAS.map(m=>`<button class="chip danger" aria-pressed="false" data-int="${m}">${m}</button>`).join('');
apIntWrap.querySelectorAll('.chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    const m = chip.dataset.int;
    if(state.angioplastia.intercorrencias.has(m)) state.angioplastia.intercorrencias.delete(m);
    else state.angioplastia.intercorrencias.add(m);
    setChipPressed(chip, state.angioplastia.intercorrencias.has(m));
    updateAngioplastiaPreview();
  });
});

/* ========================================================================
   ANGIOPLASTIA — vessel + device UI
   ======================================================================== */
const apVesselPresetSel = document.getElementById('ap_vesselPreset');
apVesselPresetSel.innerHTML = gaVesselPresetSel.innerHTML;

function newTreatedVessel(preset){
  return {
    id: nextId(),
    nome: preset ? preset.nome : '',
    sigla: preset ? preset.sigla : '',
    cateterGuia: '',
    lesaoPre: '',
    localizacao: '',
    devices: [],
    timiPos: '3',
    resultado: 'Sucesso',
    resultadoDetalhe: '',
    complicacoes: new Set(),
  };
}
const DEVICE_FASE_LABELS = {
  pre: 'Balão (pré-dilatação)', stent: 'Stent', pos: 'Balão (pós-dilatação)',
  ivus_pre: 'IVUS — antes da ICP', ivus_pos_pre: 'IVUS — após pré-dilatação', ivus_pos_stent: 'IVUS — após implante de stent',
  oct_pre: 'OCT — antes da ICP', oct_pos_pre: 'OCT — após pré-dilatação', oct_pos_stent: 'OCT — após implante de stent',
  rotablator: 'Rotablator', litotripsia: 'Litotripsia intracoronária', cutting_balloon: 'Cutting balloon',
};
const DEVICE_FASE_ORDER = ['ivus_pre','oct_pre','rotablator','litotripsia','cutting_balloon',
  'pre','ivus_pos_pre','oct_pos_pre','stent','ivus_pos_stent','oct_pos_stent','pos'];
const DEVICE_FASE_GROUPS = [
  {label:'Balão / Stent', fases:['pre','stent','pos']},
  {label:'Imagem intravascular — IVUS', fases:['ivus_pre','ivus_pos_pre','ivus_pos_stent']},
  {label:'Imagem intravascular — OCT', fases:['oct_pre','oct_pos_pre','oct_pos_stent']},
  {label:'Preparo de lesão calcificada', fases:['rotablator','litotripsia','cutting_balloon']},
];

function newDevice(fase){
  fase = fase || 'stent';
  return {
    id: nextId(), fase,
    /* balão / stent */
    tipoStent:'Farmacológico', descricao:'', diametro:'', comprimento:'',
    pressao: fase === 'cutting_balloon' ? '18' : '', obs:'',
    /* IVUS / OCT (antes da ICP, após pré-dilatação, após stent) */
    arteria:'', velocidade:'', semLesao:false, localizacao:'Proximal', caracteristicas: new Set(),
    alm:'', dim1:'', dim2:'', cargaPlaca:'', calcio:false, calcioEspessura:'', calcioExtensao:'',
    calcioArco:'gt270', nodulo:false, diametroReferencia:'',
    sinaisModificacao: new Set(), sinaisModificacaoOutro:'',
    areaMinimaStent:'',
    /* litotripsia */
    pulsos:'',
  };
}

document.getElementById('ap_addPreset').addEventListener('click', ()=>{
  const preset = presetByValue(apVesselPresetSel.value);
  state.angioplastia.vasos.push(newTreatedVessel(preset));
  renderApVessels();
  updateAngioplastiaPreview();
});
document.getElementById('ap_addCustom').addEventListener('click', ()=>{
  state.angioplastia.vasos.push(newTreatedVessel(null));
  renderApVessels();
  updateAngioplastiaPreview();
});

function balaoStentFieldsHtml(d){
  const sug = d.fase === 'stent' ? STENT_SUG : BALAO_SUG;
  const listId = 'sug_' + d.id;
  return `
    <div class="field-grid">
      ${d.fase === 'stent' ? `
      <div class="field"><label>Tipo de stent</label>
        <select data-dfield="tipoStent">
          <option ${d.tipoStent==='Farmacológico'?'selected':''}>Farmacológico</option>
          <option ${d.tipoStent==='Convencional'?'selected':''}>Convencional</option>
        </select>
      </div>` : ''}
      <div class="field span-2"><label>${d.fase==='stent'?'Modelo do stent':'Modelo do balão'}</label>
        <input type="text" data-dfield="descricao" value="${esc(d.descricao)}" list="${listId}" placeholder="ex.: ${sug[0]}">
        <datalist id="${listId}">${sug.map(x=>`<option value="${x}">`).join('')}</datalist>
      </div>
      <div class="field"><label>Diâmetro</label><div class="unit-field"><input type="number" step="0.25" data-dfield="diametro" value="${esc(d.diametro)}"><span>mm</span></div></div>
      <div class="field"><label>Comprimento</label><div class="unit-field"><input type="number" step="1" data-dfield="comprimento" value="${esc(d.comprimento)}"><span>mm</span></div></div>
      <div class="field"><label>Pressão</label><div class="unit-field"><input type="number" step="1" data-dfield="pressao" value="${esc(d.pressao)}"><span>atm</span></div></div>
      <div class="field span-2"><label>Observação (opcional)</label>
        <input type="text" data-dfield="obs" value="${esc(d.obs)}" placeholder="ex.: leve resistência à passagem do fio">
      </div>
    </div>`;
}

function imagingPreFieldsHtml(d, modality){
  const caracList = modality === 'ivus' ? IVUS_PLACA_CARACTERISTICAS : OCT_PLACA_CARACTERISTICAS;
  const caracChips = caracList.map(c => `<button type="button" class="chip ${d.caracteristicas.has(c)?'active':''}" aria-pressed="${d.caracteristicas.has(c)?'true':'false'}" data-carac="${esc(c)}">${esc(c)}</button>`).join('');
  return `
    <div class="field-grid">
      <div class="field span-2"><label>Artéria avaliada</label><input type="text" data-dfield="arteria" value="${esc(d.arteria)}" placeholder="ex.: DA"></div>
      ${modality === 'ivus' ? `<div class="field"><label>Velocidade de recuo</label><div class="unit-field"><input type="number" step="0.1" data-dfield="velocidade" value="${esc(d.velocidade)}"><span>mm/s</span></div></div>` : ''}
      <div class="field"><label>Diâmetro de referência do vaso distal</label><div class="unit-field"><input type="number" step="0.1" data-dfield="diametroReferencia" value="${esc(d.diametroReferencia)}"><span>mm</span></div></div>
    </div>
    <label class="checkline"><input type="checkbox" data-dfield="semLesao" ${d.semLesao?'checked':''}> Não foi observada lesão significativa</label>
    ${!d.semLesao ? `
    <div class="field-grid">
      <div class="field"><label>Localização</label>
        <select data-dfield="localizacao">
          <option ${d.localizacao==='Proximal'?'selected':''}>Proximal</option>
          <option ${d.localizacao==='Médio'?'selected':''}>Médio</option>
          <option ${d.localizacao==='Distal'?'selected':''}>Distal</option>
        </select>
      </div>
      <div class="field"><label>Área luminal mínima</label><div class="unit-field"><input type="number" step="0.01" data-dfield="alm" value="${esc(d.alm)}"><span>mm²</span></div></div>
      <div class="field"><label>Dimensões (menor x maior)</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="number" step="0.01" data-dfield="dim1" value="${esc(d.dim1)}" placeholder="mm">
          <span style="color:var(--muted);">x</span>
          <input type="number" step="0.01" data-dfield="dim2" value="${esc(d.dim2)}" placeholder="mm">
        </div>
      </div>
      ${modality === 'ivus' ? `<div class="field"><label>Carga de placa</label><div class="unit-field"><input type="number" data-dfield="cargaPlaca" value="${esc(d.cargaPlaca)}"><span>%</span></div></div>` : ''}
    </div>
    <div class="field"><label>Características da placa</label><div class="chip-group" data-carac-group>${caracChips}</div></div>
    <label class="checkline"><input type="checkbox" data-dfield="calcio" ${d.calcio?'checked':''}> Presença de cálcio</label>
    ${d.calcio ? `
    <div class="field-grid">
      ${modality === 'oct' ? `<div class="field"><label>Espessura do cálcio</label><div class="unit-field"><input type="number" step="0.01" data-dfield="calcioEspessura" value="${esc(d.calcioEspessura)}"><span>mm</span></div></div>` : ''}
      <div class="field"><label>Extensão do cálcio</label><div class="unit-field"><input type="number" step="0.1" data-dfield="calcioExtensao" value="${esc(d.calcioExtensao)}"><span>mm</span></div></div>
      <div class="field"><label>Arco de cálcio</label>
        <select data-dfield="calcioArco">
          <option value="gt270" ${d.calcioArco==='gt270'?'selected':''}>Maior que 270°</option>
          <option value="lt270" ${d.calcioArco==='lt270'?'selected':''}>Menor que 270°</option>
          <option value="360" ${d.calcioArco==='360'?'selected':''}>360° (circunferencial)</option>
        </select>
      </div>
      <div class="field span-2"><label class="checkline"><input type="checkbox" data-dfield="nodulo" ${d.nodulo?'checked':''}> Nódulo de cálcio presente</label></div>
    </div>` : ''}
    ` : ''}
    <div class="field"><label>Observações (opcional)</label><textarea data-dfield="obs">${esc(d.obs)}</textarea></div>`;
}

function imagingPosPreFieldsHtml(d, modality){
  const sinaisChips = SINAIS_MODIFICACAO_CALCIO.map(s => `<button type="button" class="chip ${d.sinaisModificacao.has(s)?'active':''}" aria-pressed="${d.sinaisModificacao.has(s)?'true':'false'}" data-sinal="${esc(s)}">${esc(s)}</button>`).join('');
  return `
    <div class="field-grid">
      <div class="field span-2"><label>Artéria avaliada</label><input type="text" data-dfield="arteria" value="${esc(d.arteria)}" placeholder="ex.: DA"></div>
      ${modality === 'ivus' ? `<div class="field"><label>Velocidade de recuo</label><div class="unit-field"><input type="number" step="0.1" data-dfield="velocidade" value="${esc(d.velocidade)}"><span>mm/s</span></div></div>` : ''}
    </div>
    <div class="field"><label>Sinais de modificação do cálcio</label><div class="chip-group" data-sinal-group>${sinaisChips}</div></div>
    ${d.sinaisModificacao.has('Outros') ? `<div class="field"><label>Descreva "Outros"</label><input type="text" data-dfield="sinaisModificacaoOutro" value="${esc(d.sinaisModificacaoOutro)}"></div>` : ''}`;
}

function imagingPosStentFieldsHtml(d){
  return `
    <div class="field-grid">
      <div class="field"><label>Área mínima do stent</label><div class="unit-field"><input type="number" step="0.01" data-dfield="areaMinimaStent" value="${esc(d.areaMinimaStent)}"><span>mm²</span></div></div>
    </div>
    <div class="field"><label>Observações (opcional)</label><textarea data-dfield="obs">${esc(d.obs)}</textarea></div>`;
}

function rotablatorFieldsHtml(d){
  return `<div class="field-grid">
    <div class="field"><label>Burr</label><div class="unit-field"><input type="number" step="0.25" data-dfield="diametro" value="${esc(d.diametro)}"><span>mm</span></div></div>
  </div>`;
}
function litotripsiaFieldsHtml(d){
  return `<div class="field-grid">
    <div class="field"><label>Diâmetro</label><div class="unit-field"><input type="number" step="0.25" data-dfield="diametro" value="${esc(d.diametro)}"><span>mm</span></div></div>
    <div class="field"><label>Comprimento</label><div class="unit-field"><input type="number" step="1" data-dfield="comprimento" value="${esc(d.comprimento)}"><span>mm</span></div></div>
    <div class="field"><label>Pulsos</label><input type="number" step="1" data-dfield="pulsos" value="${esc(d.pulsos)}"></div>
  </div>`;
}
function cuttingBalloonFieldsHtml(d){
  return `<div class="field-grid">
    <div class="field"><label>Diâmetro</label><div class="unit-field"><input type="number" step="0.25" data-dfield="diametro" value="${esc(d.diametro)}"><span>mm</span></div></div>
    <div class="field"><label>Comprimento</label><div class="unit-field"><input type="number" step="1" data-dfield="comprimento" value="${esc(d.comprimento)}"><span>mm</span></div></div>
    <div class="field"><label>Pressão</label><div class="unit-field"><input type="number" step="1" data-dfield="pressao" value="${esc(d.pressao)}"><span>atm</span></div></div>
  </div>`;
}

function deviceFieldsHtml(d){
  if(d.fase === 'pre' || d.fase === 'stent' || d.fase === 'pos') return balaoStentFieldsHtml(d);
  if(d.fase === 'ivus_pre') return imagingPreFieldsHtml(d, 'ivus');
  if(d.fase === 'oct_pre') return imagingPreFieldsHtml(d, 'oct');
  if(d.fase === 'ivus_pos_pre') return imagingPosPreFieldsHtml(d, 'ivus');
  if(d.fase === 'oct_pos_pre') return imagingPosPreFieldsHtml(d, 'oct');
  if(d.fase === 'ivus_pos_stent' || d.fase === 'oct_pos_stent') return imagingPosStentFieldsHtml(d);
  if(d.fase === 'rotablator') return rotablatorFieldsHtml(d);
  if(d.fase === 'litotripsia') return litotripsiaFieldsHtml(d);
  if(d.fase === 'cutting_balloon') return cuttingBalloonFieldsHtml(d);
  return '';
}

function deviceRowHtml(v, d){
  const faseOptsHtml = DEVICE_FASE_GROUPS.map(g => '<optgroup label="' + esc(g.label) + '">' +
    g.fases.map(f => `<option value="${f}" ${d.fase===f?'selected':''}>${esc(DEVICE_FASE_LABELS[f])}</option>`).join('') +
    '</optgroup>').join('');
  return `
  <div class="device-row" data-did="${d.id}">
    <div class="row-top">
      <div class="field-grid">
        <div class="field span-2"><label>Fase</label><select data-dfield="fase">${faseOptsHtml}</select></div>
      </div>
      <button class="icon-btn" data-remove-device title="Remover dispositivo">✕</button>
    </div>
    ${deviceFieldsHtml(d)}
  </div>`;
}

function treatedVesselCardHtml(v){
  const timiOpts = ['0','1','2','3'].map(t=>`<option ${v.timiPos===t?'selected':''}>${t}</option>`).join('');
  const compChips = COMPLICACOES_VASO.map(c=>`<button class="chip danger ${v.complicacoes.has(c)?'active':''}" aria-pressed="${v.complicacoes.has(c)?'true':'false'}" data-vcomp="${c}">${c}</button>`).join('');
  return `
  <div class="subcard" data-vid="${v.id}">
    <div class="subcard-head">
      <div class="field-grid">
        <div class="field span-2"><label>Vaso tratado</label>
          <input type="text" data-vfield="nome" value="${esc(v.nome)}" placeholder="ex.: Artéria DA">
        </div>
        <div class="field"><label>Sigla</label>
          <input type="text" data-vfield="sigla" value="${esc(v.sigla)}" placeholder="ex.: DA">
        </div>
        <div class="field"><label>Cateter guia</label>
          <input type="text" data-vfield="cateterGuia" value="${esc(v.cateterGuia)}" list="cateterGuiaSug" placeholder="ex.: JL4">
        </div>
        <div class="field"><label>Lesão pré (%)</label>
          <div class="unit-field"><input type="number" min="0" max="100" data-vfield="lesaoPre" value="${esc(v.lesaoPre)}"><span>%</span></div>
        </div>
        <div class="field"><label>Localização</label>
          <select data-vfield="localizacao">
            <option value="" ${!v.localizacao?'selected':''}>—</option>
            <option ${v.localizacao==='Óstio'?'selected':''}>Óstio</option>
            <option ${v.localizacao==='Proximal'?'selected':''}>Proximal</option>
            <option ${v.localizacao==='Médio'?'selected':''}>Médio</option>
            <option ${v.localizacao==='Distal'?'selected':''}>Distal</option>
          </select>
        </div>
      </div>
      <button class="icon-btn" data-remove-vessel title="Remover vaso">✕</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:8px;">
      <span class="card-sub" style="font-weight:700;">Dispositivos utilizados (em ordem)</span>
      ${(v.devices||[]).map(d=>deviceRowHtml(v,d)).join('') || '<p class="empty-note">Nenhum dispositivo adicionado.</p>'}
      <div class="add-row">
        <select data-device-type-picker>${DEVICE_FASE_GROUPS.map(g => '<optgroup label="' + esc(g.label) + '">' +
          g.fases.map(f => `<option value="${f}">${esc(DEVICE_FASE_LABELS[f])}</option>`).join('') + '</optgroup>').join('')}</select>
        <button class="btn btn-sm" data-add-device-btn>+ Adicionar dispositivo</button>
      </div>
    </div>

    <hr class="divider">
    <div class="field-grid">
      <div class="field"><label>Fluxo TIMI pós</label><select data-vfield="timiPos">${timiOpts}</select></div>
      <div class="field"><label>Resultado</label>
        <select data-vfield="resultado">
          <option ${v.resultado==='Sucesso'?'selected':''}>Sucesso</option>
          <option ${v.resultado==='Insucesso'?'selected':''}>Insucesso</option>
        </select>
      </div>
      <div class="field span-2"><label>Observações finais (opcional)</label>
        <input type="text" data-vfield="resultadoDetalhe" value="${esc(v.resultadoDetalhe)}" placeholder="ex.: estenose residual de 10%">
      </div>
    </div>
    <div class="field">
      <label>Complicações neste vaso</label>
      <div class="chip-group">${compChips}</div>
    </div>
  </div>`;
}

function renderApVessels(){
  const container = document.getElementById('ap_vesselList');
  const vs = state.angioplastia.vasos;
  if(!vs.length){
    container.innerHTML = '<p class="empty-note">Nenhum vaso tratado adicionado ainda — use "Adicionar vaso tratado" acima.</p>';
    return;
  }
  container.innerHTML = `<datalist id="cateterGuiaSug">${CATETER_GUIA_SUG.map(x=>`<option value="${x}">`).join('')}</datalist>` +
    vs.map(v => treatedVesselCardHtml(v)).join('');
  wireApVesselEvents();
}

function findApVessel(id){ return state.angioplastia.vasos.find(v=>v.id===id); }

function wireApVesselEvents(){
  const container = document.getElementById('ap_vesselList');
  container.querySelectorAll('.subcard[data-vid]').forEach(card=>{
    const vid = card.dataset.vid;
    const v = findApVessel(vid);

    card.querySelectorAll(':scope [data-vfield]').forEach(inp=>{
      const evt = inp.tagName === 'SELECT' ? 'change' : 'input';
      inp.addEventListener(evt, ()=>{
        v[inp.dataset.vfield] = inp.value;
        updateAngioplastiaPreview();
      });
    });

    card.querySelector('[data-remove-vessel]').addEventListener('click', ()=>{
      state.angioplastia.vasos = state.angioplastia.vasos.filter(x=>x.id!==vid);
      renderApVessels();
      updateAngioplastiaPreview();
    });

    const deviceTypePicker = card.querySelector('[data-device-type-picker]');
    const addDeviceBtn = card.querySelector('[data-add-device-btn]');
    if(addDeviceBtn) addDeviceBtn.addEventListener('click', ()=>{
      v.devices.push(newDevice(deviceTypePicker.value));
      renderApVessels();
      updateAngioplastiaPreview();
    });

    card.querySelectorAll('[data-vcomp]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const c = chip.dataset.vcomp;
        if(v.complicacoes.has(c)) v.complicacoes.delete(c); else v.complicacoes.add(c);
        setChipPressed(chip, v.complicacoes.has(c));
        updateAngioplastiaPreview();
      });
    });

    card.querySelectorAll('.device-row[data-did]').forEach(drow=>{
      const did = drow.dataset.did;
      const d = v.devices.find(x=>x.id===did);
      drow.querySelectorAll('[data-dfield]').forEach(inp=>{
        const isCheckbox = inp.type === 'checkbox';
        const evt = isCheckbox ? 'change' : (inp.tagName === 'SELECT' ? 'change' : 'input');
        inp.addEventListener(evt, ()=>{
          d[inp.dataset.dfield] = isCheckbox ? inp.checked : inp.value;
          /* changing the fase, or a checkbox that shows/hides its own sub-fields
             (semLesao, calcio), needs the row's markup fully rebuilt */
          if(inp.dataset.dfield === 'fase' || inp.dataset.dfield === 'semLesao' || inp.dataset.dfield === 'calcio'){
            renderApVessels();
          }
          updateAngioplastiaPreview();
        });
      });
      drow.querySelectorAll('[data-carac]').forEach(chip=>{
        chip.addEventListener('click', ()=>{
          const c = chip.dataset.carac;
          if(d.caracteristicas.has(c)) d.caracteristicas.delete(c); else d.caracteristicas.add(c);
          setChipPressed(chip, d.caracteristicas.has(c));
          updateAngioplastiaPreview();
        });
      });
      drow.querySelectorAll('[data-sinal]').forEach(chip=>{
        chip.addEventListener('click', ()=>{
          const s = chip.dataset.sinal;
          if(d.sinaisModificacao.has(s)) d.sinaisModificacao.delete(s); else d.sinaisModificacao.add(s);
          setChipPressed(chip, d.sinaisModificacao.has(s));
          if(s === 'Outros') renderApVessels();
          updateAngioplastiaPreview();
        });
      });
      drow.querySelector('[data-remove-device]').addEventListener('click', ()=>{
        v.devices = v.devices.filter(x=>x.id!==did);
        renderApVessels();
        updateAngioplastiaPreview();
      });
    });
  });
}

['ap_via','ap_puncao','ap_lado','ap_introdutor','ap_introdutorCustom','ap_hemostasia','ap_hemostasiaCustom','ap_anestesia',
 'ap_contrasteTipo','ap_contrasteTipoCustom','ap_contrasteVolume','ap_conclusaoExtra',
 'ap_medicacaoOutras','ap_intercorrenciasObs'
].forEach(id=>{
  const el = document.getElementById(id);
  el.addEventListener('input', updateAngioplastiaPreview);
  el.addEventListener('change', updateAngioplastiaPreview);
});

/* ========================================================================
   ANGIOPLASTIA — text generation
   ======================================================================== */
function deviceDescLabel(d){
  let parts = [];
  if(d.descricao) parts.push(d.descricao);
  let dims = '';
  if(d.diametro) dims += d.diametro;
  if(d.comprimento) dims += (dims?' x ':'') + d.comprimento + (dims?' mm':'');
  if(dims && d.diametro && !d.comprimento) dims += ' mm';
  if(d.diametro && d.comprimento) dims = d.diametro + ' x ' + d.comprimento + ' mm';
  else if(d.diametro) dims = d.diametro + ' mm';
  else if(d.comprimento) dims = d.comprimento + ' mm de comprimento';
  if(dims) parts.push(dims);
  if(d.pressao) parts.push('a ' + d.pressao + 'atm');
  let label = parts.join(' ');
  if(d.obs && d.obs.trim()) label += ' (' + d.obs.trim() + ')';
  return label;
}

function apLabel(v){
  const sigla = (v.sigla || '').trim();
  return sigla ? ('Artéria ' + sigla) : (v.nome || 'vaso');
}

function vesselProcedureClause(v){
  const label = apLabel(v);
  const stents = v.devices.filter(d=>d.fase==='stent');
  const baloes = v.devices.filter(d=>d.fase==='pre'||d.fase==='pos');
  if(stents.length){
    const tipos = Array.from(new Set(stents.map(s=>s.tipoStent)));
    const tiposLabel = tipos.map(t=>t.toLowerCase()).join(' e ');
    const stentWord = stents.length > 1 ? 'stents' : 'stent';
    if(baloes.length){
      return `Angioplastia da(o) ${label} com balões e implante de ${stentWord} ${tiposLabel}`;
    }
    return `Angioplastia da(o) ${label} com implante direto de ${stentWord} ${tiposLabel}`;
  }
  if(baloes.length){
    return `Angioplastia da(o) ${label} com balão convencional (POBA)`;
  }
  return `Cateterização diagnóstica da(o) ${label}, sem intervenção`;
}

/* IVUS/OCT "antes da ICP" reaproveita a mesma frase da coronariografia
   diagnóstica (buildImagingSentence), só que com o diâmetro de referência
   do vaso distal adicionado ao final da primeira linha. */
function deviceToImagingCfg(d, modality){
  return {
    modality, catheter: modality === 'IVUS' ? 'OptiCross 40MHz' : 'C7 Dragonfly OpStar',
    arteria: d.arteria, velocidade: modality === 'IVUS' ? d.velocidade : null,
    diametroReferencia: d.diametroReferencia,
    semLesao: d.semLesao, localizacao: d.localizacao,
    caracteristicas: Array.from(d.caracteristicas || []),
    alm: d.alm, dim1: d.dim1, dim2: d.dim2,
    cargaPlaca: modality === 'IVUS' ? d.cargaPlaca : null,
    calcio: d.calcio, calcioEspessura: d.calcioEspessura, calcioExtensao: d.calcioExtensao,
    calcioArco: d.calcioArco, nodulo: d.nodulo, obs: d.obs,
  };
}

function buildReimagingSentence(modality, d){
  const catheter = modality === 'IVUS' ? 'OptiCross 40MHz' : 'C7 Dragonfly OpStar';
  const arteria = (d.arteria || '').trim() || '***';
  let s = `Realizado novamente ${modality} da artéria ${arteria} com cateter ${catheter}. `;
  s += (modality === 'IVUS' && d.velocidade)
    ? `Aquisição de imagens utilizando recuo automático do cateter a ${d.velocidade} mm/s.`
    : `Aquisição de imagens utilizando recuo automático do cateter a 75 mm/s.`;
  const sinais = Array.from(d.sinaisModificacao || []);
  if(sinais.length){
    const labels = sinais.map(sg => (sg === 'Outros' && d.sinaisModificacaoOutro && d.sinaisModificacaoOutro.trim()) ? d.sinaisModificacaoOutro.trim() : sg);
    s += ` Evidenciado sinais de modificação do cálcio: ${labels.join(', ').toLowerCase()}.`;
  } else {
    s += ' Não evidenciados sinais de modificação do cálcio.';
  }
  return s;
}

function buildStentAreaSentence(modality, d){
  let s = `Após angioplastia, realizado ${modality} da artéria tratada, evidenciando stent farmacológico bem expandido e bem aposto, sem dissecção de bordas.`;
  if(d.areaMinimaStent) s += ` Área mínima do stent de ${d.areaMinimaStent} mm².`;
  if(d.obs && d.obs.trim()) s += ' ' + d.obs.trim();
  return s;
}

function buildRotablatorSentence(d){
  return `Preparo da lesão calcificada por meio de sistema de aterectomia rotacional Rotablator®, burr ${d.diametro || '***'} mm.`;
}
function buildLitotripsiaSentence(d){
  return `Preparo da lesão calcificada por meio de sistema de litotripsia intracoronária Shockwave C2+ IVL ${d.diametro || '***'} x ${d.comprimento || '***'} mm com ${d.pulsos || '***'} pulsos.`;
}
function buildCuttingBalloonSentence(d){
  return `Realizado preparo da lesão calcificada com balão Wolverine Coronary Cutting Balloon ${d.diametro || '***'} x ${d.comprimento || '***'} mm a ${d.pressao || '18'} atm.`;
}

function buildAngioplastiaText(){
  const s = state.angioplastia;
  const g = id => document.getElementById(id).value;

  const clauses = s.vasos.map(vesselProcedureClause);

  let out = [];
  out.push('PROCEDIMENTO');
  if(clauses.length){
    out.push(joinList(clauses, 'e') + '.');
  } else {
    out.push('Angioplastia coronariana.');
  }

  out.push('\nTÉCNICA');
  const apIntrodutorVal = resolveCustomSelect('ap_introdutor', 'ap_introdutorCustom');
  const apHemostasiaVal = resolveCustomSelect('ap_hemostasia', 'ap_hemostasiaCustom');
  const apContrasteVal = resolveCustomSelect('ap_contrasteTipo', 'ap_contrasteTipoCustom');
  let tecLine = `Via de Acesso: ${g('ap_via')}, punção ${g('ap_puncao').toLowerCase()} ${g('ap_lado').toLowerCase()}`;
  if(apIntrodutorVal.trim()) tecLine += `, introdutor ${apIntrodutorVal.trim()}`;
  if(apHemostasiaVal.trim()) tecLine += `, hemostasia com ${apHemostasiaVal.trim().toLowerCase()}`;
  out.push(tecLine + '.');
  if(g('ap_anestesia').trim()) out.push('Anestesia: ' + g('ap_anestesia').trim() + '.');
  out.push(`Contraste: ${apContrasteVal.trim()}, volume (ml) = ${g('ap_contrasteVolume') || '0'}.`);
  const medList = Array.from(s.medicacao);
  const medOutras = g('ap_medicacaoOutras').trim();
  if(medOutras) medList.push(medOutras);
  out.push('Medicação: ' + (medList.length ? medList.join(', ') : 'nenhuma') + '.');
  out.push('Intercorrências: ' + (s.intercorrencias.size ? Array.from(s.intercorrencias).join(', ') : 'nenhuma') + '.');
  const intercObs = g('ap_intercorrenciasObs').trim();
  if(intercObs) out.push(intercObs);

  out.push('\nINTERVENÇÃO CORONÁRIA PERCUTÂNEA');

  s.vasos.forEach(v=>{
    out.push('\n' + apLabel(v));
    const steps = [];
    steps.push('Cateterização seletiva da artéria coronária' + (v.cateterGuia ? ' com cateter ' + v.cateterGuia + '.' : '.'));
    steps.push('Heparinização sistêmica.');
    if(v.lesaoPre){
      let injLine = 'Injeção seletiva evidenciando lesão de ' + v.lesaoPre + '%';
      const locF = localizacaoFrase(v.localizacao);
      if(locF) injLine += ' ' + locF;
      steps.push(injLine + '.');
    }
    steps.push('Posicionamento de fio-guia 0,014" na porção distal.');

    /* devices are grouped by fase and walked in a fixed clinical order —
       imaging/lesion-prep before pré-dilatação, stent, then imaging/pos-
       dilatação — rather than by the order rows happen to sit in the list */
    const byFase = fase => v.devices.filter(d=>d.fase===fase);

    byFase('ivus_pre').forEach(d => steps.push(buildImagingSentence(deviceToImagingCfg(d,'IVUS'))));
    byFase('oct_pre').forEach(d => steps.push(buildImagingSentence(deviceToImagingCfg(d,'OCT'))));
    byFase('rotablator').forEach(d => steps.push(buildRotablatorSentence(d)));
    byFase('litotripsia').forEach(d => steps.push(buildLitotripsiaSentence(d)));
    byFase('cutting_balloon').forEach(d => steps.push(buildCuttingBalloonSentence(d)));

    const pre = byFase('pre');
    if(pre.length) steps.push('Pré-dilatação com balão ' + joinList(pre.map(deviceDescLabel)) + '.');

    byFase('ivus_pos_pre').forEach(d => steps.push(buildReimagingSentence('IVUS', d)));
    byFase('oct_pos_pre').forEach(d => steps.push(buildReimagingSentence('OCT', d)));

    const stent = byFase('stent');
    if(stent.length){
      const farm = stent.filter(d=>d.tipoStent==='Farmacológico');
      const conv = stent.filter(d=>d.tipoStent==='Convencional');
      let stentParts = [];
      if(farm.length) stentParts.push('stent farmacológico ' + joinList(farm.map(deviceDescLabel)));
      if(conv.length) stentParts.push('stent convencional ' + joinList(conv.map(deviceDescLabel)));
      steps.push('Implante de ' + stentParts.join(' e ') + '.');
    }

    byFase('ivus_pos_stent').forEach(d => steps.push(buildStentAreaSentence('IVUS', d)));
    byFase('oct_pos_stent').forEach(d => steps.push(buildStentAreaSentence('OCT', d)));

    const pos = byFase('pos');
    if(pos.length) steps.push('Pós-dilatação com balão ' + joinList(pos.map(deviceDescLabel)) + '.');

    let closing = 'Ao final, evidenciado ';
    if(v.complicacoes.size){
      closing += 'o seguinte: ' + Array.from(v.complicacoes).join(', ') + '. Fluxo distal TIMI ' + v.timiPos + '.';
    } else {
      closing += 'bom aspecto angiográfico da artéria tratada, sem sinais de complicações, e fluxo distal TIMI ' + v.timiPos + '.';
    }
    steps.push(closing);

    steps.forEach(st => out.push('- ' + st));
  });

  if(!s.vasos.length) out.push('\nNenhum vaso tratado adicionado.');

  const eq = equipeBlock(s.equipe);
  if(eq) out.push('\n' + eq);

  out.push('\nCONCLUSÃO');
  const intercLine = s.intercorrencias.size
    ? 'Procedimento com intercorrências: ' + Array.from(s.intercorrencias).join(', ') + '.'
    : 'Procedimento sem intercorrências.';
  out.push(intercLine);
  s.vasos.forEach(v=>{
    let resLine = '- ' + vesselProcedureClause(v);
    if(v.resultado === 'Sucesso'){
      resLine += ', com sucesso' + (v.resultadoDetalhe ? ' (' + v.resultadoDetalhe + ')' : '') + '.';
    } else {
      resLine += ', com insucesso' + (v.resultadoDetalhe ? ': ' + v.resultadoDetalhe : '') + '.';
    }
    out.push(resLine);
  });
  const extra = g('ap_conclusaoExtra').trim();
  if(extra) out.push('\n' + extra);

  return out.join('\n');
}

function updateAngioplastiaPreview(){
  const ta = document.getElementById('ap_output');
  if(document.activeElement !== ta) ta.value = buildAngioplastiaText();
  const n = state.angioplastia.vasos.length;
  document.getElementById('ap_meta').textContent = n ? (n + (n===1?' vaso tratado':' vasos tratados')) : 'nenhum vaso tratado ainda';
  schedulePatientSave();
}

/* ========================================================================
   TABS
   ======================================================================== */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-selected', t===tab ? 'true':'false'));
    document.querySelectorAll('section.workspace').forEach(sec=>{
      sec.hidden = sec.dataset.view !== tab.dataset.view;
    });
  });
});

/* ========================================================================
   COPY TO CLIPBOARD
   ======================================================================== */
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(()=> t.classList.remove('show'), 1800);
}

function copyText(text, btn){
  function done(ok){
    if(ok){
      const original = btn.textContent;
      btn.textContent = 'Copiado ✓';
      btn.classList.add('copied');
      setTimeout(()=>{ btn.textContent = original; btn.classList.remove('copied'); }, 1500);
      showToast('Laudo copiado para a área de transferência');
    } else {
      showToast('Não foi possível copiar — selecione e copie manualmente');
    }
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>done(true)).catch(()=>fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, cb){
  try{
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    cb(ok);
  }catch(e){ cb(false); }
}

document.getElementById('ga_copyBtn').addEventListener('click', ()=>{
  copyText(document.getElementById('ga_output').value, document.getElementById('ga_copyBtn'));
});
document.getElementById('ap_copyBtn').addEventListener('click', ()=>{
  copyText(document.getElementById('ap_output').value, document.getElementById('ap_copyBtn'));
});

/* ========================================================================
   EXEMPLO (sob demanda) — antes carregava sozinho a cada abertura da página;
   como o texto gerado é colado direto no prontuário, um exemplo com achados
   plausíveis pré-carregado é arriscado (pode ser copiado por engano junto
   com dados reais). Agora só entra se o usuário pedir, e nunca sobrescreve
   um laudo em andamento sem confirmação.
   ======================================================================== */
function loadExampleData(){
  const cd = newVessel({sistema:'direita', nivel:'principal', nome:'Artéria Coronária Direita', sigla:'CD'});
  cd.importancia = 'Grande';
  cd.lesoes.push({id:nextId(), tipo:'Lesão focal', percentual:'80', localizacao:'Proximal', flags:{}});
  const dp = newVessel({sistema:'direita', nivel:'ramo', nome:'Artéria descendente posterior direita', sigla:'DP'});
  dp.importancia = 'Grande';
  dp.lesoes.push({id:nextId(), tipo:'Lesão segmentar', percentual:'80', localizacao:'Proximal', flags:{}});
  state.angiografia.vasos.push(cd, dp);

  const treated = newTreatedVessel({sistema:'esquerda', nivel:'principal', nome:'Artéria Descendente Anterior', sigla:'DA'});
  treated.cateterGuia = 'JL4';
  treated.lesaoPre = '80';
  treated.devices.push({id:nextId(), fase:'pre', descricao:'Mini Trek', diametro:'2', comprimento:'20', pressao:'10'});
  treated.devices.push({id:nextId(), fase:'stent', tipoStent:'Farmacológico', descricao:'Firehawk', diametro:'3', comprimento:'23', pressao:'14'});
  treated.devices.push({id:nextId(), fase:'pos', descricao:'NC Trek Neo', diametro:'3', comprimento:'15', pressao:'20'});
  state.angioplastia.vasos.push(treated);

  renderGaVessels();
  renderApVessels();
  updateAngiografiaPreview();
  updateAngioplastiaPreview();
}

document.getElementById('loadExampleBtn').addEventListener('click', ()=>{
  const hasData = state.angiografia.vasos.length || state.angioplastia.vasos.length;
  if(hasData && !confirm('Isso substitui os vasos/achados já preenchidos por um exemplo fictício. Continuar?')) return;
  if(hasData){
    state.angiografia.vasos = [];
    state.angioplastia.vasos = [];
  }
  loadExampleData();
  document.getElementById('exampleBanner').hidden = false;
  showToast('Exemplo carregado — lembre-se de apagar antes de usar em um paciente real');
});

/* ========================================================================
   NOVO LAUDO — limpa os dados do paciente atual (vasos, achados, técnica)
   nas duas abas para começar o próximo caso. A equipe é mantida de
   propósito (normalmente é a mesma equipe ao longo do plantão).
   ======================================================================== */
function resetChipGroup(selector){
  document.querySelectorAll(selector).forEach(chip => setChipPressed(chip, false));
}

function startNewReport(){
  if(!confirm('Iniciar um novo laudo? Isso apaga os vasos, achados e campos preenchidos das duas abas (a equipe é mantida).')) return;

  state.angiografia.vasos = [];
  state.angiografia.metodos = new Set();
  state.angiografia.metodosInfluencia = null;
  GA_FIELD_IDS.forEach(id => setFieldValue(id, GA_DEFAULTS[id]));
  syncGaIntrodutorWrap(); syncGaHemostasiaWrap(); syncGaContrasteWrap();
  document.getElementById('ga_colateralDetalheWrap').style.display = 'none';
  document.getElementById('ga_padraoCustomWrap').style.display = 'none';
  resetChipGroup('#ga_metodos .chip');
  resetChipGroup('#ga_metodosInfluenciaWrap .chip');
  syncGaMetodosWraps();
  gaIvusCaracteristicas.clear();
  gaOctCaracteristicas.clear();
  resetChipGroup('#ga_ivus_caracteristicas .chip');
  resetChipGroup('#ga_oct_caracteristicas .chip');
  syncGaIvusDetalhes(); syncGaIvusCalcio(); syncGaOctDetalhes(); syncGaOctCalcio();
  disarmLoadDefaults();
  syncPonteVisibility();

  state.angioplastia.vasos = [];
  state.angioplastia.medicacao = new Set();
  state.angioplastia.intercorrencias = new Set();
  AP_FIELD_IDS.forEach(id => setFieldValue(id, AP_DEFAULTS[id]));
  syncApIntrodutorWrap(); syncApHemostasiaWrap(); syncApContrasteWrap();
  resetChipGroup('#ap_medicacao .chip');
  resetChipGroup('#ap_intercorrencias .chip');

  document.getElementById('patientRef').value = '';
  document.getElementById('exampleBanner').hidden = true;

  clearPatientData();
  renderGaVessels();
  renderApVessels();
  updateAngiografiaPreview();
  updateAngioplastiaPreview();
  showToast('Novo laudo iniciado');
}
document.getElementById('newReportBtn').addEventListener('click', startNewReport);

/* ========================================================================
   TEMA (claro / escuro / automático)
   ======================================================================== */
const THEME_KEY = 'hemolaudo_theme';
function getStoredTheme(){ try{ return localStorage.getItem(THEME_KEY); }catch(e){ return null; } }
function setStoredTheme(v){ try{ if(v) localStorage.setItem(THEME_KEY, v); else localStorage.removeItem(THEME_KEY); }catch(e){} }
function applyTheme(mode){
  if(mode === 'light' || mode === 'dark') document.documentElement.setAttribute('data-theme', mode);
  else document.documentElement.removeAttribute('data-theme');
  const btn = document.getElementById('themeToggleBtn');
  if(!btn) return;
  if(mode === 'dark'){ btn.textContent = '🌙'; btn.title = 'Tema escuro — clique para tema claro'; }
  else if(mode === 'light'){ btn.textContent = '☀️'; btn.title = 'Tema claro — clique para automático'; }
  else { btn.textContent = '🌓'; btn.title = 'Tema automático (segue o sistema) — clique para escuro'; }
}
document.getElementById('themeToggleBtn').addEventListener('click', ()=>{
  const current = getStoredTheme();
  const next = current === 'dark' ? 'light' : current === 'light' ? null : 'dark';
  setStoredTheme(next);
  applyTheme(next);
});
applyTheme(getStoredTheme());

/* ========================================================================
   INIT
   ======================================================================== */
captureFieldDefaults();
loadTeamFromStorage();
renderEquipe(document.getElementById('ga_equipeBody'), state.angiografia.equipe, updateAngiografiaPreview);
renderEquipe(document.getElementById('ap_equipeBody'), state.angioplastia.equipe, updateAngioplastiaPreview);

loadPatientData();

/* reflect any restored selections onto the chip buttons + dependent panels
   (setting .value directly, as loadPatientData does, doesn't fire 'change') */
document.querySelectorAll('#ga_metodos .chip').forEach(chip=>{
  setChipPressed(chip, state.angiografia.metodos.has(chip.dataset.key));
});
syncGaMetodosWraps();
document.querySelectorAll('#ga_metodosInfluenciaWrap .chip').forEach(chip=>{
  setChipPressed(chip, chip.dataset.influencia === state.angiografia.metodosInfluencia);
});
document.querySelectorAll('#ga_ivus_caracteristicas .chip').forEach(chip=>{
  setChipPressed(chip, gaIvusCaracteristicas.has(chip.dataset.carac));
});
document.querySelectorAll('#ga_oct_caracteristicas .chip').forEach(chip=>{
  setChipPressed(chip, gaOctCaracteristicas.has(chip.dataset.carac));
});
syncGaIvusDetalhes(); syncGaIvusCalcio(); syncGaOctDetalhes(); syncGaOctCalcio();
document.getElementById('ga_colateralDetalheWrap').style.display =
  document.getElementById('ga_colateral').value === 'Presente' ? 'flex' : 'none';
document.getElementById('ga_padraoCustomWrap').style.display =
  document.getElementById('ga_padrao').value === 'custom' ? 'flex' : 'none';
syncGaIntrodutorWrap(); syncGaHemostasiaWrap(); syncGaContrasteWrap();
syncApIntrodutorWrap(); syncApHemostasiaWrap(); syncApContrasteWrap();
syncPonteVisibility();

document.querySelectorAll('#ap_medicacao .chip').forEach(chip=>{
  setChipPressed(chip, state.angioplastia.medicacao.has(chip.dataset.med));
});
document.querySelectorAll('#ap_intercorrencias .chip').forEach(chip=>{
  setChipPressed(chip, state.angioplastia.intercorrencias.has(chip.dataset.int));
});

renderGaVessels();
renderApVessels();
updateAngiografiaPreview();
updateAngioplastiaPreview();

})();
