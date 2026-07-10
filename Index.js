/**
 * ElectraAI - Electronics Diagnostic System JS Controller
 * Includes Stepper Wizard, Voice Input, Custom Dropzones, AI Mock Analysis,
 * Diagnostic Database Compiler, Multi-language (EN/HI) dictionary, and Context-Aware Chatbot.
 */

// --- Global App State ---
const AppState = {
  currentStep: 1,
  currentTheme: 'dark',
  currentLang: 'EN',
  selectedDevice: null,
  uploadedImages: [],
  diagnosedIssue: null,
  voiceRecognition: null,
  isListening: false,
  history: [],
  geminiApiKey: '',
  userLocation: null
};

// --- Language Dictionary (English & Hindi) ---
const LangDictionary = {
  EN: {
    critical_fault: "Critical Fault Detected",
    warning_fault: "Action Required",
    minor_fault: "Minor Issue Detected",
    diy: "DIY (Do It Yourself)",
    tech: "Technician Required",
    cost_low: "Low Cost",
    cost_mid: "Moderate",
    cost_high: "High Repair",
    chat_welcome: "Hi! I am your ElectraAI Assistant. I have finished analyzing your {brand} {device} ({model}). Based on our findings, let's explore how we can resolve this problem. Ask me anything, or choose a common question below!",
    chat_sent_symptom: "I want to check the details of {symptom} diagnosis.",
    chat_suggest_1: "How do I fix this myself?",
    chat_suggest_2: "What tools or parts do I need?",
    chat_suggest_3: "Is it safe to run in this state?",
    chat_suggest_4: "Find a local repair technician",
    chat_ans_diy_lap: "To diagnose loose RAM: 1) Turn off the laptop and disconnect the charger. 2) Open the back cover using a precision screwdriver. 3) Push the clips on the side of the RAM slot outwards; the RAM will pop up. 4) Remove the RAM stick and clean the golden contact lines with a soft pencil eraser. 5) Re-insert the RAM firmly at a 30-degree angle and press down until it clicks. 6) Power on to verify display.",
    chat_ans_tools: "For this diagnostic resolution, you will need a Philips precision screwdriver kit, a plastic spudger or opening tool, a rubber eraser or contact cleaner spray, and optionally a replacement display flex cable or thermal paste.",
    chat_ans_safe: "If it is a display/RAM issue, it is generally safe but the system won't boot. However, if you notice symptoms like battery swelling, overheating, or a burning smell, disconnect all power immediately as it could cause fire or damage the board.",
    chat_ans_default: "Based on your {brand} device profile, the AI diagnostics pinpoint a primary connection or hardware fault. I highly suggest trying basic troubleshooting like a hard reset or inspecting visual cables. For deeper hardware faults, a certified repair shop is recommended."
  },
  HI: {
    critical_fault: "गंभीर खराबी का पता चला",
    warning_fault: "कार्रवाई आवश्यक है",
    minor_fault: "मामूली समस्या का पता चला",
    diy: "डीआईवाई (स्वयं करें)",
    tech: "तकनीशियन की आवश्यकता",
    cost_low: "कम लागत",
    cost_mid: "सामान्य",
    cost_high: "उच्च मरम्मत",
    chat_welcome: "नमस्ते! मैं आपका ElectraAI सहायक हूँ। मैंने आपके {brand} {device} ({model}) का विश्लेषण पूरा कर लिया है। हमारी रिपोर्ट के आधार पर, आइए देखें कि इस समस्या को कैसे हल किया जाए। मुझसे कुछ भी पूछें, या नीचे दिए गए विकल्पों को चुनें!",
    chat_sent_symptom: "मैं {symptom} निदान के विवरण की जांच करना चाहता हूं।",
    chat_suggest_1: "मैं इसे स्वयं कैसे ठीक करूं?",
    chat_suggest_2: "मुझे किन उपकरणों या भागों की आवश्यकता है?",
    chat_suggest_3: "क्या इस स्थिति में इसे चलाना सुरक्षित है?",
    chat_suggest_4: "स्थानीय मरम्मत तकनीशियन खोजें",
    chat_ans_diy_lap: "ढीले रैम (RAM) की जांच करने के लिए: 1) लैपटॉप बंद करें और चार्जर निकालें। 2) स्क्रूड्राइवर से पीछे का कवर खोलें। 3) रैम स्लॉट के किनारों क्लिप को बाहर की तरफ दबाएं; रैम बाहर आ जाएगी। 4) रैम निकालें और उसके सोने के रंग के पट्टियों को रबर (इरेज़र) से साफ करें। 5) रैम को वापस झुकाकर स्लॉट में डालें और नीचे दबाएं जब तक कि आवाज न आए। 6) लैपटॉप चालू करें।",
    chat_ans_tools: "इस मरम्मत के लिए, आपको एक सटीक स्क्रूड्राइवर किट, एक प्लास्टिक ओपनिंग टूल, एक रबर (इरेज़र) या कांटेक्ट क्लीनर स्प्रे, और जरूरत पड़ने पर एक नया डिस्प्ले केबल की आवश्यकता होगी।",
    chat_ans_safe: "यदि यह डिस्प्ले/रैम की समस्या है, तो यह सुरक्षित है लेकिन स्क्रीन नहीं दिखेगी। हालांकि, अगर बैटरी फूल रही है, बहुत गर्म हो रही है, या जलने की गंध आ रही है, तो तुरंत चार्जर को हटा दें क्योंकि यह शॉर्ट सर्किट का कारण बन सकता है।",
    chat_ans_default: "आपके {brand} डिवाइस के विवरण के अनुसार, मुख्य समस्या कनेक्शन या हार्डवेयर से संबंधित है। मैं सबसे पहले एक बार हार्ड रीसेट करने या डिस्प्ले केबल की जांच करने का सुझाव देता हूं। अधिक जटिल समस्या होने पर नजदीकी सर्विस सेंटर से संपर्क करें।"
  }
};

// --- Mock Service Centers Directory ---
const ServiceCenters = [
  { name: "Electra Care Authorized Hub", rating: 4.8, distance: "1.2 km", address: "Sector 18, Block B-4, Noida", phone: "+91 98110 23456", match: ["laptop", "mobile", "tv", "printer"] },
  { name: "QuickFix Multi-Brand Labs", rating: 4.7, distance: "2.5 km", address: "Preet Vihar, G-9, Metro Pillar 110, Delhi", phone: "+91 88001 98765", match: ["laptop", "mobile", "router"] },
  { name: "Home-Cool Care Specialists", rating: 4.9, distance: "3.1 km", address: "Lajpat Nagar II, New Delhi", phone: "+91 95400 12312", match: ["ac", "refrigerator", "washing_machine"] },
  { name: "Quantum Chip Repair Point", rating: 4.5, distance: "4.0 km", address: "Nehru Place Market, G-12, Delhi", phone: "+91 99991 76543", match: ["laptop", "tv", "printer", "router"] }
];

