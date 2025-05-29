import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./src/**/*.{html,js,jsx}"],
    theme: {
        extend: {}
    },
    plugins: [daisyui],
    daisyui: {
        themes: [
            "light",
            "dark",
            "cupcake",
            "dracula"
        ],
    },
}