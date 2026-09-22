const path =
    window.location.pathname;

const username =
    path.split("/")[2];

const resumeURL =
    `${window.location.origin}/resume/${username}`;

const badgeURL =
    `${window.location.origin}/badge/${username}`;

const markdown =
    `[![GitHub Resume](${badgeURL})](${resumeURL})`;

document.getElementById("badge").src =
    badgeURL;

document.getElementById("markdown").value =
    markdown;

document
    .getElementById("copy-button")
    .addEventListener("click", async () => {

        await navigator.clipboard.writeText(
            markdown
        );

        document.getElementById(
            "copy-button"
        ).textContent = "Copied!";
    });
