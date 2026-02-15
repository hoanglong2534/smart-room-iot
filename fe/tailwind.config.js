
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: '#FAF7F2',   // Light Beige
                    secondary: '#FDFBF7', // Lighter Beige
                    dark: '#EFE9D9',      // Darker Beige (for gradient)
                },
                brand: {
                    DEFAULT: '#8C6A3F',   // Brown
                    hover: '#7A5C37',
                },
                text: {
                    title: '#3A2F24',
                    body: '#6B543E',
                    light: '#FBC02D',
                    temp: '#F44336',
                    humidity: '#5BD4D4',
                },
                card: {
                    humidity: '#E8F2F1',
                    light: '#FFF4D6',
                    temp: '#FCE8E6',
                }
            },
        },
    },
    plugins: [],
}
