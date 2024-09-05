const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;


app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.get('/joueurs', (req, res) => {
    fs.readFile('joueurs.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(JSON.parse(data));
    });
});


app.post('/joueurs', (req, res) => {
    const newPlayer = req.body;
    fs.readFile('joueurs.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const players = JSON.parse(data);
        newPlayer.id = players.length + 1; 
        players.push(newPlayer);
        fs.writeFile('joueurs.json', JSON.stringify(players), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.status(201).json(newPlayer); 
        });
    });
});


app.put('/joueurs/:id', (req, res) => {
    const playerId = parseInt(req.params.id);
    const updatedPlayer = req.body;
    fs.readFile('joueurs.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        let players = JSON.parse(data);
        const playerIndex = players.findIndex(player => player.id === playerId);
        if (playerIndex === -1) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        players[playerIndex] = { ...players[playerIndex], ...updatedPlayer };
        fs.writeFile('joueurs.json', JSON.stringify(players), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json(players[playerIndex]);
        });
    });
});


app.delete('/joueurs/:id', (req, res) => {
    const playerId = parseInt(req.params.id);
    fs.readFile('joueurs.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        let players = JSON.parse(data);
        const filteredPlayers = players.filter(player => player.id !== playerId);
        if (filteredPlayers.length === players.length) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        fs.writeFile('joueurs.json', JSON.stringify(filteredPlayers), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.status(204).end(); 
        });
    });
});


app.get('/joueurs/byTeam/:idEquipe', (req, res) => {
    const teamId = parseInt(req.params.idEquipe);
    fs.readFile('joueurs.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const players = JSON.parse(data);
        const teamPlayers = players.filter(player => player.idEquipe === teamId);
        res.json(teamPlayers);
    });
});


app.get('/joueurs/team/:id', (req, res) => {
    const playerId = parseInt(req.params.id);
    fs.readFile('joueurs.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const players = JSON.parse(data);
        const player = players.find(player => player.id === playerId);
        if (!player) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        res.json({ idEquipe: player.idEquipe });
    });
});


app.get('/joueurs/search/:nom', (req, res) => {
    const playerName = req.params.nom.toLowerCase();
    fs.readFile('joueurs.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const players = JSON.parse(data);
        const filteredPlayers = players.filter(player => player.nom.toLowerCase().includes(playerName));
        res.json(filteredPlayers);
    });
});


app.get('/', (req, res) => {
    const crudOperations = {
        getPlayers: {
            description: "Get all players",
            method: "GET",
            endpoint: "/joueurs"
        },
        createPlayer: {
            description: "Create a new player",
            method: "POST",
            endpoint: "/joueurs"
        },
        updatePlayer: {
            description: "Update an existing player",
            method: "PUT",
            endpoint: "/joueurs/:id"
        },
        deletePlayer: {
            description: "Delete a player",
            method: "DELETE",
            endpoint: "/joueurs/:id"
        },
        getPlayersByTeam: {
            description: "Get players by team ID",
            method: "GET",
            endpoint: "/joueurs/byTeam/:idEquipe"
        },
        getTeamOfPlayer: {
            description: "Get team ID of a player",
            method: "GET",
            endpoint: "/joueurs/team/:id"
        },
        searchPlayersByName: {
            description: "Search players by name",
            method: "GET",
            endpoint: "/joueurs/search/:nom"
        }
    };

    fs.readFile('joueurs.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const responseData = {
            data: JSON.parse(data),
            crudOperations: crudOperations
        };
        res.json(responseData);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
