import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './Login.css'
import { supabase } from './supabase'

type LoginProps = {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  // =========================================================
  // ESTADOS DO LOGIN
  // =========================================================

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  // Cadastro
  const [modoCadastro, setModoCadastro] = useState(false)
  const [nomeCadastro, setNomeCadastro] = useState('')
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('')

  // Recuperação de senha
  const [modoRecuperacao, setModoRecuperacao] = useState(false)
  const [modoRedefinirSenha, setModoRedefinirSenha] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')

  // =========================================================
  // DETECTAR RECUPERAÇÃO DE SENHA
  // =========================================================

  useEffect(() => {
    // -------------------------------------------------------
    // Função responsável por colocar a tela no modo
    // "Criar nova senha"
    // -------------------------------------------------------

    const ativarModoRedefinicao = () => {
      setModoCadastro(false)
      setModoRecuperacao(true)
      setModoRedefinirSenha(true)

      setSenha('')
      setNovaSenha('')
      setSenhaConfirmacao('')
      setErro('')
    }

    // -------------------------------------------------------
    // 1. Escuta eventos do Supabase
    //
    // Quando o usuário clica no link recebido por e-mail,
    // o Supabase pode disparar PASSWORD_RECOVERY.
    // -------------------------------------------------------

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log('Evento Supabase:', event)

      if (event === 'PASSWORD_RECOVERY') {
        ativarModoRedefinicao()
      }
    })

    // -------------------------------------------------------
    // 2. Verifica a URL atual
    //
    // Isso é importante porque o usuário pode abrir
    // diretamente o link recebido no e-mail.
    //
    // O Supabase normalmente adiciona:
    //
    // #access_token=...
    // &refresh_token=...
    // &type=recovery
    //
    // -------------------------------------------------------

    const hash = window.location.hash
    const search = window.location.search

    const recuperacaoPeloHash =
      hash.includes('type=recovery')

    const recuperacaoPelaURL =
      new URLSearchParams(search).get('type') === 'recovery'

    if (
      recuperacaoPeloHash ||
      recuperacaoPelaURL
    ) {
      console.log(
        'Link de recuperação detectado pela URL.'
      )

      ativarModoRedefinicao()
    }

    // -------------------------------------------------------
    // Limpeza do listener
    // -------------------------------------------------------

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // =========================================================
  // CADASTRO
  // =========================================================

  const cadastrar = async (e: FormEvent) => {
    e.preventDefault()

    setErro('')

    // Verifica campos
    if (
      nomeCadastro.trim() === '' ||
      email.trim() === '' ||
      senha.trim() === '' ||
      senhaConfirmacao.trim() === ''
    ) {
      setErro('Preencha todos os campos.')
      return
    }

    // Verifica tamanho da senha
    if (senha.length < 6) {
      setErro(
        'A senha deve ter pelo menos 6 caracteres.'
      )
      return
    }

    // Verifica confirmação
    if (senha !== senhaConfirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    // Cria usuário no Supabase
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,

      options: {
        data: {
          nome: nomeCadastro.trim(),
        },
      },
    })

    if (error) {
      console.error(
        'Erro ao criar conta:',
        error
      )

      setErro(error.message)
      return
    }

    // Guarda o nome localmente
    localStorage.setItem(
      'casa-em-ordem-nome',
      nomeCadastro.trim()
    )

    setErro(
      'Conta criada com sucesso! Verifique seu e-mail para confirmar a conta.'
    )

    setModoCadastro(false)

    setSenha('')
    setSenhaConfirmacao('')
  }

  // =========================================================
  // RECUPERAÇÃO / ALTERAÇÃO DE SENHA
  // =========================================================

  const recuperarSenha = async (e: FormEvent) => {
    e.preventDefault()

    setErro('')

    // =======================================================
    // CASO 1
    // Usuário está criando uma NOVA SENHA
    // =======================================================

    if (modoRedefinirSenha) {
      // Verifica tamanho
      if (novaSenha.length < 6) {
        setErro(
          'A nova senha deve ter pelo menos 6 caracteres.'
        )
        return
      }

      // Verifica se existe sessão de recuperação
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error(
          'Erro ao verificar sessão:',
          sessionError
        )

        setErro(
          'Não foi possível verificar a sessão de recuperação.'
        )

        return
      }

      if (!sessionData.session) {
        setErro(
          'A sessão de recuperação expirou. Solicite um novo link.'
        )

        return
      }

      // =====================================================
      // ALTERA A SENHA NO SUPABASE
      // =====================================================

      const { error } =
        await supabase.auth.updateUser({
          password: novaSenha,
        })

      if (error) {
        console.error(
          'Erro ao alterar senha:',
          error
        )

        setErro(
          'Não foi possível alterar a senha. ' +
          error.message
        )

        return
      }

      // =====================================================
      // SENHA ALTERADA COM SUCESSO
      // =====================================================

      // Encerra a sessão de recuperação
      await supabase.auth.signOut()

      // Limpa campos
      setNovaSenha('')
      setSenha('')

      // Volta para o login
      setModoRecuperacao(false)
      setModoRedefinirSenha(false)

      setErro(
        'Senha alterada com sucesso! Faça login novamente.'
      )

      return
    }

    // =======================================================
    // CASO 2
    // Usuário está solicitando o E-MAIL DE RECUPERAÇÃO
    // =======================================================

    if (email.trim() === '') {
      setErro(
        'Digite o e-mail cadastrado.'
      )

      return
    }

    // =======================================================
    // ENVIA E-MAIL DE RECUPERAÇÃO
    // =======================================================

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          // O usuário será enviado de volta para
          // o endereço atual da aplicação.
          redirectTo: window.location.origin,
        }
      )

    if (error) {
      console.error(
        'Erro ao enviar recuperação:',
        error
      )

      setErro(error.message)

      return
    }

    setNovaSenha('')

    setErro(
      'Enviamos um link de recuperação para seu e-mail. Verifique sua caixa de entrada.'
    )
  }

  // =========================================================
  // LOGIN
  // =========================================================

  const entrar = async (e: FormEvent) => {
    e.preventDefault()

    setErro('')

    // Verifica campos
    if (
      email.trim() === '' ||
      senha.trim() === ''
    ) {
      setErro(
        'Preencha seu e-mail e sua senha.'
      )

      return
    }

    // Faz login
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      })

    if (error) {
      console.error(
        'Erro ao fazer login:',
        error
      )

      setErro(
        'E-mail ou senha incorretos.'
      )

      return
    }

    // =======================================================
    // PEGA O NOME DO USUÁRIO
    // =======================================================

    const nome =
      data.user.user_metadata?.nome

    if (nome) {
      localStorage.setItem(
        'casa-em-ordem-nome',
        nome
      )
    }

    // Esse item pode continuar existindo para compatibilidade
    // com versões antigas do aplicativo.
    localStorage.setItem(
      'casa-em-ordem-logado',
      'true'
    )

    // Informa ao App.tsx que o login foi realizado
    onLogin()
  }

  // =========================================================
  // ABRIR TELA "ESQUECI MINHA SENHA"
  // =========================================================

  const abrirRecuperacao = () => {
    setModoCadastro(false)

    setModoRecuperacao(true)

    setModoRedefinirSenha(false)

    setSenha('')
    setNovaSenha('')
    setSenhaConfirmacao('')
    setErro('')
  }

  // =========================================================
  // VOLTAR PARA LOGIN
  // =========================================================

  const voltarLogin = () => {
    setModoCadastro(false)

    setModoRecuperacao(false)

    setModoRedefinirSenha(false)

    setSenha('')
    setNovaSenha('')
    setSenhaConfirmacao('')
    setErro('')
  }

  // =========================================================
  // TELA
  // =========================================================

  return (
    <main className="login-page">
      <section className="login-card">

        {/* LOGO */}
        <div className="login-logo">
          🏠
        </div>

        {/* ETIQUETA */}
        <span className="login-etiqueta">
          ✨ CASA EM ORDEM
        </span>

        {/* TÍTULO */}
        <h1>
          {modoRedefinirSenha
            ? 'Criar nova senha'
            : modoRecuperacao
              ? 'Recuperar senha'
              : modoCadastro
                ? 'Criar sua conta'
                : 'Bem-vinda!'}
        </h1>

        {/* DESCRIÇÃO */}
        <p className="login-descricao">
          {modoRedefinirSenha
            ? 'Digite uma nova senha para sua conta.'
            : modoRecuperacao
              ? 'Digite seu e-mail para receber o link de recuperação.'
              : 'Organize sua casa sem comprometer sua rotina.'}
        </p>

        {/* ===================================================
            FORMULÁRIO
        =================================================== */}

        <form
          onSubmit={
            modoRedefinirSenha || modoRecuperacao
              ? recuperarSenha
              : modoCadastro
                ? cadastrar
                : entrar
          }
          className="login-form"
        >

          {/* =================================================
              NOME — CADASTRO
          ================================================= */}

          {modoCadastro && (
            <label>
              Nome

              <input
                type="text"
                value={nomeCadastro}
                onChange={(e) => {
                  setNomeCadastro(
                    e.target.value
                  )

                  setErro('')
                }}
                placeholder="Seu nome"
              />
            </label>
          )}

          {/* =================================================
              E-MAIL

              Não mostramos o e-mail quando o usuário
              já está criando uma nova senha.
          ================================================= */}

          {!modoRedefinirSenha && (
            <label>
              E-mail

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(
                    e.target.value
                  )

                  setErro('')
                }}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </label>
          )}

          {/* =================================================
              SENHA

              No modo recuperação normal não mostramos
              senha.

              No modo redefinir senha mostramos a nova senha.
          ================================================= */}

          {(!modoRecuperacao ||
            modoRedefinirSenha) && (
            <label>
              {modoRedefinirSenha
                ? 'Nova senha'
                : 'Senha'}

              <input
                type="password"
                value={
                  modoRedefinirSenha
                    ? novaSenha
                    : senha
                }
                onChange={(e) => {
                  if (modoRedefinirSenha) {
                    setNovaSenha(
                      e.target.value
                    )
                  } else {
                    setSenha(
                      e.target.value
                    )
                  }

                  setErro('')
                }}
                placeholder={
                  modoRedefinirSenha
                    ? 'Digite a nova senha'
                    : 'Digite sua senha'
                }
                autoComplete={
                  modoRedefinirSenha
                    ? 'new-password'
                    : 'current-password'
                }
              />
            </label>
          )}

          {/* =================================================
              CONFIRMAR SENHA — CADASTRO
          ================================================= */}

          {modoCadastro && (
            <label>
              Confirmar senha

              <input
                type="password"
                value={senhaConfirmacao}
                onChange={(e) => {
                  setSenhaConfirmacao(
                    e.target.value
                  )

                  setErro('')
                }}
                placeholder="Digite a senha novamente"
                autoComplete="new-password"
              />
            </label>
          )}

          {/* =================================================
              ERRO / MENSAGEM
          ================================================= */}

          {erro && (
            <p className="login-erro">
              {erro}
            </p>
          )}

          {/* =================================================
              BOTÃO PRINCIPAL
          ================================================= */}

          <button
            type="submit"
            className="login-botao"
          >
            {modoRedefinirSenha
              ? 'Alterar senha'
              : modoRecuperacao
                ? 'Enviar'
                : modoCadastro
                  ? 'Criar conta'
                  : 'Entrar'}
          </button>

          {/* =================================================
              BOTÃO CADASTRO / LOGIN
          ================================================= */}

          {!modoRecuperacao &&
            !modoRedefinirSenha && (
              <button
                type="button"
                className="login-alternar"
                onClick={() => {
                  setModoCadastro(
                    !modoCadastro
                  )

                  setErro('')
                }}
              >
                {modoCadastro
                  ? 'Já tenho uma conta'
                  : 'Ainda não tenho uma conta'}
              </button>
            )}

          {/* =================================================
              RECUPERAÇÃO / VOLTAR
          ================================================= */}

          {modoRecuperacao ||
          modoRedefinirSenha ? (
            <button
              type="button"
              className="login-alternar"
              onClick={voltarLogin}
            >
              Voltar para login
            </button>
          ) : (
            <button
              type="button"
              className="login-alternar"
              onClick={abrirRecuperacao}
            >
              Esqueci minha senha
            </button>
          )}

        </form>

        {/* RODAPÉ */}
        <p className="login-rodape">
          Sua rotina organizada, um dia de cada vez 💙
        </p>

      </section>
    </main>
  )
}

export default Login