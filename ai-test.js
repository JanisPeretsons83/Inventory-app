// ======================================================
// 🤖 AI PIEPRASĪJUMS — TEST REŽĪMS
// ======================================================

let aiCameraStream = null;
let aiPendingBlob = null;
let aiPendingPreviewUrl = null;
let aiPendingResult = null;

// 1. Sagatavo attēlu AI
async function prepareLabelImageForAI(file) {
    if (!file) {
        throw new Error("Nav izvēlēts attēls");
    }
    if (!file.type.startsWith("image/")) {
        throw new Error("Izvēlētais fails nav attēls");
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const img = new Image();
        reader.onload = event => {
            img.onload = () => {
                try {
                    // AI attēlam izmantojam atsevišķus parametrus.
                    // Esošo areaPhotos sistēmu tas NEIETEKMĒ.
                    const MAX_SIZE = 1000;
                    const JPEG_QUALITY = 0.60;
                    let width =
                        img.naturalWidth || img.width;
                    let height =
                        img.naturalHeight || img.height;
                    // ------------------------------
                    // Samazina attēlu proporcionāli
                    // ------------------------------
                    const scale = Math.min(
                        1,
                        MAX_SIZE / width,
                        MAX_SIZE / height
                    );
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                    // ------------------------------
                    // Izveido pagaidu canvas RAM
                    // ------------------------------
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        throw new Error(
                            "Neizdevās izveidot Canvas"
                        );
                    }
                    // Balts fons JPEG attēlam
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, width, height);
                    // Ievieto samazināto attēlu
                    ctx.drawImage(img, 0, 0, width, height);
                    // ------------------------------
                    // Canvas → JPEG Blob
                    // ------------------------------
                    canvas.toBlob(
                        blob => {
                            if (!blob) {
                                reject(
                                    new Error("Neizdevās izveidot AI attēlu")
                                );
                                return;
                            }
                            console.log(
                                "🤖 AI attēls sagatavots:",
                                { originalSize: Math.round(file.size / 1024) + " KB",
                                    aiSize: Math.round(blob.size / 1024) + " KB",
                                    width: width,
                                    height: height,
                                    type:
                                        blob.type
                                }
                            );
                            showAITestInfo(
                                file.size,
                                blob.size,
                                width,
                                height,
                                blob.type
                                );
                            // ⚠️ Tikai atgriež Blob.
                            // localStorage NETIEK izmantots.
                            resolve(blob);
                        },
                        "image/jpeg",
                        JPEG_QUALITY
                    );
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => {
                reject(
                    new Error("Neizdevās ielādēt attēlu"));
            };
            img.src = event.target.result;
        };
        reader.onerror = () => {reject(
                new Error("Neizdevās nolasīt attēla failu"));
        };
        reader.readAsDataURL(file);
    });
}

// ======================================================
// 📷 ATVER AI LABEL KAMERU
// ======================================================

async function startAILabelScan() {
    if (!isTestMode()) {
        return;
    }
    const modal = document.getElementById("aiCameraModal");
    const video = document.getElementById("aiCameraVideo");
    // ==========================================
    // HTML pārbaude
    // ==========================================
    if (!modal) {
        console.error("❌ aiCameraModal nav atrasts");
        showNotice(
            "❌ AI kameras logs nav atrasts.",
            "error"
        );
        return;
    }
    if (!video) {
        console.error(
            "❌ aiCameraVideo nav atrasts"
        );
        showNotice(
            "❌ AI video elements nav atrasts.",
            "error"
        );
        return;
    }
    // ==========================================
    // Kameras API pārbaude
    // ==========================================
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {
        showNotice("❌ Šī ierīce neatbalsta kameras režīmu.",
                    "error");
        return;
    }
    try {
        console.log(
            "📷 Mēģina atvērt AI kameru..."
        );
        // ==========================================
        // Aizmugurējā kamera
        // ==========================================
        aiCameraStream = await navigator.mediaDevices
                .getUserMedia({
                    video: {facingMode: {
                            ideal: "environment"
                        },
                        width: {ideal: 1920
                        },
                        height: {ideal: 1080
                        }
                    },
                    audio: false
                });
        // ==========================================
        // Kamera → VIDEO
        // ==========================================
        video.srcObject = aiCameraStream;
        // ==========================================
        // Parāda mūsu kameras logu
        // ==========================================
        modal.style.display = "block";
        await video.play();
        console.log(
            "✅ AI kamera palaista"
        );
    }
    catch (error) {
        console.error(
            "❌ AI kameras kļūda:",
            error
        );
        if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
        ) {
            showNotice(
                "⚠️ Kamerai nav dota piekļuve.",
                "error"
            );
            return;
        }
        showNotice(
            `❌ Kamera: ${
                error.name ||
                "nezināma kļūda"
            }`,
            "error"
        );
    }
}

