/* =========================================
   TASKQUEST GAME LIBRARY
   ========================================= */
(() => {

    /* =====================================
       1. GLOBAL VARIABLES
       ===================================== */

    const GAME_STORAGE_KEY = "taskquest-games-v1";
    let games = [];
    let currentCover = "";
    let coverLoading = false;
    let coverRequestId = 0;

    /* =====================================
       2. SELECT HTML ELEMENTS
       ===================================== */

    const gameGrid = document.querySelector("#gameGrid");
    const gameDialog = document.querySelector("#gameDialog");
    const gameForm = document.querySelector("#gameForm");
    const dialogTitle = document.querySelector("#dialogTitle");
    const addGameButton = document.querySelector("#addGameButton");
    const closeGameDialog = document.querySelector("#closeGameDialog");
    const cancelGameButton = document.querySelector("#cancelGameButton");
    const saveGameButton = document.querySelector("#saveGameButton");
    const searchGames = document.querySelector("#searchGames");
    const filterGames = document.querySelector("#filterGames");
    const totalGames = document.querySelector("#totalGames");
    const favoriteGames = document.querySelector("#favoriteGames");
    const gameStatus = document.querySelector("#gameStatus");
    const formMessage = document.querySelector("#formMessage");
    const gameId = document.querySelector("#gameId");
    const gameName = document.querySelector("#gameName");
    const gameServer = document.querySelector("#gameServer");
    const gameCurrency = document.querySelector("#gameCurrency");
    const gameTimezone = document.querySelector("#gameTimezone");
    const dailyReset = document.querySelector("#dailyReset");
    const weeklyReset = document.querySelector("#weeklyReset");
    const gameColor = document.querySelector("#gameColor");
    const gameNotes = document.querySelector("#gameNotes");
    const gameFavorite = document.querySelector("#gameFavorite");
    const gameCover = document.querySelector("#gameCover");
    const coverPreview = document.querySelector("#coverPreview");
    const removeCover = document.querySelector("#removeCover");

    if (!gameGrid) {
        return;
    }

    /* =====================================
       3. HELPER FUNCTIONS
       ===================================== */

    function refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    function createIcon(name) {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", name);
        icon.setAttribute("aria-hidden", "true");
        return icon;
    }

    function showStatus(message) {
        gameStatus.textContent = message;
    }

    function showFormMessage(message) {
        formMessage.textContent = message;
    }

    function isValidColor(color) {
        return /^#[0-9a-fA-F]{6}$/.test(color);
    }

    function isValidCover(cover) {
        return typeof cover === "string" &&
            /^data:image\/(png|jpeg|webp);base64,/
                .test(cover);
    }

    /* =====================================
       4. LOCAL STORAGE
       ===================================== */

    function loadGames() {
        try {
            const savedGames =
                localStorage.getItem(
                    GAME_STORAGE_KEY
                );
            const parsedGames = JSON.parse(savedGames || "[]");
            if (Array.isArray(parsedGames)) {
                games = parsedGames.filter(game =>
                    game && typeof game.id === "string" && typeof game.name === "string"
                );
            } else {
                games = [];
            }
        } catch (error) {
            games = [];
            showStatus(
                "Unable to load saved games."
            );
            console.error(error);
        }
    }

    function saveGames(nextGames) {
        try {
            localStorage.setItem(
                GAME_STORAGE_KEY, JSON.stringify(nextGames)
            );
            games = nextGames;
            return true;
        } catch (error) {
            showStatus(
                "Unable to save. Browser storage may be full."
            );
            console.error(error);
            return false;
        }
    }

    /* =====================================
       5. COVER IMAGE PREVIEW
       ===================================== */

    function updateCoverPreview() {
        if (isValidCover(currentCover)) {
            coverPreview.src = currentCover;
            coverPreview.hidden = false;
        } else {
            coverPreview.removeAttribute("src");
            coverPreview.hidden = true;
        }
    }

    function cancelCoverRequest() {
        coverRequestId++;
        coverLoading = false;
        saveGameButton.disabled = false;
    }

    gameCover.addEventListener("change", () => {
        cancelCoverRequest();

        const file = gameCover.files[0];

        showFormMessage("");
        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/png", "image/jpeg", "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            showFormMessage(
                "Please select a PNG, JPEG or WEBP image."
            );
            gameCover.value = "";
            return;
        }
        const maximumSize = 2 * 1024 * 1024;

        if (file.size > maximumSize) {
            showFormMessage(
                "Image size must not exceed 2 MB."
            );
            gameCover.value = "";
            return;
        }

        const requestId = coverRequestId;
        const reader = new FileReader();

        coverLoading = true;
        saveGameButton.disabled = true;

        reader.onload = () => {
            if (requestId !== coverRequestId) {
                return;
            }
            if (isValidCover(reader.result)) {
                currentCover = reader.result;

                updateCoverPreview();
            } else {
                showFormMessage(
                    "Invalid image data."
                );
            }
            coverLoading = false;
            saveGameButton.disabled = false;
        };

        reader.onerror = () => {
            if (requestId !== coverRequestId) {
                return;
            }

            coverLoading = false;
            saveGameButton.disabled = false;

            showFormMessage(
                "Unable to read the selected image."
            );
        };
        reader.readAsDataURL(file);
    });

    removeCover.addEventListener("click", () => {
        cancelCoverRequest();

        currentCover = "";
        gameCover.value = "";

        updateCoverPreview();
        showFormMessage("");
    });

    /* =====================================
       6. OPEN ADD GAME DIALOG
       ===================================== */

    function openAddGame() {
        cancelCoverRequest();

        gameForm.reset();
        gameId.value = "";
        gameColor.value = "#384C65";
        dailyReset.value = "04:00";
        weeklyReset.value = "Monday";
        currentCover = "";

        updateCoverPreview();
        showFormMessage("");

        dialogTitle.textContent = "Add Game";
        gameDialog.showModal();
        refreshIcons();
    }

    /* =====================================
       7. CLOSE DIALOG
       ===================================== */

    function closeDialog() {
        cancelCoverRequest(); gameDialog.close();
    }

    addGameButton.addEventListener(
        "click", openAddGame
    );

    closeGameDialog.addEventListener(
        "click", closeDialog
    );

    cancelGameButton.addEventListener(
        "click", closeDialog
    );

    gameDialog.addEventListener("close", () => {
        cancelCoverRequest();
    });

    /* =====================================
       8. ADD OR UPDATE GAME
       ===================================== */

    gameForm.addEventListener("submit", event => {
        event.preventDefault();
        showFormMessage("");

        if (coverLoading) {
            showFormMessage(
                "Please wait for the image to finish loading."
            );
            return;
        }

        const name = gameName.value.trim();

        if (!name) {
            showFormMessage(
                "Game name is required."
            );
            gameName.focus();
            return;
        }

        const existingGame = games.find(
            game => game.id === gameId.value
        );

        const game = {
            id: existingGame
                ? existingGame.id : crypto.randomUUID(),

            name: name,

            server:
                gameServer.value.trim(),

            currency:
                gameCurrency.value.trim(),

            timezone:
                gameTimezone.value,

            dailyReset:
                dailyReset.value,

            weeklyReset:
                weeklyReset.value,

            color:
                gameColor.value,

            notes:
                gameNotes.value.trim(),

            favorite:
                gameFavorite.checked,

            cover:
                currentCover,

            createdAt: existingGame

                ? existingGame.createdAt : new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };

        let nextGames;

        if (existingGame) {
            nextGames = games.map(item =>
                item.id === game.id
                    ? game : item
            );
        } else {
            nextGames = [...games, game];
        }

        if (!saveGames(nextGames)) {
            ShowFormMessage(
                "Unable to save game. Storage may be full."
            );
            return;
        }

        searchGames.value = "";
        filterGames.value = "all";

        closeDialog();
        renderGames();

        showStatus(
            existingGame
                ? "Game updated successfully." : "Game added successfully."
        );

    });

    /* =====================================
       9. EDIT GAME
       ===================================== */

    function editGame(id) {
        const game = games.find(
            item => item.id === id
        );

        if (!game) {
            return;
        }
        cancelCoverRequest();

        gameForm.reset();

        gameId.value =
            game.id;

        gameName.value =
            game.name;

        gameServer.value =
            game.server || "";

        gameCurrency.value =
            game.currency || "";

        gameTimezone.value =
            game.timezone || "UTC";

        if (!gameTimezone.value) {
            gameTimezone.value = "UTC";

        }

        dailyReset.value =
            game.dailyReset || "04:00";

        weeklyReset.value =
            game.weeklyReset || "Monday";

        gameColor.value =

            isValidColor(game.color)

                ? game.color : "#384C65";

        gameNotes.value =
            game.notes || "";

        gameFavorite.checked =
            Boolean(game.favorite);

        currentCover =
            game.cover || "";

        updateCoverPreview();

        showFormMessage("");

        dialogTitle.textContent =
            "Edit Game";

        gameDialog.showModal();
        refreshIcons();
    }

    /* =====================================
       10. DELETE GAME
       ===================================== */

    function deleteGame(id) {
        const game = games.find(
            item => item.id === id
        );

        if (!game) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${game.name}" from your library?`
        );

        if (!confirmed) {
            return;
        }

        const nextGames = games.filter(
            item => item.id !== id
        );

        if (!saveGames(nextGames)) {
            return;
        }

        renderGames();
        showStatus(
            "Game deleted successfully."
        );
    }

    /* =====================================
       11. FAVORITE GAME
       ===================================== */

    function toggleFavorite(id) {
        const nextGames = games.map(game => {
            if (game.id === id) {
                return {
                    ...game, favorite: !game.favorite,

                    updatedAt:
                        new Date().toISOString()
                };
            }
            return game;
        });

        if (!saveGames(nextGames)) {
            return;
        }
        renderGames();
    }

    /* =====================================
       12. CREATE GAME CARD
       ===================================== */

    function createGameCard(game) {

        const card = createElement(
            "article", "gl-card"
        );

        card.dataset.id = game.id;

        /* Cover */

        const cover = createElement(
            "div", "gl-cover"
        );

        const color =
            isValidColor(game.color)
                 ? game.color : "#384C65";

        cover.style.setProperty(
            "--game-color", color
        );

        if (isValidCover(game.cover)) {
            const image =
                document.createElement("img");
            image.src = game.cover;
            image.alt = game.name + " cover";
            cover.appendChild(image);
        } else {
            cover.appendChild(
                createIcon("gamepad-2")
            );
        }

        /* Favorite button */

        const favoriteButton = createElement(
            "button", game.favorite
                ? "gl-favorite active" : "gl-favorite"
        );

        favoriteButton.type = "button";

        favoriteButton.setAttribute(
            "aria-label", game.favorite
                ? "Remove from favorites" : "Add to favorites"
        );

        favoriteButton.setAttribute(
            "aria-pressed", String(Boolean(game.favorite))
        );

        favoriteButton.appendChild(
            createIcon("star")
        );

        favoriteButton.addEventListener(
            "click", () => toggleFavorite(game.id)
        );

        cover.appendChild(favoriteButton);

        /* Card content */

        const content = createElement(
            "div", "gl-card-content"
        );

        const title = createElement(
            "h3", "", game.name
        );

        const server = createElement(
            "p", "gl-server", game.server || "No server specified"
        );

        const info = createElement(
            "div", "gl-card-info"
        );

        info.append(
            createElement(
                "p", "", "Currency: " +
                (game.currency || "Not specified")
            ),

            createElement(
                "p", "", "Daily Reset: " + (game.dailyReset || "04:00")
            ),

            createElement(
                "p", "", "Weekly Reset: " +
                (game.weeklyReset || "Monday")
            ),

            createElement(
                "p", "", "Time Zone: " +
                (game.timezone || "UTC")
            )
        );

        content.append(
            title, server, info
        );

        /* Notes */

        if (game.notes) {
            const notes = createElement(
                "p", "gl-card-notes",
                game.notes
            );
            content.appendChild(notes);
        }

        /* Future Game Event button */

        const eventsButton = createElement(
            "button", "gl-view-events", "View Events — Coming Soon"
        );

        eventsButton.type = "button";

        eventsButton.disabled = true;

        eventsButton.title = "Game Event Management will be connected later.";

        /* Card action buttons */

        const actions = createElement(
            "div", "gl-card-actions"
        );

        const editButton = createElement(
            "button", "gl-edit"
        );

        editButton.type = "button";

        editButton.append(
            createIcon("pencil"), document.createTextNode("Edit")
        );

        editButton.addEventListener(
            "click", () => editGame(game.id)
        );

        const deleteButton = createElement(
            "button", "gl-delete"
        );

        deleteButton.type = "button";
        deleteButton.append(
            createIcon("trash-2"),
            document.createTextNode("Delete")
        );

        deleteButton.addEventListener(
            "click",
            () => deleteGame(game.id)
        );

        actions.append(
            editButton, deleteButton
        );

        content.append(
            eventsButton, actions
        );

        card.append(
            cover, content
        );
        return card;
    }

    /* =====================================
       13. CREATE ADD GAME CARD
       ===================================== */

    function createAddCard() {

        const card = createElement(
            "button", "gl-add-card"
        );

        card.type = "button";

        const icon =
            createIcon("plus");

        const title = createElement(
            "strong", "", "Add New Game"
        );

        const description = createElement(
            "span", "", "Start a new adventure"
        );

        card.append(
            icon, title, description
        );

        card.addEventListener(
            "click",
            openAddGame
        );
        return card;
    }

    /* =====================================
       14. UPDATE STATISTICS
       ===================================== */

    function updateStatistics() {
        totalGames.textContent =
            games.length;

        favoriteGames.textContent =
            games.filter(
                game => game.favorite
            ).length;
    }

    /* =====================================
       15. RENDER GAME LIBRARY
       ===================================== */
    function renderGames() {
        gameGrid.replaceChildren();

        const search =
            searchGames.value
                .trim()
                .toLowerCase();

        const filter =
            filterGames.value;

        let filteredGames = games.filter(game => {

            const name =
                game.name.toLowerCase();

            const server =
                (game.server || "").toLowerCase();

            const matchesSearch =
                name.includes(search) ||
                server.includes(search);

            const matchesFilter =
                filter === "all" ||
                Boolean(game.favorite);

            return (
                matchesSearch &&
                matchesFilter
            );
        });

        /* Favorites first */

        filteredGames.sort((a, b) =>
            Number(Boolean(b.favorite)) -
            Number(Boolean(a.favorite))
        );

        /* Empty state */

        if (filteredGames.length === 0) {
            const empty = createElement(
                "p", "gl-empty", games.length === 0
                    ? "Your game library is empty."
                    : "No matching games found."
            );
            gameGrid.appendChild(empty);
        }

        /* Render existing games */

        filteredGames.forEach(game => {
            gameGrid.appendChild(
                createGameCard(game)
            );
        });

        /* Render add card */
      
        gameGrid.appendChild(
            createAddCard()
        );

        updateStatistics();
        refreshIcons();
    }

    /* =====================================
       16. SEARCH AND FILTER EVENTS
       ===================================== */

    searchGames.addEventListener(
        "input",
        renderGames
    );

    filterGames.addEventListener(
        "change",
        renderGames
    );


    /* =====================================
       17. INITIALIZE GAME LIBRARY
       ===================================== */

    loadGames();
    renderGames();

    console.log("TaskQuest Game Library is running.");
})();
