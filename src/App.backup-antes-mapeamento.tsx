import { useEffect, useState } from 'react'
import Login from './Login'
import { supabase } from './supabase'

// ======================================================
// TIPOS
// ======================================================

type Tarefa = {
  id: number
  nome: string
  dia: string
  tempo: string
  horario?: string
  icone: string
  ambienteId: number
  recorrente?: boolean
  semanaCriada?: string
  concluida: boolean
}

type Ambiente = {
  id: number
  nome: string
  icone: string
}

type RegistroHistorico = {
  data: string
  concluidas: number
  total: number
  progresso: number
  tarefasConcluidas?: string[]
}

// ======================================================
// DADOS INICIAIS
// ======================================================

const diasDaSemana = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

const tarefasIniciais: Tarefa[] = [
  {
    id: 1,
    nome: 'Organizar os quartos',
    dia: 'Segunda-feira',
    tempo: '20–30 minutos',
    icone: '🛏️',
    ambienteId: 1,
    concluida: false,
  },
  {
    id: 2,
    nome: 'Limpar o banheiro',
    dia: 'Terça-feira',
    tempo: '20–30 minutos',
    icone: '🛁',
    ambienteId: 2,
    concluida: false,
  },
  {
    id: 3,
    nome: 'Organizar a cozinha',
    dia: 'Quarta-feira',
    tempo: '30 minutos',
    icone: '🍳',
    ambienteId: 3,
    concluida: false,
  },
  {
    id: 4,
    nome: 'Organizar a sala',
    dia: 'Quinta-feira',
    tempo: '25 minutos',
    icone: '🛋️',
    ambienteId: 4,
    concluida: false,
  },
  {
    id: 5,
    nome: 'Lavanderia e revisão geral',
    dia: 'Sexta-feira',
    tempo: '30–40 minutos',
    icone: '🧺',
    ambienteId: 5,
    concluida: false,
  },
]

const ambientesIniciais: Ambiente[] = [
  { id: 1, nome: 'Quartos', icone: '🛏️' },
  { id: 2, nome: 'Banheiro', icone: '🛁' },
  { id: 3, nome: 'Cozinha', icone: '🍳' },
  { id: 4, nome: 'Sala', icone: '🛋️' },
  { id: 5, nome: 'Lavanderia', icone: '🧺' },
]

const menu = [
  { id: 'inicio', icone: '🏠', nome: 'Início' },
  { id: 'hoje', icone: '📅', nome: 'Hoje' },
  { id: 'rotina', icone: '📋', nome: 'Rotina' },
  { id: 'calendario', icone: '🗓️', nome: 'Calendário' },
  { id: 'historico', icone: '📊', nome: 'Histórico' },
  { id: 'ambientes', icone: '🛋️', nome: 'Ambientes' },
  { id: 'configuracoes', icone: '⚙️', nome: 'Configurações' },
]

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