// ======================================================
// ❌ AIZVER AI KAMERU
// ======================================================

function closeAILabelCamera() {
    const modal = document.getElementById("aiCameraModal");
    const video = document.getElementById("aiCameraVideo");
    // ==========================================
    // Aptur kameru
    // ==========================================
    if (aiCameraStream) {
        aiCameraStream
            .getTracks()
            .forEach(track => {
                track.stop();
            });
        aiCameraStream = null;
    }
    // ==========================================
    // Atvieno video
    // ==========================================
    if (video) {
        video.pause();
        video.srcObject = null;
    }
    // ==========================================
    // Aizver kameras logu
    // ==========================================
    if (modal) {
        modal.style.display = "none";
    }
}

// ======================================================
// 📷 NOFOTOGRAFĒ TIEŠI LABEL RĀMJA ZONU
// ŅEM VĒRĀ object-fit: cover
// ======================================================

async function captureAILabel() {
    const video = document.getElementById("aiCameraVideo");
    const frame = document.querySelector(".aiLabelFrame");
    if (!video || !frame) {
        showNotice(
            "❌ Kameras rāmis nav atrasts.",
            "error"
        );
        return;
    }
    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {
        showNotice(
            "⚠️ Kamera vēl nav gatava.",
            "error"
        );
        return;
    }
    try {
        // ==========================================
        // 1. VIDEO izmēri
        // ==========================================
        
        const videoRect = video.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        // Īstā kameras izšķirtspēja
        const cameraWidth = video.videoWidth;
        const cameraHeight = video.videoHeight;
        
        // ==========================================
        // 2. object-fit: cover mērogs
        // ==========================================

        const coverScale = Math.max(
                videoRect.width / cameraWidth,
                videoRect.height / cameraHeight
            );
        
        // Cik liels kameras attēls faktiski
        // tiek uzzīmēts uz ekrāna
        
        const renderedWidth = cameraWidth * coverScale;
        const renderedHeight = cameraHeight * coverScale;
        
        // ==========================================
        // 3. Cik daudz COVER nogriež no malām
        // ==========================================
        
        const cropOffsetX = (renderedWidth - videoRect.width) / 2;
        const cropOffsetY = (renderedHeight - videoRect.height) / 2;
        
        // ==========================================
        // 4. Rāmja pozīcija VIDEO elementā
        // ==========================================
        
        const frameX = frameRect.left - videoRect.left;
        const frameY = frameRect.top - videoRect.top;
        
        // ==========================================
        // 5. Ekrāna koordinātas
        //    → kameras īstie pikseļi
        // ==========================================
        
        let sourceX = (frameX + cropOffsetX) /coverScale;
        let sourceY = (frameY + cropOffsetY) /coverScale;
        let sourceWidth = frameRect.width /coverScale;
        let sourceHeight = frameRect.height /coverScale;
        
        // ==========================================
        // 6. Drošības robežas
        // ==========================================
        
        sourceX = Math.max(0,
                Math.round(sourceX)
            );
        sourceY = Math.max(0,
                Math.round(sourceY)
            );
        sourceWidth = Math.round(sourceWidth);
        sourceHeight = Math.round(sourceHeight);
        if (
            sourceX + sourceWidth >
            cameraWidth
            ) { sourceWidth = cameraWidth - sourceX;
                }
        if (sourceY + sourceHeight >
            cameraHeight
            ) { sourceHeight = cameraHeight - sourceY;
                }
        
        // ==========================================
        // 7. AI ATTĒLA MAX IZMĒRS
        // ==========================================
        
        const MAX_SIZE = 1000;
        const resizeScale = Math.min(1,
                MAX_SIZE / sourceWidth,
                MAX_SIZE / sourceHeight
            );
        const outputWidth = Math.round(
                sourceWidth * resizeScale
            );
        const outputHeight = Math.round(
                sourceHeight * resizeScale
            );
        
        // ==========================================
        // 8. CANVAS — tikai RAM
        // ==========================================
        
        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error(
                "Canvas nav pieejams"
            );
        }
        // Balts fons
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0,
            outputWidth,
            outputHeight
        );
        
        // ==========================================
        // 9. IZGRIEŽ TIKAI RĀMJA SATURU
        // ==========================================
        
        ctx.drawImage(
            video,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            outputWidth,
            outputHeight
        );
        
        // ==========================================
        // 10. JPEG BLOB
        // ==========================================
        
        const aiImageBlob =
            await new Promise(
                (resolve, reject) => {
                    canvas.toBlob(
                        blob => {
                            if (!blob) {
                                reject(
                                    new Error("Neizdevās izveidot AI attēlu")
                                );
                                return;
                            }
                            resolve(blob);
                        },
                        "image/jpeg", 0.70);
                }
            );
        
        // ==========================================
        // 11. TESTA INFORMĀCIJA
        // ==========================================
        
        const ratio = outputWidth / outputHeight;
        console.log(
            "🤖 AI LABEL:",
            {
                camera: `${cameraWidth} × ${cameraHeight}`,
                output: `${outputWidth} × ${outputHeight}`,
                ratio: ratio.toFixed(3),
                expectedRatio: (123 / 100).toFixed(3),
                size: Math.round(
                        aiImageBlob.size / 1024
                    ) + " KB"
            }
        );
        
        // ==========================================
        // 12. IZSLĒDZ KAMERU
        // ==========================================
        
        closeAILabelCamera();
        showAILabelPreview(
            aiImageBlob,
            outputWidth,
            outputHeight
        );
        // VĒLĀK:
        // await sendLabelToAI(aiImageBlob);
    }
    catch (error) {
        console.error(
            "❌ Label foto kļūda:",
            error);
        showNotice("❌ Neizdevās uzņemt lapiņas attēlu.",
            "error");
    }
}

