// ======================================================
// 🤖 AI PIEPRASĪJUMS — TEST REŽĪMS
// ======================================================

let aiCameraStream = null;

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
        alert(
            "📷 Label foto gatavs\n\n" +
            `Izmērs: ${outputWidth} × ${outputHeight}\n` +
            `Proporcija: ${ratio.toFixed(3)}\n` +
            `Jābūt: ${(123 / 100).toFixed(3)}\n\n` +
            `Fails: ${
                Math.round(aiImageBlob.size / 1024)
            } KB\n\n` +
            "✅ Tikai RAM"
        );
        // VĒLĀK:
        //
        // showAILabelPreview(aiImageBlob);
        //
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
    // ...
}

// 4. Parāda AI rezultātu lietotājam
function showAIResult(result) {
    // ...
}

// 5. Pēc apstiprinājuma aizpilda formu
function applyAIResult(result) {
    // ...
}


