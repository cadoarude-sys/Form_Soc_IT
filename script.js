document.addEventListener('DOMContentLoaded', () => {
    // --- 0. DARK MODE LOGIC ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
        if(themeToggleBtn) themeToggleBtn.textContent = '☀️';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // --- 1. WIZARD LOGIC ---
    let currentStep = 1;
    const totalSteps = 6;
    
    const steps = document.querySelectorAll('.step');
    const dots = document.querySelectorAll('.step-dot');
    const progressFill = document.getElementById('progressFill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const globalErrorMsg = document.getElementById('globalErrorMsg');

    function updateWizard() {
        // Update steps visibility
        steps.forEach(step => {
            if(parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update progress bar & dots
        progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
        dots.forEach(dot => {
            const dotStep = parseInt(dot.dataset.step);
            dot.classList.remove('active', 'completed');
            if(dotStep === currentStep) {
                dot.classList.add('active');
            } else if (dotStep < currentStep) {
                dot.classList.add('completed');
            }
        });

        // Update Buttons
        prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
        
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
        
        globalErrorMsg.classList.add('hidden');
        
        // Scroll to top of form
        document.querySelector('.wizard-progress').scrollIntoView({ behavior: 'smooth' });
    }

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateWizard();
            }
        } else {
            globalErrorMsg.classList.remove('hidden');
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizard();
        }
    });

    // --- 2. VALIDATION LOGIC ---
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/\d{1,2})?$/;

    function validateStep(stepIndex) {
        const stepEl = document.querySelector(`.step[data-step="${stepIndex}"]`);
        let isValid = true;

        // Reset previous errors
        const errorElements = stepEl.querySelectorAll('.has-error');
        errorElements.forEach(el => el.classList.remove('has-error'));

        // Check required fields
        const requiredInputs = stepEl.querySelectorAll('input[required], textarea[required]');
        requiredInputs.forEach(input => {
            // If it's visible (not in a hidden conditional wrapper)
            if (input.offsetParent !== null && !input.value.trim()) {
                input.classList.add('has-error');
                isValid = false;
            }
        });

        // Specific IP validations in step 3 table
        if (stepIndex === 3) {
            const ipInputs = stepEl.querySelectorAll('.ip-input');
            ipInputs.forEach(input => {
                if (input.value.trim() && !ipRegex.test(input.value.trim())) {
                    input.classList.add('has-error');
                    // Add has-error to the parent td to show the error message inside the table
                    input.parentElement.classList.add('has-error'); 
                    isValid = false;
                } else {
                    input.parentElement.classList.remove('has-error');
                }
            });
        }

        // Conditional required check (Step 5 - API connection)
        if (stepIndex === 5) {
            const radioSi = document.getElementById('radioConexionSi');
            const textareaConexion = document.getElementById('detalleConexion');
            if (radioSi.checked && !textareaConexion.value.trim()) {
                textareaConexion.classList.add('has-error');
                isValid = false;
            }
        }

        return isValid;
    }

    // Clear error on input
    document.addEventListener('input', (e) => {
        if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            e.target.classList.remove('has-error');
            if(e.target.parentElement) e.target.parentElement.classList.remove('has-error');
        }
    });

    // --- 3. CONDITIONAL LOGIC ---
    // Step 3: Tipo Recurso -> Otro
    const checkOtroRecurso = document.getElementById('checkOtroRecurso');
    const wrapperOtroRecurso = document.getElementById('wrapperOtroRecurso');
    const inputOtroRecurso = document.getElementById('otroRecursoInput');

    if(checkOtroRecurso && wrapperOtroRecurso) {
        checkOtroRecurso.addEventListener('change', (e) => {
            if(e.target.checked) {
                wrapperOtroRecurso.classList.remove('hidden');
                inputOtroRecurso.setAttribute('required', 'true');
            } else {
                wrapperOtroRecurso.classList.add('hidden');
                inputOtroRecurso.removeAttribute('required');
                inputOtroRecurso.value = '';
                inputOtroRecurso.classList.remove('has-error');
            }
            saveDraft();
        });
    }

    // Step 3: Internet Access -> Detalle Internet
    const radioInternetSi = document.getElementById('radioInternetSi');
    const radioInternetNo = document.getElementById('radioInternetNo');
    const wrapperDetalleInternet = document.getElementById('wrapperDetalleInternet');
    const urlsInternet = document.getElementById('urlsInternet');
    const puertosInternet = document.getElementById('puertosInternet');

    if(radioInternetSi && wrapperDetalleInternet) {
        radioInternetSi.addEventListener('change', () => {
            wrapperDetalleInternet.classList.remove('hidden');
            if(urlsInternet) urlsInternet.setAttribute('required', 'true');
            if(puertosInternet) puertosInternet.setAttribute('required', 'true');
            saveDraft();
        });
        radioInternetNo.addEventListener('change', () => {
            wrapperDetalleInternet.classList.add('hidden');
            if(urlsInternet) {
                urlsInternet.removeAttribute('required');
                urlsInternet.value = '';
                urlsInternet.classList.remove('has-error');
            }
            if(puertosInternet) {
                puertosInternet.removeAttribute('required');
                puertosInternet.value = '';
                puertosInternet.classList.remove('has-error');
            }
            saveDraft();
        });
    }

    // Step 5: Conexion API -> Textarea
    const radioConexionSi = document.getElementById('radioConexionSi');
    const radioConexionNo = document.getElementById('radioConexionNo');
    const wrapperDetalleConexion = document.getElementById('wrapperDetalleConexion');

    if(radioConexionSi && wrapperDetalleConexion) {
        radioConexionSi.addEventListener('change', () => wrapperDetalleConexion.classList.remove('hidden'));
        radioConexionNo.addEventListener('change', () => {
            wrapperDetalleConexion.classList.add('hidden');
            document.getElementById('detalleConexion').classList.remove('has-error');
        });
    }

    // --- 4. DYNAMIC TABLE LOGIC ---
    const addPortBtn = document.getElementById('addPortBtn');
    const portsTableBody = document.querySelector('#portsTable tbody');

    if (addPortBtn && portsTableBody) {
        addPortBtn.addEventListener('click', () => {
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transition = 'opacity 0.3s ease';
            
            row.innerHTML = `
                <td><input type="text" placeholder="Ej. 80" name="puerto[]" class="port-input"></td>
                <td><input type="text" placeholder="Ej. UDP" name="protocolo[]"></td>
                <td>
                    <input type="text" placeholder="Ej. 192.168.1.1" name="origen[]" class="ip-input">
                    <span class="error-msg text-xs">IP Inválida</span>
                </td>
                <td>
                    <input type="text" placeholder="Ej. 10.0.0.1" name="destino[]" class="ip-input">
                    <span class="error-msg text-xs">IP Inválida</span>
                </td>
                <td><input type="text" placeholder="Justificación" name="justificacionPuerto[]"></td>
                <td class="no-pdf">
                    <button type="button" class="btn btn-danger btn-sm btn-remove" title="Eliminar fila">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>
            `;
            portsTableBody.appendChild(row);
            setTimeout(() => row.style.opacity = '1', 10);

            const removeBtn = row.querySelector('.btn-remove');
            removeBtn.addEventListener('click', function() {
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    saveDraft();
                }, 300);
            });
            
            // Re-bind input events for draft
            row.querySelectorAll('input').forEach(inp => {
                inp.addEventListener('input', saveDraft);
            });
        });
    }

    // --- 4.5 DROPZONE LOGIC ---
    const dropzoneArea = document.getElementById('dropzoneArea');
    const fileInput = document.getElementById('archivoAdjunto');
    const dropzoneContent = document.getElementById('dropzoneContent');
    const dropzoneFile = document.getElementById('dropzoneFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const removeFileBtn = document.getElementById('removeFileBtn');

    if (dropzoneArea && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzoneArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzoneArea.addEventListener(eventName, () => dropzoneArea.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzoneArea.addEventListener(eventName, () => dropzoneArea.classList.remove('dragover'), false);
        });

        dropzoneArea.addEventListener('drop', (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;
            if (files.length) {
                fileInput.files = files;
                updateDropzoneUI();
            }
        }, false);

        fileInput.addEventListener('change', updateDropzoneUI);

        function updateDropzoneUI() {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    alert('El archivo supera el límite de 5MB.');
                    removeFile();
                    return;
                }
                fileNameDisplay.textContent = file.name;
                dropzoneContent.classList.add('hidden');
                dropzoneFile.classList.remove('hidden');
            }
        }

        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering click on input
            removeFile();
        });

        function removeFile() {
            fileInput.value = '';
            dropzoneContent.classList.remove('hidden');
            dropzoneFile.classList.add('hidden');
        }
    }

    // --- 5. LOCAL STORAGE (DRAFT) LOGIC ---
    const form = document.getElementById('resourceRequestForm');
    const clearDraftBtn = document.getElementById('clearDraftBtn');

    function saveDraft() {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Handle multiple checkboxes/arrays (like ports) manually since Object.fromEntries takes only the last value
        data.clasificacion = formData.getAll('clasificacion');
        data.tipoRecurso = formData.getAll('tipoRecurso');
        data.entorno = formData.getAll('entorno');
        data.ubicacion = formData.getAll('ubicacion');
        data.politicasPass = formData.getAll('politicasPass');
        
        // Save table data
        const ports = [];
        const rows = portsTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            ports.push({
                puerto: row.querySelector('[name="puerto[]"]').value,
                protocolo: row.querySelector('[name="protocolo[]"]').value,
                origen: row.querySelector('[name="origen[]"]').value,
                destino: row.querySelector('[name="destino[]"]').value,
                justificacion: row.querySelector('[name="justificacionPuerto[]"]').value
            });
        });
        data.portsTable = ports;

        localStorage.setItem('formDraft_SocIT', JSON.stringify(data));
        clearDraftBtn.style.display = 'inline-flex';
    }

    function loadDraft() {
        const saved = localStorage.getItem('formDraft_SocIT');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Populate standard inputs
            Object.keys(data).forEach(key => {
                const el = form.elements[key];
                if (!el || key === 'portsTable') return;

                if (el.type === 'checkbox' || el.type === 'radio') {
                    // It's a single radio/checkbox
                } else if (el.length) {
                    // NodeList of radios or checkboxes
                    Array.from(el).forEach(input => {
                        if (input.type === 'radio') {
                            if (input.value === data[key]) input.checked = true;
                        } else if (input.type === 'checkbox') {
                            if (Array.isArray(data[key]) && data[key].includes(input.value)) {
                                input.checked = true;
                            }
                        }
                    });
                } else {
                    el.value = data[key];
                }
            });

            // Rebuild Table
            if (data.portsTable && data.portsTable.length > 0) {
                portsTableBody.innerHTML = ''; // clear default row
                data.portsTable.forEach((portData, index) => {
                    if (index > 0) addPortBtn.click(); // trigger add row for >1 items
                });
                
                setTimeout(() => {
                    const rows = portsTableBody.querySelectorAll('tr');
                    data.portsTable.forEach((portData, index) => {
                        if (rows[index]) {
                            rows[index].querySelector('[name="puerto[]"]').value = portData.puerto || '';
                            rows[index].querySelector('[name="protocolo[]"]').value = portData.protocolo || '';
                            rows[index].querySelector('[name="origen[]"]').value = portData.origen || '';
                            rows[index].querySelector('[name="destino[]"]').value = portData.destino || '';
                            rows[index].querySelector('[name="justificacionPuerto[]"]').value = portData.justificacion || '';
                        }
                    });
                }, 50); // wait for rows to be added
            }

            // Trigger conditional logic manually based on loaded data
            if(checkOtroRecurso && checkOtroRecurso.checked) checkOtroRecurso.dispatchEvent(new Event('change'));
            if(radioInternetSi && radioInternetSi.checked) radioInternetSi.dispatchEvent(new Event('change'));
            if(radioConexionSi && radioConexionSi.checked) radioConexionSi.dispatchEvent(new Event('change'));

            clearDraftBtn.style.display = 'inline-flex';
        }
    }

    clearDraftBtn.addEventListener('click', () => {
        if(confirm('¿Estás seguro de que quieres borrar el borrador y limpiar el formulario?')) {
            localStorage.removeItem('formDraft_SocIT');
            form.reset();
            // Reset conditionals
            if(checkOtroRecurso) checkOtroRecurso.dispatchEvent(new Event('change'));
            if(radioInternetNo) radioInternetNo.dispatchEvent(new Event('change'));
            if(radioConexionNo) radioConexionNo.dispatchEvent(new Event('change'));
            clearDraftBtn.style.display = 'none';
            // Go to step 1
            currentStep = 1;
            updateWizard();
        }
    });

    // Listen to changes to save draft
    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);

    // --- 6. EXPORT TO PDF ---
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            // Temporarily show all steps for the PDF
            steps.forEach(step => step.classList.add('active'));
            
            const element = document.getElementById('pdf-container');
            const opt = {
                margin:       10,
                filename:     `Solicitud_${document.getElementById('nombreSolicitante').value || 'Recurso'}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, ignoreElements: (el) => el.classList.contains('no-pdf') || el.classList.contains('wizard-progress') || el.id === 'clearDraftBtn' },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Generate PDF
            html2pdf().set(opt).from(element).save().then(() => {
                // Restore wizard view
                updateWizard();
            });
        });
    }

    // --- 7. FORM SUBMISSION (BACKEND FETCH) ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateStep(currentStep)) {
                globalErrorMsg.classList.remove('hidden');
                return;
            }

            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                Procesando...
            `;
            submitBtn.disabled = true;

            // Add spinner animation style if not exists
            if (!document.getElementById('spinnerStyle')) {
                const style = document.createElement('style');
                style.id = 'spinnerStyle';
                style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }

            // Gather Data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.clasificacion = formData.getAll('clasificacion');
            data.tipoRecurso = formData.getAll('tipoRecurso');
            data.entorno = formData.getAll('entorno');
            data.ubicacion = formData.getAll('ubicacion');
            data.politicasPass = formData.getAll('politicasPass');
            
            const ports = [];
            portsTableBody.querySelectorAll('tr').forEach(row => {
                ports.push({
                    puerto: row.querySelector('[name="puerto[]"]').value,
                    protocolo: row.querySelector('[name="protocolo[]"]').value,
                    origen: row.querySelector('[name="origen[]"]').value,
                    destino: row.querySelector('[name="destino[]"]').value,
                    justificacion: row.querySelector('[name="justificacionPuerto[]"]').value
                });
            });
            data.portsTable = ports;

            // Prepare for multipart/form-data
            const finalFormData = new FormData();
            finalFormData.append('data', JSON.stringify(data));
            
            if (fileInput && fileInput.files.length > 0) {
                finalFormData.append('archivoAdjunto', fileInput.files[0]);
            }

            try {
                // Send to Cloudflare Worker Backend
                const apiUrl = 'https://form-soc-it-backend.cloudflare-freund.workers.dev/api/solicitudes';
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: finalFormData
                });

                if (response.ok) {
                    submitBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        ¡Solicitud Enviada!
                    `;
                    submitBtn.classList.remove('btn-primary');
                    submitBtn.style.backgroundColor = '#10b981'; // Success green
                    
                    // Clear draft on successful submit
                    localStorage.removeItem('formDraft_SocIT');
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.classList.add('btn-primary');
                        submitBtn.style.backgroundColor = '';
                        form.reset();
                        currentStep = 1;
                        updateWizard();
                        clearDraftBtn.style.display = 'none';
                    }, 3000);
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error("Error al enviar:", error);
                alert("Hubo un error al conectar con el servidor. Asegúrate de ejecutar 'node server.js' en la terminal.");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Initialize
    loadDraft();
    updateWizard();
});