// ======================================================
// 🧪 AI TESTA INFORMĀCIJA
// ======================================================

function showAITestInfo(
    originalBytes,
    aiBytes,
    width,
    height,
    type
) {
    const originalKB = Math.round(originalBytes / 1024);
    const aiKB = Math.round(aiBytes / 1024);
    alert(
        "📷 AI attēls sagatavots\n\n" +
        `Oriģināls: ${originalKB} KB\n` +
        `AI bilde: ${aiKB} KB\n\n` +
        `Izmērs: ${width} × ${height}\n` +
        `Formāts: ${type}\n\n` +
        "✅ Attēls netika saglabāts localStorage"
    );
}

// ======================================================
// 👁️ PARĀDA AI ATTĒLA PRIEKŠSKATĪJUMU
// ======================================================

function showAILabelPreview(
    blob,
    width,
    height
) {
    const modal = document.getElementById("aiPreviewModal");
    const image = document.getElementById("aiPreviewImage");
    const info = document.getElementById("aiPreviewInfo");
    if (!modal || !image || !info) {
        return;
    }
    // Veco URL atbrīvo
    if (aiPendingPreviewUrl) {
        URL.revokeObjectURL(
            aiPendingPreviewUrl
        );
    }
    aiPendingBlob = blob;
    aiPendingPreviewUrl = URL.createObjectURL(blob);
    image.src = aiPendingPreviewUrl;
    info.innerHTML =
        `Izmērs: ${width} × ${height}<br>` +
        `Fails: ${Math.round(blob.size / 1024)} KB<br>` +
        `Proporcija: ${(width / height).toFixed(3)}`;
    modal.style.display =
        "block";
}

// ======================================================
// 🔄 FOTOGRAFĒ VĒLREIZ
// ======================================================

function retakeAILabel() {

    closeAILabelPreview();

    startAILabelScan();
}

// ======================================================
// ✅ APSTIPRINA AI ATTĒLU
// ======================================================

