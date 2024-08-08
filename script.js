document.addEventListener('DOMContentLoaded', () => {
    const girlsNames = ["Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Charlotte", "Amelia", "Evelyn", "Abigail"];
    const boysNames = ["Liam", "Noah", "Oliver", "Elijah", "William", "James", "Benjamin", "Lucas", "Henry", "Alexander"];
    let currentNameType = 'girls';
    let scores = {
        girls: {},
        boys: {}
    };
    girlsNames.forEach(name => scores.girls[name] = 0);
    boysNames.forEach(name => scores.boys[name] = 0);

    const name1Div = document.getElementById('name1');
    const name2Div = document.getElementById('name2');
    const chooseName1Btn = document.getElementById('choose-name1');
    const chooseName2Btn = document.getElementById('choose-name2');
    const calculateRankingBtn = document.getElementById('calculate-ranking');
    const saveResultsBtn = document.getElementById('save-results');
    const uploadResultsBtn = document.getElementById('upload-results');
    const fileInput = document.getElementById('file-input');
    const errorMessage = document.getElementById('error-message');
    const nameTypeToggle = document.getElementById('name-type-toggle');
    const girlsResultsList = document.getElementById('girls-results-list');
    const boysResultsList = document.getElementById('boys-results-list');

    function getRandomPair() {
        const names = currentNameType === 'girls' ? girlsNames : boysNames;
        let index1 = Math.floor(Math.random() * names.length);
        let index2;
        do {
            index2 = Math.floor(Math.random() * names.length);
        } while (index1 === index2);
        return [names[index1], names[index2]];
    }

    function displayNames() {
        const [name1, name2] = getRandomPair();
        name1Div.textContent = name1;
        name2Div.textContent = name2;
    }

    function updateScores(preferredName) {
        scores[currentNameType][preferredName]++;
        displayNames();
    }

    function displayResults() {
        girlsResultsList.innerHTML = '';
        boysResultsList.innerHTML = '';

        const sortedGirlsNames = Object.keys(scores.girls).sort((a, b) => scores.girls[b] - scores.girls[a]);
        sortedGirlsNames.forEach(name => {
            const li = document.createElement('li');
            li.textContent = `${name}: ${scores.girls[name]}`;
            girlsResultsList.appendChild(li);
        });

        const sortedBoysNames = Object.keys(scores.boys).sort((a, b) => scores.boys[b] - scores.boys[a]);
        sortedBoysNames.forEach(name => {
            const li = document.createElement('li');
            li.textContent = `${name}: ${scores.boys[name]}`;
            boysResultsList.appendChild(li);
        });
    }

    function saveResults() {
        let csvContent = "data:text/csv;charset=utf-8,Type,Name,Score\n";

        const sortedGirlsNames = Object.keys(scores.girls).sort((a, b) => scores.girls[b] - scores.girls[a]);
        sortedGirlsNames.forEach(name => {
            csvContent += `girls,${name},${scores.girls[name]}\n`;
        });

        const sortedBoysNames = Object.keys(scores.boys).sort((a, b) => scores.boys[b] - scores.boys[a]);
        sortedBoysNames.forEach(name => {
            csvContent += `boys,${name},${scores.boys[name]}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'baby_name_ratings.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function validateCSV(content) {
        const rows = content.split('\n');
        if (rows.length < 2) return false;

        const headers = rows[0].split(',');
        if (headers[0].trim() !== 'Type' || headers[1].trim() !== 'Name' || headers[2].trim() !== 'Score') return false;

        for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;
            const cols = rows[i].split(',');
            if (cols.length !== 3) return false;
            const type = cols[0].trim();
            const name = cols[1].trim();
            const score = parseInt(cols[2].trim(), 10);
            if (!['girls', 'boys'].includes(type) || (type === 'girls' && !girlsNames.includes(name)) || (type === 'boys' && !boysNames.includes(name)) || isNaN(score)) return false;
        }
        return true;
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            if (!validateCSV(content)) {
                errorMessage.textContent = "Invalid CSV format. Please ensure the file has 'Type,Name,Score' headers and valid data.";
                errorMessage.style.display = 'block';
                return;
            }

            errorMessage.style.display = 'none';

            // Clear current scores
            girlsNames.forEach(name => scores.girls[name] = 0);
            boysNames.forEach(name => scores.boys[name] = 0);

            // Update scores with new data
            const rows = content.split('\n').slice(1);
            rows.forEach(row => {
                if (row.trim() === '') return;
                const [type, name, score] = row.split(',').map(cell => cell.trim());
                if (type && name && score) {
                    scores[type][name] = parseInt(score, 10);
                }
            });
            displayResults();
        };
        reader.readAsText(file);
    }

    nameTypeToggle.addEventListener('change', (event) => {
        currentNameType = event.target.value;
        displayNames();
    });

    chooseName1Btn.addEventListener('click', () => {
        const selectedName = name1Div.textContent;
        updateScores(selectedName);
    });

    chooseName2Btn.addEventListener('click', () => {
        const selectedName = name2Div.textContent;
        updateScores(selectedName);
    });

    calculateRankingBtn.addEventListener('click', displayResults);
    saveResultsBtn.addEventListener('click', saveResults);
    uploadResultsBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);

    displayNames();
});