// --- Device Dynamic Symptoms Options ---
const DeviceSymptomsMap = {
  laptop: [
    { label: { en: "Display black / No visual output", hi: "डिस्प्ले ब्लैक / कोई विजुअल आउटपुट नहीं" }, val: "display" },
    { label: { en: "Device overheating / Loud fan noise", hi: "ओवरहीटिंग / तेज पंखे की आवाज" }, val: "overheat" },
    { label: { en: "Battery draining fast / Not charging", hi: "बैटरी तेजी से डिस्चार्ज / चार्ज न होना" }, val: "battery" },
    { label: { en: "Keyboard keys unresponsive", hi: "कीबोर्ड कीज काम नहीं कर रही हैं" }, val: "keyboard" },
    { label: { en: "System crash / Blue Screen (BSOD)", hi: "सिस्टम क्रैश / ब्लू स्क्रीन (BSOD)" }, val: "crash" },
    { label: { en: "Beep sounds at bootup", hi: "चालू होने पर बीप की आवाजें आना" }, val: "beep" }
  ],
  mobile: [
    { label: { en: "Cracked screen / Unresponsive touch", hi: "टूटी स्क्रीन / टच काम न करना" }, val: "screen" },
    { label: { en: "Battery drainage / Overheating", hi: "तेजी से बैटरी खत्म होना / गर्म होना" }, val: "battery" },
    { label: { en: "Device boot loops / Won't turn on", hi: "बूट लूप / चालू न होना" }, val: "power" },
    { label: { en: "Speaker / Microphone muffling", hi: "स्पीकर / माइक में धुंधली आवाज" }, val: "sound" },
    { label: { en: "Charging port loose / Water damage", hi: "चार्जिंग पोर्ट ढीला / पानी घुसना" }, val: "water" }
  ],
  tv: [
    { label: { en: "Screen shows lines / Cracked panel", hi: "स्क्रीन पर लाइनें / टूटा हुआ पैनल" }, val: "lines" },
    { label: { en: "No picture but audio works", hi: "चित्र नहीं आ रहा लेकिन आवाज चल रही है" }, val: "picture" },
    { label: { en: "HDMI or USB ports unresponsive", hi: "HDMI / USB पोर्ट काम नहीं कर रहे" }, val: "ports" },
    { label: { en: "TV reboots on its own", hi: "टीवी अपने आप बार-बार बंद-चालू होना" }, val: "reboot" }
  ],
  refrigerator: [
    { label: { en: "Not cooling properly", hi: "कूलिंग नहीं हो रही" }, val: "cooling" },
    { label: { en: "Excessive frost in freezer", hi: "फ्रीजर में बहुत अधिक बर्फ जमना" }, val: "frost" },
    { label: { en: "Water leaking on floor", hi: "नीचे से पानी लीक होना" }, val: "leak" },
    { label: { en: "Compressor making loud humming noise", hi: "कंप्रेसर से तेज गुनगुनाहट की आवाज" }, val: "noise" }
  ],
  ac: [
    { label: { en: "Not blowing cold air", hi: "ठंडी हवा नहीं आ रही है" }, val: "cooling" },
    { label: { en: "Water dripping from indoor unit", hi: "इनडोर यूनिट से पानी टपकना" }, val: "dripping" },
    { label: { en: "Strange rattling or squeaking noise", hi: "अजीब खड़खड़ाहट या चीखने की आवाज" }, val: "noise" },
    { label: { en: "Error code flashing on screen", hi: "स्क्रीन पर एरर कोड का चमकना" }, val: "error" }
  ],
  washing_machine: [
    { label: { en: "Water not draining out", hi: "पानी बाहर नहीं निकल रहा है" }, val: "drain" },
    { label: { en: "Drum not spinning / Agitating", hi: "ड्रम नहीं घूम रहा" }, val: "spin" },
    { label: { en: "Severe vibration or walking", hi: "तेज कंपन या हिलना" }, val: "vibrate" },
    { label: { en: "Water leaking from bottom", hi: "नीचे से पानी बहना" }, val: "leak" }
  ],
  printer: [
    { label: { en: "Paper jam in rollers", hi: "रोलर्स में कागज का फंसना" }, val: "paper" },
    { label: { en: "Faded print / Missing lines", hi: "धुंधली छपाई / गायब लाइनें" }, val: "print" },
    { label: { en: "Double feeding papers", hi: "एक साथ कई कागज खींचना" }, val: "feed" },
    { label: { en: "Ink cartridge not recognized", hi: "इंक कार्ट्रिज की पहचान न होना" }, val: "cartridge" }
  ],
  router: [
    { label: { en: "Wi-Fi network not visible", hi: "वाई-फाई नेटवर्क दिखाई नहीं दे रहा" }, val: "wifi" },
    { label: { en: "No internet (WAN red LED)", hi: "इंटरनेट कनेक्शन नहीं (WAN लाल बत्ती)" }, val: "internet" },
    { label: { en: "Frequent disconnections", hi: "बार-बार डिस्कनेक्ट होना" }, val: "drops" }
  ]
};

// --- DOM References ---
const Elements = {
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  apiSettingsBtn: document.getElementById('api-settings-btn'),
  apiSettingsModal: document.getElementById('api-settings-modal'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  geminiApiKeyInput: document.getElementById('gemini-api-key-input'),
  toggleKeyVisibility: document.getElementById('toggle-key-visibility'),
  eyeIcon: document.getElementById('eye-icon'),
  saveApiKeyBtn: document.getElementById('save-api-key-btn'),
  apiKeyStatus: document.getElementById('api-key-status'),
  langToggleBtn: document.getElementById('lang-toggle-btn'),
  currentLangText: document.getElementById('current-lang'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  stepIndicators: document.querySelectorAll('.step-indicator'),
  stepPanels: document.querySelectorAll('.step-panel'),
  deviceSelectionGrid: document.getElementById('device-selection-grid'),
  deviceDetailsForm: document.getElementById('device-details-form'),
  dynamicSymptomsContainer: document.getElementById('dynamic-symptoms-container'),
  symptomsValidationMsg: document.getElementById('symptoms-validation-msg'),
  submitStep2Btn: document.getElementById('submit-step-2-btn'),
  mediaDropzone: document.getElementById('media-dropzone'),
  mediaFileInput: document.getElementById('media-file-input'),
  uploadPreviewsContainer: document.getElementById('upload-previews-container'),
  startDiagnosisBtn: document.getElementById('start-diagnosis-btn'),
  analysisProgressBar: document.getElementById('analysis-progress-bar'),
  statusTickerList: document.getElementById('status-ticker-list'),
  scannerGridPreviews: document.getElementById('scanner-grid-previews'),
  resultsDashboard: document.getElementById('step-panel-results'),
  restartDiagnosticBtn: document.getElementById('restart-diagnostic-btn'),
  printReportBtn: document.getElementById('print-diagnosis-report'),
  
  // Results Fields
  resultStatusBadge: document.getElementById('result-status-badge'),
  resultSummarySeverity: document.getElementById('result-summary-severity'),
  resultModelText: document.getElementById('result-model-text'),
  resultDateText: document.getElementById('result-date-text'),
  diagnosticIssuesList: document.getElementById('diagnostic-issues-list'),
  minCostVal: document.getElementById('min-cost-val'),
  maxCostVal: document.getElementById('max-cost-val'),
  costRangeActiveIndicator: document.getElementById('cost-range-active-indicator'),
  partsCostTableBody: document.getElementById('parts-cost-table-body'),
  diyActionStepsContainer: document.getElementById('diy-action-steps-container'),
  
  // Chat Fields
  chatMessagesArea: document.getElementById('chat-messages-area'),
  chatSuggestionsContainer: document.getElementById('chat-suggestions-container'),
  chatInputForm: document.getElementById('chat-input-form'),
  chatUserMessageInput: document.getElementById('chat-user-message-input'),
  
  // Service Directory
  serviceCentersList: document.getElementById('service-centers-list'),
  
  // Voice Input
  voiceInputBtn: document.getElementById('voice-input-btn'),
  deviceDescription: document.getElementById('device-description'),
  voiceTranscriptInfo: document.getElementById('voice-transcript-info'),
  voiceTranscriptMsg: document.getElementById('voice-transcript-msg'),

  // History Drawer Elements
  historyToggleBtn: document.getElementById('history-toggle-btn'),
  historyBadgeCount: document.getElementById('history-badge-count'),
  historyDrawer: document.getElementById('history-drawer'),
  closeDrawerBtn: document.getElementById('close-drawer-btn'),
  drawerOverlay: document.getElementById('drawer-overlay'),
  historyListContainer: document.getElementById('history-list-container'),
  clearHistoryBtn: document.getElementById('clear-history-btn')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('gemini_api_key');
  initTheme();
  initLanguage();
  initDeviceGrid();
  initWizardNavigation();
  initSymptomsHandler();
  initDropzone();
  initVoiceRecognition();
  initChatEngine();
  initHistoryHandler();
  initApiKeyModal();
  initLocationHandler();
  lucide.createIcons();
});

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  
  Elements.themeToggleBtn.addEventListener('click', () => {
    const newTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  AppState.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// --- Language Management ---
function initLanguage() {
  Elements.langToggleBtn.addEventListener('click', () => {
    AppState.currentLang = AppState.currentLang === 'EN' ? 'HI' : 'EN';
    Elements.currentLangText.textContent = AppState.currentLang;
    updateLanguageTexts();
    
    // Refresh symptoms list if on Step 2
    if (AppState.selectedDevice) {
      renderSymptoms(AppState.selectedDevice);
    }
  });
}

function updateLanguageTexts() {
  const lang = AppState.currentLang;
  
  // Find all elements with data-en or data-hi attribute
  document.querySelectorAll('[data-en], [data-hi]').forEach(el => {
    if (lang === 'HI' && el.getAttribute('data-hi')) {
      el.textContent = el.getAttribute('data-hi');
    } else if (lang === 'EN' && el.getAttribute('data-en')) {
      el.textContent = el.getAttribute('data-en');
    }
  });

  // Update Input Placeholders
  document.querySelectorAll('input, textarea').forEach(el => {
    const enPlaceholder = el.getAttribute('data-en-placeholder');
    const hiPlaceholder = el.getAttribute('data-hi-placeholder');
    if (enPlaceholder && hiPlaceholder) {
      el.setAttribute('placeholder', lang === 'HI' ? hiPlaceholder : enPlaceholder);
    }
  });
}

// --- Stepper Navigation Manager ---
function initWizardNavigation() {
  // Stepper Headings Click triggers (only allows moving back to completed steps)
  Elements.stepIndicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const step = parseInt(indicator.getAttribute('data-step'));
      if (step < AppState.currentStep && AppState.currentStep !== 4 && AppState.currentStep !== 5) {
        navigateToStep(step);
      }
    });
  });

  // Back button triggers
  document.querySelectorAll('.back-btn-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      if (AppState.currentStep > 1) {
        navigateToStep(AppState.currentStep - 1);
      }
    });
  });

  // Restart Button
  Elements.restartDiagnosticBtn.addEventListener('click', resetDiagnosticApp);
  
  // Print PDF Trigger
  Elements.printReportBtn.addEventListener('click', triggerTechnicalPrint);
}