function acceptAILabelPreview() {
    if (!aiPendingBlob) {
        showNotice(
            "❌ AI attēls vairs nav pieejams.\n" +
            "Nofotografē lapiņu vēlreiz.",
            "error"
        );
        return;
    }
    
    // 2. Vai ir internets

    if (!canUseAIOnline()) {
        return;
    }
    showNotice("✅ Attēls gatavs AI nolasīšanai.",
        "success"
    );
     closeAILabelPreview();
    // VĒLĀK:
    // try {
    //
    //     const result =
    //         await sendLabelToAI(aiPendingBlob);
    //
    // } catch (error) {
    //
    //     handleAIError(error);
}

function closeAILabelPreview() {
    const modal = document.getElementById("aiPreviewModal");
    const image = document.getElementById("aiPreviewImage");
    if (modal) {modal.style.display = "none";}
    if (image) {image.src = "";}
    if (aiPendingPreviewUrl) {
        URL.revokeObjectURL(
            aiPendingPreviewUrl
        );
        aiPendingPreviewUrl = null;
    }
    aiPendingBlob = null;
}

// ======================================================
// 📷 SAŅEM NOFOTOGRAFĒTO LABEL
// ======================================================
async function handleAILabelPhoto(event) {
    //...
}

// 2. Nosūta attēlu serverless funkcijai
async function sendLabelToAI(blob) {
    // ...
}

// 3. Validē saņemto JSON
function validateAIResult(result) {

    // AI atbildei jābūt objektam
    if (!result ||
        typeof result !== "object" ||
        Array.isArray(result)
    ) {
        const error = new Error("AI atbilde nav derīgs objekts");
        error.type = "invalid-response";
        throw error;
    }

    // ==========================================
    // Palīgfunkcija skaitļu pārbaudei
    // ==========================================

    function validNumber(
        value,
        min,
        max
    ) {
        // AI nav spējis nolasīt
        if (value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }
        const number = Number(value);
            if (!Number.isFinite(number) ||
                number < min ||
                number > max
            ) {
            return null;
        }
        return number;
    }

    // ==========================================
    // Pārbaudām katru lauku
    // ==========================================

    const validated = {thickness: validNumber(
            result.thickness,
            1,
            300
        ),
        width: validNumber(result.width,
            1,
            500
        ),
        length: validNumber(result.length,
            1,
            10000
        ),
        pieces: validNumber(result.pieces,
            1,
            100000
        ),
        month: validNumber(result.month,
            1,
            12
        ),
        year: validNumber(
            result.year,
            2000,
            2099
        )
    };

    // ==========================================
    // Veseli skaitļi
    // ==========================================

    [
        "thickness",
        "width",
        "length",
        "pieces",
        "month",
        "year"
    ].forEach(key => {
        if (
            validated[key] !== null &&
            !Number.isInteger(validated[key])
        ) {
            validated[key] = null;
        }
    });

    // ==========================================
    // Vai AI vispār kaut ko nolasīja?
    // ==========================================

    const hasAnyValue = Object.values(validated)
            .some(value => value !== null);
    if (!hasAnyValue) {
        const error =
            new Error("AI nenolasīja nevienu derīgu vērtību"
            );
        error.type = "invalid-response";
        throw error;
    }
    return validated;
}

// ======================================================
// 🧪 TESTA AI ATBILDE
// ======================================================

