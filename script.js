document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       1. Sticky Header
       ========================================= */
    const stickyHeader = document.getElementById('stickyHeader');
    
    window.addEventListener('scroll', () => {
        // Appears when scrolling beyond ~400px (approx first fold)
        if (window.scrollY > 400) {
            stickyHeader.classList.add('visible');
        } else {
            stickyHeader.classList.remove('visible');
        }
    });

    /* =========================================
       2. Image Carousel with Zoom
       ========================================= */
    const mainImg = document.getElementById('mainZoomImage');
    const carouselMain = document.getElementById('carouselMain');
    const thumbnails = document.querySelectorAll('.thumb');
    const btnPrev = document.getElementById('carouselPrev');
    const btnNext = document.getElementById('carouselNext');
    let currentIndex = 0;

    // The data source for the images (matching the UI)
    const images = Array.from(thumbnails).map(thumb => {
        const img = thumb.querySelector('img');
        return img ? img.src.replace('&w=200', '&w=800') : mainImg.src;
    });

    function updateCarousel(index) {
        // boundary checks
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        
        currentIndex = index;
        
        // update main image
        mainImg.src = images[currentIndex];
        
        // update thumbnails active state
        thumbnails.forEach((thumb, i) => {
            if (i === currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    // Thumbnail Clicks
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            updateCarousel(index);
        });
    });

    // Arrow Clicks
    btnPrev.addEventListener('click', () => updateCarousel(currentIndex - 1));
    btnNext.addEventListener('click', () => updateCarousel(currentIndex + 1));

    // Zoom Effect (Amazon Style Lens)
    const zoomLens = document.getElementById('zoomLens');
    const zoomResult = document.getElementById('zoomResult');
    const zoomRatio = 2; // the zoom scale

    carouselMain.addEventListener('mouseenter', () => {
        // Only activate on larger screens
        if (window.innerWidth < 992) return;
        
        zoomLens.style.opacity = '1';
        zoomResult.style.visibility = 'visible';
        zoomResult.style.opacity = '1';
        zoomResult.style.backgroundImage = `url('${mainImg.src}')`;
        
        // Make the background size relative to original image size
        const { width, height } = carouselMain.getBoundingClientRect();
        zoomResult.style.backgroundSize = `${width * zoomRatio}px ${height * zoomRatio}px`;
        
        // Size the lens correctly based on the result element size vs total background size
        const resultRect = zoomResult.getBoundingClientRect();
        zoomLens.style.width = `${resultRect.width / zoomRatio}px`;
        zoomLens.style.height = `${resultRect.height / zoomRatio}px`;
    });

    carouselMain.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 992) return;
        
        const { left, top, width, height } = carouselMain.getBoundingClientRect();
        // Fallback for lens size if not rendered properly yet
        const lensWidth = zoomLens.offsetWidth || (zoomResult.offsetWidth / zoomRatio);
        const lensHeight = zoomLens.offsetHeight || (zoomResult.offsetHeight / zoomRatio);
        
        // Calculate raw x, y for top left of lens
        let x = e.clientX - left - (lensWidth / 2);
        let y = e.clientY - top - (lensHeight / 2);
        
        // Prevent lens from going outside the image bounds
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > width - lensWidth) x = width - lensWidth;
        if (y > height - lensHeight) y = height - lensHeight;
        
        zoomLens.style.left = `${x}px`;
        zoomLens.style.top = `${y}px`;
        
        // Calculate background position
        zoomResult.style.backgroundPosition = `-${x * zoomRatio}px -${y * zoomRatio}px`;
    });

    // Reset zoom when mouse leaves
    carouselMain.addEventListener('mouseleave', () => {
        zoomLens.style.opacity = '0';
        zoomResult.style.visibility = 'hidden';
        zoomResult.style.opacity = '0';
    });


    /* =========================================
       3. FAQ Accordion
       ========================================= */
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close all others
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherIcon = otherItem.querySelector('.faq-icon');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherIcon) {
                        otherIcon.src = 'images/downarrow.png';
                    }
                    if (otherAnswer) otherAnswer.style.display = 'none';
                }
            });
            
            // Toggle current
            const isActive = item.classList.toggle('active');
            const icon = item.querySelector('.faq-icon');
            const answer = item.querySelector('.faq-answer');
            
            if (isActive) {
                if (icon) icon.src = 'images/uparrow.png';
                if (answer) answer.style.display = 'block';
            } else {
                if (icon) icon.src = 'images/downarrow.png';
                if (answer) answer.style.display = 'none';
            }
        });
    });    /* =========================================
       4. Manufacturing Process Dynamic Tabs
       ========================================= */
    const processTabs = document.querySelectorAll('.tab-pill');
    const processTitle = document.getElementById('process-title');
    const processDesc = document.getElementById('process-desc');
    const processBullets = document.getElementById('process-bullets');
    const subPrevBtn = document.getElementById('process-sub-prev');
    const subNextBtn = document.getElementById('process-sub-next');
    const subPrevBtnMobile = document.getElementById('process-sub-prev-mobile');
    const subNextBtnMobile = document.getElementById('process-sub-next-mobile');
    const processTrack = document.querySelector('.process-track');
    
    let currentProcessIndex = 0;
    let currentSubImageIndex = 0;

    const processData = {
        "Raw Material": {
            title: "High-Grade Raw Material Selection",
            desc: "The foundation of quality begins with high-density polyethylene (HDPE) resins of the highest grade, specifically PE100 or PE80.",
            bullets: ["PE100 grade material", "Optimal molecular weight distribution", "Superior stress crack resistance"]
        },
        "Extrusion": {
            title: "Precision Extrusion Technology",
            desc: "Raw material is fed into high-volume extruders where it's heated and homogenized for consistent output.",
            bullets: ["Uniform melting process", "Steady melt pressure control", "Advanced screw design"]
        },
        "Cooling": {
            title: "Controlled Rapid Cooling",
            desc: "The molten pipe passes through water spray tanks to solidify while maintaining its engineered shape.",
            bullets: ["Multi-stage cooling tanks", "Automated temperature control", "Prevention of thermal stress"]
        },
        "Sizing": {
            title: "Vacuum Sizing & Calibration",
            desc: "Vacuum sizing tanks precisely calibrate the pipe's outer diameter and wall thickness uniformity.",
            bullets: ["Precise diameter calibration", "Internal pressure stabilization", "High-accuracy sizing sleeves"]
        },
        "Quality Control": {
            title: "Rigorous Testing & Assurance",
            desc: "Continuous ultrasonic monitoring ensures wall thickness meets international standards throughout production.",
            bullets: ["Continuous ultrasonic measurement", "Hydrostatic pressure testing", "Impact and tensile strength checks"]
        },
        "Marking": {
            title: "Automated Identification",
            desc: "Each pipe is marked with detailed traceability data, standards, and sizing for easy identification.",
            bullets: ["Laser marking technology", "Traceability batch codes", "Clear dimensional specifications"]
        },
        "Cutting": {
            title: "Clean Swarfless Cutting",
            desc: "High-precision saws cut pipes to specific lengths without leaving debris, ensuring clean installation ends.",
            bullets: ["Automated cut-to-length", "Clean, square ends", "Integration with haul-off speed"]
        },
        "Packaging": {
            title: "Protective Handling & Storage",
            desc: "Pipes are coiled or bundled and secured for safe transit, preserving their structural integrity.",
            bullets: ["Automated coiling systems", "Protective storage measures", "Safe shipping optimization"]
        }
    };

    function updateSubSlider() {
        if (processTrack) {
            processTrack.style.transform = `translateX(-${currentSubImageIndex * 33.333}%)`;
        }
    }

    processTabs.forEach(tab => {
        tab.dataset.stage = tab.textContent.trim();
    });

    if (window.innerWidth <= 767 && processTabs[0]) {
        processTabs[0].textContent = `Step 1/${processTabs.length}: ${processTabs[0].dataset.stage}`;
    }

    processTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            const stage = tab.dataset.stage;
            const data = processData[stage];
            currentProcessIndex = index;
            currentSubImageIndex = 0; // Reset sub-slider on tab change
            updateSubSlider();

            if (data && processTitle && processDesc && processBullets) {
                // Update active state
                processTabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.background = '#fff';
                    t.style.color = '#64748b';
                    t.style.border = '1px solid #e2e8f0';
                    t.textContent = t.dataset.stage;
                });
                tab.classList.add('active');
                tab.style.background = '#2B3990';
                tab.style.color = '#fff';
                tab.style.border = '1px solid #2B3990';
                
                if (window.innerWidth <= 767) {
                    tab.textContent = `Step ${index + 1}/${processTabs.length}: ${stage}`;
                }

                // Update text content
                processTitle.textContent = data.title;
                processDesc.textContent = data.desc;

                // Update bullets
                processBullets.innerHTML = data.bullets.map(text => `
                    <div style="display: flex; align-items: center; gap: 0.75rem; color: #1e293b; font-weight: 500; font-size: 0.95rem;">
                        <img src="images/Vector6.png" alt="check" style="height: 14px;">
                        ${text}
                    </div>
                `).join('');
            }
        });
    });

    function handleProcessPrev(e) {
        if (e) e.preventDefault();
        if (window.innerWidth <= 767) {
            let newIndex = (currentProcessIndex - 1 + processTabs.length) % processTabs.length;
            processTabs[newIndex].click();
            const tabScroller = document.querySelector('.tab-scroller');
            if (tabScroller) {
                const targetTab = processTabs[newIndex];
                tabScroller.scrollTo({
                    left: targetTab.offsetLeft - (tabScroller.offsetWidth / 2) + (targetTab.offsetWidth / 2),
                    behavior: 'smooth'
                });
            }
        } else {
            currentSubImageIndex = (currentSubImageIndex - 1 + 3) % 3;
            updateSubSlider();
        }
    }

    function handleProcessNext(e) {
        if (e) e.preventDefault();
        if (window.innerWidth <= 767) {
            let newIndex = (currentProcessIndex + 1) % processTabs.length;
            processTabs[newIndex].click();
            const tabScroller = document.querySelector('.tab-scroller');
            if (tabScroller) {
                const targetTab = processTabs[newIndex];
                tabScroller.scrollTo({
                    left: targetTab.offsetLeft - (tabScroller.offsetWidth / 2) + (targetTab.offsetWidth / 2),
                    behavior: 'smooth'
                });
            }
        } else {
            currentSubImageIndex = (currentSubImageIndex + 1) % 3;
            updateSubSlider();
        }
    }

    if (subPrevBtn) subPrevBtn.addEventListener('click', handleProcessPrev);
    if (subNextBtn) subNextBtn.addEventListener('click', handleProcessNext);
    if (subPrevBtnMobile) subPrevBtnMobile.addEventListener('click', handleProcessPrev);
    if (subNextBtnMobile) subNextBtnMobile.addEventListener('click', handleProcessNext);

    /* =========================================
       5. Versatile Applications Carousel
       ========================================= */
    const appCarouselInner = document.getElementById('app-carousel-inner');
    const appPrev = document.getElementById('app-prev');
    const appNext = document.getElementById('app-next');
    
    if (appCarouselInner && appPrev && appNext) {
        let isAnimating = false;
        
        appNext.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;
            
            const gap = parseInt(window.getComputedStyle(appCarouselInner).gap) || 24;
            const cardWidth = appCarouselInner.children[0].offsetWidth;
            
            // Animate to the left
            appCarouselInner.style.transition = 'transform 0.5s ease';
            appCarouselInner.style.transform = `translateX(-${cardWidth + gap}px)`;
            
            // Wait for transition to finish, then snap back & move item in DOM
            setTimeout(() => {
                appCarouselInner.style.transition = 'none';
                // Move first fully out-of-view item to the back
                appCarouselInner.appendChild(appCarouselInner.firstElementChild);
                // Snap view back to 0 instantly
                appCarouselInner.style.transform = 'translateX(0)';
                isAnimating = false;
            }, 500); // 500ms matches transform transition
        });
        
        appPrev.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;
            
            const gap = parseInt(window.getComputedStyle(appCarouselInner).gap) || 24;
            const cardWidth = appCarouselInner.children[0].offsetWidth;
            
            // Immediately move the last item to the front of the DOM
            appCarouselInner.insertBefore(appCarouselInner.lastElementChild, appCarouselInner.firstElementChild);
            
            // Instantly offset the container backwards so visually nothing changed
            appCarouselInner.style.transition = 'none';
            appCarouselInner.style.transform = `translateX(-${cardWidth + gap}px)`;
            
            // Force browser reflow to apply the negative offset without animating
            void appCarouselInner.offsetWidth;
            
            // Animate it back to 0 perfectly seamlessly
            appCarouselInner.style.transition = 'transform 0.5s ease';
            appCarouselInner.style.transform = 'translateX(0)';
            
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        });
    }

    /* =========================================
       6. Modal Functionality
       ========================================= */
    const quoteTriggers = document.querySelectorAll('.btn-quote-trigger');
    const downloadTriggers = document.querySelectorAll('.btn-download-trigger');
    const overlays = document.querySelectorAll('.modal-overlay');

    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    };

    quoteTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('quoteModal');
        });
    });

    downloadTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('downloadModal');
        });
    });

    // Close on overlay click
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    window.handleFormSubmit = function(event, modalToClose) {
        if (event) event.preventDefault();
        
        // 1. Close current modal if any
        if (modalToClose) {
            closeModal(modalToClose);
        }
        
        // 2. Clear the form
        const form = event.target;
        if (form && form.reset) form.reset();
        
        // 3. Show Thank You Modal
        setTimeout(() => {
            openModal('thankYouModal');
        }, 400); // Small delay to allow previous modal closure animation
    };
});
