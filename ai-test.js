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
                    width =
                        Math.round(width * scale);
                    height =
                        Math.round(height * scale);
                    // ------------------------------
                    // Izveido pagaidu canvas RAM
                    // ------------------------------
                    const canvas =
                        document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx =
                        canvas.getContext("2d");
                    if (!ctx) {
                        throw new Error(
                            "Neizdevās izveidot Canvas"
                        );
                    }
                    // Balts fons JPEG attēlam
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(
                        0,
                        0,
                        width,
                        height
                    );
                    // Ievieto samazināto attēlu
                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );
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
    if (!modal || !video) {
        showNotice("❌ AI kameras logs nav atrasts.",
            "error");
        return;
    }
    // Pārbauda kameras API
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {
        showNotice("❌ Šī ierīce neatbalsta kameras režīmu.",
            "error");
        return;
    }
    try {
        // Pieprasa AIZMUGURĒJO kameru
        aiCameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: "environment"
                    },
                    width: {
                        ideal: 1920
                    },
                    height: {
                        ideal: 1080
                    }
                },
                audio: false
            });
        video.srcObject = aiCameraStream;
        // Parāda mūsu kameras logu
        modal.style.display = "block";
        // Īpaši svarīgi Safari/iPhone
        await video.play();
    }
    catch (error) {
        console.error("AI kamera:",
            error);
        // Ja kamera nav atļauta
        if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
        ) {
            showNotice("⚠️ Kamerai nav dota piekļuve.",
                        "error");
            return;
        }
        showNotice("❌ Neizdevās atvērt kameru.",
            "error");
    }
}

// ======================================================
// 📷 TESTA FOTO POGA
// ======================================================

function captureAILabel() {
    const video = document.getElementById("aiCameraVideo");
    if (!video) {
        return;
    }
    if (!video.videoWidth ||
        !video.videoHeight
    ) {
        showNotice("⚠️ Kamera vēl nav gatava.",
            "error");
        return;
    }
    showNotice("📷 Kamera darbojas korekti.",
        "success");
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
    const originalKB =
        Math.round(originalBytes / 1024);
    const aiKB =
        Math.round(aiBytes / 1024);
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

// 6. Galvenā AI lapiņas funkcija
function startAILabelScan() {
    // Tikai TEST lietotājiem
    if (!isTestMode()) {
        return;
    }
    const input = document.getElementById("aiLabelCamera");
    if (!input) {
        console.error("aiLabelCamera nav atrasts");
        return;
    }
    // Notīra iepriekšējo izvēli.
    // Tas ļauj fotografēt atkārtoti.
    input.value = "";
    input.click();
}
