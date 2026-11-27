/* =========================================
   GAME EVENT PREVIEW
   ========================================= */

(() => {
    /* Initialize Lucide icons */
    if (window.lucide) {
        window.lucide.createIcons();
    }

    /* Event configuration */
    const eventConfig = {
        totalDays: 14, requiredDays: 7, dailyReward: 60, finalReward: 1600
    };

    /* Initial event status */

    const initialStates = [
        "completed",  // Day 1
        "completed",  // Day 2
        "completed",  // Day 3
        "missed",     // Day 4
        "completed",  // Day 5
        "missed",     // Day 6
        "pending",    // Day 7
        "pending",    // Day 8
        "pending",    // Day 9
        "pending",    // Day 10
        "pending",    // Day 11
        "pending",    // Day 12
        "pending",    // Day 13
        "pending"     // Day 14
    ];

    let dayStates = [...initialStates];
    let rewardClaimed = false;

    /* Select HTML elements */

    const daysContainer = document.querySelector("#demoEventDays");
    const progressBar = document.querySelector("#demoProgressBar");
    const progressText = document.querySelector("#demoProgressText");
    const completedText = document.querySelector("#demoCompleted");
    const missedText = document.querySelector("#demoMissed");
    const remainingText = document.querySelector("#demoRemaining");
    const earnedText = document.querySelector("#demoEarned");
    const lostText = document.querySelector("#demoLost");
    const eventMessage = document.querySelector("#demoEventMessage");
    const claimButton = document.querySelector("#demoClaimButton");
    const resetButton = document.querySelector("#demoResetButton");

    if (!daysContainer) {
        return;
    }

    /* =====================================
       GENERATE EVENT DAYS
       ===================================== */

    function renderDays() {
        daysContainer.replaceChildren();
        dayStates.forEach((status, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "tq-event-day " + status;

            button.dataset.index = index;
            button.setAttribute(
                "aria-label", "Day " + (index + 1) + ": " + status
            );

            const label = document.createElement("span");

            label.textContent = "Day " + (index + 1);

            const symbol = document.createElement("span");
            symbol.className = "tq-event-day-symbol";

            if (status === "completed") {
                symbol.textContent = "✓";
            } else if (status === "missed") {
                symbol.textContent = "×";
            } else {
                symbol.textContent = "○";
            }

            button.append(label, symbol);
            daysContainer.appendChild(button);
        });
    }

    /* =====================================
       CALCULATE EVENT PROGRESS
       ===================================== */

    function calculateEvent() {
        const completed = dayStates.filter(
                status => status === "completed"
            ).length;

        const missed = dayStates.filter(
                status => status === "missed"
            ).length;

        const remaining = eventConfig.totalDays - completed - missed;

        const needed = Math.max(
            0, eventConfig.requiredDays - completed
        );

        const allowedMisses = Math.max(
            0, remaining - needed
        );
        const earned = completed * eventConfig.dailyReward;

        const lost = missed * eventConfig.dailyReward;

        const unlocked = completed >= eventConfig.requiredDays;

        const achievable = completed + remaining >= eventConfig.requiredDays;

        return {
            completed, missed, remaining, needed, allowedMisses, earned, lost, unlocked, achievable
        };
    }

    /* =====================================
       UPDATE EVENT DISPLAY
       ===================================== */

    function updateEvent() {
        const result = calculateEvent();

        progressBar.max = eventConfig.requiredDays;

        progressBar.value = Math.min(
            result.completed, eventConfig.requiredDays
        );

        progressText.textContent = result.completed + " / " + eventConfig.requiredDays + " days";

        completedText.textContent = result.completed;

        missedText.textContent = result.missed;

        remainingText.textContent = result.remaining;

        earnedText.textContent = result.earned.toLocaleString();

        lostText.textContent = result.lost.toLocaleString();

        /* Reward already claimed */

        if (rewardClaimed) {
            eventMessage.textContent = "Final reward recorded: " + eventConfig.finalReward.toLocaleString();

            claimButton.textContent = "Reward Claimed";

            claimButton.disabled = true;

            /* Reward unlocked */

        } else if (result.unlocked) {
            eventMessage.textContent = "Congratulations! Your final reward " + "is ready to claim.";

            claimButton.textContent = "Claim Final Reward";
            claimButton.disabled = false;

            /* Reward still achievable */
        } else if (result.achievable) {
            eventMessage.textContent =
                "Complete " + result.needed + " more day(s) to unlock the final reward. " + "You can miss up to " + result.allowedMisses + " more day(s).";
            claimButton.textContent = "Final Reward Locked";
            claimButton.disabled = true;
            /* Reward no longer achievable */
        } else {
            eventMessage.textContent = "Not enough remaining opportunities " + "to unlock the final reward.";

            claimButton.textContent = "Reward Unreachable";

            claimButton.disabled = true;
        }
    }

    /* =====================================
       CHANGE DAY STATUS
       ===================================== */

    daysContainer.addEventListener("click", event => {
        const button = event.target.closest(".tq-event-day");

        if (!button) {
            return;
        }
        const index = Number(button.dataset.index);
        const currentStatus = dayStates[index];

        if (currentStatus === "pending") {
            dayStates[index] = "completed";
        } else if (currentStatus === "completed") {
            dayStates[index] = "missed";
        } else {
            dayStates[index] = "pending";
        }

        /* Editable demo: changing a day resets claim */

        rewardClaimed = false;

        renderDays();
        updateEvent();

        daysContainer.children[index]?.focus();
    });

    /* =====================================
       CLAIM FINAL REWARD
       ===================================== */

    claimButton.addEventListener("click", () => {
        const result = calculateEvent();
        if (!result.unlocked || rewardClaimed) {
            return;
        }
        rewardClaimed = true;
        updateEvent();
    });

    /* =====================================
       RESET EVENT
       ===================================== */

    resetButton.addEventListener("click", () => {
        dayStates = [...initialStates];
        rewardClaimed = false;
        renderDays();
        updateEvent();
    });

    /* =====================================
       INITIALIZE EVENT
       ===================================== */

    renderDays();
    updateEvent();
    console.log("TaskQuest Event Preview is running.");
})();