function navigateToStep(step) {
  AppState.currentStep = step;
  
  // Hide all step sections
  Elements.stepPanels.forEach(panel => panel.classList.remove('active'));
  Elements.resultsDashboard.classList.remove('active');
  
  // Show target step
  const panel = document.getElementById(`step-panel-${step}`);
  if (panel) {
    panel.classList.add('active');
  }
  
  // Update Stepper Progress Timeline Headers
  Elements.stepIndicators.forEach(indicator => {
    const indStep = parseInt(indicator.getAttribute('data-step'));
    indicator.classList.remove('active', 'completed');
    
    if (indStep === step) {
      indicator.classList.add('active');
    } else if (indStep < step) {
      indicator.classList.add('completed');
    }
  });

  // Update timeline line width
  let progressPct = 0;
  if (step === 1) progressPct = 0;
  else if (step === 2) progressPct = 33;
  else if (step === 3) progressPct = 66;
  else if (step === 4) progressPct = 100;
  
  Elements.progressBarFill.style.width = `${progressPct}%`;
  
  // Adjust layouts
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetDiagnosticApp() {
  // Clear forms
  document.getElementById('device-brand').value = '';
  document.getElementById('device-model').value = '';
  document.getElementById('device-year').value = '';
  document.getElementById('device-error-code').value = '';
  Elements.deviceDescription.value = '';
  Elements.deviceDetailsForm.classList.remove('was-validated');
  
  // Clear file uploads
  AppState.uploadedImages = [];
  Elements.uploadPreviewsContainer.innerHTML = '';
  
  // Reset active classes on grids
  document.querySelectorAll('.device-card').forEach(c => c.classList.remove('selected'));
  AppState.selectedDevice = null;
  
  // Navigate to step 1
  navigateToStep(1);
}

// --- Step 1: Device Selection Grid ---
function initDeviceGrid() {
  const cards = document.querySelectorAll('.device-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const deviceType = card.getAttribute('data-device');
      AppState.selectedDevice = deviceType;
      
      // Load symptoms for this specific device
      renderSymptoms(deviceType);
      
      // Proceed automatically to Step 2
      setTimeout(() => {
        navigateToStep(2);
      }, 350);
    });

    // Dynamic spotlight background glow on hover
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    });
  });
}

// --- Step 2: Form Handling & Dynamic Symptoms ---
function initSymptomsHandler() {
  Elements.submitStep2Btn.addEventListener('click', () => {
    const form = Elements.deviceDetailsForm;
    const checkedSymptoms = Elements.dynamicSymptomsContainer.querySelectorAll('input[type="checkbox"]:checked');
    
    // Custom validate symptoms checkboxes (at least one is required)
    const isSymptomValid = checkedSymptoms.length > 0;
    if (!isSymptomValid) {
      Elements.symptomsValidationMsg.style.display = 'block';
    } else {
      Elements.symptomsValidationMsg.style.display = 'none';
    }
    
    // Check standard HTML5 validation
    const isFormValid = form.checkValidity();
    form.classList.add('was-validated');
    
    if (isFormValid && isSymptomValid) {
      navigateToStep(3);
    }
  });
}

function renderSymptoms(deviceType) {
  const symptoms = DeviceSymptomsMap[deviceType] || [];
  Elements.dynamicSymptomsContainer.innerHTML = '';
  Elements.symptomsValidationMsg.style.display = 'none';
  
  symptoms.forEach((s, idx) => {
    const labelText = AppState.currentLang === 'HI' ? s.label.hi : s.label.en;
    
    const label = document.createElement('label');
    label.className = 'symptom-checkbox-label';
    label.setAttribute('for', `symptom-${idx}`);
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `symptom-${idx}`;
    input.value = s.val;
    input.className = 'symptom-checkbox-input';
    
    input.addEventListener('change', () => {
      if (input.checked) {
        label.classList.add('checked');
      } else {
        label.classList.remove('checked');
      }
      // Re-evaluate validation warning dynamically
      const checked = Elements.dynamicSymptomsContainer.querySelectorAll('input[type="checkbox"]:checked');
      if (checked.length > 0) {
        Elements.symptomsValidationMsg.style.display = 'none';
      }
    });

    const span = document.createElement('span');
    span.textContent = labelText;
    
    label.appendChild(input);
    label.appendChild(span);
    Elements.dynamicSymptomsContainer.appendChild(label);
  });
}

// --- Step 3: Media Upload Dropzone ---
function initDropzone() {
  const dropzone = Elements.mediaDropzone;
  const input = Elements.mediaFileInput;
  
  // Highlight dropzone on drag over
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });
  
  // Handle drop files
  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleUploadedFiles(files);
  });
  
  // Handle click to browse files
  input.addEventListener('change', () => {
    handleUploadedFiles(input.files);
  });

  // Start diagnosis trigger
  Elements.startDiagnosisBtn.addEventListener('click', runDiagnosticsSimulation);
}

function handleUploadedFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      AppState.uploadedImages.push(dataUrl);
      renderUploadPreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderUploadPreviews() {
  Elements.uploadPreviewsContainer.innerHTML = '';
  
  AppState.uploadedImages.forEach((imgSrc, idx) => {
    const card = document.createElement('div');
    card.className = 'preview-card';
    
    const img = document.createElement('img');
    img.src = imgSrc;
    img.className = 'preview-img';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'preview-remove-btn';
    removeBtn.innerHTML = '<i data-lucide="x"></i>';
    removeBtn.title = "Delete photo";
    
    removeBtn.addEventListener('click', () => {
      AppState.uploadedImages.splice(idx, 1);
      renderUploadPreviews();
    });
    
    card.appendChild(img);
    card.appendChild(removeBtn);
    Elements.uploadPreviewsContainer.appendChild(card);
  });
  
  lucide.createIcons();
}

// --- Step 4: AI Analysis Simulation & Loading Screen ---
function runDiagnosticsSimulation() {
  navigateToStep(4);

  const scannerContainer = Elements.scannerGridPreviews;
  scannerContainer.innerHTML = '';

  if (AppState.uploadedImages.length > 0) {
    AppState.uploadedImages.slice(0, 3).forEach(imgSrc => {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.className = 'scan-preview-item';
      scannerContainer.appendChild(img);
    });
  } else {
    scannerContainer.innerHTML = `<div class="device-icon" style="margin-bottom:0;"><i data-lucide="${getDeviceIcon(AppState.selectedDevice)}"></i></div>`;
    lucide.createIcons();
  }

  let progress = 0;
  Elements.analysisProgressBar.style.width = '0%';

  const tickerItems = Elements.statusTickerList.querySelectorAll('.ticker-item');
  let activeTickerIdx = 0;

  const tickerInterval = setInterval(() => {
    tickerItems.forEach(item => item.classList.remove('active'));
    activeTickerIdx = (activeTickerIdx + 1) % tickerItems.length;
    tickerItems[activeTickerIdx].classList.add('active');
    Elements.statusTickerList.style.transform = `translateY(-${activeTickerIdx * 30}px)`;
  }, 700);

  // Start Gemini API call in parallel
  const geminiPromise = compileDiagnosticsData();

  // Progress bar runs until 90%, then waits for Gemini
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += 2;
      Elements.analysisProgressBar.style.width = `${progress}%`;
    }
  }, 80);

  geminiPromise.then(() => {
    clearInterval(progressInterval);
    clearInterval(tickerInterval);

    // Fill to 100%
    Elements.analysisProgressBar.style.width = '100%';

    setTimeout(() => {
      Elements.stepPanels.forEach(panel => panel.classList.remove('active'));
      Elements.resultsDashboard.classList.add('active');
      Elements.progressBarFill.style.width = '100%';
      Elements.stepIndicators.forEach(indicator => indicator.classList.add('completed'));
    }, 500);
  }).catch(() => {
    clearInterval(progressInterval);
    clearInterval(tickerInterval);
  });
}

function getDeviceIcon(device) {
  switch (device) {
    case 'laptop': return 'laptop';
    case 'mobile': return 'smartphone';
    case 'tv': return 'tv';
    case 'refrigerator': return 'snowflake';
    case 'ac': return 'wind';
    case 'washing_machine': return 'washing-machine';
    case 'printer': return 'printer';
    case 'router': return 'wifi';
    default: return 'cpu';
  }
}

// --- API Key Modal ---
function initApiKeyModal() {
  // Pre-fill saved key
  if (AppState.geminiApiKey) {
    Elements.geminiApiKeyInput.value = AppState.geminiApiKey;
  }

  Elements.apiSettingsBtn.addEventListener('click', () => {
    Elements.apiSettingsModal.classList.add('active');
    Elements.apiKeyStatus.className = 'modal-status';
    Elements.apiKeyStatus.textContent = '';
  });

  Elements.closeModalBtn.addEventListener('click', () => {
    Elements.apiSettingsModal.classList.remove('active');
  });

  Elements.apiSettingsModal.addEventListener('click', (e) => {
    if (e.target === Elements.apiSettingsModal) {
      Elements.apiSettingsModal.classList.remove('active');
    }
  });

  Elements.toggleKeyVisibility.addEventListener('click', () => {
    const isPassword = Elements.geminiApiKeyInput.type === 'password';
    Elements.geminiApiKeyInput.type = isPassword ? 'text' : 'password';
    Elements.eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
    lucide.createIcons();
  });

  Elements.saveApiKeyBtn.addEventListener('click', () => {
    const key = Elements.geminiApiKeyInput.value.trim();
    if (!key) {
      Elements.apiKeyStatus.className = 'modal-status error';
      Elements.apiKeyStatus.textContent = 'Please enter a valid API key.';
      return;
    }
    if (key.length < 20) {
      Elements.apiKeyStatus.className = 'modal-status error';
      Elements.apiKeyStatus.textContent = 'Invalid key. Please enter a valid Gemini API key.';
      return;
    }
    AppState.geminiApiKey = key;
    Elements.apiKeyStatus.className = 'modal-status success';
    Elements.apiKeyStatus.textContent = '✓ API key saved successfully!';
    setTimeout(() => Elements.apiSettingsModal.classList.remove('active'), 1200);
  });
}

// --- Groq API Call ---
async function callGeminiAPI(brand, model, year, errCode, description, symptoms, deviceType) {
  const apiKey = AppState.geminiApiKey;
  if (!apiKey) throw new Error('NO_API_KEY');

  const lang = AppState.currentLang;
  const langInstruction = lang === 'HI' ? 'Respond in Hindi language only.' : 'Respond in English language only.';
  const descTrimmed = description ? description.slice(0, 200) : '';

  const messages = [
    { role: 'system', content: `Electronics repair diagnostic AI. ${langInstruction} Reply ONLY valid JSON, no markdown: {"severity":"critical|moderate|minor","summary":"...","issues":[{"name":"...","confidence":90,"type":"diy|tech","cost":"\u20b9500-2000","parts":"...","time":"30 Mins","desc":"...","suggestions":"step1. step2."}],"chat_welcome":"..."}` },
    { role: 'user', content: `Device:${deviceType} Brand:${brand} Model:${model} Year:${year||'?'} Error:${errCode||'none'} Symptoms:${symptoms.join(',')} Desc:${descTrimmed}` }
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 1000 })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Groq API error');
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  const cleaned = rawText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
  return JSON.parse(cleaned);
}

