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
    // Auth Guard for Dashboard
    if (pageId === 'dashboard' && !isAuthenticated()) {
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
        history.pushState(null, null, `#${pageId}`);
    }
}

// Nav link clicks
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetAttr = link.getAttribute('href');
        if (targetAttr && targetAttr.startsWith('#')) {
            e.preventDefault();
            navigateTo(targetAttr.substring(1));
        }
    });
});

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

// --- DATA MIGRATION & PERMANENT STORAGE ---
const DB_KEY = 'DLSSPAK_DATABASE';

function getMergedDatabase() {
    let currentData = JSON.parse(localStorage.getItem(DB_KEY));
    
    // Rescue Mission: If first time with permanent key, scan for all old version data
    if (!currentData) {
        let rescued = [];
        const versions = ['dl_records_v4', 'dl_records_v3', 'dl_records_v2', 'dl_records_v1', 'dl_records'];
        
        versions.forEach(v => {
            const oldData = JSON.parse(localStorage.getItem(v));
            if (oldData && Array.isArray(oldData)) {
                // Merge unique records based on CNIC
                oldData.forEach(newRec => {
                    if (!rescued.find(r => r.cnic === newRec.cnic)) {
                        rescued.push(newRec);
                    }
                });
            }
        });

        if (rescued.length > 0) {
            currentData = rescued;
        } else {
            // Final fallback to default record if absolutely nothing found
            currentData = [
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
        }
        localStorage.setItem(DB_KEY, JSON.stringify(currentData));
    }
    return currentData;
}

let records = getMergedDatabase();

function saveRecords() {
    localStorage.setItem(DB_KEY, JSON.stringify(records));
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

    const filtered = records.filter(r => {
        return r.fullName.toLowerCase().includes(searchTerm) || r.cnic.includes(searchTerm);
    });

    recordsTableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        noDataMessage.classList.remove('hidden');
    } else {
        noDataMessage.classList.add('hidden');
        filtered.forEach(r => {
            const row = document.createElement('tr');
            row.innerHTML = `
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
                    <span class="status-badge ${r.status.toLowerCase()}">${r.status}</span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${r.vehicles.join(', ')}</div>
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
        document.getElementById('modalTitle').innerText = 'Add New License Record';
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

    const data = {
        fullName: document.getElementById('fullName').value.toUpperCase(),
        cnic: cnic,
        fatherName: document.getElementById('fatherName').value.toUpperCase(),
        nationalLicense: document.getElementById('nationalLicense').value.toUpperCase(),
        issuedFrom: document.getElementById('issuedFrom').value,
        issueDate: issueDate,
        expiryDate: expiryDate,
        status: document.getElementById('status').value,
        photoUrl: document.getElementById('photoUrl').value,
        vehicles: selectedVehicles,
        
        // Optional Fields
        dob: document.getElementById('dob').value,
        address: document.getElementById('address').value,
        height: document.getElementById('height').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        callNumber: callNumber,
        passportNum: document.getElementById('passportNum').value.toUpperCase()
    };

    if (editId) {
        const index = records.findIndex(r => r.id === editId);
        if (index !== -1) records[index] = { ...records[index], ...data };
    } else {
        data.id = data.cnic + Date.now();
        records.push(data);
    }

    saveRecords();
    renderRecords();
    toggleModal(false);
});

window.deleteRecord = function(id) {
    if (confirm('Are you sure you want to delete this record permanentally? This cannot be undone.')) {
        records = records.filter(r => r.id !== id);
        saveRecords();
        renderRecords();
    }
};

window.openEditModal = function(id) {
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
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?cnic=' + cnicInput + '#verify';
        window.history.pushState({path:newUrl},'',newUrl);
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
    dashboardSearch?.addEventListener('input', renderRecords);

    // Check for permalink ?cnic=...
    const urlParams = new URLSearchParams(window.location.search);
    const cnicParam = urlParams.get('cnic');
    if (cnicParam) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = cnicParam;
        performVerify(cnicParam, true);
        
        // Remove the CNIC from the URL to prevent re-triggering upon refresh
        if (history.replaceState) {
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "#verify";
            window.history.replaceState({path:cleanUrl}, '', cleanUrl);
        }
    }
});

// ID Card Auto-formatter (Applied to both Main Search and Modal Input)
(function initIdFormatter() {
    const inputs = [document.getElementById('cnicNum'), document.getElementById('searchInput')];
    inputs.forEach(idInput => {
        if (!idInput) return;
        idInput.addEventListener('input', function() {
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
    loginSection.classList.remove('hidden');
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
    // Navigating away from dashboard automatically handles logging out
    // via the navigateTo function's built-in safeguard
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
        // Auto-clear on tab hide removed per user request

        
        // Clear auth 
        if (isAuthenticated()) {
            isAppAuthenticated = false;
            navigateTo('home');
        }
    }
});