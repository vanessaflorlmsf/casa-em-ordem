import { useEffect, useState } from 'react'

type Tarefa = {
  id: number
  nome: string
  dia: string
  tempo: string
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

const diasDaSemana = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
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
  { id: 'ambientes', icone: '🛋️', nome: 'Ambientes' },
  { id: 'configuracoes', icone: '⚙️', nome: 'Configurações' },
]

function App() {
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

  const [pagina, setPagina] = useState('inicio')
  const [menuAberto, setMenuAberto] = useState(false)
  const [filtroAmbiente, setFiltroAmbiente] = useState<number | null>(null)

  const [modalTarefa, setModalTarefa] = useState(false)
  const [tarefaEditando, setTarefaEditando] =
    useState<Tarefa | null>(null)

  const [nome, setNome] = useState('')
  const [dia, setDia] = useState('Segunda-feira')
  const [tempo, setTempo] = useState('20–30 minutos')
  const [icone, setIcone] = useState('🧹')
  const [ambienteId, setAmbienteId] = useState(1)
  const [recorrente, setRecorrente] = useState(false)

  const [modalAmbiente, setModalAmbiente] = useState(false)
  const [ambienteEditando, setAmbienteEditando] =
    useState<Ambiente | null>(null)

  const [nomeAmbiente, setNomeAmbiente] = useState('')
  const [iconeAmbiente, setIconeAmbiente] = useState('🏠')

  useEffect(() => {
    localStorage.setItem(
      'casa-em-ordem-tarefas',
      JSON.stringify(tarefas),
    )
  }, [tarefas])

  useEffect(() => {
    localStorage.setItem(
      'casa-em-ordem-ambientes',
      JSON.stringify(ambientes),
    )
  }, [ambientes])

  const selecionarPagina = (id: string) => {
    setPagina(id)
    setMenuAberto(false)
  }

  const abrirNovaTarefa = () => {
    setTarefaEditando(null)
    setNome('')
    setDia('Segunda-feira')
    setTempo('20–30 minutos')
    setIcone('🧹')
    setAmbienteId(1)
    setRecorrente(false)
    setModalTarefa(true)
  }

  const abrirEdicao = (tarefa: Tarefa) => {
    setTarefaEditando(tarefa)
    setNome(tarefa.nome)
    setDia(tarefa.dia)
    setTempo(tarefa.tempo)
    setIcone(tarefa.icone)
    setAmbienteId(tarefa.ambienteId || 1)
    setRecorrente(tarefa.recorrente || false)
    setModalTarefa(true)
  }

  const fecharModalTarefa = () => {
    setModalTarefa(false)
    setTarefaEditando(null)
  }

  const obterSemanaAtual = () => {
    const data = new Date()
    const primeiroDia = new Date(
      data.getFullYear(),
      0,
      1,
    )

    const dias = Math.floor(
      (data.getTime() - primeiroDia.getTime()) /
        (1000 * 60 * 60 * 24),
    )

    const semana = Math.ceil(
      (dias + primeiroDia.getDay() + 1) / 7,
    )

    return `${data.getFullYear()}-${semana}`
  }

  useEffect(() => {
    const semanaAtual = obterSemanaAtual()

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

  const salvarTarefa = () => {
    if (!nome.trim()) return

    if (tarefaEditando) {
      setTarefas((atuais) =>
        atuais.map((tarefa) =>
          tarefa.id === tarefaEditando.id
            ? {
                ...tarefa,
                nome: nome.trim(),
                dia,
                tempo,
                icone,
                ambienteId,
                recorrente,
                semanaCriada: tarefa.semanaCriada || obterSemanaAtual(),
              }
            : tarefa,
        ),
      )
    } else {
      setTarefas((atuais) => [
        ...atuais,
        {
          id: Date.now(),
          nome: nome.trim(),
          dia,
          tempo,
          icone,
          ambienteId,
          recorrente,
          semanaCriada: obterSemanaAtual(),
          concluida: false,
        },
      ])
    }

    fecharModalTarefa()
  }

  const excluirTarefa = (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta tarefa?')) {
      return
    }

    setTarefas((atuais) =>
      atuais.filter((tarefa) => tarefa.id !== id),
    )
  }

  const alternarTarefa = (id: number) => {
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, concluida: !tarefa.concluida }
          : tarefa,
      ),
    )
  }

  const abrirNovoAmbiente = () => {
    setAmbienteEditando(null)
    setNomeAmbiente('')
    setIconeAmbiente('🏠')
    setModalAmbiente(true)
  }

  const abrirEdicaoAmbiente = (ambiente: Ambiente) => {
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
    if (!nomeAmbiente.trim()) return

    if (ambienteEditando) {
      setAmbientes((atuais) =>
        atuais.map((ambiente) =>
          ambiente.id === ambienteEditando.id
            ? {
                ...ambiente,
                nome: nomeAmbiente.trim(),
                icone: iconeAmbiente,
              }
            : ambiente,
        ),
      )
    } else {
      setAmbientes((atuais) => [
        ...atuais,
        {
          id: Date.now(),
          nome: nomeAmbiente.trim(),
          icone: iconeAmbiente,
        },
      ])
    }

    fecharModalAmbiente()
  }

  const excluirAmbiente = (id: number) => {
    if (!window.confirm('Deseja excluir este ambiente?')) {
      return
    }

    setAmbientes((atuais) =>
      atuais.filter((ambiente) => ambiente.id !== id),
    )
  }

  const tarefasConcluidas = tarefas.filter(
    (tarefa) => tarefa.concluida,
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

  const hoje = diasJavaScript[new Date().getDay()]

  const tarefasHoje = tarefas.filter(
    (tarefa) => tarefa.dia === hoje,
  )

  const tarefasHojeConcluidas = tarefasHoje.filter(
    (tarefa) => tarefa.concluida,
  ).length

  const horaAtual = new Date().getHours()

  const saudacao =
    horaAtual < 12
      ? 'Bom dia'
      : horaAtual < 18
        ? 'Boa tarde'
        : 'Boa noite'

  const proximaTarefa = tarefasHoje.find(
    (tarefa) => !tarefa.concluida,
  )

  const progressoHoje =
    tarefasHoje.length === 0
      ? 0
      : Math.round(
          (tarefasHojeConcluidas / tarefasHoje.length) * 100,
        )

  const progresso =
    tarefas.length === 0
      ? 0
      : Math.round((tarefasConcluidas / tarefas.length) * 100)

  return (
    <div className="layout">
      <aside
        className={
          menuAberto
            ? 'sidebar sidebar-aberta'
            : 'sidebar'
        }
      >
        <div className="sidebar-logo">
          <div className="logo-casa">🏠</div>

          <div>
            <strong>Casa em Ordem</strong>
            <span>Minha rotina</span>
          </div>
        </div>

        <nav className="menu">
          <span className="menu-titulo">MENU</span>

          {menu.map((item) => (
            <button
              key={item.id}
              className={
                pagina === item.id
                  ? 'menu-item ativo'
                  : 'menu-item'
              }
              onClick={() => selecionarPagina(item.id)}
            >
              <span>{item.icone}</span>
              {item.nome}
            </button>
          ))}
        </nav>

        <div className="sidebar-final">
          <div className="mini-perfil">
            <div className="avatar">V</div>

            <div>
              <strong>Vanessa</strong>
              <span>Minha casa</span>
            </div>
          </div>
        </div>
      </aside>

      {menuAberto && (
        <div
          className="overlay-menu"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <div className="conteudo">
        <header className="topo">
          <button
            className="menu-mobile"
            onClick={() => setMenuAberto(true)}
          >
            ☰
          </button>

          <div className="topo-mobile-titulo">
            <span className="logo">Casa em Ordem</span>
          </div>

          <div className="perfil">
            <span>Olá, Vanessa! 👋</span>
            <div className="avatar">V</div>
          </div>
        </header>

        {pagina === 'inicio' && (
          <main className="dashboard">
            <section className="dashboard-boas-vindas">
              <div>
                <span className="etiqueta">CASA EM ORDEM</span>

                <h1>
                  {saudacao}, Vanessa! 👋
                </h1>

                <p>
                  Vamos deixar sua casa em ordem sem pesar na sua rotina.
                </p>
              </div>

              <div className="dashboard-data">
                <span>📅</span>
                <div>
                  <strong>{hoje}</strong>
                  <small>Rotina de hoje</small>
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

                  <span className="card-emoji">📋</span>
                </div>

                <p>
                  {tarefasHoje.length === 0
                    ? 'Nenhuma tarefa programada para hoje.'
                    : `${tarefasHojeConcluidas} de ${tarefasHoje.length} concluídas`}
                </p>

                <div className="barra dashboard-barra">
                  <div
                    className="barra-preenchida"
                    style={{
                      width: progressoHoje + '%',
                    }}
                  />
                </div>

                <small>{progressoHoje}% concluído</small>
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

                  <span className="card-emoji">📊</span>
                </div>

                <p>
                  {tarefasConcluidas} de {tarefas.length} tarefas
                  concluídas.
                </p>

                <button
                  className="link-dashboard"
                  onClick={() => selecionarPagina('rotina')}
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
                    ⏱️ {proximaTarefa.tempo}
                  </p>
                ) : (
                  <p>
                    Você concluiu todas as tarefas de hoje.
                  </p>
                )}

                {proximaTarefa && (
                  <button
                    className="link-dashboard"
                    onClick={() =>
                      alternarTarefa(proximaTarefa.id)
                    }
                  >
                    Marcar como concluída →
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

                    <h2>Suas tarefas</h2>
                  </div>

                  <button
                    className="link-dashboard"
                    onClick={() => selecionarPagina('hoje')}
                  >
                    Ver todas →
                  </button>
                </div>

                {tarefasHoje.length === 0 ? (
                  <div className="dashboard-vazio">
                    <span>🌸</span>
                    <p>
                      Você não tem tarefas programadas para hoje.
                    </p>
                  </div>
                ) : (
                  <div className="dashboard-lista">
                    {tarefasHoje.map((tarefa) => {
                      const ambiente = ambientes.find(
                        (item) =>
                          item.id === tarefa.ambienteId,
                      )

                      return (
                        <div
                          className={
                            tarefa.concluida
                              ? 'dashboard-tarefa concluida'
                              : 'dashboard-tarefa'
                          }
                          key={tarefa.id}
                        >
                          <div className="dashboard-tarefa-icone">
                            {tarefa.icone}
                          </div>

                          <div className="dashboard-tarefa-info">
                            <strong>{tarefa.nome}</strong>

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
                              alternarTarefa(tarefa.id)
                            }
                          >
                            {tarefa.concluida
                              ? '✓ Concluída'
                              : 'Concluir'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <aside className="dashboard-dica">
                <span className="dica-icone">💡</span>

                <span className="card-label">
                  DICA DO DIA
                </span>

                <h3>
                  {progressoHoje === 100
                    ? 'Rotina concluída!'
                    : progressoHoje >= 50
                      ? 'Você está indo muito bem!'
                      : tarefasHoje.length > 0
                        ? 'Comece pela próxima tarefa.'
                        : 'Planeje sua próxima rotina.'}
                </h3>

                <p>
                  Pequenas tarefas feitas todos os dias ajudam a
                  manter a casa organizada sem acumular tudo para
                  uma única vez.
                </p>
              </aside>
            </section>

            <section className="dashboard-acao">
              <div>
                <span className="etiqueta">ORGANIZE SUA CASA</span>

                <h2>Precisa adicionar uma tarefa?</h2>

                <p>
                  Crie uma nova atividade e escolha o dia e o
                  ambiente.
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

        {pagina === 'hoje' && (
          <main className="hoje-page">
            <section className="hoje-cabecalho">
              <div>
                <span className="etiqueta">MINHA ROTINA</span>

                <h1>Hoje</h1>

                <p>
                  {hoje}
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
                <strong>{tarefasHoje.length}</strong>
                <small>Tarefas de hoje</small>
              </div>

              <div>
                <span>✅</span>
                <strong>{tarefasHojeConcluidas}</strong>
                <small>Concluídas</small>
              </div>

              <div>
                <span>📊</span>
                <strong>{progressoHoje}%</strong>
                <small>Progresso</small>
              </div>
            </section>

            <section className="hoje-progresso">
              <div className="progresso-topo">
                <span>Progresso de hoje</span>
                <strong>{progressoHoje}%</strong>
              </div>

              <div className="barra">
                <div
                  className="barra-preenchida"
                  style={{
                    width: progressoHoje + '%',
                  }}
                />
              </div>
            </section>

            <section className="hoje-tarefas">
              <div className="rotina-lista-topo">
                <span className="etiqueta">TAREFAS DO DIA</span>
                <h2>O que precisa ser feito</h2>
              </div>

              {tarefasHoje.length === 0 ? (
                <div className="hoje-vazio">
                  <span>🌸</span>

                  <h3>Nenhuma tarefa para hoje</h3>

                  <p>
                    Sua rotina não possui tarefas cadastradas para
                    {` ${hoje.toLowerCase()}`}.
                  </p>

                  <button
                    className="botao-nova"
                    onClick={abrirNovaTarefa}
                  >
                    + Criar tarefa
                  </button>
                </div>
              ) : (
                <div className="hoje-lista">
                  {tarefasHoje.map((tarefa) => {
                    const ambiente = ambientes.find(
                      (item) =>
                        item.id === tarefa.ambienteId,
                    )

                    return (
                      <div
                        className={
                          tarefa.concluida
                            ? 'hoje-tarefa concluida'
                            : 'hoje-tarefa'
                        }
                        key={tarefa.id}
                      >
                        <div className="hoje-tarefa-icone">
                          {tarefa.icone}
                        </div>

                        <div className="hoje-tarefa-info">
                          <strong>{tarefa.nome}</strong>

                          <span>
                            ⏱️ {tarefa.tempo}
                          </span>

                          {ambiente && (
                            <span>
                              {ambiente.icone} {ambiente.nome}
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
                              alternarTarefa(tarefa.id)
                            }
                          >
                            {tarefa.concluida
                              ? '✓ Concluída'
                              : 'Concluir'}
                          </button>

                          <button
                            className="botao-secundario"
                            onClick={() =>
                              abrirEdicao(tarefa)
                            }
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </main>
        )}

        {pagina === 'rotina' && (
          <main className="rotina-page">
            <section className="rotina-cabecalho">
              <div>
                <span className="etiqueta">ORGANIZAÇÃO</span>

                <h1>Minha rotina</h1>

                <p>
                  Acompanhe suas tarefas e mantenha sua casa em ordem.
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
                  <strong>{tarefas.length}</strong>
                  <small>Total de tarefas</small>
                </div>
              </div>

              <div className="rotina-stat">
                <span>✅</span>
                <div>
                  <strong>{tarefasConcluidas}</strong>
                  <small>Concluídas</small>
                </div>
              </div>

              <div className="rotina-stat">
                <span>⏳</span>
                <div>
                  <strong>{tarefas.length - tarefasConcluidas}</strong>
                  <small>Pendentes</small>
                </div>
              </div>

              <div className="rotina-stat">
                <span>📊</span>
                <div>
                  <strong>{progresso}%</strong>
                  <small>Progresso</small>
                </div>
              </div>
            </section>

            <section className="rotina-lista">
              <div className="rotina-lista-topo">
                <div>
                  <span className="etiqueta">TAREFAS</span>
                  <h2>Todas as tarefas</h2>
                </div>
              </div>

              <div className="filtros-ambiente">
                <button
                  className={
                    filtroAmbiente === null
                      ? 'filtro-ambiente ativo'
                      : 'filtro-ambiente'
                  }
                  onClick={() => setFiltroAmbiente(null)}
                >
                  ✨ Todos
                </button>

                {ambientes.map((ambiente) => (
                  <button
                    key={ambiente.id}
                    className={
                      filtroAmbiente === ambiente.id
                        ? 'filtro-ambiente ativo'
                        : 'filtro-ambiente'
                    }
                    onClick={() =>
                      setFiltroAmbiente(ambiente.id)
                    }
                  >
                    {ambiente.icone} {ambiente.nome}
                  </button>
                ))}
              </div>

              {tarefas.length === 0 ? (
                <div className="rotina-vazia">
                  <span>✨</span>
                  <h3>Nenhuma tarefa cadastrada</h3>
                  <p>
                    Crie sua primeira tarefa para começar a organizar
                    sua rotina.
                  </p>

                  <button
                    className="botao-nova"
                    onClick={abrirNovaTarefa}
                  >
                    + Criar tarefa
                  </button>
                </div>
              ) : (
                <div className="rotina-tarefas">
                  {diasDaSemana.map((diaDaSemana) => {
                    const tarefasDoDia = tarefas.filter(
                      (tarefa) =>
                        tarefa.dia === diaDaSemana &&
                        (
                          filtroAmbiente === null ||
                          tarefa.ambienteId === filtroAmbiente
                        ),
                    )

                    if (tarefasDoDia.length === 0) {
                      return null
                    }

                    return (
                      <div
                        className="rotina-dia"
                        key={diaDaSemana}
                      >
                        <div className="rotina-dia-titulo">
                          <h3>{diaDaSemana}</h3>

                          <span>
                            {tarefasDoDia.length}{' '}
                            {tarefasDoDia.length === 1
                              ? 'tarefa'
                              : 'tarefas'}
                          </span>
                        </div>

                        {tarefasDoDia.map((tarefa) => {
                          const ambiente = ambientes.find(
                            (item) =>
                              item.id === tarefa.ambienteId,
                          )

                          return (
                            <div
                              className={
                                tarefa.concluida
                                  ? 'rotina-tarefa concluida'
                                  : 'rotina-tarefa'
                              }
                              key={tarefa.id}
                            >
                              <div className="rotina-tarefa-icone">
                                {tarefa.icone}
                              </div>

                              <div className="rotina-tarefa-info">
                                <strong>{tarefa.nome}</strong>

                                <span>
                                  ⏱️ {tarefa.tempo}
                                </span>

                                {ambiente && (
                                  <span>
                                    {ambiente.icone}{' '}
                                    {ambiente.nome}
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
                                    alternarTarefa(tarefa.id)
                                  }
                                >
                                  {tarefa.concluida
                                    ? '✓ Concluída'
                                    : 'Concluir'}
                                </button>

                                <button
                                  className="botao-secundario"
                                  onClick={() =>
                                    abrirEdicao(tarefa)
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  className="botao-excluir"
                                  onClick={() =>
                                    excluirTarefa(tarefa.id)
                                  }
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </main>
        )}

        {pagina === 'calendario' && (
          <main className="calendario-page">
            <section className="calendario-cabecalho">
              <div>
                <span className="etiqueta">PLANEJAMENTO</span>

                <h1>Calendário semanal 🗓️</h1>

                <p>
                  Visualize sua rotina e acompanhe as tarefas da semana.
                </p>
              </div>

              <button
                className="botao-nova"
                onClick={abrirNovaTarefa}
              >
                + Nova tarefa
              </button>
            </section>

            <section className="calendario-grid">
              {diasDaSemana.map((diaCalendario) => {
                const tarefasDoDia = tarefas.filter(
                  (tarefa) => tarefa.dia === diaCalendario,
                )

                return (
                  <div
                    className="calendario-dia"
                    key={diaCalendario}
                  >
                    <div className="calendario-dia-topo">
                      <h2>{diaCalendario}</h2>

                      <span>
                        {tarefasDoDia.length}
                      </span>
                    </div>

                    {tarefasDoDia.length === 0 ? (
                      <div className="calendario-vazio">
                        Nenhuma tarefa
                      </div>
                    ) : (
                      <div className="calendario-tarefas">
                        {tarefasDoDia.map((tarefa) => {
                          const ambiente = ambientes.find(
                            (item) =>
                              item.id === tarefa.ambienteId,
                          )

                          return (
                            <div
                              className={
                                tarefa.concluida
                                  ? 'calendario-tarefa concluida'
                                  : 'calendario-tarefa'
                              }
                              key={tarefa.id}
                            >
                              <button
                                className="calendario-check"
                                onClick={() =>
                                  alternarTarefa(tarefa.id)
                                }
                              >
                                {tarefa.concluida ? '✓' : '○'}
                              </button>

                              <div className="calendario-tarefa-icone">
                                {tarefa.icone}
                              </div>

                              <div className="calendario-tarefa-info">
                                <strong>{tarefa.nome}</strong>

                                <span>
                                  ⏱️ {tarefa.tempo}
                                </span>

                                {ambiente && (
                                  <span>
                                    {ambiente.icone}{' '}
                                    {ambiente.nome}
                                  </span>
                                )}

                                {tarefa.recorrente && (
                                  <small>
                                    🔁 Toda semana
                                  </small>
                                )}
                              </div>

                              <button
                                className="botao-secundario"
                                onClick={() =>
                                  abrirEdicao(tarefa)
                                }
                              >
                                ✏️
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          </main>
        )}

        {pagina === 'ambientes' && (
          <main className="pagina-placeholder">
            <div className="titulo-secao">
              <div>
                <span className="etiqueta">MINHA CASA</span>
                <h1>Ambientes</h1>
                <p>
                  Organize os espaços da sua casa.
                </p>
              </div>

              <button
                className="botao-nova"
                onClick={abrirNovoAmbiente}
              >
                + Novo ambiente
              </button>
            </div>

            <div className="cards-ambientes">
              {ambientes.map((ambiente) => (
                <div
                  className="card-ambiente"
                  key={ambiente.id}
                >
                  <div className="ambiente-icone">
                    {ambiente.icone}
                  </div>

                  <div className="ambiente-info">
                    <strong>{ambiente.nome}</strong>

                    <span>
                      Ambiente da casa
                    </span>
                  </div>

                  <div className="ambiente-acoes">
                    <button
                      className="botao-secundario"
                      onClick={() =>
                        abrirEdicaoAmbiente(ambiente)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="botao-excluir"
                      onClick={() =>
                        excluirAmbiente(ambiente.id)
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {pagina === 'configuracoes' && (
          <main className="pagina-placeholder">
            <span className="etiqueta">CONFIGURAÇÕES</span>
            <h1>Configurações</h1>
            <p>
              As configurações da sua conta ficarão aqui.
            </p>

            <div className="config-card">
              <strong>Casa em Ordem</strong>
              <span>Versão inicial do aplicativo</span>
            </div>
          </main>
        )}
      </div>

      {modalTarefa && (
        <div
          className="modal-fundo"
          onClick={fecharModalTarefa}
        >
          <div
            className="modal"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="modal-topo">
              <div>
                <span className="etiqueta">
                  {tarefaEditando ? 'EDITAR' : 'NOVA TAREFA'}
                </span>

                <h2>
                  {tarefaEditando
                    ? 'Editar tarefa'
                    : 'Adicionar tarefa'}
                </h2>
              </div>

              <button
                className="fechar-modal"
                onClick={fecharModalTarefa}
              >
                ×
              </button>
            </div>

            <label>Nome da tarefa</label>

            <input
              type="text"
              placeholder="Ex.: Limpar a varanda"
              value={nome}
              onChange={(evento) =>
                setNome(evento.target.value)
              }
            />

            <label>Dia</label>

            <select
              value={dia}
              onChange={(evento) =>
                setDia(evento.target.value)
              }
            >
              {diasDaSemana.map((diaDaSemana) => (
                <option key={diaDaSemana}>
                  {diaDaSemana}
                </option>
              ))}
            </select>

            <label>Tempo estimado</label>

            <input
              type="text"
              placeholder="Ex.: 30 minutos"
              value={tempo}
              onChange={(evento) =>
                setTempo(evento.target.value)
              }
            />

            <label>Ícone</label>

            <input
              type="text"
              maxLength={2}
              value={icone}
              onChange={(evento) =>
                setIcone(evento.target.value)
              }
            />

            <label>Ambiente</label>

            <select
              value={ambienteId}
              onChange={(evento) =>
                setAmbienteId(Number(evento.target.value))
              }
            >
              {ambientes.map((ambiente) => (
                <option
                  key={ambiente.id}
                  value={ambiente.id}
                >
                  {ambiente.icone} {ambiente.nome}
                </option>
              ))}
            </select>

        <label className="checkbox-recorrente">
          <input
            type="checkbox"
            checked={recorrente}
            onChange={(evento) => setRecorrente(evento.target.checked)}
          />
          <span>🔁 Repetir toda semana</span>
        </label>


            <div className="modal-acoes">
              <button
                className="botao-cancelar"
                onClick={fecharModalTarefa}
              >
                Cancelar
              </button>

              <button
                className="botao-salvar"
                onClick={salvarTarefa}
              >
                {tarefaEditando
                  ? 'Salvar alterações'
                  : 'Adicionar tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAmbiente && (
        <div
          className="modal-fundo"
          onClick={fecharModalAmbiente}
        >
          <div
            className="modal"
            onClick={(evento) => evento.stopPropagation()}
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
                onClick={fecharModalAmbiente}
              >
                ×
              </button>
            </div>

            <label>Nome do ambiente</label>

            <input
              type="text"
              placeholder="Ex.: Escritório"
              value={nomeAmbiente}
              onChange={(evento) =>
                setNomeAmbiente(evento.target.value)
              }
            />

            <label>Ícone</label>

            <input
              type="text"
              maxLength={2}
              value={iconeAmbiente}
              onChange={(evento) =>
                setIconeAmbiente(evento.target.value)
              }
            />

            <div className="modal-acoes">
              <button
                className="botao-cancelar"
                onClick={fecharModalAmbiente}
              >
                Cancelar
              </button>

              <button
                className="botao-salvar"
                onClick={salvarAmbiente}
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
