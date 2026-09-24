const express = require("express");
const path = require("path");

const app = express();
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;


function calculateProjectScore(repo) {

    let score = 0;

   
    if (repo.description) {
        score += 5;
    }

 
    if (repo.language) {
        score += 4;
    }

 
    if (repo.topics && repo.topics.length > 0) {
        score += 3;
    }

    
    score += Math.min(
        repo.stargazers_count * 2,
        10
    );

    
    score += Math.min(
        repo.forks_count,
        5
    );

   
    const lastUpdated =
        new Date(repo.updated_at);

    const currentDate =
        new Date();

    const daysSinceUpdate =
        (currentDate - lastUpdated) /
        (1000 * 60 * 60 * 24);

    if (daysSinceUpdate <= 30) {
        score += 5;
    } else if (daysSinceUpdate <= 90) {
        score += 3;
    } else if (daysSinceUpdate <= 180) {
        score += 1;
    }

    return score;
}


// Serve files from the public folder

app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.sendFile(
        __dirname + "/public/index.html"
    );
});

app.get("/embed/:username", (req, res) => {

    res.sendFile(
        __dirname + "/public/embed.html"
    );

});

app.get("/resume/:username", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "resume.html")
    );

});

async function getRepositoryReadme(username, repositoryName) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${username}/${repositoryName}/readme`,
            {
                headers: {
    "Accept": "application/vnd.github.raw+json",
    "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "GitHub-Resume-Generator"
}
            }
        );

        if (!response.ok) {
            return "";
        }

        const readme = await response.text();

        return readme;

    } catch (error) {
        console.error(
            `Could not retrieve README for ${repositoryName}`
        );

        return "";
    }
}

async function getRepositoryLanguages(username, repositoryName) {

    try {

        const response = await fetch(
    `https://api.github.com/repos/${username}/${repositoryName}/languages`,
    {
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "GitHub-Resume-Generator"
        }
    }
);

        if (!response.ok) {
            return {};
        }

        return await response.json();

    } catch (error) {

        console.error(
            `Could not retrieve languages for ${repositoryName}`
        );

        return {};
    }
}

function extractProjectSummary(readme, description) {

    if (!readme) {
        return description || "No project description available.";
    }

    const lines = readme
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    // Look for a paragraph near the beginning
    // of the README.
    for (let i = 0; i < Math.min(lines.length, 20); i++) {

        const line = lines[i];

        // Ignore Markdown headings
        if (line.startsWith("#")) {
            continue;
        }

        // Ignore images and badges
        if (
            line.startsWith("!") ||
            line.startsWith("[")
        ) {
            continue;
        }

        // Ignore code blocks
        if (line.startsWith("```")) {
            continue;
        }

        // Ignore common Markdown formatting
        if (
            line.startsWith("-") ||
            line.startsWith("*") ||
            line.startsWith(">")
        ) {
            continue;
        }

        // Look for a reasonably descriptive paragraph.
        if (line.length >= 50) {

            return line
                .replace(/\*\*/g, "")
                .replace(/\*/g, "")
                .replace(/`/g, "")
                .trim();
        }
    }

    // Fall back to the GitHub repository description.
    return description || "No project description available.";
}

async function getAllRepositories(username) {

    const repositories = [];
    let page = 1;

    while (true) {

        const response = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`,
    {
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "GitHub-Resume-Generator"
        }
    }
);

        if (!response.ok) {
            throw new Error(
                "Could not retrieve repositories."
            );
        }

        const pageRepositories =
            await response.json();

        repositories.push(...pageRepositories);

        if (pageRepositories.length < 100) {
            break;
        }

        page++;
    }

    return repositories;
}

app.get("/badge/:username", async (req, res) => {

    const username =
        req.params.username.trim();

    try {

        const response = await fetch(
            `https://api.github.com/users/${username}`
        );

        if (!response.ok) {
            return res.status(404).send(
                "GitHub user not found."
            );
        }

        const user =
            await response.json();

        const displayName =
            user.name || user.login;

        const svg = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="220"
                height="40"
                viewBox="0 0 220 40"
            >

                <rect
                    width="220"
                    height="40"
                    rx="6"
                    fill="#222"
                />

                <text
                    x="15"
                    y="17"
                    fill="#ffffff"
                    font-family="Arial, sans-serif"
                    font-size="12"
                >
                    GitHub Resume
                </text>

                <text
                    x="15"
                    y="31"
                    fill="#cccccc"
                    font-family="Arial, sans-serif"
                    font-size="11"
                >
                    ${displayName}
                </text>

            </svg>
        `;

        res.setHeader(
            "Content-Type",
            "image/svg+xml"
        );

        res.send(svg);

    } catch (error) {

        console.error(
            "Could not generate resume badge:",
            error
        );

        res.status(500).send(
            "Could not generate badge."
        );
    }
});


app.get("/api/resume/:username", async (req, res) => {

    const username =
        req.params.username.trim();

    if (!username) {
        return res.status(400).json({
            error: "GitHub username is required."
        });
    }

    try {

        // Get GitHub profile
        const userResponse = await fetch(
    `https://api.github.com/users/${username}`,
    {
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "GitHub-Resume-Generator"
        }
    }
);

if (!userResponse.ok) {

    const errorDetails =
        await userResponse.text();

    console.error(
        "GitHub API error:",
        userResponse.status,
        errorDetails
    );

    return res.status(userResponse.status).json({
        error: "GitHub API request failed.",
        status: userResponse.status,
        details: errorDetails
    });
}

const user =
    await userResponse.json();

        // Get all repositories
        const repositories =
            await getAllRepositories(username);

      


// Score repositories
const originalRepositories =
    repositories.filter(repo => !repo.fork);

const scoredRepositories =
    originalRepositories.map(repo => {

        return {
            ...repo,

            resumeScore:
                calculateProjectScore(repo)
        };

    });

// Sort repositories
scoredRepositories.sort((a, b) => {
    return b.resumeScore -
        a.resumeScore;
});

// Select top five repositories
const featuredRepositories =
    scoredRepositories.slice(0, 5);

for (const repo of featuredRepositories) {

    repo.readme =
        await getRepositoryReadme(
            username,
            repo.name
        );

    repo.projectSummary =
        extractProjectSummary(
            repo.readme,
            repo.description
        );

    repo.languages =
        await getRepositoryLanguages(
            username,
            repo.name
        );
}
        // Calculate GitHub statistics
        const totalStars = repositories.reduce(
            (total, repo) =>
                total + repo.stargazers_count,
            0
        );

        const totalForks = repositories.reduce(
            (total, repo) =>
                total + repo.forks_count,
            0
        );

        const languages = repositories
            .map(repo => repo.language)
            .filter(language => language);

        const uniqueLanguages = [
            ...new Set(languages)
        ];

        const recentlyUpdated =
            repositories.filter(repo => {

                const lastUpdated =
                    new Date(repo.updated_at);

                const currentDate =
                    new Date();

                const daysSinceUpdate =
                    (currentDate - lastUpdated) /
                    (1000 * 60 * 60 * 24);

                return daysSinceUpdate <= 30;

            }).length;

        // Send data to browser
        res.json({

            user: user,

            repositories:
                featuredRepositories,

            statistics: {

                totalRepositories:
                    repositories.length,

                totalStars:
                    totalStars,

                totalForks:
                    totalForks,

                totalLanguages:
                    uniqueLanguages.length,

                recentlyUpdated:
                    recentlyUpdated
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong."
        });
    }
});


app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
