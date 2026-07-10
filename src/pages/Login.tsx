import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setMsg('')
    setCarregando(true)
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password: senha })
        if (error) throw error
        setMsg('Conta criada! Se a confirmação por e-mail estiver ativa, verifique sua caixa de entrada.')
      }
    } catch (err: any) {
      setErro(err?.message ?? 'Não foi possível autenticar.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div className="login-brand">
          <span className="brand-mark">GP</span>
          <span>Gestão de Projetos</span>
        </div>
        <h1 className="login-title">{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h1>

        <form onSubmit={enviar} className="stack">
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {erro && <p className="form-error">{erro}</p>}
          {msg && <p className="login-msg">{msg}</p>}

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          className="btn-link"
          onClick={() => {
            setModo(modo === 'entrar' ? 'criar' : 'entrar')
            setErro('')
            setMsg('')
          }}
        >
          {modo === 'entrar' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}
