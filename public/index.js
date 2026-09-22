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

        const errorText =
            await response.text();

        console.error(
            "API Error:",
            response.status,
            errorText
        );

        throw new Error(
            `Request failed: ${response.status}`
        );
    }

    window.location.href =
        `/embed/${username}`;

} catch (error) {

    console.error(
        "Generator Error:",
        error
    );

    errorMessage.textContent =
        "Could not generate the resume. Please try again.";

}

});
