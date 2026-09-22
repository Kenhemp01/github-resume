const path = window.location.pathname;

const username = path.split("/")[2];

async function loadResume() {

    const response =
    await fetch(`/api/resume/${username}`);

if (!response.ok) {
    throw new Error(
        "Could not load GitHub resume."
    );
}

const data =
    await response.json();

    const user = data.user;
    const repositories = data.repositories;
    document.title =
    `${user.name || user.login} — GitHub Resume`;


    // Profile

    document.getElementById("name").textContent =
        user.name || user.login;

    document.getElementById("username").textContent =
        `@${user.login}`;

    document.getElementById("bio").textContent =
        user.bio || "No bio available.";

    document.getElementById("profile-picture").src =
        user.avatar_url;

    document.getElementById("github-link").href =
        user.html_url;


    // Skills

    const languages = repositories
        .map(repo => repo.language)
        .filter(language => language);

    const uniqueLanguages = [...new Set(languages)];


    const skillsHTML = uniqueLanguages
        .map(language => `
            <span class="skill">
                ${language}
            </span>
        `)
        .join("");

    document.getElementById("skills").innerHTML =
        skillsHTML;

    // GitHub statistics
const statistics = data.statistics;

document.getElementById("statistics").innerHTML = `
    <div class="stat">
        <strong>${statistics.totalRepositories}</strong>
        <span>Repositories</span>
    </div>

    <div class="stat">
        <strong>${statistics.totalLanguages}</strong>
        <span>Languages</span>
    </div>

    <div class="stat">
        <strong>${statistics.totalStars}</strong>
        <span>Stars</span>
    </div>

    <div class="stat">
        <strong>${statistics.totalForks}</strong>
        <span>Forks</span>
    </div>

    <div class="stat">
        <strong>${statistics.recentlyUpdated}</strong>
        <span>Updated Recently</span>
    </div>
`; 


    // Projects
const projectsHTML = repositories
    .map(repo => {

        const updatedDate = new Date(repo.updated_at);

        const formattedDate = updatedDate.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

        return `
    <div class="project">

        <h3>
            ${repo.name}
        </h3>

        <p>
            ${repo.projectSummary}
        </p>

        <div class="project-details">

            <span>
                ${repo.language || "Not specified"}
            </span>

            <span>
                ⭐ ${repo.stargazers_count}
            </span>

            <span>
                Updated ${formattedDate}
            </span>

        </div>

        <div class="project-topics">

            ${(repo.topics || [])
                .map(topic => `
                    <span class="topic">
                        ${topic}
                    </span>
                `)
                .join("")}

        </div>

        <a href="${repo.html_url}" target="_blank">
            View Repository →
        </a>

    </div>
`;
    })
    .join("");

document.getElementById("projects").innerHTML =
    projectsHTML;
}


loadResume();