// --- Diagnostic Engine & Compiler ---
async function compileDiagnosticsData() {
  const brand = document.getElementById('device-brand').value.trim();
  const model = document.getElementById('device-model').value.trim();
  const errCode = document.getElementById('device-error-code').value.trim().toUpperCase();
  const description = Elements.deviceDescription.value;
  const checkedSymptoms = Array.from(
    Elements.dynamicSymptomsContainer.querySelectorAll('input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  let finalIssues = [];
  let severity = 'moderate';
  let chatWelcome = null;

  try {
    const geminiResult = await callGeminiAPI(brand, model,
      document.getElementById('device-year').value,
      errCode, description, checkedSymptoms, AppState.selectedDevice
    );

    finalIssues = geminiResult.issues || [];
    severity = geminiResult.severity || 'moderate';
    chatWelcome = geminiResult.chat_welcome || null;

  } catch (err) {
    console.error('Gemini API Error:', err.message);
    navigateToStep(3);
    if (err.message === 'NO_API_KEY') {
      Elements.apiSettingsModal.classList.add('active');
      Elements.apiKeyStatus.className = 'modal-status error';
      Elements.apiKeyStatus.textContent = AppState.currentLang === 'HI' ? 'डायग्नोसिस के लिए API key जरूरी है।' : 'API key required to run diagnostics.';
    } else {
      Swal.fire({
        icon: 'error',
        title: AppState.currentLang === 'HI' ? 'AI विश्लेषण विफल' : 'AI Analysis Failed',
        text: err.message,
        confirmButtonText: AppState.currentLang === 'HI' ? 'ठीक है' : 'OK'
      });
    }
    return;
  }

  // Sort by confidence
  finalIssues.sort((a, b) => b.confidence - a.confidence);
  AppState.diagnosedIssue = finalIssues[0];

  // --- Render Results UI ---
  Elements.resultModelText.textContent = `${brand} ${model}`;
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  Elements.resultDateText.textContent = new Date().toLocaleDateString(
    AppState.currentLang === 'HI' ? 'hi-IN' : 'en-US', dateOptions
  );

  Elements.resultStatusBadge.className = `summary-badge ${severity}`;
  const sevLabel = LangDictionary[AppState.currentLang][`${severity}_fault`] || 'Fault Found';
  Elements.resultSummarySeverity.textContent = sevLabel;

  // Issues list
  Elements.diagnosticIssuesList.innerHTML = '';
  finalIssues.forEach(issue => {
    const badgeLabel = LangDictionary[AppState.currentLang][issue.type] || issue.type;
    const item = document.createElement('div');
    item.className = 'issue-item';
    item.innerHTML = `
      <div class="issue-main">
        <div class="issue-title-flex">
          <h4 class="issue-title">${issue.name}</h4>
          <span class="issue-badge ${issue.type}">${badgeLabel}</span>
        </div>
        <p class="issue-desc">${issue.desc}</p>
      </div>
      <div class="issue-side-score">
        <span class="confidence-label" data-en="Confidence" data-hi="विश्वास स्तर">Confidence</span>
        <span class="confidence-val">${issue.confidence}%</span>
      </div>`;
    Elements.diagnosticIssuesList.appendChild(item);
  });

  // Cost range
  let minPrice = 0, maxPrice = 0;
  finalIssues.forEach(issue => {
    const costClean = issue.cost.replace(/[₹,]/g, '');
    const prices = costClean.split('–').map(p => parseInt(p.trim()));
    if (!isNaN(prices[0])) {
      if (minPrice === 0 || prices[0] < minPrice) minPrice = prices[0];
      const high = prices[1] || prices[0];
      if (high > maxPrice) maxPrice = high;
    }
  });
  Elements.minCostVal.textContent = `₹${minPrice}`;
  Elements.maxCostVal.textContent = `₹${maxPrice}`;
  let barPercent = maxPrice > 5000 ? 85 : maxPrice > 1500 ? 60 : 25;
  Elements.costRangeActiveIndicator.style.width = `${barPercent}%`;

  // Parts table
  Elements.partsCostTableBody.innerHTML = '';
  finalIssues.forEach(issue => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${issue.parts}</strong></td>
      <td><span class="text-cyan">${issue.confidence}%</span></td>
      <td>${issue.cost}</td>
      <td>${issue.time}</td>`;
    Elements.partsCostTableBody.appendChild(tr);
  });

  // DIY Accordion
  Elements.diyActionStepsContainer.innerHTML = '';
  finalIssues.forEach((issue, idx) => {
    const accordion = document.createElement('div');
    accordion.className = `diy-accordion-item ${idx === 0 ? 'active' : ''}`;
    const bullets = issue.suggestions.split('.').filter(s => s.trim().length > 2);
    let listHTML = `<ol class="diy-list">`;
    bullets.forEach(b => { listHTML += `<li>${b.trim()}.</li>`; });
    listHTML += `</ol>`;
    accordion.innerHTML = `
      <button class="diy-header-btn" type="button">
        <span>${issue.name} - Resolution Instructions</span>
        <i data-lucide="chevron-down" class="diy-arrow-icon"></i>
      </button>
      <div class="diy-accordion-content">${listHTML}</div>`;
    accordion.querySelector('.diy-header-btn').addEventListener('click', () => {
      const isActive = accordion.classList.contains('active');
      Elements.diyActionStepsContainer.querySelectorAll('.diy-accordion-item').forEach(i => i.classList.remove('active'));
      if (!isActive) accordion.classList.add('active');
    });
    Elements.diyActionStepsContainer.appendChild(accordion);
  });

  // Service Centers
  Elements.serviceCentersList.innerHTML = '';
  ServiceCenters.filter(c => c.match.includes(AppState.selectedDevice)).forEach(center => {
    const card = document.createElement('div');
    card.className = 'center-card';
    card.innerHTML = `
      <div class="center-title-bar">
        <h4 class="center-name">${center.name}</h4>
        <span class="center-rating"><i data-lucide="star"></i> ${center.rating}</span>
      </div>
      <div class="center-info-row"><i data-lucide="map-pin"></i><span>${center.address} (${center.distance})</span></div>
      <div class="center-info-row"><i data-lucide="phone"></i><span>${center.phone}</span></div>
      <div class="center-action-row">
        <button class="center-book-btn" type="button" data-en="Book Appointment" data-hi="अपॉइंटमेंट बुक करें">Book Appointment</button>
      </div>`;
    card.querySelector('.center-book-btn').addEventListener('click', () => {
      Swal.fire({
        icon: 'success',
        title: AppState.currentLang === 'HI' ? 'अपॉइंटमेंट बुक हो गया!' : 'Appointment Requested!',
        text: AppState.currentLang === 'HI' ? `${center.name} आपसे जल्द ही संपर्क करेगा।` : `${center.name} will call you shortly.`,
        confirmButtonText: AppState.currentLang === 'HI' ? 'ठीक है' : 'OK'
      });
    });
    Elements.serviceCentersList.appendChild(card);
  });

  // Print invoice
  populatePrintInvoice({
    device: AppState.selectedDevice, brand, model,
    year: document.getElementById('device-year').value || 'Unknown',
    severity, errorCode: errCode || 'N/A',
    description: Elements.deviceDescription.value,
    symptoms: checkedSymptoms.join(', '), issues: finalIssues
  });

  // Save to history
  saveRecordToHistory({
    id: Date.now(),
    date: new Date().toLocaleDateString(AppState.currentLang === 'HI' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    device: AppState.selectedDevice, brand, model,
    year: document.getElementById('device-year').value || 'Unknown',
    severity, errorCode: errCode || 'N/A',
    description: Elements.deviceDescription.value,
    symptoms: checkedSymptoms.join(', '),
    primaryIssue: finalIssues[0].name,
    confidence: finalIssues[0].confidence,
    cost: finalIssues[0].cost,
    finalIssues
  });

  // Trigger chat welcome with Gemini message if available
  if (chatWelcome) {
    Elements.chatMessagesArea.innerHTML = '';
    appendChatMessage(chatWelcome, 'bot');
    renderChatSuggestions();
  } else {
    triggerBotWelcome(brand, model);
  }

  // Fetch nearby shops if location available
  if (AppState.userLocation) {
    fetchNearbyShops(AppState.userLocation.lat, AppState.userLocation.lng)
      .then(shops => renderNearbyShops(shops, AppState.userLocation.lat, AppState.userLocation.lng))
      .catch(() => {});
  }

  lucide.createIcons();
  updateLanguageTexts();
}

// --- Printable Invoice/Report Generator ---
function populatePrintInvoice(data) {
  document.getElementById('print-ref-number').textContent = Math.floor(1000 + Math.random() * 9000);
  document.getElementById('print-date-generated').textContent = new Date().toLocaleDateString();
  
  document.getElementById('print-device-type').textContent = data.device.toUpperCase();
  document.getElementById('print-brand-name').textContent = data.brand;
  document.getElementById('print-model-num').textContent = data.model;
  document.getElementById('print-purchase-year').textContent = data.year;
  document.getElementById('print-severity').textContent = data.severity.toUpperCase();
  document.getElementById('print-error-code').textContent = data.errorCode;
  document.getElementById('print-problem-desc').textContent = data.description;
  document.getElementById('print-symptoms-list').textContent = data.symptoms;

  // Print Issues Table
  const tableBody = document.getElementById('print-issues-table-body');
  tableBody.innerHTML = '';
  data.issues.forEach(issue => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${issue.name}</strong></td>
      <td>${issue.confidence}%</td>
      <td>${issue.type.toUpperCase()}</td>
      <td>${issue.cost}</td>
      <td>${issue.parts}</td>
    `;
    tableBody.appendChild(tr);
  });

  // Print suggestions steps
  const stepsList = document.getElementById('print-suggestions-ordered-list');
  stepsList.innerHTML = '';
  data.issues.forEach(issue => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${issue.name}:</strong> ${issue.suggestions}`;
    stepsList.appendChild(li);
  });
}

function triggerTechnicalPrint() {
  window.print();
}

// --- Voice Recognition Interface (Speech API) ---
function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    // Hide mic overlay support info or show warning on click
    Elements.voiceInputBtn.addEventListener('click', () => {
      Swal.fire({
        icon: 'error',
        title: AppState.currentLang === 'HI' ? 'सपोर्ट नहीं' : 'Not Supported',
        text: AppState.currentLang === 'HI' ? 'आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता। कृपया गूगल क्रोम का उपयोग करें।' : 'Speech Recognition is not supported in this browser. Please try Google Chrome.',
        confirmButtonText: 'OK'
      });
    });
    return;
  }

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = false;
  
  // Set language dynamically
  rec.lang = AppState.currentLang === 'HI' ? 'hi-IN' : 'en-US';
  
  rec.onstart = () => {
    AppState.isListening = true;
    Elements.voiceInputBtn.classList.add('listening');
    Elements.voiceTranscriptMsg.textContent = AppState.currentLang === 'HI' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now';
    Elements.voiceTranscriptInfo.classList.add('active');
  };

  rec.onend = () => {
    AppState.isListening = false;
    Elements.voiceInputBtn.classList.remove('listening');
    setTimeout(() => {
      Elements.voiceTranscriptInfo.classList.remove('active');
    }, 2000);
  };

  rec.onerror = () => {
    AppState.isListening = false;
    Elements.voiceInputBtn.classList.remove('listening');
    Elements.voiceTranscriptMsg.textContent = AppState.currentLang === 'HI' ? 'त्रुटि: आवाज़ समझ नहीं आई' : 'Error transcribing speech.';
  };

  rec.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (Elements.deviceDescription.value) {
      Elements.deviceDescription.value += ' ' + transcript;
    } else {
      Elements.deviceDescription.value = transcript;
    }
    Elements.voiceTranscriptMsg.textContent = AppState.currentLang === 'HI' ? 'सफलतापूर्वक जोड़ा गया!' : 'Text added successfully!';
  };

  Elements.voiceInputBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (AppState.isListening) {
      rec.stop();
    } else {
      rec.lang = AppState.currentLang === 'HI' ? 'hi-IN' : 'en-US';
      rec.start();
    }
  });

  AppState.voiceRecognition = rec;
}

// --- Interactive Chat Engine Simulator ---
function initChatEngine() {
  Elements.chatInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = Elements.chatUserMessageInput.value.trim();
    if (!message) return;
    
    appendChatMessage(message, 'user');
    Elements.chatUserMessageInput.value = '';
    
    // Simulate AI response delay
    setTimeout(() => {
      processChatResponse(message);
    }, 600);
  });
}

function triggerBotWelcome(brand, model) {
  // Clear past messages
  Elements.chatMessagesArea.innerHTML = '';
  
  const devType = AppState.selectedDevice.toUpperCase();
  let welcomeText = LangDictionary[AppState.currentLang].chat_welcome;
  welcomeText = welcomeText.replace('{brand}', brand).replace('{device}', devType).replace('{model}', model);
  
  appendChatMessage(welcomeText, 'bot');
  renderChatSuggestions();
}

function appendChatMessage(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  
  Elements.chatMessagesArea.appendChild(bubble);
  Elements.chatMessagesArea.scrollTop = Elements.chatMessagesArea.scrollHeight;
}

function renderChatSuggestions() {
  Elements.chatSuggestionsContainer.innerHTML = '';
  const lang = AppState.currentLang;
  
  const suggestions = [
    LangDictionary[lang].chat_suggest_1,
    LangDictionary[lang].chat_suggest_2,
    LangDictionary[lang].chat_suggest_3,
    LangDictionary[lang].chat_suggest_4
  ];

  suggestions.forEach(text => {
    const chip = document.createElement('button');
    chip.className = 'chat-chip';
    chip.textContent = text;
    chip.type = 'button';
    
    chip.addEventListener('click', () => {
      appendChatMessage(text, 'user');
      setTimeout(() => {
        processChatResponse(text);
      }, 500);
    });
    
    Elements.chatSuggestionsContainer.appendChild(chip);
  });
}

async function processChatResponse(query) {
  const lang = AppState.currentLang;
  const brand = document.getElementById('device-brand').value.trim();
  const model = document.getElementById('device-model').value.trim();
  const mainIssue = AppState.diagnosedIssue;

  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble bot typing-indicator';
  typingBubble.id = typingId;
  typingBubble.textContent = lang === 'HI' ? 'टाइप हो रहा है...' : 'Typing...';
  Elements.chatMessagesArea.appendChild(typingBubble);
  Elements.chatMessagesArea.scrollTop = Elements.chatMessagesArea.scrollHeight;

  try {
    const apiKey = AppState.geminiApiKey;
    if (!apiKey) throw new Error('NO_API_KEY');

    const langInstruction = lang === 'HI' ? 'Respond in Hindi only.' : 'Respond in English only.';
    const issueContext = mainIssue ? `Issue:${mainIssue.name}. ${mainIssue.desc?.slice(0,100)}.` : '';
    const prompt = `ElectraAI repair chatbot. Device:${AppState.selectedDevice} Brand:${brand} Model:${model}. ${issueContext} ${langInstruction} User:"${query.slice(0,150)}" Reply concise plain text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `ElectraAI repair chatbot. Device:${AppState.selectedDevice} Brand:${brand} Model:${model}. ${issueContext} ${langInstruction}` },
          { role: 'user', content: query.slice(0, 150) }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'OpenAI API error');
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('empty_response');

    document.getElementById(typingId)?.remove();
    appendChatMessage(reply, 'bot');

  } catch (err) {
    document.getElementById(typingId)?.remove();
    console.error('Chat Gemini Error:', err.message);
    if (err.message === 'NO_API_KEY') {
      appendChatMessage(lang === 'HI' ? 'API key सेट नहीं है। कृपया Settings में जाकर Gemini API key डालें।' : 'API key not set. Please add your Gemini API key in Settings.', 'bot');
    } else {
      appendChatMessage(lang === 'HI' ? `AI से जवाब नहीं मिला: ${err.message}` : `AI error: ${err.message}`, 'bot');
    }
  }
}