function testAIResultFlow() {
    const fakeResult = {
        thickness: 27,
        width: 95,
        length: 4200,
        pieces: 600,
        month: 8,
        year: 2026
    };
    try {
        const validated = validateAIResult(fakeResult);
        showAIResult(validated);
    } catch (error) {
        handleAIError(error);
    }
}
// 4. Parāda AI rezultātu lietotājam
function showAIResult(result) {
    aiPendingResult = result;
    const modal = document.getElementById("aiResultModal");
    const content = document.getElementById("aiResultContent");
    if (!modal || !content) {
        showNotice(
            "❌ AI rezultāta logs nav atrasts.",
            "error"
        );
        return;
    }
    const showValue = value =>
        value === null
            ? "⚠️ Nav nolasīts"
            : value;
    content.innerHTML = `
        <div class="aiResultRow">
            <span>Biezums:</span>
            <strong>${showValue(result.thickness)}</strong>
        </div>
        <div class="aiResultRow">
            <span>Platums:</span>
            <strong>${showValue(result.width)}</strong>
        </div>
        <div class="aiResultRow">
            <span>Garums:</span>
            <strong>${showValue(result.length)}</strong>
        </div>
        <div class="aiResultRow">
            <span>Gabali:</span>
            <strong>${showValue(result.pieces)}</strong>
        </div>
        <div class="aiResultRow">
            <span>Mēnesis:</span>
            <strong>${showValue(result.month)}</strong>
        </div>
        <div class="aiResultRow">
            <span>Gads:</span>
            <strong>${showValue(result.year)}</strong>
        </div>
    `;
    modal.style.display = "flex";
}

// 5. Pēc apstiprinājuma aizpilda formu
function applyAIResult(result) {
    // 🪵 Biezums
    const thickness = document.getElementById("thickness");
        if (thickness) {thickness.value = result.thickness ?? "";
        }
    // 📏 Platums
    const width = document.getElementById("width");
        if (width) {width.value = result.width ?? "";
        }
    // 📐 Garums
    const length = document.getElementById("length");
        if (length) {length.value = result.length ?? "";
        }
    // 🔢 Gabali pakā
    const pieces = document.getElementById("pieces");
        if (pieces) {
            pieces.value = result.pieces ?? "";
        }
    // 📅 Mēnesis
    const month = document.getElementById("month");
        if (month) {
            month.value = result.month ?? "";
        }
    // 📅 Gads
    const year = document.getElementById("year");
        if (year) {
            year.value = result.year ?? "";
        }
    //📝 AIZPILDA FORMAS LAUKUS
    const setField = (id, value) => {

        if (value === null) {
            return;
        }

        const field =
            document.getElementById(id);

        if (field) {
            field.value = value;
        }
    };

    // packages APZINĀTI neaiztiekam
    setField("thickness", result.thickness);
    setField("width", result.width);
    setField("length", result.length);
    setField("pieces", result.pieces);
    setField("month", result.month);
    setField("year", result.year);
}

function closeAIResultModal() {
    const modal = document.getElementById("aiResultModal");
    if (modal) {
        modal.style.display = "none";
    }
    aiPendingResult = null;
}

function applyPendingAIResult() {
    if (!aiPendingResult) {
        showNotice(
            "❌ AI dati nav pieejami.",
            "error"
        );
        return;
    }
    applyAIResult(aiPendingResult);
    closeAIResultModal();
    showNotice(
        "✅ AI dati ievietoti laukos.",
        "success"
    );
}
// ======================================================
// 🌐 AI INTERNETA PĀRBAUDE
// ======================================================

function canUseAIOnline() {
    if (!navigator.onLine) {
        showNotice(
            "📵 AI nolasīšanai nepieciešams internets.\n" +
            "Datus vari ievadīt manuāli.",
            "error"
        );
        return false;
    }
    return true;
}
// ======================================================
// ⚠️ AI KĻŪDU APSTRĀDE
// ======================================================

function handleAIError(error) {
    console.error(
        "❌ AI kļūda:",
        error
    );
    let message = "❌ Neizdevās nolasīt lapiņu.";
    // Nav interneta
    if (!navigator.onLine) {
        message = "📵 Nav interneta savienojuma.\n" +
            "AI nolasīšanai nepieciešams internets.";
    }
    // Pieprasījums pārāk ilgs
    else if (
        error?.name === "AbortError"
    ) {
        message = "⏱️ AI neatbildēja laikā.\n" +
            "Mēģini vēlreiz.";
    }
    // Servera / Worker kļūda
    else if (
        error?.type === "server"
    ) {
        message = "⚠️ AI serviss pašlaik nav pieejams.\n" +
            "Datus vari ievadīt manuāli.";
    }
    // Nederīga AI atbilde
    else if (
        error?.type === "invalid-response"
    ) {
        message = "⚠️ AI atbilde nebija derīga.\n" +
            "Mēģini lapiņu nofotografēt vēlreiz.";
    }
    showNotice(
        message,
        "error"
    );
}
