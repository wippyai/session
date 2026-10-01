import themePreset from '@wippy-fe/theme/tailwind.config'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [themePreset],
  content: [
    './src/**/*.{vue,ts}',
    // Tests name classes in strings and regexes (e.g. `opacity-60`, `text-warn-700`);
    // scanned, they would add utilities to the shipped CSS that no component uses.
    '!./src/**/*.test.ts',
  ],
}