// --- Diagnostic History Management ---

function initHistoryHandler() {
  // Load initial history from localStorage
  try {
    const localData = localStorage.getItem('electra_history');
    if (localData) {
      AppState.history = JSON.parse(localData);
    }
  } catch (e) {
    console.error("Failed to load history from localStorage:", e);
    AppState.history = [];
  }
  updateHistoryBadge();

  // Toggle drawer open
  if (Elements.historyToggleBtn) {
    Elements.historyToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loadHistoryList();
      if (Elements.historyDrawer) Elements.historyDrawer.classList.add('active');
      if (Elements.drawerOverlay) Elements.drawerOverlay.classList.add('active');
    });
  }

  // Close drawer
  const closeDrawer = () => {
    if (Elements.historyDrawer) Elements.historyDrawer.classList.remove('active');
    if (Elements.drawerOverlay) Elements.drawerOverlay.classList.remove('active');
  };

  if (Elements.closeDrawerBtn) Elements.closeDrawerBtn.addEventListener('click', closeDrawer);
  if (Elements.drawerOverlay) Elements.drawerOverlay.addEventListener('click', closeDrawer);

  // Clear all history
  if (Elements.clearHistoryBtn) {
    Elements.clearHistoryBtn.addEventListener('click', () => {
      Swal.fire({
        icon: 'warning',
        title: AppState.currentLang === 'HI' ? 'क्या आप sure हैं?' : 'Are you sure?',
        text: AppState.currentLang === 'HI' ? 'सारा इतिहास मिट जाएगा।' : 'All history will be deleted.',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        confirmButtonText: AppState.currentLang === 'HI' ? 'हाँ, मिटाएं' : 'Yes, Clear',
        cancelButtonText: AppState.currentLang === 'HI' ? 'रद्द करें' : 'Cancel'
      }).then(result => {
      if (result.isConfirmed) {
        AppState.history = [];
        localStorage.removeItem('electra_history');
        updateHistoryBadge();
        loadHistoryList();
        closeDrawer();
      }
      });
    });
  }
}

