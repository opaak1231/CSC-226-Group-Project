/* =========================================
   SHARED THEME CONTROLLER
   ========================================= */

(() => {
    const THEME_KEY = "taskquest-theme";

    const themes = [
        "system",
        "light",
        "dark"
    ];

    const themeButton =
        document.querySelector("#themeToggle");

    const root = document.documentElement;

    let currentTheme = "system";

    /* Load saved theme */

    try {
        const savedTheme =
            localStorage.getItem(THEME_KEY);

        if (themes.includes(savedTheme)) {

            currentTheme = savedTheme;
        }

    } catch (error) {

        console.warn(
            "Unable to load theme.",
            error);
    }

    /* Apply theme */

    function applyTheme() {
        if (currentTheme === "system") {
            root.removeAttribute("data-theme");
        } else {
            root.dataset.theme = currentTheme;
        }
        if (themeButton) {
            themeButton.textContent =
                "Theme: " +
                currentTheme.charAt(0).toUpperCase() +
                currentTheme.slice(1);
        }
    }

    /* Save theme */

    function saveTheme() {
        try {
            localStorage.setItem(
                THEME_KEY,
                currentTheme
            );
        } catch (error) {
            console.warn(
                "Unable to save theme.",
                error
            );
        }
    }

    /* Change theme */

    if (themeButton) {
        themeButton.addEventListener("click", () => {
            const currentIndex =
                themes.indexOf(currentTheme);

            const nextIndex =
                (currentIndex + 1) % themes.length;

            currentTheme = themes[nextIndex];

            applyTheme();
            saveTheme();
        });
    }

    /* Initialize */

    applyTheme();
    console.log("TaskQuest shared theme is running.");
})();
