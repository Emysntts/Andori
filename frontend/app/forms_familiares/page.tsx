'use client'

import { useState, useRef } from 'react'

export default function FormsFamiliaresPage() {
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    // Como não há backend, apenas mantemos visualmente que foi "salvo"
    // e não persistimos os dados.
    setTimeout(() => setSubmitted(false), 3000)
  }

  function handleClear() {
    formRef.current?.reset()
    setSubmitted(false)
  }

  return (
    <div>
      <section
        className="panel p-8"
        style={{ borderTopLeftRadius: '2.5rem' }}
      >
        <div className="space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#01162A]">Formulário para familiares</h1>
              <p className="text-[#01162A]/70 mt-1">Informações sobre o estudante (uso interno, não conectado).</p>
            </div>
          </header>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold text-[#01162A]" htmlFor="nome">
                  Nome do estudante
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Ex.: Ana Souza"
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-2 focus:outline-none focus:border-[#EFB4C8] bg-transparent text-[#01162A] placeholder:text-[#C5C5C5]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-[#01162A]" htmlFor="nivelSuporte">
                  Nível de suporte
                </label>
                <select
                  id="nivelSuporte"
                  name="nivelSuporte"
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-2 focus:outline-none focus:border-[#EFB4C8] bg-transparent text-[#01162A]"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  <option value="baixo">Baixo</option>
                  <option value="moderado">Moderado</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold text-[#01162A]" htmlFor="interesses">
                  Interesses / Hiperfocos
                </label>
                <textarea
                  id="interesses"
                  name="interesses"
                  placeholder="Ex.: dinossauros, trens, astronomia..."
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 min-h-[110px] focus:outline-none focus:border-[#EFB4C8] bg-transparent text-[#01162A] placeholder:text-[#C5C5C5] resize-y"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-[#01162A]" htmlFor="preferencias">
                  Preferências de aprendizado
                </label>
                <textarea
                  id="preferencias"
                  name="preferencias"
                  placeholder="Ex.: aprende melhor com recursos visuais, passo a passo, música..."
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 min-h-[110px] focus:outline-none focus:border-[#EFB4C8] bg-transparent text-[#01162A] placeholder:text-[#C5C5C5] resize-y"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold text-[#01162A]" htmlFor="comportamento">
                  Comportamento
                </label>
                <textarea
                  id="comportamento"
                  name="comportamento"
                  placeholder="Observações gerais sobre comportamento..."
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 min-h-[110px] focus:outline-none focus:border-[#EFB4C8] bg-transparent text-[#01162A] placeholder:text-[#C5C5C5] resize-y"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-[#01162A]" htmlFor="dificuldades">
                  Dificuldades observadas
                </label>
                <textarea
                  id="dificuldades"
                  name="dificuldades"
                  placeholder="Ex.: leitura de textos longos, mudanças de rotina..."
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 min-h-[110px] focus:outline-none focus:border-[#EFB4C8] bg-transparent text-[#01162A] placeholder:text-[#C5C5C5] resize-y"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-[#01162A]" htmlFor="laudo">
                Anexar laudo (opcional)
              </label>
              <input
                id="laudo"
                name="laudo"
                type="file"
                className="block w-full text-sm text-[#01162A] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-[#C5C5C5] file:text-sm file:font-semibold file:bg-transparent file:text-[#01162A] hover:file:bg-[#C5C5C5]/20"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-xl border-2 border-[#EFB4C8] text-[#EFB4C8] font-semibold hover:bg-[#EFB4C8] hover:text-white transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-2 rounded-xl border-2 border-[#C5C5C5] text-[#01162A] font-semibold hover:bg-[#C5C5C5]/20 transition-colors"
              >
                Limpar
              </button>
              {submitted && (
                <span className="text-sm text-[#01162A]/70 ml-2">
                  Formulário salvo localmente (sem envio).
                </span>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}