function saveRecordToHistory(record) {
  AppState.history.unshift(record);
  if (AppState.history.length > 25) AppState.history.pop();
  try {
    localStorage.setItem('electra_history', JSON.stringify(AppState.history));
  } catch (e) {
    console.error("Failed to save history to localStorage:", e);
  }
  updateHistoryBadge();
}

function deleteHistoryRecord(id) {
  AppState.history = AppState.history.filter(r => r.id !== id);
  try {
    localStorage.setItem('electra_history', JSON.stringify(AppState.history));
  } catch (e) {}
  updateHistoryBadge();
  loadHistoryList();
}

function updateHistoryBadge() {
  const count = AppState.history.length;
  if (Elements.historyBadgeCount) {
    if (count > 0) {
      Elements.historyBadgeCount.textContent = count;
      Elements.historyBadgeCount.style.display = 'block';
    } else {
      Elements.historyBadgeCount.style.display = 'none';
    }
  }
}

function loadHistoryList() {
  const container = Elements.historyListContainer;
  if (!container) return;
  container.innerHTML = '';
  
  if (AppState.history.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 10px; color: var(--text-muted); font-size:13px;">
        <i data-lucide="info" style="width:28px; height:28px; margin-bottom:10px; opacity:0.5;"></i>
        <p data-en="No past analysis found." data-hi="कोई पुराना विश्लेषण नहीं मिला।">No past analysis found.</p>
      </div>
    `;
    updateLanguageTexts();
    lucide.createIcons();
    return;
  }

  AppState.history.forEach(record => {
    const card = document.createElement('div');
    card.className = 'history-item-card';
    
    const viewBtnText = AppState.currentLang === 'HI' ? 'विवरण देखें' : 'View Details';
    const deleteBtnText = AppState.currentLang === 'HI' ? 'हटाएं' : 'Delete';
    const severityLabel = LangDictionary[AppState.currentLang][`${record.severity}_fault`] || record.severity;
    
    card.innerHTML = `
      <div class="history-item-header">
        <div class="history-item-meta">
          <span class="history-item-title">${record.brand} ${record.model}</span>
          <span class="history-item-date">${record.date}</span>
        </div>
      </div>
      <div class="history-item-body">
        <div class="history-item-fault">
          <span data-en="Failure:" data-hi="खराबी:">Failure:</span>
          <span class="history-item-fault-val">${record.primaryIssue}</span>
        </div>
      </div>
      <div class="history-item-actions">
        <span class="history-item-badge ${record.severity}">${severityLabel}</span>
        <div style="display:flex;gap:6px;">
          <button class="history-view-btn" data-id="${record.id}">
            <i data-lucide="eye" style="width:12px; height:12px;"></i>
            <span>${viewBtnText}</span>
          </button>
          <button class="history-delete-btn" data-id="${record.id}" title="${deleteBtnText}">
            <i data-lucide="trash-2" style="width:12px; height:12px;"></i>
          </button>
        </div>
      </div>
    `;
    
    card.querySelector('.history-view-btn').addEventListener('click', () => viewPastRecord(record.id));
    card.querySelector('.history-delete-btn').addEventListener('click', () => deleteHistoryRecord(record.id));

    container.appendChild(card);
  });

  updateLanguageTexts();
  lucide.createIcons();
}

function viewPastRecord(id) {
  const record = AppState.history.find(r => r.id === id);
  if (!record) return;

  // Restore state
  AppState.selectedDevice = record.device;
  document.getElementById('device-brand').value = record.brand;
  document.getElementById('device-model').value = record.model;
  document.getElementById('device-year').value = record.year !== 'Unknown' ? record.year : '';
  document.getElementById('device-error-code').value = record.errorCode !== 'N/A' ? record.errorCode : '';
  Elements.deviceDescription.value = record.description;
  
  // Set primary issue
  AppState.diagnosedIssue = record.finalIssues[0];
  
  // Render details UI
  Elements.resultModelText.textContent = `${record.brand} ${record.model}`;
  Elements.resultDateText.textContent = record.date;
  
  // Set Severity Badge
  Elements.resultStatusBadge.className = `summary-badge ${record.severity}`;
  const sevLabel = LangDictionary[AppState.currentLang][`${record.severity}_fault`] || "Fault Found";
  Elements.resultSummarySeverity.textContent = sevLabel;
  
  // Dynamic issues list
  Elements.diagnosticIssuesList.innerHTML = '';
  record.finalIssues.forEach(issue => {
    const badgeClass = issue.type;
    const badgeLabel = LangDictionary[AppState.currentLang][issue.type];
    
    const item = document.createElement('div');
    item.className = 'issue-item';
    item.innerHTML = `
      <div class="issue-main">
        <div class="issue-title-flex">
          <h4 class="issue-title">${issue.name}</h4>
          <span class="issue-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <p class="issue-desc">${issue.desc}</p>
      </div>
      <div class="issue-side-score">
        <span class="confidence-label" data-en="Confidence" data-hi="विश्वास स्तर">Confidence</span>
        <span class="confidence-val">${issue.confidence}%</span>
      </div>
    `;
    Elements.diagnosticIssuesList.appendChild(item);
  });

  // Cost estimates ranges
  let minPrice = 0;
  let maxPrice = 0;
  record.finalIssues.forEach(issue => {
    const costClean = issue.cost.replace(/[₹,]/g, '');
    const prices = costClean.split('–').map(p => parseInt(p.trim()));
    if (prices[0] !== undefined) {
      if (minPrice === 0 || prices[0] < minPrice) minPrice = prices[0];
      if (prices[1] !== undefined) {
        if (prices[1] > maxPrice) maxPrice = prices[1];
      } else {
        if (prices[0] > maxPrice) maxPrice = prices[0];
      }
    }
  });

  Elements.minCostVal.textContent = `₹${minPrice}`;
  Elements.maxCostVal.textContent = `₹${maxPrice}`;
  
  let barPercent = 30;
  if (maxPrice > 5000) barPercent = 85;
  else if (maxPrice > 1500) barPercent = 60;
  else barPercent = 25;
  
  Elements.costRangeActiveIndicator.style.width = `${barPercent}%`;

  // Parts Table Body
  Elements.partsCostTableBody.innerHTML = '';
  record.finalIssues.forEach(issue => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${issue.parts}</strong></td>
      <td><span class="text-cyan">${issue.confidence}%</span></td>
      <td>${issue.cost}</td>
      <td>${issue.time}</td>
    `;
    Elements.partsCostTableBody.appendChild(tr);
  });

  // Action Steps Guide Accordion
  Elements.diyActionStepsContainer.innerHTML = '';
  record.finalIssues.forEach((issue, idx) => {
    const accordion = document.createElement('div');
    accordion.className = `diy-accordion-item ${idx === 0 ? 'active' : ''}`;
    const bullets = issue.suggestions.split('.').filter(s => s.trim().length > 2);
    let listHTML = `<ol class="diy-list">`;
    bullets.forEach(b => {
      listHTML += `<li>${b.trim()}.</li>`;
    });
    listHTML += `</ol>`;

    accordion.innerHTML = `
      <button class="diy-header-btn" type="button">
        <span>${issue.name} - Resolution Instructions</span>
        <i data-lucide="chevron-down" class="diy-arrow-icon"></i>
      </button>
      <div class="diy-accordion-content">
        ${listHTML}
      </div>
    `;

    const btn = accordion.querySelector('.diy-header-btn');
    btn.addEventListener('click', () => {
      const isActive = accordion.classList.contains('active');
      Elements.diyActionStepsContainer.querySelectorAll('.diy-accordion-item').forEach(item => item.classList.remove('active'));
      if (!isActive) {
        accordion.classList.add('active');
      }
    });

    Elements.diyActionStepsContainer.appendChild(accordion);
  });

  // Render Service centers matching device
  Elements.serviceCentersList.innerHTML = '';
  const matchingCenters = ServiceCenters.filter(c => c.match.includes(AppState.selectedDevice));
  matchingCenters.forEach(center => {
    const card = document.createElement('div');
    card.className = 'center-card';
    card.innerHTML = `
      <div class="center-title-bar">
        <h4 class="center-name">${center.name}</h4>
        <span class="center-rating"><i data-lucide="star"></i> ${center.rating}</span>
      </div>
      <div class="center-info-row">
        <i data-lucide="map-pin"></i>
        <span>${center.address} (${center.distance})</span>
      </div>
      <div class="center-info-row">
        <i data-lucide="phone"></i>
        <span>${center.phone}</span>
      </div>
      <div class="center-action-row">
        <button class="center-book-btn" type="button" data-en="Book Appointment" data-hi="अपॉइंटमेंट बुक करें">Book Appointment</button>
      </div>
    `;
    card.querySelector('.center-book-btn').addEventListener('click', () => {
      Swal.fire({
        icon: 'success',
        title: AppState.currentLang === 'HI' ? 'अपॉइंटमेंट बुक हो गया!' : 'Appointment Requested!',
        text: AppState.currentLang === 'HI' ? `${center.name} आपसे जल्द ही संपर्क करेगा।` : `${center.name} will call you shortly to confirm standard slot.`,
        confirmButtonText: AppState.currentLang === 'HI' ? 'ठीक है' : 'OK'
      });
    });
    Elements.serviceCentersList.appendChild(card);
  });

  // Populate technical print metadata
  populatePrintInvoice({
    device: AppState.selectedDevice,
    brand: record.brand,
    model: record.model,
    year: record.year,
    severity: record.severity,
    errorCode: record.errorCode,
    description: record.description,
    symptoms: record.symptoms,
    issues: record.finalIssues
  });

  // Pre-load Welcoming chatbot message
  triggerBotWelcome(record.brand, record.model);

  // Close the drawer and overlay
  if (Elements.historyDrawer) Elements.historyDrawer.classList.remove('active');
  if (Elements.drawerOverlay) Elements.drawerOverlay.classList.remove('active');

  // Go to results step
  Elements.stepPanels.forEach(panel => panel.classList.remove('active'));
  Elements.resultsDashboard.classList.add('active');
  Elements.progressBarFill.style.width = `100%`;
  Elements.stepIndicators.forEach(indicator => indicator.classList.add('completed'));

  lucide.createIcons();
  updateLanguageTexts();
}

