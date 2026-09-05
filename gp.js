const GP = (() => {
    const DATA_KEY = "finishedGoodsData";

    let entries = [];
    let dataChanged = false;

    function init() {
        load();
        updateHeader();
        updateAreas();
        updateMaps();
        render();
    }

    function updateHeader() {
        const element =
            document.getElementById("gpInfoLine");

        if (!element) {
            return;
        }

        const location =
            localStorage.getItem("location") || "";

        const user =
            localStorage.getItem("userName") || "";

        const date =
            new Date().toLocaleDateString("lv-LV");

        element.textContent =
            `${location} | ${user} | ${date}`;
    }

    function updateAreas() {
        const select =
            document.getElementById("gpArea");

        if (!select) {
            return;
        }

        const location =
            localStorage.getItem("location");

        select.innerHTML =
            `<option value="">Apgabals *</option>`;

        /*
         * Izmanto app.js jau esošo
         * areasByLocation sarakstu.
         */
        const areas =
            areasByLocation[location] || [];

        areas.forEach(area => {
            const option =
                document.createElement("option");

            option.value = area;
            option.textContent = area;

            select.appendChild(option);
        });
    }

function updateMaps() {
    const location =
        localStorage.getItem("location");

    const container =
        document.getElementById("gpMapLinks");

    const BASE_PATH = "/Inventory-app";

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (location === "Dārdu") {
        container.innerHTML = `
            <a
                href="#"
                onclick="openImageFromSrc(
                    '${BASE_PATH}/dardu_map1.jpeg'
                ); return false;"
            >
                📍 Karte 1
            </a>

            <a
                href="#"
                onclick="openImageFromSrc(
                    '${BASE_PATH}/dardu_map2.jpeg'
                ); return false;"
            >
                📍 Karte 2
            </a>
        `;
    } else if (location === "Cecīļu") {
        container.innerHTML = `
            <a
                href="#"
                onclick="openImageFromSrc(
                    '${BASE_PATH}/cecilu_map.jpeg'
                ); return false;"
            >
                📍 Karte
            </a>
        `;
    }
}
    function handleAreaChange() {
        const area =
            document.getElementById("gpArea")?.value || "";

        console.log("GP apgabals:", area);
    }

    function add() {
        const area =
            document.getElementById("gpArea")
                ?.value
                .trim() || "";

        const packages =
            Number(
                document.getElementById("gpPackages")
                    ?.value
            );

        const productCode =
            document.getElementById("gpProductCode")
                ?.value
                .trim() || "";

        if (!area) {
            showNotice(
                "⚠️ Izvēlies apgabalu",
                "error"
            );

            return;
        }

        if (!Number.isInteger(packages) || packages <= 0) {
            showNotice(
                "⚠️ Ievadi palešu skaitu",
                "error"
            );

            return;
        }

        if (!productCode) {
            showNotice(
                "⚠️ Ievadi produkta kodu",
                "error"
            );

            return;
        }

        entries.push({
            id:
                crypto.randomUUID?.() ||
                `${Date.now()}-${Math.random()}`,

            area,
            packages,
            productCode,

            user:
                localStorage.getItem("userName") || "",

            location:
                localStorage.getItem("location") || "",

            createdAt:
                new Date().toISOString()
        });

        dataChanged = true;

        if (!save()) {
            entries.pop();
            dataChanged = entries.length > 0;
            return;
        }

        document.getElementById("gpPackages").value = "";
        document.getElementById("gpProductCode").value = "";

        render();
    }

    function save() {
        try {
            localStorage.setItem(
                DATA_KEY,
                JSON.stringify(entries)
            );

            return true;
        } catch (error) {
            console.error(
                "GP datu saglabāšanas kļūda:",
                error
            );

            showNotice(
                "❌ Neizdevās saglabāt Gala produkta datus.",
                "error"
            );

            return false;
        }
    }

    function load() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(DATA_KEY) || "[]"
            );

            entries = Array.isArray(saved)
                ? saved
                : [];
        } catch (error) {
            console.error(
                "GP datu ielādes kļūda:",
                error
            );

            entries = [];
        }
    }

    function render() {
        const list =
            document.getElementById("finishedGoodsList");

        const summary =
            document.getElementById("gpSummary");

        if (!list || !summary) {
            return;
        }

        const totalPackages = entries.reduce(
            (sum, entry) =>
                sum + (Number(entry.packages) || 0),
            0
        );

        summary.innerHTML = `
            📝 Ieraksti: ${entries.length}<br>
            📦 Paletes: ${totalPackages}
        `;

        list.innerHTML = "";

        [...entries]
            .reverse()
            .forEach(entry => {
                const row =
                    document.createElement("div");

                row.className = "gpEntry";

                const text =
                    document.createElement("span");

                text.textContent =
                    `${entry.area} | ` +
                    `${entry.packages} pal. | ` +
                    entry.productCode;

                row.appendChild(text);
                list.appendChild(row);
            });
    }

    function getEntries() {
        return [...entries];
    }

    function hasChanges() {
        return dataChanged;
    }

    function clear() {
        entries = [];
        dataChanged = false;

        localStorage.removeItem(DATA_KEY);
        render();
    }

    return {
        init,
        add,
        render,
        updateAreas,
        updateMaps,
        handleAreaChange,
        getEntries,
        hasChanges,
        clear
    };
})();
