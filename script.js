// script.js

// --- NAVIGATION LOGIC ---
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');
const menuToggle = document.querySelector('.menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

const ADMIN_CREDENTIALS = {
    email: 'DLIMSFAISALABAD@GMAIL.COM',
    password: 'abc@987654321#',
    pin: '#03007612274#'
};

let isAppAuthenticated = false;

function isAuthenticated() {
    return isAppAuthenticated === true;
}

function navigateTo(pageId) {
    console.log("Navigating to:", pageId);
    // Auth Guard for Dashboard
    if (pageId === 'dashboard' && !isAuthenticated()) {
        console.log("Auth required for dashboard - showing login.");
        showLoginOverlay();
        return;
    }

    // Auto-logout when switching to any other section from Dashboard
    if (pageId !== 'dashboard' && isAuthenticated()) {
        isAppAuthenticated = false;
    }

    // Auto-clear logic removed per user request for record persistence


    pageSections.forEach(section => section.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    const targetSection = document.getElementById(pageId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo(0, 0);
    } else {
        document.getElementById('home').classList.add('active');
    }

    const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    navLinksContainer.classList.remove('active');
    triggerScrollAnimations();

    if (history.pushState) {
        if (pageId === 'verify') {
            // Keep current search params if they exist, or just set hash
            history.pushState(null, null, window.location.search + `#${pageId}`);
        } else {
            // Clean URL when navigating away from verify
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `#${pageId}`;
            history.pushState(null, null, cleanUrl);
        }
    }
}

// Nav link clicks
function initNavListeners() {
    const freshNavLinks = document.querySelectorAll('.nav-link');
    freshNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetAttr = link.getAttribute('href');
            console.log("Nav link clicked:", targetAttr);
            if (targetAttr && targetAttr.startsWith('#')) {
                e.preventDefault();
                navigateTo(targetAttr.substring(1));
            }
        });
    });
}
initNavListeners();

// Logo link clicks (navbar + footer)
document.querySelectorAll('a.logo, a.footer-logo').forEach(logoLink => {
    logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
    });
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('nav') && navLinksContainer.classList.contains('active')) {
        navLinksContainer.classList.remove('active');
    }
});

// Sticky Navbar
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

// --- SCROLL ANIMATIONS ---
// --- SCROLL ANIMATIONS (Intersection Observer) ---
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

function triggerScrollAnimations() {
    const animElements = document.querySelectorAll('.page-section.active .scroll-anim');
    animElements.forEach(el => {
        scrollObserver.observe(el);
    });
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    triggerScrollAnimations();
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        navigateTo(hash);
    }
});

// Back/forward browser navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1) || 'home';
    navigateTo(hash);
});

// --- AUTO SLIDER LOGIC ---
(function initSlider() {
    const track = document.getElementById('sliderTrack');
    const dots = document.querySelectorAll('#sliderDots .dot');
    if (!track || dots.length === 0) return;

    const total = dots.length;
    let current = 0;
    let timer;

    function goTo(index) {
        current = (index + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        dots[current].classList.add('active');

        // Sequential Content Animation
        const slides = track.querySelectorAll('.slide');
        slides.forEach((s, i) => {
            const elements = s.querySelectorAll('.slide-tag, h2, p, .slide-btn');
            if (i === current) {
                elements.forEach((el, idx) => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, 200 + (idx * 150));
                });
            } else {
                elements.forEach(el => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(10px)';
                    el.style.transition = 'none';
                });
            }
        });
    }

    function next() { goTo(current + 1); }
    function startAuto() { timer = setInterval(next, 4000); }
    function stopAuto() { clearInterval(timer); }

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            stopAuto();
            goTo(parseInt(dot.dataset.index));
            startAuto();
        });
    });

    // Pause on hover
    const wrapper = document.querySelector('.slider-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAuto);
        wrapper.addEventListener('mouseleave', startAuto);
    }

    // Intercept slide CTA links through SPA router
    document.querySelectorAll('.slide-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navigateTo(href.substring(1));
            }
        });
    });

    startAuto();
})();

