export default {
  extends: ["stylelint-config-tailwindcss"],
  rules: {
    "order/properties-alphabetical-order": true,
    "import-notation": null,
  },
  plugins: ["stylelint-order"],
};
