const form =
    document.getElementById("username-form");

const usernameInput =
    document.getElementById("username");

const errorMessage =
    document.getElementById("error-message");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username =
        usernameInput.value.trim();

    if (!username) {
        return;
    }

    errorMessage.textContent =
        "Checking GitHub profile...";

    try {

        const response =
            await fetch(`/api/resume/${username}`);

        if (!response.ok) {
            throw new Error(
                "GitHub user not found."
            );
        }

        window.location.href =
            `/embed/${username}`;

    } catch (error) {

        errorMessage.textContent =
            "Could not find that GitHub user.";

    }

});
