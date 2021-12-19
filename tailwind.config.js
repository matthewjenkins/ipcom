module.exports = {
  content: ["./*.{html,js}", "./src/**/*.{js,ts}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    // ...
  ],
};
