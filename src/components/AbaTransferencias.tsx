import { useState } from 'react'
import { fmt, num, labelCentro, labelCategoria, type PrevistoLinha, type RealizadoLinha } from '../lib/financeiro'
import { readList } from '../lib/storage'
import {
  FLUXO,
  REJEITADA,
  proximaAcao,
  saldosPorCombo,
  saldoDoCombo,
  type Transferencia,
} from '../lib/transferencias'

type Props = {
  previsto: PrevistoLinha[]
  realizado: RealizadoLinha[]
  transferencias: Transferencia[]
  setTransferencias: (fn: (t: Transferencia[]) => Transferencia[]) => void
}

const novaVazia = {
  centroOrigemId: '',
  categoriaOrigemId: '',
  centroDestinoId: '',
  categoriaDestinoId: '',
  valor: '',
  justificativa: '',
}

export default function AbaTransferencias({ previsto, realizado, transferencias, setTransferencias }: Props) {
  const [nova, setNova] = useState(novaVazia)
  const [erro, setErro] = useState('')

  const centros = readList<any>('gp.centros')
  const categorias = readList<any>('gp.categorias')
  const combos = saldosPorCombo(previsto, realizado, transferencias)
  const combosComSaldo = combos.filter((c) => c.saldo > 0)

  function up(campo: keyof typeof novaVazia, valor: string) {
    setNova((n) => ({ ...n, [campo]: valor }))
  }

  // Origem é escolhida a partir de combos existentes com saldo (value = "centro|categoria")
  function setOrigem(chave: string) {
    const [centroOrigemId, categoriaOrigemId] = chave.split('|')
    setNova((n) => ({ ...n, centroOrigemId, categoriaOrigemId }))
  }

  function solicitar() {
    if (!nova.centroOrigemId) {
      setErro('Selecione a origem (centro + categoria com saldo).')
      return
    }
    if (!nova.centroDestinoId || !nova.categoriaDestinoId) {
      setErro('Selecione o centro e a categoria de destino.')
      return
    }
    const valor = num(nova.valor)
    if (valor <= 0) {
      setErro('Informe um valor maior que zero.')
      return
    }
    const saldo = saldoDoCombo(combos, nova.centroOrigemId, nova.categoriaOrigemId)
    if (valor > saldo) {
      setErro(`Sem saldo suficiente na origem. Saldo disponível: ${fmt(saldo)}.`)
      return
    }
    if (
      nova.centroOrigemId === nova.centroDestinoId &&
      nova.categoriaOrigemId === nova.categoriaDestinoId
    ) {
      setErro('Origem e destino não podem ser iguais.')
      return
    }
    const id = transferencias.reduce((m, t) => Math.max(m, t.id), 0) + 1
    setTransferencias((l) => [...l, { id, ...nova, status: 'Solicitada' }])
    setNova(novaVazia)
    setErro('')
  }

  function avancar(t: Transferencia, proximo: string) {
    setTransferencias((l) => l.map((x) => (x.id === t.id ? { ...x, status: proximo } : x)))
  }
  function rejeitar(id: number) {
    setTransferencias((l) => l.map((x) => (x.id === id ? { ...x, status: REJEITADA } : x)))
  }
  function remover(id: number) {
    setTransferencias((l) => l.filter((x) => x.id !== id))
  }

  return (
    <div>
      <div className="lock-banner">
        ℹ️ Somente pessoas no perfil <strong>Gerente</strong> deveriam solicitar; a aprovação segue
        <strong> PMO → Gerente do CC → Board</strong>. Essa restrição por perfil entra com o login.
      </div>

      <div className="grid-add">
        <select value={nova.centroOrigemId ? `${nova.centroOrigemId}|${nova.categoriaOrigemId}` : ''} onChange={(e) => setOrigem(e.target.value)}>
          <option value="">Origem (com saldo)…</option>
          {combosComSaldo.map((c) => (
            <option key={`${c.centroId}|${c.categoriaId}`} value={`${c.centroId}|${c.categoriaId}`}>
              {labelCentro(c.centroId)} / {labelCategoria(c.categoriaId)} — saldo {fmt(c.saldo)}
            </option>
          ))}
        </select>
        <span className="seta">→</span>
        <select value={nova.centroDestinoId} onChange={(e) => up('centroDestinoId', e.target.value)}>
          <option value="">Centro destino…</option>
          {centros.map((c) => (
            <option key={c.id} value={c.id}>
              {c.codigo} — {c.descricao}
            </option>
          ))}
        </select>
        <select value={nova.categoriaDestinoId} onChange={(e) => up('categoriaDestinoId', e.target.value)}>
          <option value="">Categoria destino…</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descricao}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Valor"
          value={nova.valor}
          onChange={(e) => up('valor', e.target.value)}
        />
        <button type="button" className="btn-secondary" onClick={solicitar}>
          Solicitar
        </button>
      </div>
      <input
        className="just-input"
        placeholder="Justificativa (opcional)"
        value={nova.justificativa}
        onChange={(e) => up('justificativa', e.target.value)}
      />

      {erro && <p className="form-error">{erro}</p>}
      {combosComSaldo.length === 0 && (
        <p className="muted">Não há saldo disponível em nenhuma categoria (lance valores na aba “Valor Previsto”).</p>
      )}

      {transferencias.length > 0 && (
        <div className="transf-lista">
          {transferencias.map((t) => {
            const acao = proximaAcao(t.status)
            const rejeitada = t.status === REJEITADA
            const idxAtual = FLUXO.indexOf(t.status as (typeof FLUXO)[number])
            return (
              <div key={t.id} className="card transf-item">
                <div className="transf-head">
                  <strong>
                    {labelCentro(t.centroOrigemId)} / {labelCategoria(t.categoriaOrigemId)} →{' '}
                    {labelCentro(t.centroDestinoId)} / {labelCategoria(t.categoriaDestinoId)}
                  </strong>
                  <span className="transf-valor">{fmt(num(t.valor))}</span>
                </div>
                {t.justificativa && <p className="muted">{t.justificativa}</p>}

                {rejeitada ? (
                  <span className="badge badge-vermelho">Rejeitada</span>
                ) : (
                  <div className="stepper">
                    {FLUXO.map((etapa, i) => (
                      <span
                        key={etapa}
                        className={`step ${i < idxAtual ? 'step-ok' : ''} ${i === idxAtual ? 'step-now' : ''}`}
                      >
                        {i < idxAtual ? '✓ ' : ''}
                        {etapa}
                      </span>
                    ))}
                  </div>
                )}

                <div className="transf-actions">
                  {acao && (
                    <button type="button" className="btn-primary" onClick={() => avancar(t, acao.proximo)}>
                      {acao.label}
                    </button>
                  )}
                  {!rejeitada && t.status !== 'Efetivada' && (
                    <button type="button" className="btn-secondary" onClick={() => rejeitar(t.id)}>
                      Rejeitar
                    </button>
                  )}
                  <button type="button" className="btn-link-danger" onClick={() => remover(t.id)}>
                    Remover
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
