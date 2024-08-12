document.addEventListener('DOMContentLoaded', () => {
    const girlsNames = ["Luma", "Fern", "Aurora", "Olive", "Iris", "Aurelia", "Eros", "Astraea", "Aster", "Sage", "Willow", "Meadow", "Lotus", "Everest"];
    const boysNames = ["Kai", "Axel", "Dax", "Gideon", "Lief", "Ianthe", "Cyrus", "Rowan", "Wren", "Eos", "Aster", "Sage", "Alder", "Astor", "Orion", "Forrest", "Cedar", "Cypress", "Gabe(Gabriel)", "Everest", "Edison", "Everett", "Kelvin", "Nero"];

    let currentTournament; // No tournament is selected by default

    // Get references to the elements
    const boysNamesButton = document.getElementById('boys-names-button');
    const girlsNamesButton = document.getElementById('girls-names-button');
    const startOverButton = document.getElementById('start-over-button');
    const name1Div = document.getElementById('name1');
    const name2Div = document.getElementById('name2');
    const chooseName1Btn = document.getElementById('choose-name1');
    const chooseName2Btn = document.getElementById('choose-name2');
    const roundInfoDiv = document.getElementById('round-info');
    const currentRoundWinnersList = document.getElementById('current-round-winners-list');
    const previousRoundsContainer = document.getElementById('previous-rounds-container');
    const topPickDisplaySection = document.getElementById('top-pick-display');
    let topPickNameDiv = document.getElementById('top-pick-name');
    const runnerUpNamesList = document.getElementById('runner-up-names-list');

    // Disable the "I Prefer This Name" buttons initially
    disableRatingButtons();

    // Initialize the state for a tournament
    function initializeState(names) {
        return {
            names: names,
            currentRound: 1,
            mainBracket: initializeTournament(names),
            roundType: 'main',
            winners: [],
            currentPairIndex: 0,
            previousRounds: [], // Store all previous rounds
            finished: false,
            topPick: null, // Store the top pick when the tournament ends
            previousRoundWinners: [] // Store the winners from the round before the final
        };
    }

    function initializeTournament(names) {
        const shuffledNames = names.sort(() => Math.random() - 0.5);

        let bracket = [];
        for (let i = 0; i < shuffledNames.length; i += 2) {
            if (i + 1 < shuffledNames.length) {
                bracket.push([shuffledNames[i], shuffledNames[i + 1]]);
            } else {
                bracket.push([shuffledNames[i], shuffledNames[i]]); // Pair with itself to avoid undefined
            }
        }

        return bracket;
    }

    // Event listeners for gender selection buttons
    boysNamesButton.addEventListener('click', () => {
        startTournament('boys');
    });

    girlsNamesButton.addEventListener('click', () => {
        startTournament('girls');
    });

    function startTournament(gender) {
        // Initialize the tournament based on gender selection
        if (gender === 'boys') {
            currentTournament = initializeState(boysNames);
            boysNamesButton.disabled = true;
            girlsNamesButton.disabled = true;
        } else if (gender === 'girls') {
            currentTournament = initializeState(girlsNames);
            boysNamesButton.disabled = true;
            girlsNamesButton.disabled = true;
        }

        // Enable the "I Prefer This Name" buttons
        enableRatingButtons();

        // Display the first pair of names
        displayNames();
        displayRoundInfo();
    }

    function displayNames() {
        if (currentTournament.finished) {
            displayTopPick();
            disableRatingButtons();
            return;
        }

        const currentPair = getCurrentPair();
        name1Div.textContent = currentPair[0];
        name2Div.textContent = currentPair[1] || '';
        chooseName2Btn.style.display = currentPair[1] ? 'block' : 'none';
    }

    function getCurrentPair() {
        return currentTournament.mainBracket[currentTournament.currentPairIndex];
    }

    function displayRoundInfo() {
        roundInfoDiv.textContent = `Round ${currentTournament.currentRound}`;
    }

    function advanceTournament(winner, loser) {
        currentTournament.winners.push(winner);

        currentTournament.currentPairIndex++;

        if (currentTournament.currentPairIndex >= currentTournament.mainBracket.length) {
            saveCurrentRoundResults();
            if (currentTournament.winners.length === 1) {
                currentTournament.finished = true;
                currentTournament.topPick = currentTournament.winners[0]; // Set the top pick
                displayTopPick();
                disableRatingButtons();
                return;
            } else {
                // Save the winners of the current round as previousRoundWinners
                currentTournament.previousRoundWinners = [...currentTournament.winners];

                currentTournament.mainBracket = initializeTournament(currentTournament.winners);
                currentTournament.winners = [];
                currentTournament.currentRound++;
                currentTournament.currentPairIndex = 0;
            }
        }

        displayNames();
        displayRoundInfo();
        displayTournamentProgress();
    }

    function saveCurrentRoundResults() {
        currentTournament.previousRounds.push({
            round: currentTournament.currentRound,
            winners: [...currentTournament.winners]
        });
        displayPreviousRounds();
    }

    function displayTournamentProgress() {
        currentRoundWinnersList.innerHTML = '';

        currentTournament.winners.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            currentRoundWinnersList.appendChild(li);
        });
    }

    function displayPreviousRounds() {
        previousRoundsContainer.innerHTML = '';

        currentTournament.previousRounds.forEach(round => {
            const roundSummary = document.createElement('div');
            roundSummary.classList.add('round-summary');

            const roundTitle = document.createElement('h3');
            roundTitle.textContent = `Round ${round.round}`;

            const winnersList = document.createElement('ul');
            round.winners.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;
                winnersList.appendChild(li);
            });

            roundSummary.appendChild(roundTitle);
            roundSummary.appendChild(document.createTextNode('Winners:'));
            roundSummary.appendChild(winnersList);

            previousRoundsContainer.appendChild(roundSummary);
        });
    }

    function displayTopPick() {
        topPickNameDiv = document.getElementById('top-pick-name');
        if (topPickNameDiv && currentTournament.topPick) {
            topPickNameDiv.textContent = currentTournament.topPick;
            displayRunnerUpNames(); // Display runner-up names along with the top pick
            topPickDisplaySection.style.display = 'block'; // Show the top pick section
        }
    }

    function displayRunnerUpNames() {
        runnerUpNamesList.innerHTML = ''; // Clear any previous content

        // Calculate the round that is 2 less than the current round
        const runnerUpRound = currentTournament.currentRound - 2;

        if (runnerUpRound >= 1) {
            const round = currentTournament.previousRounds.find(r => r.round === runnerUpRound);

            if (round) {
                // Filter out the top pick from the runner-up names
                const runnerUpNames = round.winners.filter(name => name !== currentTournament.topPick);

                // Display the runner-up names
                runnerUpNames.forEach(name => {
                    const li = document.createElement('li');
                    li.textContent = name;
                    runnerUpNamesList.appendChild(li);
                });
            }
        }
    }

    function disableRatingButtons() {
        chooseName1Btn.disabled = true;
        chooseName2Btn.disabled = true;
    }

    function enableRatingButtons() {
        chooseName1Btn.disabled = false;
        chooseName2Btn.disabled = false;
    }

    // Add event listener for the Start Over button
    startOverButton.addEventListener('click', () => {
        location.reload(); // Reload the page when Start Over button is clicked
    });

    chooseName1Btn.addEventListener('click', () => {
        const selectedName = name1Div.textContent;
        const otherName = name2Div.textContent;
        advanceTournament(selectedName, otherName);
    });

    chooseName2Btn.addEventListener('click', () => {
        const selectedName = name2Div.textContent;
        const otherName = name1Div.textContent;
        advanceTournament(selectedName, otherName);
    });
});