// --- CLOUD DATABASE CONFIGURATION (FIREBASE) ---
const firebaseConfig = {
    apiKey: "AIzaSyA_XFRt4zY6pl4cg5_XvP6LCrk9D34NHMU",
    authDomain: "passport-web-ca6b0.firebaseapp.com",
    databaseURL: "https://passport-web-ca6b0-default-rtdb.firebaseio.com/", // Constructed from project ID
    projectId: "passport-web-ca6b0",
    storageBucket: "passport-web-ca6b0.firebasestorage.app",
    messagingSenderId: "298777292683",
    appId: "1:298777292683:web:393feab13fc1a3cb7e898e"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
} else {
    console.error("Firebase SDK not loaded. Please check your internet connection.");
}

// --- NEW: SUPABASE INITIALIZATION (ONLY FOR PHOTOS) ---
const SUPABASE_URL = "https://iuidnruijsjizrfpnrnz.supabase.co";
const SUPABASE_KEY = "sb_publishable_djGZWJJ4At6fhpRchFlCdg_Jg8eC7AZ";
const BUCKET_NAME = 'webpassport';
let supabaseClient = null;

try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase initialized successfully.");
    } else {
        console.warn("Supabase library not found. Profile photo uploads will be disabled.");
    }
} catch (e) {
    console.error("Supabase Init Error:", e);
}

let db = null;
let recordsRef = null;

try {
    if (typeof firebase !== 'undefined') {
        db = firebase.database();
        recordsRef = db.ref('license_records');
    }
} catch (e) {
    console.error("Firebase DB error:", e);
}

// Initialize records with default data immediately
let records = [
    {
        id: '33100-2756891-3',
        fullName: 'MUHAMMAD TAYYAB',
        cnic: '33100-2756891-3',
        fatherName: 'MUSHTAQ AHMAD',
        nationalLicense: 'DL-23-9687',
        issuedFrom: '2023-06-26',
        issueDate: '2023-06-26',
        expiryDate: '2028-06-25',
        vehicles: ['M/CYCLE', 'LTV'],
        status: 'ACTIVE',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        dob: '1995-12-10',
        address: 'Sector G-11, Islamabad, Pakistan',
        height: '5/7',
        bloodGroup: 'O+',
        callNumber: '03001234567',
        passportNum: 'TP9876543'
    }
];

// Load backup from LocalStorage if it exists
try {
    const backup = localStorage.getItem('dlims_backup_records');
    if (backup) {
        records = JSON.parse(backup);
        console.log("Local backup loaded.");
    }
} catch (e) { console.error("Backup load fail:", e); }

let pendingAutoSearch = new URLSearchParams(window.location.search).get('cnic');

// Initialize data and setup Listener
function initDatabaseSync() {
    recordsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Convert Firebase object to Array
            records = Object.keys(data).map(key => ({
                firebaseKey: key, // Keep internal key for updates/deletes
                ...data[key]
            }));
            console.log("Sync complete: Cloud data loaded.");
            renderRecords(); // Refresh dashboard
            
            // Re-run verify if a search was active to update with cloud data
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value) {
                performVerify(searchInput.value, true);
            }
        }
    });
}

// Call init if recordsRef is available
if (recordsRef) {
    initDatabaseSync();
} else {
    console.warn("Database not available - running in offline mode.");
}

function saveRecords() {
    // 1. Sync to Cloud if available
    if (recordsRef) {
        recordsRef.set(records.map(r => {
            const { firebaseKey, ...cleanRecord } = r;
            return cleanRecord;
        })).then(() => {
            console.log("Success: Cloud Sync Complete.");
        }).catch(err => {
            console.error("Cloud Sync Error:", err);
            // Don't alert here to avoid annoying the user if they are just testing locally
        });
    }

    // 2. Always Save to Local Storage as a reliable backup
    try {
        localStorage.setItem('dlims_backup_records', JSON.stringify(records));
    } catch (e) {
        console.error("Local Storage Error:", e);
    }
}

// Selectors
const recordsTableBody = document.getElementById('recordsTableBody');
const dashboardSearch = document.getElementById('dashboardSearch');
const noDataMessage = document.getElementById('noDataMessage');

const modalOverlay = document.getElementById('modalOverlay');
const recordForm = document.getElementById('recordForm');
const addRecordBtn = document.getElementById('addRecordBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');