function App() {
  // ====================================================
  // DADOS DO USUÁRIO
  // ====================================================

  const [nomeUsuario, setNomeUsuario] = useState(() => {
    return localStorage.getItem('casa-em-ordem-nome') || 'Vanessa'
  })

  const [nomeTemporario, setNomeTemporario] = useState(() => {
    return localStorage.getItem('casa-em-ordem-nome') || 'Vanessa'
  })

  // ====================================================
  // AUTENTICAÇÃO
  // ====================================================

  // Indica se existe uma sessão válida no Supabase.
  const [estaLogada, setEstaLogada] = useState(false)

  // Enquanto verificamos a sessão, mostramos uma pequena tela
  // de carregamento para evitar o "pisca" da tela de Login.
  const [verificandoSessao, setVerificandoSessao] = useState(true)

  // ====================================================
  // TAREFAS
  // ====================================================

  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    const salvas = localStorage.getItem('casa-em-ordem-tarefas')

    if (salvas) {
      try {
        return JSON.parse(salvas)
      } catch {
        return tarefasIniciais
      }
    }

    return tarefasIniciais
  })

  // ====================================================
  // AMBIENTES
  // ====================================================


  // ==================================================
  // CARREGAR TAREFAS DO SUPABASE
  // ==================================================

  const carregarTarefasDoSupabase = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return
    }

    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: true })

    if (error) {
      console.error('Erro ao carregar tarefas:', error)
      return
    }

    if (data) {
      setTarefas(data as Tarefa[])
    }
  }

  const [ambientes, setAmbientes] = useState<Ambiente[]>(() => {
    const salvos = localStorage.getItem('casa-em-ordem-ambientes')

    if (salvos) {
      try {
        return JSON.parse(salvos)
      } catch {
        return ambientesIniciais
      }
    }

    return ambientesIniciais
  })

  // ====================================================
  // TEMA
  // ====================================================

  const [tema, setTema] = useState<'claro' | 'escuro'>(() => {
    const temaSalvo = localStorage.getItem('casa-em-ordem-tema')

    return temaSalvo === 'escuro' ? 'escuro' : 'claro'
  })

  // ====================================================
  // NAVEGAÇÃO
  // ====================================================

  const [pagina, setPagina] = useState('inicio')
  const [menuAberto, setMenuAberto] = useState(false)

  // ====================================================
  // FILTROS
  // ====================================================

  const [filtroAmbiente, setFiltroAmbiente] = useState<number | null>(
    null,
  )

  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'pendentes' | 'concluidas'
  >('todos')

  const [filtroHistorico, setFiltroHistorico] = useState<
    '7' | '30' | 'todos'
  >('todos')

  // ====================================================
  // HISTÓRICO
  // ====================================================

  const [historico, setHistorico] = useState<RegistroHistorico[]>(() => {
    const salvo = localStorage.getItem('casa-em-ordem-historico')

    if (salvo) {
      try {
        return JSON.parse(salvo)
      } catch {
        return []
      }
    }

    return []
  })

  // ====================================================
  // CALENDÁRIO
  // ====================================================

  const [semanaCalendario, setSemanaCalendario] = useState(() => {
    const data = new Date()
    const dia = data.getDay()
    const diferenca = dia === 0 ? -6 : 1 - dia

    const segunda = new Date(data)

    segunda.setDate(data.getDate() + diferenca)
    segunda.setHours(0, 0, 0, 0)

    return segunda
  })

  // ====================================================
  // MODAL DE TAREFA
  // ====================================================

  const [modalTarefa, setModalTarefa] = useState(false)

  const [tarefaEditando, setTarefaEditando] =
    useState<Tarefa | null>(null)

  const [nome, setNome] = useState('')
  const [dia, setDia] = useState('Segunda-feira')
  const [tempo, setTempo] = useState('20–30 minutos')
  const [horario, setHorario] = useState('')
  const [icone, setIcone] = useState('🧹')
  const [ambienteId, setAmbienteId] = useState(1)
  const [recorrente, setRecorrente] = useState(false)

  // ====================================================
  // MODAL DE AMBIENTE
  // ====================================================

  const [modalAmbiente, setModalAmbiente] = useState(false)

  const [ambienteEditando, setAmbienteEditando] =
    useState<Ambiente | null>(null)

  const [nomeAmbiente, setNomeAmbiente] = useState('')
  const [iconeAmbiente, setIconeAmbiente] = useState('🏠')

  // ====================================================
  // AUTENTICAÇÃO COM SUPABASE
  // ====================================================

  useEffect(() => {
    // Verifica se o usuário já possui uma sessão válida.
    const verificarSessao = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // ==================================================
      // RECUPERAÇÃO DE SENHA
      // ==================================================
      // Quando o usuário clica no link enviado pelo
      // Supabase, existe uma sessão temporária.
      //
      // Essa sessão NÃO significa que o usuário fez login.
      // Precisamos manter o Login.tsx aberto para que ele
      // possa criar a nova senha.
      // ==================================================

      const estaEmRecuperacao =
        window.location.hash.includes('type=recovery') ||
        new URLSearchParams(window.location.search).get('type') === 'recovery'

      if (estaEmRecuperacao) {
        // Não entra no Dashboard durante recuperação.
        setEstaLogada(false)
      } else if (session?.user) {
        // ==================================================
        // LOGIN NORMAL
        // ==================================================

        setEstaLogada(true)

        // O nome pode estar dentro do user_metadata do Supabase.
        const nome =
          session.user.user_metadata?.nome ||
          localStorage.getItem('casa-em-ordem-nome') ||
          'Vanessa'

        setNomeUsuario(nome)
        setNomeTemporario(nome)

        // Carrega as tarefas do usuário no Supabase.
        carregarTarefasDoSupabase()

        localStorage.setItem(
          'casa-em-ordem-nome',
          nome
        )
      } else {
        // Nenhuma sessão.
        setEstaLogada(false)
      }

      setVerificandoSessao(false)
    }

    verificarSessao()

    // Observa alterações na autenticação:
    // login, logout, recuperação de senha etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      // Durante a recuperação de senha, o Supabase cria
      // uma sessão temporária. Essa sessão NÃO deve
      // abrir o Dashboard.
      if (_evento === 'PASSWORD_RECOVERY') {
        setEstaLogada(false)
        return
      }

      // Para login normal, a sessão controla o acesso.
      setEstaLogada(!!session)

      if (session?.user) {
        const nome =
          session.user.user_metadata?.nome ||
          localStorage.getItem('casa-em-ordem-nome') ||
          'Vanessa'

        setNomeUsuario(nome)
        setNomeTemporario(nome)
      }
    })

    // Remove o observador quando o componente sair da tela.
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // ====================================================
  // LOGIN
  // ====================================================

  const fazerLogin = async () => {
    // O Login.tsx já realiza o login no Supabase.
    // Aqui apenas recuperamos os dados do usuário.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const nome =
      user?.user_metadata?.nome ||
      localStorage.getItem('casa-em-ordem-nome') ||
      'Vanessa'

    setNomeUsuario(nome)
    setNomeTemporario(nome)

    setEstaLogada(true)
  }

  // ====================================================
  // LOGOUT
  // ====================================================

  const fazerLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erro ao sair:', error)
      alert('Não foi possível sair. Tente novamente.')
      return
    }

    // Remove o indicador antigo usado pela versão anterior.
    localStorage.removeItem('casa-em-ordem-logado')

    setEstaLogada(false)
  }

  // ====================================================
  // SALVAR TAREFAS NO LOCALSTORAGE
  // ====================================================

  useEffect(() => {
    localStorage.setItem(
      'casa-em-ordem-tarefas',
      JSON.stringify(tarefas),
    )
  }, [tarefas])

  // ====================================================
  // SALVAR AMBIENTES NO LOCALSTORAGE
  // ====================================================

  useEffect(() => {
    localStorage.setItem(
      'casa-em-ordem-ambientes',
      JSON.stringify(ambientes),
    )
  }, [ambientes])

  // ====================================================
  // SALVAR HISTÓRICO NO LOCALSTORAGE
  // ====================================================

  useEffect(() => {
    localStorage.setItem(
      'casa-em-ordem-historico',
      JSON.stringify(historico),
    )
  }, [historico])

  // ====================================================
  // AMBIENTE SELECIONADO
  // ====================================================

  const ambienteFiltrado = ambientes.find(
    (ambiente) => ambiente.id === filtroAmbiente,
  )

  const tarefasDoAmbienteSelecionado =
    filtroAmbiente === null
      ? []
      : tarefas.filter(
          (tarefa) => tarefa.ambienteId === filtroAmbiente,
        )

  // ====================================================
  // ALTERAR NOME
  // ====================================================

  const salvarNomeUsuario = () => {
    const novoNome = nomeTemporario.trim()

    if (!novoNome) {
      alert('Digite um nome.')
      return
    }

    setNomeUsuario(novoNome)
    setNomeTemporario(novoNome)

    localStorage.setItem('casa-em-ordem-nome', novoNome)
  }

  const restaurarNomeUsuario = () => {
    setNomeUsuario('Vanessa')
    setNomeTemporario('Vanessa')

    localStorage.setItem(
      'casa-em-ordem-nome',
      'Vanessa',
    )
  }

  // ====================================================
  // TEMA
  // ====================================================

  useEffect(() => {
    document.body.classList.toggle(
      'tema-escuro',
      tema === 'escuro',
    )
  }, [tema])

  const alterarTema = (
    novoTema: 'claro' | 'escuro',
  ) => {
    setTema(novoTema)

    localStorage.setItem(
      'casa-em-ordem-tema',
      novoTema,
    )
  }

  // ====================================================
  // LIMPAR DADOS
  // ====================================================

  const limparDadosAplicativo = () => {
    const confirmar = window.confirm(
      'Tem certeza que deseja apagar todos os dados do aplicativo? Esta ação não pode ser desfeita.',
    )

    if (!confirmar) {
      return
    }

    localStorage.removeItem(
      'casa-em-ordem-tarefas',
    )

    localStorage.removeItem(
      'casa-em-ordem-ambientes',
    )

    localStorage.removeItem(
      'casa-em-ordem-nome',
    )

    localStorage.removeItem(
      'casa-em-ordem-historico',
    )

    window.location.reload()
  }

  // ====================================================
  // NAVEGAÇÃO
  // ====================================================

  const selecionarPagina = (id: string) => {
    setPagina(id)

    if (id === 'rotina') {
      setFiltroAmbiente(null)
    }

    setMenuAberto(false)
  }

  // ====================================================
  // ABRIR NOVA TAREFA
  // ====================================================

  const abrirNovaTarefa = () => {
    setTarefaEditando(null)

    setNome('')
    setDia('Segunda-feira')
    setTempo('20–30 minutos')
    setHorario('')
    setIcone('🧹')
    setAmbienteId(
      ambientes.length > 0 ? ambientes[0].id : 1,
    )
    setRecorrente(false)

    setModalTarefa(true)
  }

  // ====================================================
  // NOVA TAREFA PELO CALENDÁRIO
  // ====================================================

  const abrirNovaTarefaCalendario = (
    diaSelecionado: string,
  ) => {
    setTarefaEditando(null)

    setNome('')
    setDia(diaSelecionado)
    setTempo('20–30 minutos')
    setHorario('')
    setIcone('🧹')
    setAmbienteId(
      ambientes.length > 0 ? ambientes[0].id : 1,
    )
    setRecorrente(false)

    setModalTarefa(true)
  }

  // ====================================================
  // EDITAR TAREFA
  // ====================================================

  const abrirEdicao = (tarefa: Tarefa) => {
    setTarefaEditando(tarefa)

    setNome(tarefa.nome)
    setDia(tarefa.dia)
    setTempo(tarefa.tempo)
    setHorario(tarefa.horario || '')
    setIcone(tarefa.icone)
    setAmbienteId(tarefa.ambienteId || 1)
    setRecorrente(tarefa.recorrente || false)

    setModalTarefa(true)
  }

  const fecharModalTarefa = () => {
    setModalTarefa(false)
    setTarefaEditando(null)
  }

  // ====================================================
  // CALENDÁRIO
  // ====================================================

  const obterInicioSemana = (data: Date) => {
    const resultado = new Date(data)

    const diaAtual = resultado.getDay()

    const diferenca =
      diaAtual === 0 ? -6 : 1 - diaAtual

    resultado.setDate(
      resultado.getDate() + diferenca,
    )

    resultado.setHours(0, 0, 0, 0)

    return resultado
  }

  const formatarDataCalendario = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const formatarPeriodoSemana = (inicio: Date) => {
    const fim = new Date(inicio)

    fim.setDate(
      inicio.getDate() + 6,
    )

    return `${formatarDataCalendario(
      inicio,
    )} a ${formatarDataCalendario(fim)}`
  }

  const voltarSemana = () => {
    setSemanaCalendario((atual) => {
      const novaSemana = new Date(atual)

      novaSemana.setDate(
        novaSemana.getDate() - 7,
      )

      return novaSemana
    })
  }

  const avancarSemana = () => {
    setSemanaCalendario((atual) => {
      const novaSemana = new Date(atual)

      novaSemana.setDate(
        novaSemana.getDate() + 7,
      )

      return novaSemana
    })
  }

  const irParaHoje = () => {
    setSemanaCalendario(
      obterInicioSemana(new Date()),
    )

    setTimeout(() => {
      const hojeAtual = new Date()

      const idHoje =
        'calendario-dia-' +
        hojeAtual.toISOString().slice(0, 10)

      document
        .getElementById(idHoje)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
    }, 150)
  }

  const semanaEhAtual = () => {
    const inicioAtual =
      obterInicioSemana(new Date())

    return (
      inicioAtual.getTime() ===
      semanaCalendario.getTime()
    )
  }

  // ====================================================
  // IDENTIFICAR SEMANA
  // ====================================================

  const obterSemanaDaData = (data: Date) => {
    const primeiroDia = new Date(
      data.getFullYear(),
      0,
      1,
    )

    const dias = Math.floor(
      (data.getTime() -
        primeiroDia.getTime()) /
        (1000 * 60 * 60 * 24),
    )

    const semana = Math.ceil(
      (dias +
        primeiroDia.getDay() +
        1) /
        7,
    )

    return `${data.getFullYear()}-${semana}`
  }

  const obterSemanaAtual = () => {
    return obterSemanaDaData(new Date())
  }

  // ====================================================
  // RESETAR TAREFAS RECORRENTES
  // ====================================================

  useEffect(() => {
    const semanaAtual =
      obterSemanaAtual()

    setTarefas((atuais) =>
      atuais.map((tarefa) => {
        if (
          tarefa.recorrente &&
          tarefa.semanaCriada &&
          tarefa.semanaCriada !== semanaAtual
        ) {
          return {
            ...tarefa,
            concluida: false,
            semanaCriada: semanaAtual,
          }
        }

        return tarefa
      }),
    )
  }, [])

  // ====================================================
  // SALVAR TAREFA
  // ====================================================

  const salvarTarefa = () => {
    if (!nome.trim()) {
      alert('Digite o nome da tarefa.')
      return
    }

    if (tarefaEditando) {
      // Atualiza uma tarefa existente.
      setTarefas((atuais) =>
        atuais.map((tarefa) =>
          tarefa.id === tarefaEditando.id
            ? {
                ...tarefa,
                nome: nome.trim(),
                dia,
                tempo,
                horario,
                icone,
                ambienteId,
                recorrente,
                semanaCriada:
                  tarefa.semanaCriada ||
                  obterSemanaAtual(),
              }
            : tarefa,
        ),
      )
    } else {
      // Cria uma nova tarefa.
      setTarefas((atuais) => [
        ...atuais,
        {
          id: Date.now(),
          nome: nome.trim(),
          dia,
          tempo,
          horario,
          icone,
          ambienteId,
          recorrente,
          semanaCriada:
            obterSemanaAtual(),
          concluida: false,
        },
      ])
    }

    fecharModalTarefa()
  }

  // ====================================================
  // EXCLUIR TAREFA
  // ====================================================

  const excluirTarefa = (id: number) => {
    if (
      !window.confirm(
        'Deseja realmente excluir esta tarefa?',
      )
    ) {
      return
    }

    setTarefas((atuais) =>
      atuais.filter(
        (tarefa) => tarefa.id !== id,
      ),
    )
  }

  // ====================================================
  // CONCLUIR / DESMARCAR TAREFA
  // ====================================================

  const alternarTarefa = (id: number) => {
    const tarefasAtualizadas =
      tarefas.map((tarefa) =>
        tarefa.id === id
          ? {
              ...tarefa,
              concluida:
                !tarefa.concluida,
            }
          : tarefa,
      )

    setTarefas(tarefasAtualizadas)

    // Histórico representa o progresso das tarefas de hoje.
    const diasJavaScript = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ]

    const hojeAtual =
      diasJavaScript[
        new Date().getDay()
      ]

    const tarefasDeHoje =
      tarefasAtualizadas.filter(
        (tarefa) =>
          tarefa.dia === hojeAtual,
      )

    const tarefasConcluidasHoje =
      tarefasDeHoje.filter(
        (tarefa) => tarefa.concluida,
      )

    const concluidas =
      tarefasConcluidasHoje.length

    const total =
      tarefasDeHoje.length

    const progresso =
      total === 0
        ? 0
        : Math.round(
            (concluidas / total) *
              100,
          )

    const hojeData = new Date()

    const data =
      String(
        hojeData.getFullYear(),
      ) +
      '-' +
      String(
        hojeData.getMonth() + 1,
      ).padStart(2, '0') +
      '-' +
      String(
        hojeData.getDate(),
      ).padStart(2, '0')

    const tarefasConcluidasDoDia =
      tarefasConcluidasHoje.map(
        (tarefa) => tarefa.nome,
      )

    const registro: RegistroHistorico = {
      data,
      concluidas,
      total,
      progresso,
      tarefasConcluidas:
        tarefasConcluidasDoDia,
    }

    setHistorico(
      (historicoAtual) => {
        const existeHoje =
          historicoAtual.some(
            (item) =>
              item.data === data,
          )

        if (existeHoje) {
          return historicoAtual.map(
            (item) =>
              item.data === data
                ? registro
                : item,
          )
        }

        return [
          ...historicoAtual,
          registro,
        ].slice(-30)
      },
    )
  }

  // ====================================================
  // AMBIENTES
  // ====================================================

  const abrirNovoAmbiente = () => {
    setAmbienteEditando(null)
    setNomeAmbiente('')
    setIconeAmbiente('🏠')
    setModalAmbiente(true)
  }

  const abrirEdicaoAmbiente = (
    ambiente: Ambiente,
  ) => {
    setAmbienteEditando(ambiente)
    setNomeAmbiente(ambiente.nome)
    setIconeAmbiente(ambiente.icone)
    setModalAmbiente(true)
  }

  const fecharModalAmbiente = () => {
    setModalAmbiente(false)
    setAmbienteEditando(null)
  }

  const salvarAmbiente = () => {
    if (!nomeAmbiente.trim()) {
      alert('Digite o nome do ambiente.')
      return
    }

    if (ambienteEditando) {
      setAmbientes((atuais) =>
        atuais.map((ambiente) =>
          ambiente.id ===
          ambienteEditando.id
            ? {
                ...ambiente,
                nome:
                  nomeAmbiente.trim(),
                icone:
                  iconeAmbiente,
              }
            : ambiente,
        ),
      )
    } else {
      setAmbientes((atuais) => [
        ...atuais,
        {
          id: Date.now(),
          nome:
            nomeAmbiente.trim(),
          icone:
            iconeAmbiente,
        },
      ])
    }

    fecharModalAmbiente()
  }

  const excluirAmbiente = (
    id: number,
  ) => {
    if (
      !window.confirm(
        'Deseja excluir este ambiente?',
      )
    ) {
      return
    }

    setAmbientes((atuais) =>
      atuais.filter(
        (ambiente) =>
          ambiente.id !== id,
      ),
    )
  }

  // ====================================================
  // INFORMAÇÕES DO DASHBOARD
  // ====================================================

  const tarefasConcluidas =
    tarefas.filter(
      (tarefa) =>
        tarefa.concluida,
    ).length

  const diasJavaScript = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ]

  const hoje =
    diasJavaScript[
      new Date().getDay()
    ]

  const tarefasHoje =
    tarefas.filter(
      (tarefa) =>
        tarefa.dia === hoje,
    )

  const tempoTotalHoje =
    tarefasHoje.reduce(
      (total, tarefa) => {
        const minutos =
          parseInt(
            tarefa.tempo,
            10,
          )

        return (
          total +
          (Number.isNaN(
            minutos,
          )
            ? 0
            : minutos)
        )
      },
      0,
    )

  const tempoTotalHojeFormatado =
    tempoTotalHoje < 60
      ? `${tempoTotalHoje} min`
      : `${Math.floor(
          tempoTotalHoje / 60,
        )}h ${
          tempoTotalHoje % 60
        }min`

  const tarefasHojeConcluidas =
    tarefasHoje.filter(
      (tarefa) =>
        tarefa.concluida,
    ).length

  const horaAtual =
    new Date().getHours()

  const saudacao =
    horaAtual < 12
      ? 'Bom dia'
      : horaAtual < 18
        ? 'Boa tarde'
        : 'Boa noite'

  const proximaTarefa =
    tarefasHoje.find(
      (tarefa) =>
        !tarefa.concluida,
    )

  const progressoHoje =
    tarefasHoje.length === 0
      ? 0
      : Math.round(
          (tarefasHojeConcluidas /
            tarefasHoje.length) *
            100,
        )

  const tarefasRestantesHoje =
    tarefasHoje.length -
    tarefasHojeConcluidas

  const mensagemProgresso =
    tarefasHoje.length === 0
      ? 'Sua agenda está livre hoje. Que tal planejar uma pequena tarefa?'
      : progressoHoje === 100
        ? '🎉 Tudo concluído! Você cuidou da sua rotina de hoje.'
        : progressoHoje >= 75
          ? '✨ Está quase lá! Falta pouco para concluir sua rotina.'
          : progressoHoje >= 50
            ? '💜 Mais da metade concluída. Continue nesse ritmo!'
            : progressoHoje > 0
              ? '🌷 Você já começou. Continue com calma, uma tarefa por vez.'
              : '🌸 Comece pela próxima tarefa e avance aos poucos.'

  // ====================================================
  // HISTÓRICO FILTRADO
  // ====================================================

  const historicoFiltrado =
    filtroHistorico === 'todos'
      ? historico
      : historico.slice(
          -Number(
            filtroHistorico,
          ),
        )

  const totalConcluidasHistorico =
    historicoFiltrado.reduce(
      (total, registro) =>
        total +
        registro.concluidas,
      0,
    )

  const progressoMedioHistorico =
    historicoFiltrado.length === 0
      ? 0
      : Math.round(
          historicoFiltrado.reduce(
            (total, registro) =>
              total +
              registro.progresso,
            0,
          ) /
            historicoFiltrado.length,
        )

  const diasRegistradosHistorico =
    historicoFiltrado.length

  const progresso =
    tarefas.length === 0
      ? 0
      : Math.round(
          (tarefasConcluidas /
            tarefas.length) *
            100,
        )

  // ====================================================
  // CARREGAMENTO DA SESSÃO
  // ====================================================

  if (verificandoSessao) {
    return (
      <div className="tela-carregando">
        <p>
          Carregando Casa em Ordem...
        </p>
      </div>
    )
  }

  // Se não houver sessão, mostra o Login.
  if (!estaLogada) {
    return (
      <Login
        onLogin={fazerLogin}
      />
    )
  }

  // ====================================================
  // APLICAÇÃO
  // ====================================================

  return (
    <div
      className={`layout tema-${tema}`}
    >
      {/* ==================================================
          MENU LATERAL
      ================================================== */}

      <aside
        className={
          menuAberto
            ? 'sidebar sidebar-aberta'
            : 'sidebar'
        }
      >
        <div className="sidebar-logo">
          <div className="logo-casa">
            🏠
          </div>

          <div>
            <strong>
              Casa em Ordem
            </strong>

            <span>
              Minha rotina
            </span>
          </div>
        </div>

        <nav className="menu">
          <span className="menu-titulo">
            MENU
          </span>

          {menu.map((item) => (
            <button
              key={item.id}
              className={
                pagina === item.id
                  ? 'menu-item ativo'
                  : 'menu-item'
              }
              onClick={() =>
                selecionarPagina(
                  item.id,
                )
              }
            >
              <span>
                {item.icone}
              </span>

              {item.nome}
            </button>
          ))}
        </nav>

        <div className="sidebar-final">
          <div className="mini-perfil">
            <div className="avatar">
              {nomeUsuario
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {nomeUsuario}
              </strong>

              <span>
                Minha casa
              </span>
            </div>
          </div>

          <button
            className="botao-sair"
            onClick={fazerLogout}
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Overlay do menu mobile */}
      {menuAberto && (
        <div
          className="overlay-menu"
          onClick={() =>
            setMenuAberto(false)
          }
        />
      )}

      <div className="conteudo">
        {/* ==================================================
            TOPO
        ================================================== */}

        <header className="topo">
          <button
            className="menu-mobile"
            onClick={() =>
              setMenuAberto(true)
            }
          >
            ☰
          </button>

          <div className="topo-mobile-titulo">
            <span className="logo">
              Casa em Ordem
            </span>
          </div>

          <div className="perfil">
            <span>
              Olá, {nomeUsuario}! 👋
            </span>

            <div className="avatar">
              {nomeUsuario
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        {/* ==================================================
            PÁGINA INÍCIO
        ================================================== */}

        {pagina === 'inicio' && (
          <main className="dashboard">
            <section className="dashboard-boas-vindas">
              <div>
                <span className="etiqueta">
                  CASA EM ORDEM
                </span>

                <h1>
                  {saudacao},{' '}
                  {nomeUsuario}! 👋
                </h1>

                <p>
                  Vamos deixar sua casa
                  em ordem sem pesar na
                  sua rotina.
                </p>
              </div>

              <div className="dashboard-data">
                <span>📅</span>

                <div>
                  <strong>
                    {hoje}
                  </strong>

                  <small>
                    Rotina de hoje
                  </small>
                </div>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="dashboard-card destaque">
                <div className="dashboard-card-topo">
                  <div>
                    <span className="card-label">
                      TAREFAS DE HOJE
                    </span>

                    <strong className="numero-grande">
                      {tarefasHoje.length}
                    </strong>
                  </div>

                  <span className="card-emoji">
                    📋
                  </span>
                </div>

                <p>
                  {tarefasHoje.length ===
                  0
                    ? 'Nenhuma tarefa programada para hoje.'
                    : `${tarefasHojeConcluidas} de ${tarefasHoje.length} concluídas`}
                </p>

                <div className="barra dashboard-barra">
                  <div
                    className="barra-preenchida"
                    style={{
                      width:
                        progressoHoje +
                        '%',
                    }}
                  />
                </div>

                <small>
                  {progressoHoje}%
                  concluído
                </small>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-topo">
                  <div>
                    <span className="card-label">
                      SEMANA
                    </span>

                    <strong className="numero-grande">
                      {progresso}%
                    </strong>
                  </div>

                  <span className="card-emoji">
                    📊
                  </span>
                </div>

                <p>
                  {tarefasConcluidas}{' '}
                  de {tarefas.length}{' '}
                  tarefas concluídas.
                </p>

                <button
                  className="link-dashboard"
                  onClick={() =>
                    selecionarPagina(
                      'rotina',
                    )
                  }
                >
                  Ver rotina →
                </button>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-topo">
                  <div>
                    <span className="card-label">
                      PRÓXIMA TAREFA
                    </span>

                    <strong className="proxima-nome">
                      {proximaTarefa
                        ? proximaTarefa.nome
                        : 'Tudo concluído!'}
                    </strong>
                  </div>

                  <span className="card-emoji">
                    {proximaTarefa
                      ? proximaTarefa.icone
                      : '🎉'}
                  </span>
                </div>

                {proximaTarefa ? (
                  <p>
                    ⏱️{' '}
                    {
                      proximaTarefa.tempo
                    }
                  </p>
                ) : (
                  <p>
                    Você concluiu
                    todas as tarefas
                    de hoje.
                  </p>
                )}

                {proximaTarefa && (
                  <button
                    className="link-dashboard"
                    onClick={() =>
                      alternarTarefa(
                        proximaTarefa.id,
                      )
                    }
                  >
                    Marcar como
                    concluída →
                  </button>
                )}
              </div>
            </section>

            <section className="dashboard-inferior">
              <div className="dashboard-tarefas">
                <div className="dashboard-secao-topo">
                  <div>
                    <span className="etiqueta">
                      HOJE
                    </span>

                    <h2>
                      Tarefas de hoje 💗
                    </h2>
                  </div>

                  <button
                    className="link-dashboard"
                    onClick={() =>
                      selecionarPagina(
                        'hoje',
                      )
                    }
                  >
                    Ver todas →
                  </button>
                </div>

                {tarefasHoje.length ===
                0 ? (
                  <div className="dashboard-vazio">
                    <span>🌸</span>

                    <h3>
                      Dia tranquilo por
                      aqui!
                    </h3>

                    <p>
                      Você não tem
                      tarefas
                      programadas para
                      hoje.
                    </p>

                    <button
                      className="botao-nova"
                      onClick={
                        abrirNovaTarefa
                      }
                    >
                      + Nova tarefa
                    </button>
                  </div>
                ) : (
                  <div className="dashboard-lista">
                    {tarefasHoje.map(
                      (tarefa) => {
                        const ambiente =
                          ambientes.find(
                            (item) =>
                              item.id ===
                              tarefa.ambienteId,
                          )

                        return (
                          <div
                            className={
                              tarefa.concluida
                                ? 'dashboard-tarefa concluida'
                                : 'dashboard-tarefa'
                            }
                            key={
                              tarefa.id
                            }
                          >
                            <div className="dashboard-tarefa-icone">
                              {
                                tarefa.icone
                              }
                            </div>

                            <div className="dashboard-tarefa-info">
                              <strong>
                                {
                                  tarefa.nome
                                }
                              </strong>

                              <span className="dashboard-status-tarefa">
                                {tarefa.concluida
                                  ? '✓ Concluída'
                                  : '○ Pendente'}
                              </span>

                              <span>
                                {ambiente
                                  ? `${ambiente.icone} ${ambiente.nome}`
                                  : 'Ambiente não definido'}
                              </span>
                            </div>

                            <button
                              className={
                                tarefa.concluida
                                  ? 'botao concluida'
                                  : 'botao'
                              }
                              onClick={() =>
                                alternarTarefa(
                                  tarefa.id,
                                )
                              }
                            >
                              {tarefa.concluida
                                ? '✓ Concluída'
                                : 'Concluir'}
                            </button>
                          </div>
                        )
                      },
                    )}
                  </div>
                )}
              </div>

              <aside className="dashboard-dica">
                <span className="dica-icone">
                  💡
                </span>

                <span className="card-label">
                  DICA DO DIA
                </span>

                <h3>
                  {progressoHoje ===
                  100
                    ? 'Rotina concluída!'
                    : progressoHoje >=
                        50
                      ? 'Você está indo muito bem!'
                      : tarefasHoje.length >
                          0
                        ? 'Comece pela próxima tarefa.'
                        : 'Planeje sua próxima rotina.'}
                </h3>

                <p>
                  Pequenas tarefas feitas
                  todos os dias ajudam a
                  manter a casa organizada
                  sem acumular tudo para
                  uma única vez.
                </p>
              </aside>
            </section>

            <section className="dashboard-acao">
              <div>
                <span className="etiqueta">
                  ORGANIZE SUA CASA
                </span>

                <h2>
                  Precisa adicionar uma
                  tarefa?
                </h2>

                <p>
                  Crie uma nova atividade e
                  escolha o dia e o ambiente.
                </p>
              </div>

              <button
                className="botao-nova"
                onClick={abrirNovaTarefa}
              >
                + Nova tarefa
              </button>
            </section>
          </main>
        )}

        {/* ==================================================
            PÁGINA HOJE
        ================================================== */}

        {pagina === 'hoje' && (
          <main className="hoje-page">
            <section className="hoje-cabecalho">
              <div>
                <span className="etiqueta">
                  MINHA ROTINA
                </span>

                <h1>
                  {saudacao},{' '}
                  <span className="hoje-nome-destaque">
                    {nomeUsuario}
                  </span>{' '}
                  💜
                </h1>

                <p>
                  {new Date().toLocaleDateString(
                    'pt-BR',
                    {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    },
                  )}
                </p>
              </div>

              <button
                className="botao-nova"
                onClick={abrirNovaTarefa}
              >
                + Nova tarefa
              </button>
            </section>

            <section className="hoje-resumo">
              <div>
                <span>📋</span>
                <strong>
                  {tarefasHoje.length}
                </strong>
                <small>
                  Tarefas de hoje
                </small>
              </div>

              <div>
                <span>✅</span>
                <strong>
                  {tarefasHojeConcluidas}
                </strong>
                <small>
                  Concluídas
                </small>
              </div>

              <div>
                <span>📊</span>
                <strong>
                  {progressoHoje}%
                </strong>
                <small>
                  Progresso
                </small>
              </div>

              <div>
                <span>⏱️</span>
                <strong>
                  {tempoTotalHojeFormatado}
                </strong>
                <small>
                  Tempo total
                </small>
              </div>
            </section>

            <section className="hoje-progresso">
              <div className="progresso-topo">
                <span>
                  Progresso de hoje
                </span>

                <strong>
                  {progressoHoje}%
                </strong>
              </div>

              <div className="barra">
                <div
                  className="barra-preenchida"
                  style={{
                    width:
                      progressoHoje +
                      '%',
                  }}
                />
              </div>

              <p className="hoje-mensagem-progresso">
                {mensagemProgresso}
              </p>

              {tarefasRestantesHoje >
              0 ? (
                <p className="hoje-tarefas-restantes">
                  📋{' '}
                  {tarefasRestantesHoje}{' '}
                  {tarefasRestantesHoje ===
                  1
                    ? 'tarefa restante'
                    : 'tarefas restantes'}{' '}
                  para hoje.
                </p>
              ) : tarefasHoje.length >
                0 ? (
                <p className="hoje-tarefas-restantes concluido">
                  🎉 Você terminou tudo
                  por hoje!
                </p>
              ) : null}

              <p className="hoje-tempo-resumo">
                ⏱️ Você reservou{' '}
                <strong>
                  {tempoTotalHojeFormatado}
                </strong>{' '}
                para as tarefas de hoje.
              </p>
            </section>

            {proximaTarefa && (
              <section className="hoje-proxima">
                <div className="hoje-proxima-icone">
                  ⭐
                </div>

                <div className="hoje-proxima-info">
                  <span>
                    PRÓXIMA TAREFA
                  </span>

                  <strong>
                    {proximaTarefa.nome}
                  </strong>

                  <small>
                    {proximaTarefa.tempo}

                    {(() => {
                      const ambiente =
                        ambientes.find(
                          (item) =>
                            item.id ===
                            proximaTarefa.ambienteId,
                        )

                      return ambiente
                        ? ` • ${ambiente.icone} ${ambiente.nome}`
                        : ''
                    })()}
                  </small>
                </div>

                <button
                  className="hoje-proxima-botao"
                  onClick={() =>
                    alternarTarefa(
                      proximaTarefa.id,
                    )
                  }
                >
                  {proximaTarefa.concluida
                    ? '✓ Concluída'
                    : 'Concluir'}
                </button>
              </section>
            )}

            <section className="hoje-tarefas">
              <div className="rotina-lista-topo">
                <span className="etiqueta">
                  TAREFAS DO DIA
                </span>

                <h2>
                  O que precisa ser feito
                </h2>
              </div>

              {tarefasHoje.length ===
              0 ? (
                <div className="hoje-vazio">
                  <span>🌸</span>

                  <h3>
                    Nenhuma tarefa para
                    hoje
                  </h3>

                  <p>
                    Sua rotina está livre
                    hoje. Aproveite para
                    descansar ou planeje uma
                    tarefa rápida.
                  </p>

                  <button
                    className="botao-nova"
                    onClick={
                      abrirNovaTarefa
                    }
                  >
                    + Criar tarefa
                  </button>
                </div>
              ) : tarefasHojeConcluidas ===
                tarefasHoje.length ? (
                <div className="hoje-tudo-concluido">
                  <div className="hoje-tudo-concluido-icone">
                    🎉
                  </div>

                  <span className="etiqueta">
                    ROTINA CONCLUÍDA
                  </span>

                  <h3>
                    Parabéns,{' '}
                    {nomeUsuario}! 💜
                  </h3>

                  <p>
                    Você concluiu todas as
                    tarefas de hoje.
                    Aproveite o restante do
                    dia!
                  </p>

                  <div className="hoje-tudo-concluido-resumo">
                    ✓{' '}
                    {
                      tarefasHojeConcluidas
                    }{' '}
                    de{' '}
                    {tarefasHoje.length}{' '}
                    tarefas concluídas
                  </div>
                </div>
              ) : (
                <div className="hoje-lista">
                  {tarefasHoje.map(
                    (tarefa) => {
                      const ambiente =
                        ambientes.find(
                          (item) =>
                            item.id ===
                            tarefa.ambienteId,
                        )

                      return (
                        <div
                          className={
                            tarefa.concluida
                              ? 'hoje-tarefa concluida'
                              : 'hoje-tarefa'
                          }
                          key={
                            tarefa.id
                          }
                        >
                          <div className="hoje-tarefa-icone">
                            {
                              tarefa.icone
                            }
                          </div>

                          <div className="hoje-tarefa-info">
                            <strong>
                              {
                                tarefa.nome
                              }
                            </strong>

                            {tarefa.horario && (
                              <span>
                                🕐{' '}
                                {
                                  tarefa.horario
                                }
                              </span>
                            )}

                            <span>
                              ⏱️{' '}
                              {
                                tarefa.tempo
                              }
                            </span>

                            {ambiente && (
                              <span>
                                {
                                  ambiente.icone
                                }{' '}
                                {
                                  ambiente.nome
                                }
                              </span>
                            )}
                          </div>

                          <div className="hoje-tarefa-acoes">
                            <button
                              className={
                                tarefa.concluida
                                  ? 'botao concluida'
                                  : 'botao'
                              }
                              onClick={() =>
                                alternarTarefa(
                                  tarefa.id,
                                )
                              }
                            >
                              {tarefa.concluida
                                ? '✓ Concluída'
                                : 'Concluir'}
                            </button>

                            <button
                              className="botao-secundario"
                              onClick={() =>
                                abrirEdicao(
                                  tarefa,
                                )
                              }
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      )
                    },
                  )}
                </div>
              )}
            </section>
          </main>
        )}

        {/* ==================================================
            PÁGINA ROTINA
        ================================================== */}

        {pagina === 'rotina' && (
          <main className="rotina-page">
            <section className="rotina-cabecalho">
              <div>
                <span className="etiqueta">
                  ORGANIZAÇÃO
                </span>

                <h1>
                  Minha rotina

                  {ambienteFiltrado && (
                    <span className="rotina-ambiente-titulo">
                      {' '}
                      •{' '}
                      {
                        ambienteFiltrado.icone
                      }{' '}
                      {
                        ambienteFiltrado.nome
                      }{' '}
                      (
                      {
                        tarefasDoAmbienteSelecionado.length
                      }{' '}
                      {
                        tarefasDoAmbienteSelecionado.length ===
                        1
                          ? 'tarefa'
                          : 'tarefas'
                      }
                      )
                    </span>
                  )}
                </h1>

                <p>
                  Acompanhe suas tarefas e
                  mantenha sua casa em ordem.
                </p>
              </div>

              <button
                className="botao-nova"
                onClick={abrirNovaTarefa}
              >
                + Nova tarefa
              </button>
            </section>

            <section className="rotina-resumo">
              <div className="rotina-stat">
                <span>📋</span>

                <div>
                  <strong>
                    {tarefas.length}
                  </strong>

                  <small>
                    Total de tarefas
                  </small>
                </div>
              </div>

              <div className="rotina-stat">
                <span>✅</span>

                <div>
                  <strong>
                    {tarefasConcluidas}
                  </strong>

                  <small>
                    Concluídas
                  </small>
                </div>
              </div>

              <div className="rotina-stat">
                <span>⏳</span>

                <div>
                  <strong>
                    {tarefas.length -
                      tarefasConcluidas}
                  </strong>

                  <small>
                    Pendentes
                  </small>
                </div>
              </div>

              <div className="rotina-stat">
                <span>📊</span>

                <div>
                  <strong>
                    {progresso}%
                  </strong>

                  <small>
                    Progresso
                  </small>
                </div>
              </div>
            </section>

            <section className="rotina-lista">
              <div className="rotina-lista-topo">
                <div>
                  <span className="etiqueta">
                    TAREFAS
                  </span>

                  <h2>
                    Todas as tarefas
                  </h2>
                </div>
              </div>

              <div className="filtros-status">
                <button
                  className={
                    filtroStatus ===
                    'todos'
                      ? 'filtro-status ativo'
                      : 'filtro-status'
                  }
                  onClick={() =>
                    setFiltroStatus(
                      'todos',
                    )
                  }
                >
                  Todas
                </button>

                <button
                  className={
                    filtroStatus ===
                    'pendentes'
                      ? 'filtro-status ativo'
                      : 'filtro-status'
                  }
                  onClick={() =>
                    setFiltroStatus(
                      'pendentes',
                    )
                  }
                >
                  Pendentes
                </button>

                <button
                  className={
                    filtroStatus ===
                    'concluidas'
                      ? 'filtro-status ativo'
                      : 'filtro-status'
                  }
                  onClick={() =>
                    setFiltroStatus(
                      'concluidas',
                    )
                  }
                >
                  Concluídas
                </button>
              </div>

              <div className="filtros-ambiente">
                <button
                  className={
                    filtroAmbiente ===
                    null
                      ? 'filtro-ambiente ativo'
                      : 'filtro-ambiente'
                  }
                  onClick={() =>
                    setFiltroAmbiente(
                      null,
                    )
                  }
                >
                  ✨ Todos
                </button>

                {ambientes.map(
                  (ambiente) => (
                    <button
                      key={
                        ambiente.id
                      }
                      className={
                        filtroAmbiente ===
                        ambiente.id
                          ? 'filtro-ambiente ativo'
                          : 'filtro-ambiente'
                      }
                      onClick={() =>
                        setFiltroAmbiente(
                          ambiente.id,
                        )
                      }
                    >
                      {
                        ambiente.icone
                      }{' '}
                      {
                        ambiente.nome
                      }
                    </button>
                  ),
                )}
              </div>

              {tarefas.length ===
              0 ? (
                <div className="rotina-vazia">
                  <span>✨</span>

                  <h3>
                    Nenhuma tarefa
                    cadastrada
                  </h3>

                  <p>
                    Crie sua primeira tarefa
                    para começar a organizar
                    sua rotina.
                  </p>

                  <button
                    className="botao-nova"
                    onClick={
                      abrirNovaTarefa
                    }
                  >
                    + Criar tarefa
                  </button>
                </div>
              ) : (
                <div className="rotina-tarefas">
                  {diasDaSemana.map(
                    (diaDaSemana) => {
                      const tarefasDoDia =
                        tarefas.filter(
                          (tarefa) =>
                            tarefa.dia ===
                              diaDaSemana &&
                            (filtroAmbiente ===
                              null ||
                              tarefa.ambienteId ===
                                filtroAmbiente) &&
                            (filtroStatus ===
                              'todos' ||
                              (filtroStatus ===
                                'pendentes' &&
                                !tarefa.concluida) ||
                              (filtroStatus ===
                                'concluidas' &&
                                tarefa.concluida)),
                        )

                      if (
                        tarefasDoDia.length ===
                        0
                      ) {
                        return null
                      }

                      return (
                        <div
                          className="rotina-dia"
                          key={
                            diaDaSemana
                          }
                        >
                          <div className="rotina-dia-titulo">
                            <h3>
                              {
                                diaDaSemana
                              }
                            </h3>

                            <span>
                              {
                                tarefasDoDia.length
                              }{' '}
                              {tarefasDoDia.length ===
                              1
                                ? 'tarefa'
                                : 'tarefas'}
                            </span>
                          </div>

                          {tarefasDoDia.map(
                            (tarefa) => {
                              const ambiente =
                                ambientes.find(
                                  (item) =>
                                    item.id ===
                                    tarefa.ambienteId,
                                )

                              return (
                                <div
                                  className={
                                    tarefa.concluida
                                      ? 'rotina-tarefa concluida'
                                      : 'rotina-tarefa'
                                  }
                                  key={
                                    tarefa.id
                                  }
                                >
                                  <div className="rotina-tarefa-icone">
                                    {
                                      tarefa.icone
                                    }
                                  </div>

                                  <div className="rotina-tarefa-info">
                                    <strong>
                                      {
                                        tarefa.nome
                                      }
                                    </strong>

                                    {tarefa.horario && (
                                      <span>
                                        🕐{' '}
                                        {
                                          tarefa.horario
                                        }
                                      </span>
                                    )}

                                    <span>
                                      ⏱️{' '}
                                      {
                                        tarefa.tempo
                                      }
                                    </span>

                                    {ambiente && (
                                      <span>
                                        {
                                          ambiente.icone
                                        }{' '}
                                        {
                                          ambiente.nome
                                        }
                                      </span>
                                    )}
                                  </div>

                                  <div className="rotina-tarefa-acoes">
                                    <button
                                      className={
                                        tarefa.concluida
                                          ? 'botao concluida'
                                          : 'botao'
                                      }
                                      onClick={() =>
                                        alternarTarefa(
                                          tarefa.id,
                                        )
                                      }
                                    >
                                      {tarefa.concluida
                                        ? '✓ Concluída'
                                        : 'Concluir'}
                                    </button>

                                    <button
                                      className="botao-secundario"
                                      onClick={() =>
                                        abrirEdicao(
                                          tarefa,
                                        )
                                      }
                                    >
                                      Editar
                                    </button>

                                    <button
                                      className="botao-excluir"
                                      onClick={() =>
                                        excluirTarefa(
                                          tarefa.id,
                                        )
                                      }
                                    >
                                      Excluir
                                    </button>
                                  </div>
                                </div>
                              )
                            },
                          )}
                        </div>
                      )
                    },
                  )}
                </div>
              )}
            </section>
          </main>
        )}

        {/* ==================================================
            CALENDÁRIO
        ================================================== */}

        {pagina === 'calendario' && (
          <main className="calendario-page">
            <section className="calendario-cabecalho">
              <div>
                <span className="etiqueta">
                  PLANEJAMENTO
                </span>

                <h1>
                  Calendário semanal 🗓️
                </h1>

                <p>
                  Visualize sua rotina e
                  acompanhe as tarefas da
                  semana.
                </p>
              </div>

              <button
                className="botao-nova"
                onClick={abrirNovaTarefa}
              >
                + Nova tarefa
              </button>
            </section>

            <div className="calendario-navegacao">
              <button
                className="calendario-nav-botao"
                onClick={
                  voltarSemana
                }
              >
                ← Semana anterior
              </button>

              <button
                className={
                  semanaEhAtual()
                    ? 'calendario-hoje ativo'
                    : 'calendario-hoje'
                }
                onClick={irParaHoje}
              >
                Hoje
              </button>

              <strong>
                Semana de{' '}
                {formatarPeriodoSemana(
                  semanaCalendario,
                )}
              </strong>

              <button
                className="calendario-nav-botao"
                onClick={
                  avancarSemana
                }
              >
                Próxima semana →
              </button>
            </div>

            <section className="calendario-grid">
              {diasDaSemana.map(
                (
                  diaCalendario,
                  indice,
                ) => {
                  const dataDoDia =
                    new Date(
                      semanaCalendario,
                    )

                  dataDoDia.setDate(
                    semanaCalendario.getDate() +
                      indice,
                  )

                  const semanaSelecionada =
                    obterSemanaDaData(
                      semanaCalendario,
                    )

                  const tarefasDoDia =
                    tarefas.filter(
                      (tarefa) =>
                        tarefa.dia ===
                          diaCalendario &&
                        (tarefa.recorrente ||
                          tarefa.semanaCriada ===
                            semanaSelecionada),
                    )

                  const dataFormatada =
                    formatarDataCalendario(
                      dataDoDia,
                    )

                  const agora =
                    new Date()

                  const dataEhHoje =
                    dataDoDia.getDate() ===
                      agora.getDate() &&
                    dataDoDia.getMonth() ===
                      agora.getMonth() &&
                    dataDoDia.getFullYear() ===
                      agora.getFullYear()

                  return (
                    <div
                      className={
                        dataEhHoje
                          ? 'calendario-dia hoje'
                          : 'calendario-dia'
                      }
                      key={
                        diaCalendario
                      }
                      id={
                        'calendario-dia-' +
                        dataDoDia
                          .toISOString()
                          .slice(
                            0,
                            10,
                          )
                      }
                    >
                      <div className="calendario-dia-topo">
                        <div>
                          <h2>
                            {
                              diaCalendario
                            }
                          </h2>

                          <span className="calendario-data">
                            {
                              dataFormatada
                            }
                          </span>

                          {dataEhHoje && (
                            <small className="calendario-hoje-label">
                              HOJE
                            </small>
                          )}
                        </div>

                        <span className="calendario-contador">
                          {
                            tarefasDoDia.length
                          }
                        </span>

                        <button
                          className="calendario-adicionar"
                          onClick={() =>
                            abrirNovaTarefaCalendario(
                              diaCalendario,
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      {tarefasDoDia.length ===
                      0 ? (
                        <div className="calendario-vazio">
                          Nenhuma tarefa
                        </div>
                      ) : (
                        <div className="calendario-tarefas">
                          {tarefasDoDia.map(
                            (tarefa) => {
                              const ambiente =
                                ambientes.find(
                                  (item) =>
                                    item.id ===
                                    tarefa.ambienteId,
                                )

                              return (
                                <div
                                  className={
                                    tarefa.concluida
                                      ? 'calendario-tarefa concluida'
                                      : 'calendario-tarefa'
                                  }
                                  key={
                                    tarefa.id
                                  }
                                >
                                  <button
                                    className="calendario-check"
                                    onClick={() =>
                                      alternarTarefa(
                                        tarefa.id,
                                      )
                                    }
                                  >
                                    {tarefa.concluida
                                      ? '✓'
                                      : '○'}
                                  </button>

                                  <div className="calendario-tarefa-icone">
                                    {
                                      tarefa.icone
                                    }
                                  </div>

                                  <div className="calendario-tarefa-info">
                                    <strong>
                                      {
                                        tarefa.nome
                                      }
                                    </strong>

                                    {tarefa.horario && (
                                      <span>
                                        🕐{' '}
                                        {
                                          tarefa.horario
                                        }
                                      </span>
                                    )}

                                    <span>
                                      ⏱️{' '}
                                      {
                                        tarefa.tempo
                                      }
                                    </span>

                                    {ambiente && (
                                      <span>
                                        {
                                          ambiente.icone
                                        }{' '}
                                        {
                                          ambiente.nome
                                        }
                                      </span>
                                    )}

                                    {tarefa.recorrente && (
                                      <small>
                                        🔁 Toda
                                        semana
                                      </small>
                                    )}
                                  </div>

                                  <button
                                    className="botao-secundario"
                                    onClick={() =>
                                      abrirEdicao(
                                        tarefa,
                                      )
                                    }
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )
                            },
                          )}
                        </div>
                      )}
                    </div>
                  )
                },
              )}
            </section>
          </main>
        )}

        {/* ==================================================
            HISTÓRICO
        ================================================== */}

        {pagina === 'historico' && (
          <section className="pagina-historico">
            <div className="pagina-cabecalho">
              <div>
                <span className="tag">
                  📊 Acompanhamento
                </span>

                <h2>
                  Histórico de progresso
                </h2>

                <p>
                  Acompanhe sua evolução e
                  veja como sua rotina está
                  melhorando ao longo do
                  tempo.
                </p>
              </div>
            </div>

            <div className="historico-filtros">
              <button
                className={
                  filtroHistorico ===
                  '7'
                    ? 'filtro-historico ativo'
                    : 'filtro-historico'
                }
                onClick={() =>
                  setFiltroHistorico('7')
                }
              >
                7 dias
              </button>

              <button
                className={
                  filtroHistorico ===
                  '30'
                    ? 'filtro-historico ativo'
                    : 'filtro-historico'
                }
                onClick={() =>
                  setFiltroHistorico('30')
                }
              >
                30 dias
              </button>

              <button
                className={
                  filtroHistorico ===
                  'todos'
                    ? 'filtro-historico ativo'
                    : 'filtro-historico'
                }
                onClick={() =>
                  setFiltroHistorico(
                    'todos',
                  )
                }
              >
                Tudo
              </button>
            </div>

            <div className="historico-resumo">
              <div className="historico-card">
                <span>📋</span>

                <div>
                  <strong>
                    {
                      totalConcluidasHistorico
                    }
                  </strong>

                  <small>
                    Tarefas concluídas
                  </small>
                </div>
              </div>

              <div className="historico-card">
                <span>📈</span>

                <div>
                  <strong>
                    {
                      progressoMedioHistorico
                    }
                    %
                  </strong>

                  <small>
                    Progresso médio
                  </small>
                </div>
              </div>

              <div className="historico-card">
                <span>🏆</span>

                <div>
                  <strong>
                    {
                      diasRegistradosHistorico
                    }
                  </strong>

                  <small>
                    Dias registrados
                  </small>
                </div>
              </div>
            </div>

            <div className="historico-grafico">
              <div className="historico-grafico-topo">
                <div>
                  <h3>
                    Evolução do progresso
                  </h3>

                  <p>
                    {historicoFiltrado.length ===
                    0
                      ? 'Seu progresso aparecerá aqui conforme você concluir tarefas.'
                      : `Você possui ${historicoFiltrado.length} registro${
                          historicoFiltrado.length ===
                          1
                            ? ''
                            : 's'
                        } de progresso.`}
                  </p>
                </div>
              </div>

              {historicoFiltrado.length ===
              0 ? (
                <div className="historico-vazio">
                  <span>📊</span>

                  <strong>
                    Ainda não há
                    histórico
                  </strong>

                  <div className="historico-barra historico-barra-vazia">
                    <div
                      className="historico-barra-progresso"
                      style={{
                        width: '0%',
                      }}
                    />
                  </div>

                  <strong className="historico-percentual-vazio">
                    0%
                  </strong>

                  <p>
                    Conclua suas tarefas
                    para começar a
                    registrar sua evolução.
                  </p>
                </div>
              ) : (
                <div className="historico-lista">
                  {[...historicoFiltrado]
                    .reverse()
                    .map(
                      (registro) => (
                        <div
                          className="historico-item"
                          key={
                            registro.data
                          }
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'space-between',
                              gap: '16px',
                              marginBottom:
                                '16px',
                            }}
                          >
                            <strong>
                              {registro.data
                                .split(
                                  '-',
                                )
                                .reverse()
                                .join(
                                  '/',
                                )}
                            </strong>

                            <span
                              style={{
                                padding:
                                  '8px 14px',
                                background:
                                  '#071b12',
                                border:
                                  '1px solid #39d98a',
                                borderRadius:
                                  '999px',
                                color:
                                  '#39d98a',
                                fontWeight:
                                  '700',
                                fontSize:
                                  '16px',
                              }}
                            >
                              {
                                registro.progresso
                              }
                              %
                            </span>
                          </div>

                          <div
                            style={{
                              width:
                                '100%',
                              height:
                                '18px',
                              margin:
                                '12px 0',
                              backgroundColor:
                                '#164a78',
                              border:
                                '2px solid #245f91',
                              borderRadius:
                                '999px',
                              overflow:
                                'hidden',
                              boxSizing:
                                'border-box',
                            }}
                          >
                            <div
                              style={{
                                width: `${registro.progresso}%`,
                                height:
                                  '100%',
                                backgroundColor:
                                  '#39d98a',
                                borderRadius:
                                  '999px',
                              }}
                            />
                          </div>

                          <small>
                            {
                              registro.concluidas
                            }{' '}
                            de{' '}
                            {
                              registro.total
                            }{' '}
                            tarefas concluídas
                          </small>

                          {registro.tarefasConcluidas &&
                            registro
                              .tarefasConcluidas
                              .length >
                              0 && (
                              <div className="historico-tarefas">
                                <strong>
                                  Tarefas
                                  concluídas
                                </strong>

                                {registro.tarefasConcluidas.map(
                                  (
                                    tarefa,
                                  ) => (
                                    <div
                                      className="historico-tarefa"
                                      key={
                                        tarefa
                                      }
                                    >
                                      <span>
                                        ✓
                                      </span>

                                      <span>
                                        {
                                          tarefa
                                        }
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      ),
                    )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==================================================
            CONFIGURAÇÕES
        ================================================== */}

        {pagina === 'configuracoes' && (
          <main className="pagina-placeholder configuracoes-page">
            <div className="titulo-secao">
              <div>
                <span className="etiqueta">
                  PREFERÊNCIAS
                </span>

                <h1>
                  Configurações
                </h1>

                <p>
                  Personalize sua experiência
                  no Casa em Ordem.
                </p>
              </div>
            </div>

            <section className="config-card">
              <div className="config-card-icone">
                👩
              </div>

              <div className="config-card-conteudo">
                <h2>
                  Seu nome
                </h2>

                <p>
                  Esse nome será usado nas
                  mensagens de boas-vindas.
                </p>

                <div className="config-form">
                  <input
                    type="text"
                    value={
                      nomeTemporario
                    }
                    onChange={(e) =>
                      setNomeTemporario(
                        e.target.value,
                      )
                    }
                    placeholder="Digite seu nome"
                  />

                  <button
                    type="button"
                    className="botao-nova"
                    onClick={
                      salvarNomeUsuario
                    }
                  >
                    Salvar nome
                  </button>
                </div>

                <button
                  type="button"
                  className="config-restaurar"
                  onClick={
                    restaurarNomeUsuario
                  }
                >
                  Restaurar nome
                  padrão
                </button>

                <div className="config-tema">
                  <h2>
                    Aparência
                  </h2>

                  <p className="config-tema-descricao">
                    Escolha como deseja
                    visualizar o Casa em
                    Ordem. Selecione um tema
                    e a alteração será
                    aplicada imediatamente e
                    salva automaticamente.
                  </p>

                  <h3>
                    Modo tema
                  </h3>

                  <div className="tema-modos">
                    <button
                      type="button"
                      className={
                        tema ===
                        'claro'
                          ? 'tema-modo ativo'
                          : 'tema-modo'
                      }
                      onClick={() =>
                        alterarTema(
                          'claro',
                        )
                      }
                    >
                      ☀️ Tema claro
                    </button>

                    <button
                      type="button"
                      className={
                        tema ===
                        'escuro'
                          ? 'tema-modo ativo'
                          : 'tema-modo'
                      }
                      onClick={() =>
                        alterarTema(
                          'escuro',
                        )
                      }
                    >
                      🌙 Tema escuro
                    </button>
                  </div>

                  <p className="tema-status">
                    {tema ===
                    'claro'
                      ? 'O Casa em Ordem usará o tema claro selecionado.'
                      : 'O Casa em Ordem usará o tema escuro selecionado.'}
                  </p>

                  <div className="temas-grid">
                    <button
                      type="button"
                      className={
                        tema ===
                        'claro'
                          ? 'tema-card ativo'
                          : 'tema-card'
                      }
                      onClick={() =>
                        alterarTema(
                          'claro',
                        )
                      }
                    >
                      <div className="tema-preview tema-preview-claro">
                        <div className="preview-topo" />

                        <div className="preview-corpo">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>

                      <div className="tema-card-info">
                        <strong>
                          Claro por padrão
                        </strong>

                        <p>
                          Tema claro do
                          Casa em Ordem
                          com brilho
                          completo e
                          aparência suave.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={
                        tema ===
                        'escuro'
                          ? 'tema-card ativo'
                          : 'tema-card'
                      }
                      onClick={() =>
                        alterarTema(
                          'escuro',
                        )
                      }
                    >
                      <div className="tema-preview tema-preview-escuro">
                        <div className="preview-topo" />

                        <div className="preview-corpo">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>

                      <div className="tema-card-info">
                        <strong>
                          Escuro por padrão
                        </strong>

                        <p>
                          Tema escuro do
                          Casa em Ordem
                          para uma
                          visualização
                          confortável em
                          ambientes com
                          pouca luz.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="config-perigo">
                  <h3>
                    🗑️ Limpar dados
                  </h3>

                  <p>
                    Apaga tarefas,
                    ambientes e
                    configurações salvas
                    neste navegador.
                  </p>

                  <button
                    type="button"
                    className="botao-limpar"
                    onClick={
                      limparDadosAplicativo
                    }
                  >
                    Limpar todos os
                    dados
                  </button>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* ==================================================
            AMBIENTES
        ================================================== */}

        {pagina === 'ambientes' && (
          <main className="pagina-placeholder">
            <div className="titulo-secao">
              <div>
                <span className="etiqueta">
                  MINHA CASA
                </span>

                <h1>
                  Ambientes
                </h1>

                <p>
                  Organize os espaços da
                  sua casa.
                </p>
              </div>

              <button
                className="botao-nova"
                onClick={
                  abrirNovoAmbiente
                }
              >
                + Novo ambiente
              </button>
            </div>

            <div className="cards-ambientes">
              {ambientes.map(
                (ambiente) => {
                  const tarefasAmbiente =
                    tarefas.filter(
                      (tarefa) =>
                        tarefa.ambienteId ===
                        ambiente.id,
                    )

                  const tarefasConcluidasAmbiente =
                    tarefasAmbiente.filter(
                      (tarefa) =>
                        tarefa.concluida,
                    ).length

                  const progressoAmbiente =
                    tarefasAmbiente.length ===
                    0
                      ? 0
                      : Math.round(
                          (tarefasConcluidasAmbiente /
                            tarefasAmbiente.length) *
                            100,
                        )

                  return (
                    <div
                      className="card-ambiente"
                      key={
                        ambiente.id
                      }
                    >
                      <div className="ambiente-icone">
                        {
                          ambiente.icone
                        }
                      </div>

                      <div className="ambiente-info">
                        <strong>
                          {
                            ambiente.nome
                          }
                        </strong>

                        <span>
                          {
                            tarefasAmbiente.length
                          }{' '}
                          {
                            tarefasAmbiente.length ===
                            1
                              ? 'tarefa'
                              : 'tarefas'
                          }
                        </span>

                        <div className="ambiente-progresso">
                          <div className="ambiente-progresso-topo">
                            <small>
                              {
                                tarefasConcluidasAmbiente
                              }{' '}
                              de{' '}
                              {
                                tarefasAmbiente.length
                              }{' '}
                              concluídas
                            </small>

                            <small>
                              {
                                progressoAmbiente
                              }
                              %
                            </small>
                          </div>

                          <div className="ambiente-barra">
                            <div
                              style={{
                                width:
                                  progressoAmbiente +
                                  '%',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="ambiente-acoes">
                        <button
                          className="botao-secundario"
                          onClick={() => {
                            setFiltroAmbiente(
                              ambiente.id,
                            )

                            setPagina(
                              'rotina',
                            )
                          }}
                        >
                          Ver tarefas
                        </button>

                        <button
                          className="botao-secundario"
                          onClick={() =>
                            abrirEdicaoAmbiente(
                              ambiente,
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="botao-excluir"
                          onClick={() =>
                            excluirAmbiente(
                              ambiente.id,
                            )
                          }
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          </main>
        )}
      </div>

      {/* ====================================================
          MODAL DE TAREFA
      ==================================================== */}

      {modalTarefa && (
        <div
          className="modal-fundo"
          onClick={
            fecharModalTarefa
          }
        >
          <div
            className="modal"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >
            <div className="modal-topo">
              <div>
                <span className="etiqueta">
                  {tarefaEditando
                    ? 'EDITAR'
                    : 'NOVA TAREFA'}
                </span>

                <h2>
                  {tarefaEditando
                    ? 'Editar tarefa'
                    : 'Adicionar tarefa'}
                </h2>
              </div>

              <button
                className="fechar-modal"
                onClick={
                  fecharModalTarefa
                }
              >
                ×
              </button>
            </div>

            <label>
              Nome da tarefa
            </label>

            <input
              type="text"
              placeholder="Ex.: Limpar a varanda"
              value={nome}
              onChange={(evento) =>
                setNome(
                  evento.target.value,
                )
              }
            />

            <label>
              Dia
            </label>

            <select
              value={dia}
              onChange={(evento) =>
                setDia(
                  evento.target.value,
                )
              }
            >
              {diasDaSemana.map(
                (diaDaSemana) => (
                  <option
                    key={
                      diaDaSemana
                    }
                  >
                    {diaDaSemana}
                  </option>
                ),
              )}
            </select>

            <label>
              Horário
            </label>

            <input
              type="time"
              value={horario}
              onChange={(evento) =>
                setHorario(
                  evento.target.value,
                )
              }
            />

            <label>
              Tempo estimado
            </label>

            <input
              type="text"
              placeholder="Ex.: 30 minutos"
              value={tempo}
              onChange={(evento) =>
                setTempo(
                  evento.target.value,
                )
              }
            />

            <label>
              Ícone
            </label>

            <input
              type="text"
              maxLength={2}
              value={icone}
              onChange={(evento) =>
                setIcone(
                  evento.target.value,
                )
              }
            />

            <label>
              Ambiente
            </label>

            <select
              value={ambienteId}
              onChange={(evento) =>
                setAmbienteId(
                  Number(
                    evento.target.value,
                  ),
                )
              }
            >
              {ambientes.map(
                (ambiente) => (
                  <option
                    key={
                      ambiente.id
                    }
                    value={
                      ambiente.id
                    }
                  >
                    {
                      ambiente.icone
                    }{' '}
                    {
                      ambiente.nome
                    }
                  </option>
                ),
              )}
            </select>

            <label className="checkbox-recorrente">
              <input
                type="checkbox"
                checked={recorrente}
                onChange={(evento) =>
                  setRecorrente(
                    evento.target
                      .checked,
                  )
                }
              />

              <span>
                🔁 Repetir toda semana
              </span>
            </label>

            <div className="modal-acoes">
              <button
                className="botao-cancelar"
                onClick={
                  fecharModalTarefa
                }
              >
                Cancelar
              </button>

              <button
                className="botao-salvar"
                onClick={
                  salvarTarefa
                }
              >
                {tarefaEditando
                  ? 'Salvar alterações'
                  : 'Adicionar tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL DE AMBIENTE
      ==================================================== */}

      {modalAmbiente && (
        <div
          className="modal-fundo"
          onClick={
            fecharModalAmbiente
          }
        >
          <div
            className="modal"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >
            <div className="modal-topo">
              <div>
                <span className="etiqueta">
                  {ambienteEditando
                    ? 'EDITAR AMBIENTE'
                    : 'NOVO AMBIENTE'}
                </span>

                <h2>
                  {ambienteEditando
                    ? 'Editar ambiente'
                    : 'Adicionar ambiente'}
                </h2>
              </div>

              <button
                className="fechar-modal"
                onClick={
                  fecharModalAmbiente
                }
              >
                ×
              </button>
            </div>

            <label>
              Nome do ambiente
            </label>

            <input
              type="text"
              placeholder="Ex.: Escritório"
              value={nomeAmbiente}
              onChange={(evento) =>
                setNomeAmbiente(
                  evento.target.value,
                )
              }
            />

            <label>
              Ícone
            </label>

            <input
              type="text"
              maxLength={2}
              value={iconeAmbiente}
              onChange={(evento) =>
                setIconeAmbiente(
                  evento.target.value,
                )
              }
            />

            <div className="modal-acoes">
              <button
                className="botao-cancelar"
                onClick={
                  fecharModalAmbiente
                }
              >
                Cancelar
              </button>

              <button
                className="botao-salvar"
                onClick={
                  salvarAmbiente
                }
              >
                {ambienteEditando
                  ? 'Salvar alterações'
                  : 'Adicionar ambiente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App