import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base '/gestao-projetos/' apenas no build (GitHub Pages); '/' no dev local.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/gestao-projetos/' : '/',
  plugins: [react()],
}))