// Render Dashboard
function renderRecords() {
    if (!recordsTableBody) return;
    const searchTerm = dashboardSearch.value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';

    const filtered = records.filter(r => {
        const matchesSearch = r.fullName.toLowerCase().includes(searchTerm) || r.cnic.includes(searchTerm);
        const matchesStatus = (statusFilter === 'all') || (r.status.toLowerCase() === statusFilter.toLowerCase());
        return matchesSearch && matchesStatus;
    });

    recordsTableBody.innerHTML = '';

    if (filtered.length === 0) {
        noDataMessage.classList.remove('hidden');
    } else {
        noDataMessage.classList.add('hidden');
        filtered.forEach(r => {
            const row = document.createElement('tr');
            // Ensure status is lowercase for the class, default to 'active' if missing
            const statusClass = (r.status || 'active').toLowerCase();
            const vehiclesList = Array.isArray(r.vehicles) ? r.vehicles.join(', ') : 'None';

            row.innerHTML = `
                <td>
                    <div class="user-profile-cell">
                        <img src="${r.photoUrl}" class="user-img" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(r.fullName)}&background=EEF2FF&color=2563EB';">
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--text-main);">${r.fullName}</div>
                    <div style="font-size: 0.85rem; color: var(--accent-green);">ID: ${r.cnic}</div>
                </td>
                <td>
                    <div style="font-size: 0.9rem;">${r.fatherName}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Lic: ${r.nationalLicense}</div>
                </td>
                <td>
                    <div style="font-size: 0.9rem;">From: ${r.issueDate}</div>
                    <div style="font-size: 0.9rem;">To: ${r.expiryDate}</div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${r.status || 'ACTIVE'}</span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${vehiclesList}</div>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" title="Edit" onclick="openEditModal('${r.id}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon btn-delete" title="Delete" onclick="deleteRecord('${r.id}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            recordsTableBody.appendChild(row);
        });
    }
}

// Modal Toggle
function toggleModal(show = true) {
    if (show) {
        modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        modalOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
        recordForm.reset();
        document.getElementById('editId').value = '';
        document.getElementById('photoUrl').value = '';
        document.getElementById('photoPreview').innerHTML = '<span>No photo selected</span>';
        document.getElementById('modalTitle').innerText = 'Add New License Record';
        // Uncheck all vehicle checkboxes
        document.querySelectorAll('input[name="vehicles"]').forEach(cb => cb.checked = false);
    }
}

addRecordBtn?.addEventListener('click', () => toggleModal(true));
closeModal?.addEventListener('click', () => toggleModal(false));
cancelBtn?.addEventListener('click', () => toggleModal(false));
modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) toggleModal(false);
});

// Form Submission
recordForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const editId = document.getElementById('editId').value;
    const issueDate = document.getElementById('issueDate').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const callNumber = document.getElementById('callNumber').value;
    const cnic = document.getElementById('cnicNum').value;

    if (new Date(expiryDate) <= new Date(issueDate)) {
        alert('Error: Expiry Date must be after Issue Date.');
        return;
    }

    if (callNumber && !/^03\d{9}$/.test(callNumber)) {
        alert('Error: Phone number must be in format 03XXXXXXXXX.');
        return;
    }

    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
        alert('Error: ID Card Number must be in format 12345-1234567-1');
        return;
    }

    const selectedVehicles = Array.from(document.querySelectorAll('input[name="vehicles"]:checked')).map(v => v.value);
    if (selectedVehicles.length === 0) {
        alert('Please select at least one Allowed Vehicle.');
        return;
    }

    // --- NEW: UPLOAD SYSTEM LOGIC ---
    const processSubmission = async () => {
        try {
            console.log("Starting submission process...");
            const photoFile = document.getElementById('photoFile').files[0];
            let finalPhotoUrl = document.getElementById('photoUrl').value;

            if (photoFile) {
                if (!supabaseClient) {
                    console.warn("Supabase SDK missing. Using placeholder for photo.");
                } else {
                    try {
                        const fileName = `${Date.now()}-cropped-${photoFile.name.replace(/\s/g, '_')}`;
                        // Use the croppedBlob if it exists, otherwise the original file
                        const uploadTarget = window.currentCroppedBlob || photoFile;
                        
                        const { data, error } = await supabaseClient.storage
                            .from(BUCKET_NAME)
                            .upload(fileName, uploadTarget);

                        if (error) throw error;

                        const { data: urlData } = supabaseClient.storage
                            .from(BUCKET_NAME)
                            .getPublicUrl(fileName);

                        finalPhotoUrl = urlData.publicUrl;
                        console.log("Photo upload success:", finalPhotoUrl);
                    } catch (err) {
                        console.error("Supabase Upload Error:", err);
                        alert("Note: Photo upload failed, but record will be saved without it.");
                    }
                }
            }

            // Construct the clean data object
            const data = {
                fullName: document.getElementById('fullName').value.toUpperCase(),
                cnic: cnic,
                fatherName: document.getElementById('fatherName').value.toUpperCase(),
                nationalLicense: document.getElementById('nationalLicense').value.toUpperCase(),
                issuedFrom: document.getElementById('issuedFrom').value,
                issueDate: issueDate,
                expiryDate: expiryDate,
                status: document.getElementById('status').value,
                photoUrl: finalPhotoUrl || 'https://ui-avatars.com/api/?name=User&background=EEF2FF&color=2563EB',
                vehicles: selectedVehicles,

                // Optional Fields
                dob: document.getElementById('dob').value || '',
                address: document.getElementById('address').value || '',
                height: document.getElementById('height').value || '',
                bloodGroup: document.getElementById('bloodGroup').value || '',
                callNumber: callNumber || '',
                passportNum: document.getElementById('passportNum').value.toUpperCase() || ''
            };

            if (editId) {
                const index = records.findIndex(r => r.id === editId);
                if (index !== -1) {
                    records[index] = { ...records[index], ...data };
                }
            } else {
                data.id = data.cnic + "-" + Date.now();
                records.push(data);
            }

            console.log("Record processed. Triggering save...");
            saveRecords();
            renderRecords();
            toggleModal(false);
            console.log("Submission complete!");

        } catch (globalErr) {
            console.error("Global Submission Error:", globalErr);
            alert("Unexpected Error during save: " + globalErr.message);
        }
    };

    processSubmission();
});

window.deleteRecord = function (id) {
    if (confirm('Are you sure you want to delete this record permanentally? This cannot be undone.')) {
        records = records.filter(r => r.id !== id);
        saveRecords();
        renderRecords();
    }
};

window.openEditModal = function (id) {
    const r = records.find(record => record.id === id);
    if (!r) return;

    document.getElementById('modalTitle').innerText = 'Edit License Record';
    document.getElementById('editId').value = r.id;
    document.getElementById('fullName').value = r.fullName;
    document.getElementById('cnicNum').value = r.cnic;
    document.getElementById('fatherName').value = r.fatherName;
    document.getElementById('nationalLicense').value = r.nationalLicense;
    document.getElementById('issuedFrom').value = r.issuedFrom;
    document.getElementById('issueDate').value = r.issueDate;
    document.getElementById('expiryDate').value = r.expiryDate;
    document.getElementById('status').value = r.status;
    document.getElementById('photoUrl').value = r.photoUrl;

    // Optional fields
    document.getElementById('dob').value = r.dob || '';
    document.getElementById('address').value = r.address || '';
    document.getElementById('height').value = r.height || '';
    document.getElementById('bloodGroup').value = r.bloodGroup || '';
    document.getElementById('callNumber').value = r.callNumber || '';
    document.getElementById('passportNum').value = r.passportNum || '';

    // Vehicles
    document.querySelectorAll('input[name="vehicles"]').forEach(cb => {
        cb.checked = r.vehicles.includes(cb.value);
    });

    // Handle Upload Preview in Edit Mode
    const preview = document.getElementById('photoPreview');
    if (r.photoUrl) {
        preview.innerHTML = `<img src="${r.photoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
    } else {
        preview.innerHTML = `<span>No photo selected</span>`;
    }

    toggleModal(true);
};

// --- VERIFY PORTAL SYNC & SEARCH ---
const verifyForm = document.getElementById('verifyForm');
const verifyLoading = document.getElementById('verifyLoading');
const verifyResult = document.getElementById('verifyResult');

function clearVerifyResult() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    if (verifyResult) {
        verifyResult.innerHTML = '';
        verifyResult.classList.add('hidden');
    }
}

function performVerify(cnicInput, isAuto = false) {
    if (!cnicInput) return;

    // Switch to verify section if not already there
    navigateTo('verify');

    // Update URL if not an auto-load from URL
    if (!isAuto && history.pushState) {
        // Use URLSearchParams for cleaner URL management
        const url = new URL(window.location);
        url.searchParams.set('cnic', cnicInput);
        url.hash = 'verify';
        window.history.pushState({}, '', url);
    }

    verifyResult.classList.add('hidden');
    verifyResult.innerHTML = '';
    verifyLoading.classList.remove('hidden');

    const delay = isAuto ? 500 : 1200; // Faster for auto-load

    setTimeout(() => {
        verifyLoading.classList.add('hidden');
        verifyResult.classList.remove('hidden');

        // Robust Lookup
        const searchValClean = cnicInput.replace(/\D/g, '').trim();
        const userData = records.find(r => r.cnic.replace(/\D/g, '').trim() === searchValClean);

        if (userData) {
            const isExpired = new Date(userData.expiryDate) < new Date();
            const statusText = userData.status || (isExpired ? 'EXPIRED' : 'ACTIVE');
            const statusClass = statusText === 'ACTIVE' ? 'status-active' : 'status-expired';

            let optionalRows = '';
            if (userData.dob) optionalRows += `<div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${userData.dob}</span></div>`;
            if (userData.bloodGroup) optionalRows += `<div class="info-row"><span class="info-label">Blood Group</span><span class="info-value">${userData.bloodGroup}</span></div>`;
            if (userData.callNumber) optionalRows += `<div class="info-row"><span class="info-label">Phone #</span><span class="info-value">${userData.callNumber}</span></div>`;
            if (userData.address) optionalRows += `<div class="info-row"><span class="info-label">Address</span><span class="info-value">${userData.address}</span></div>`;
            if (userData.height) optionalRows += `<div class="info-row"><span class="info-label">Height</span><span class="info-value">${userData.height}</span></div>`;
            if (userData.passportNum) optionalRows += `<div class="info-row"><span class="info-label">Passport #</span><span class="info-value">${userData.passportNum}</span></div>`;

            verifyResult.innerHTML = `
                <div class="portal-result-card scroll-anim">
                    <div class="profile-photo-container">
                        <img src="${userData.photoUrl}" class="portal-photo" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=EEF2FF&color=2563EB';">
                    </div>
                    <h4 class="holder-title">License Holder</h4>
                    
                    <div class="info-table">
                        <div class="info-row">
                            <span class="info-label">Name</span>
                            <span class="info-value uppercase">${userData.fullName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">CNIC</span>
                            <span class="info-value accent-blue">${userData.cnic}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">S/o W/o D/o</span>
                            <span class="info-value uppercase">${userData.fatherName}</span>
                        </div>
                         <div class="info-row">
                            <span class="info-label">National License</span>
                            <span class="info-value">${userData.nationalLicense}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Issue From</span>
                            <span class="info-value">${userData.issuedFrom}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Valid from</span>
                            <span class="info-value">${userData.issueDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Valid To</span>
                            <span class="info-value">${userData.expiryDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Allowed Vehicles</span>
                            <span class="info-value">${userData.vehicles.join(' ')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status</span>
                            <span class="info-value ${statusClass}">${statusText}</span>
                        </div>
                        
                        <!-- Optional Dynamic Rows -->
                        ${optionalRows}
                    </div>
                </div>
            `;
            // Trigger Reveal Animation
            setTimeout(() => {
                const card = verifyResult.querySelector('.portal-result-card');
                if (card) card.classList.add('reveal');
            }, 50);

        } else {
            verifyResult.innerHTML = `
                <div class="no-record profile-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>No Record Found</h3>
                    <p>No driving record matches this ID number.</p>
                </div>
            `;
        }
    }, delay);
}

verifyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    performVerify(searchInput.value.trim());
});

