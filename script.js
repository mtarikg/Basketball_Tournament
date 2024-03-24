document.addEventListener('DOMContentLoaded', function () {
    const nameForm = document.getElementById('nameForm');

    nameForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission

        // Get user's name from input field
        const userName = document.getElementById('userName').value;

        // Store user's name in local storage
        localStorage.setItem('userName', userName);

        // Redirect to team selection page
        window.location.href = 'team-selection.html';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Retrieve user's name from local storage
    const userName = localStorage.getItem('userName');

    // Display user's name on the page
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    const teamListContainer = document.getElementById('teamList');
    const startTournamentBtn = document.getElementById('startTournamentBtn');

    // Display teams
    teams.forEach((team, index) => {
        const teamCard = createTeamCard(team);
        teamCard.addEventListener('click', () => selectTeam(teamCard, index));
        teamListContainer.appendChild(teamCard);
    });

    // Start tournament button click event
    startTournamentBtn.addEventListener('click', () => {
        const selectedTeamIndex = localStorage.getItem('selectedTeamIndex');
        if (selectedTeamIndex !== null) {
            window.location.href = 'tournament.html';
        } else {
            alert('Please select a team before starting the tournament.');
        }
    });

    // Function to create team card
    function createTeamCard(team) {
        const teamCard = document.createElement('div');
        teamCard.classList.add('team-card');
        teamCard.innerHTML = `
            <img src="${team.logo}" alt="${team.name}" width="200"> <!-- Adjust width as needed -->
            <p>${team.name}</p>
        `;
        return teamCard;
    }

    // Function to handle team selection
    function selectTeam(selectedCard, index) {
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => card.classList.remove('selected'));
        selectedCard.classList.add('selected');
        startTournamentBtn.removeAttribute('disabled');
        localStorage.setItem('selectedTeamIndex', index);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const tournamentContainer = document.getElementById('tournamentContainer');
    const continueBtn = document.getElementById('continueBtn');
    const playAllBtn = document.getElementById('playAllBtn');
    continueBtn.style.display = "none"; // Hide continue button initially

    const userName = localStorage.getItem('userName');
    const selectedTeamIndex = localStorage.getItem('selectedTeamIndex');
    const selectedTeam = teams[selectedTeamIndex];

    // Initialize tournament stages
    let currentStage = 0;
    const stages = [
        { name: "Quarter-finals", games: generateGames(teams) },
        { name: "Semi-finals", games: [] },
        { name: "Final", games: [] }
    ];

    // Display current stage when page loads
    displayStage();

    // Event listener for the "Play All" button to play all games
    playAllBtn.addEventListener('click', () => {
        playAllGames(stages[currentStage].games);
        playAllBtn.disabled = true; // Disable the Play All Games button after clicking
    });

    // Continue button click event
    continueBtn.addEventListener('click', () => {
        // Proceed to the next stage
        currentStage++;
        continueBtn.style.display = "none"; // Hide continue button for the next stage
        playAllBtn.disabled = false; // Re-enable the Play All Games button for the next stage
        if (currentStage < stages.length) {
            // Check if there are more stages
            if (currentStage === 1) {
                // If it's the Semi-finals stage, generate games using winners of the Quarter-finals
                stages[currentStage].games = generateGames(getWinnersFromPreviousStage(stages[currentStage - 1].games));
            } else if (currentStage === 2) {
                // If it's the Final stage, generate a single game using winners of the Semi-finals
                stages[currentStage].games = generateFinalGame(getWinnersFromPreviousStage(stages[currentStage - 1].games));
            }
            displayStage(); // Display the next stage
        } else {
            // Final stage reached, display champion message
            const champion = stages[currentStage - 1].games[0].winner;
            tournamentContainer.innerHTML += `
            <img src="${champion.logo}" alt="${champion.name}" width="200">
            <p class="champion-message">The champion is: ${champion.name}!</p>
            `;
            // Hide Play All Games button
            playAllBtn.style.display = "none";

            // Check if the champion is the user's team
            if (champion.name === selectedTeam.name) {
                tournamentContainer.innerHTML += `<p class="special-message">Congratulations ${userName}! Your team ${champion.name} is the champion!</p>`;
            }
        }
    });

    // Function to generate games for each stage
    function generateGames(teams) {
        const shuffledTeams = shuffle(teams.slice()); // Copy and shuffle teams array
        const games = [];
        for (let i = 0; i < shuffledTeams.length; i += 2) {
            const game = { homeTeam: shuffledTeams[i], awayTeam: shuffledTeams[i + 1], winner: null };
            games.push(game);
        }
        return games;
    }

    // Function to display current stage
    function displayStage() {
        const stage = stages[currentStage];
        tournamentContainer.innerHTML = `<h2>${stage.name}</h2>`;
        stage.games.forEach((game, index) => {
            const gameDiv = document.createElement('div');
            gameDiv.classList.add('game');
            const homeTeamText = game.homeTeam === selectedTeam ? `<span class="selected-team">${game.homeTeam.name}</span>` : game.homeTeam.name;
            const awayTeamText = game.awayTeam === selectedTeam ? `<span class="selected-team">${game.awayTeam.name}</span>` : game.awayTeam.name;
            gameDiv.innerHTML = `${homeTeamText} vs ${awayTeamText}`;
            tournamentContainer.appendChild(gameDiv);
        });
    }

    // Function to play all games on the current stage
    function playAllGames(games) {
        const stage = stages[currentStage];
        const gameResults = [];
        games.forEach((game, index) => {
            // Simulate game result (for simplicity, just select a random winner)
            game.winner = Math.random() < 0.5 ? game.homeTeam : game.awayTeam;
            gameResults.push(`${game.homeTeam.name} vs ${game.awayTeam.name}: ${game.winner.name} wins`);
        });

        // Display winners in tournament container
        const gameElement = document.createElement('div');
        gameElement.classList.add('game-results');
        gameElement.innerHTML = gameResults.join('<br>');
        tournamentContainer.appendChild(gameElement);

        // Check if all games are played
        if (stage.games.every(game => game.winner !== null)) {
            // All games played, enable continue button
            continueBtn.style.display = "block";
        }
    }

    // Function to get winners from the previous stage
    function getWinnersFromPreviousStage(games) {
        const winners = [];
        games.forEach(game => {
            winners.push(game.winner);
        });
        return winners;
    }

    // Function to generate a single game for the Final stage
    function generateFinalGame(winners) {
        if (winners.length === 2) {
            // If there are two winners from the Semi-finals, create a single game
            const game = { homeTeam: winners[0], awayTeam: winners[1], winner: null };
            return [game];
        } else {
            // If there are not exactly two winners, return an empty array
            return [];
        }
    }

    // Shuffle function to shuffle array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});