// --- Location Handler ---
function initLocationHandler() {
  const btn = document.getElementById('share-location-btn');
  const statusText = document.getElementById('location-status-text');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      statusText.textContent = AppState.currentLang === 'HI' ? 'Location support nahi hai.' : 'Geolocation not supported.';
      return;
    }

    btn.disabled = true;
    statusText.textContent = AppState.currentLang === 'HI' ? 'Location dhundh raha hai...' : 'Fetching location...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        AppState.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        btn.innerHTML = '<i data-lucide="check-circle"></i> <span>' + (AppState.currentLang === 'HI' ? 'Location मिल गई' : 'Location Captured') + '</span>';
        btn.style.borderColor = 'var(--color-success)';
        btn.style.color = 'var(--color-success)';
        statusText.textContent = AppState.currentLang === 'HI'
          ? `📍 ${AppState.userLocation.lat.toFixed(4)}, ${AppState.userLocation.lng.toFixed(4)}`
          : `📍 ${AppState.userLocation.lat.toFixed(4)}, ${AppState.userLocation.lng.toFixed(4)}`;
        lucide.createIcons();
      },
      () => {
        btn.disabled = false;
        statusText.textContent = AppState.currentLang === 'HI' ? '❌ Location access denied.' : '❌ Location access denied.';
      },
      { timeout: 10000 }
    );
  });
}

// --- Fetch Nearby Shops via OpenStreetMap Overpass API ---
async function fetchNearbyShops(lat, lng) {
  const radius = 10000; // 10km in meters
  const query = `
    [out:json][timeout:15];
    (
      node["shop"="electronics"](around:${radius},${lat},${lng});
      node["shop"="mobile_phone"](around:${radius},${lat},${lng});
      node["shop"="computer"](around:${radius},${lat},${lng});
      node["repair"="electronics"](around:${radius},${lat},${lng});
    );
    out body 10;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  });

  const data = await res.json();
  return data.elements || [];
}

function renderNearbyShops(shops, lat, lng) {
  const container = document.getElementById('nearby-shops-container');
  const list = document.getElementById('nearby-shops-list');
  if (!container || !list) return;

  if (shops.length === 0) {
    container.style.display = 'block';
    list.innerHTML = `<p style="font-size:12px; color:var(--text-muted); padding:0 16px 12px;">
      ${AppState.currentLang === 'HI' ? '10km में कोई दुकान नहीं मिली।' : 'No shops found within 10km.'}
    </p>`;
    lucide.createIcons();
    return;
  }

  container.style.display = 'block';
  list.innerHTML = '';

  shops.forEach(shop => {
    const name = shop.tags?.name || (AppState.currentLang === 'HI' ? 'इलेक्ट्रॉनिक्स शॉप' : 'Electronics Shop');
    const addr = shop.tags?.['addr:street'] || shop.tags?.['addr:full'] || '';
    const phone = shop.tags?.phone || shop.tags?.['contact:phone'] || '';

    // Calculate distance
    const dist = getDistanceKm(lat, lng, shop.lat, shop.lon);
    const mapsUrl = `https://www.google.com/maps?q=${shop.lat},${shop.lon}`;

    const card = document.createElement('div');
    card.className = 'center-card';
    card.innerHTML = `
      <div class="center-title-bar">
        <h4 class="center-name">${name}</h4>
        <span class="center-rating" style="background:var(--color-info-bg); color:var(--color-info);">
          <i data-lucide="navigation"></i> ${dist} km
        </span>
      </div>
      ${addr ? `<div class="center-info-row"><i data-lucide="map-pin"></i><span>${addr}</span></div>` : ''}
      ${phone ? `<div class="center-info-row"><i data-lucide="phone"></i><a href="tel:${phone}" class="shop-call-link">${phone} <i data-lucide="phone-call" style="width:11px;height:11px;"></i></a></div>` : ''}
      <div class="center-action-row">
        <a href="${mapsUrl}" target="_blank" class="center-book-btn" style="text-decoration:none;">
          <i data-lucide="map" style="width:11px;height:11px;"></i>
          ${AppState.currentLang === 'HI' ? 'Maps पर देखें' : 'View on Maps'}
        </a>
      </div>`;
    list.appendChild(card);
  });

  lucide.createIcons();
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}