// Initial Render + Search Listener + Permalink Support
window.addEventListener('DOMContentLoaded', () => {
    renderRecords();
    // --- PHOTO PREVIEW & CROPPING LOGIC ---
    const photoFileInput = document.getElementById('photoFile');
    const photoPreview = document.getElementById('photoPreview');
    const cropModal = document.getElementById('cropModal');
    const imageToCrop = document.getElementById('imageToCrop');
    const confirmCropBtn = document.getElementById('confirmCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    
    let cropper = null;
    window.currentCroppedBlob = null; // Store globally for processSubmission

    photoFileInput?.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            imageToCrop.src = event.target.result;
            cropModal.classList.remove('hidden');
            cropModal.style.display = 'flex';
            
            if (cropper) cropper.destroy();
            
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1, // Fixed square
                viewMode: 1,
                autoCropArea: 1,
                responsive: true
            });
        };
        reader.readAsDataURL(file);
    });

    confirmCropBtn?.addEventListener('click', () => {
        if (!cropper) return;
        
        cropper.getCroppedCanvas({
            width: 500, // Standard size for IDs
            height: 500
        }).toBlob((blob) => {
            window.currentCroppedBlob = blob;
            const croppedUrl = URL.createObjectURL(blob);
            photoPreview.innerHTML = `<img src="${croppedUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
            
            cropModal.classList.add('hidden');
            cropModal.style.display = 'none';
        }, 'image/jpeg', 0.9);
    });

    cancelCropBtn?.addEventListener('click', () => {
        cropModal.classList.add('hidden');
        cropModal.style.display = 'none';
        photoFileInput.value = ''; // Reset file input
    });

    // --- AUTOMATIC QR SEARCH LOGIC (Moved to Global Init) ---
    if (pendingAutoSearch) {
        const cnicToSearch = pendingAutoSearch;
        pendingAutoSearch = null; 
        
        console.log("Triggering auto-search for:", cnicToSearch);
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = cnicToSearch;
            // Short delay to ensure sections are ready
            setTimeout(() => performVerify(cnicToSearch, true), 300);
        }
    }
});

// ID Card Auto-formatter (Applied to both Main Search and Modal Input)
(function initIdFormatter() {
    const inputs = [document.getElementById('cnicNum'), document.getElementById('searchInput')];
    inputs.forEach(idInput => {
        if (!idInput) return;
        idInput.addEventListener('input', function () {
            let val = this.value.replace(/\D/g, '').substring(0, 13);
            let formatted = '';
            if (val.length <= 5) { formatted = val; }
            else if (val.length <= 12) { formatted = val.substring(0, 5) + '-' + val.substring(5); }
            else { formatted = val.substring(0, 5) + '-' + val.substring(5, 12) + '-' + val.substring(12); }
            this.value = formatted;
        });
    });
})();

// --- ADMIN AUTHENTICATION LOGIC ---
const loginSection = document.getElementById('loginSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const nextStepBtn = document.getElementById('nextStepBtn');
const backStepBtn = document.getElementById('backStepBtn');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const logoutBtn = document.getElementById('logoutBtn');

function showLoginOverlay() {
    if (!loginSection) {
        alert("Error: Login box missing in HTML!");
        return;
    }
    console.log("Displaying login overlay...");
    loginSection.classList.remove('hidden');
    loginSection.style.display = 'flex'; // Force visibility
    loginError.classList.add('hidden');
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPin').value = '';
}

nextStepBtn?.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    if (email.toUpperCase() === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        loginError.classList.add('hidden');
    } else {
        loginError.classList.remove('hidden');
        loginError.querySelector('span').textContent = 'Invalid Email or Password';
    }
});

backStepBtn?.addEventListener('click', () => {
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
    loginError.classList.add('hidden');
});

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('loginPin').value;

    if (pin === ADMIN_CREDENTIALS.pin) {
        isAppAuthenticated = true;
        loginSection.classList.add('hidden');
        navigateTo('dashboard');
    } else {
        loginError.classList.remove('hidden');
        loginError.querySelector('span').textContent = 'Invalid Security PIN';
    }
});

logoutBtn?.addEventListener('click', () => {
    isAppAuthenticated = false;
    navigateTo('home');
});

const backToHomeBtn = document.getElementById('backToHomeBtn');
backToHomeBtn?.addEventListener('click', () => {
    navigateTo('home');
});

const authBackBtn = document.getElementById('authBackBtn');
authBackBtn?.addEventListener('click', () => {
    loginSection.classList.add('hidden');
    navigateTo('home');
});

// Auto-logout & Record clear on browser tab visibility hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (isAuthenticated()) {
            isAppAuthenticated = false;
            navigateTo('home');
        }
    }
});
