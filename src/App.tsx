import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Projetos from './pages/Projetos'
import Pessoas from './pages/cadastros/Pessoas'
import CentrosResponsabilidade from './pages/cadastros/CentrosResponsabilidade'
import TiposProjeto from './pages/cadastros/TiposProjeto'
import CategoriasProjeto from './pages/cadastros/CategoriasProjeto'
import Login from './pages/Login'
import { useAuth } from './context/AuthProvider'
import { supabase } from './lib/supabase'
import { syncCadastros } from './lib/cadastroSync'
import { useEffect } from 'react'

function App() {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (session) syncCadastros()
  }, [session])

  if (loading) {
    return <div className="loading-screen">Carregando…</div>
  }
  if (!session) {
    return <Login />
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">GP</span>
          <span className="brand-name">Gestão de Projetos</span>
        </div>

        <nav className="nav">
          <NavLink to="/dashboard" className="nav-link">
            <span className="nav-icon">▩</span> Dashboard
          </NavLink>
          <NavLink to="/projetos" className="nav-link">
            <span className="nav-icon">▤</span> Projetos
          </NavLink>

          <div className="nav-group">Cadastros</div>
          <NavLink to="/cadastros/pessoas" className="nav-link">
            <span className="nav-icon">◍</span> Pessoas
          </NavLink>
          <NavLink to="/cadastros/centros-responsabilidade" className="nav-link">
            <span className="nav-icon">◈</span> Centros de Responsabilidade
          </NavLink>
          <NavLink to="/cadastros/tipos-projeto" className="nav-link">
            <span className="nav-icon">◇</span> Tipos de Projeto
          </NavLink>
          <NavLink to="/cadastros/categorias-projeto" className="nav-link">
            <span className="nav-icon">◆</span> Categorias de Projeto
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-email" title={session.user.email ?? ''}>
            {session.user.email}
          </div>
          <button type="button" className="logout-btn" onClick={() => supabase.auth.signOut()}>
            Sair
          </button>
          <div className="versao">v0.2 · Supabase</div>
        </div>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/cadastros/pessoas" element={<Pessoas />} />
          <Route path="/cadastros/centros-responsabilidade" element={<CentrosResponsabilidade />} />
          <Route path="/cadastros/tipos-projeto" element={<TiposProjeto />} />
          <Route path="/cadastros/categorias-projeto" element={<CategoriasProjeto />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
