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

const badge =
    document.getElementById("badge");

const markdownBox =
    document.getElementById("markdown");

const copyButton =
    document.getElementById("copy-button");

markdownBox.value =
    markdown;

badge.onload = () => {

    badge.style.display =
        "inline-block";

};

badge.onerror = () => {

    console.error(
        "Could not load GitHub Resume badge."
    );

};

badge.src =
    badgeURL;

copyButton.addEventListener(
    "click",
    async () => {

        await navigator.clipboard.writeText(
            markdown
        );

        copyButton.textContent =
            "Copied!";

    }
);
