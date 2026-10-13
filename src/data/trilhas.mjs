// Trilhas de leitura: guias com etapas em ordem. Cada etapa é o slug de um artigo.
// Etapas ainda não publicadas (agendadas) são puladas automaticamente.
export const TRILHAS = [
  {
    slug: 'comprar-carro-usado',
    titulo: 'Guia para comprar um carro usado',
    descricao:
      'O caminho completo da compra de um usado, da escolha do modelo até o carro regularizado no seu nome: o que fazer em cada etapa e em que ordem.',
    intro: [
      'Comprar um carro usado tem uma ordem que evita prejuízo. Primeiro você escolhe um modelo que cabe no bolso e é barato de manter. Depois confere a placa, faz a vistoria e só então paga e transfere.',
      'Cada etapa abaixo tem um guia próprio, com o passo a passo, os prazos da lei e os cuidados que evitam golpe. Siga na ordem.',
    ],
    etapas: [
      { slug: 'carros-usados-baratos-ate-15-mil-reais', rotulo: 'Escolha o carro' },
      { slug: 'consulta-debitos-veiculo-pela-placa', rotulo: 'Consulte a placa antes de pagar' },
      { slug: 'vistoria-veicular-transferencia', rotulo: 'Faça a vistoria' },
      { slug: 'atpv-e-o-que-e-como-assinar', rotulo: 'Assine a autorização de transferência' },
      { slug: 'como-transferir-carro-usado', rotulo: 'Transfira para o seu nome em 30 dias' },
      { slug: 'quem-paga-ipva-na-venda-do-carro', rotulo: 'Acerte o IPVA do ano' },
      { slug: 'seguro-para-carro-antigo', rotulo: 'Escolha a proteção do carro' },
    ],
  },
  {
    slug: 'vender-carro',
    titulo: 'Guia para vender o seu carro',
    descricao:
      'O que fazer para vender o carro sem herdar as multas e os impostos do comprador: da quitação do financiamento à comunicação de venda.',
    intro: [
      'Vender um carro é rápido, mas o que você deixa de fazer pode voltar meses depois, em forma de multa, IPVA ou pontos na sua CNH. A ordem certa protege você até a transferência ser concluída.',
      'Siga as etapas abaixo. Cada uma tem um guia próprio, com o passo a passo e os prazos da lei.',
    ],
    etapas: [
      { slug: 'vender-carro-financiado', rotulo: 'Se for financiado, resolva o gravame' },
      { slug: 'consulta-debitos-veiculo-pela-placa', rotulo: 'Levante os débitos do carro' },
      { slug: 'quem-paga-ipva-na-venda-do-carro', rotulo: 'Combine quem paga o IPVA' },
      { slug: 'atpv-e-o-que-e-como-assinar', rotulo: 'Assine a autorização de transferência' },
      { slug: 'comunicacao-de-venda-de-veiculo', rotulo: 'Comunique a venda ao Detran' },
      { slug: 'indicacao-de-condutor', rotulo: 'Se chegar multa depois, indique o condutor' },
    ],
  },
  {
    slug: 'bateu-o-carro',
    titulo: 'Guia para quando você bate o carro',
    descricao:
      'O que fazer depois de uma batida, na ordem: acionar o seguro, pagar ou não a franquia, usar o carro reserva e entender quando o carro vira perda total.',
    intro: [
      'Depois de uma batida, a cabeça fica a mil e é fácil esquecer um passo que depois custa caro. A ordem certa protege você e garante a indenização.',
      'Cada etapa abaixo tem um guia próprio, com o que diz a regra da SUSEP e o que costuma estar escrito na apólice.',
    ],
    etapas: [
      { slug: 'como-acionar-seguro-auto-apos-batida', rotulo: 'Acione o seguro' },
      { slug: 'franquia-seguro-auto', rotulo: 'Entenda a franquia' },
      { slug: 'carro-reserva-no-seguro', rotulo: 'Peça o carro reserva' },
      { slug: 'perda-total-no-seguro', rotulo: 'Se o carro der perda total' },
      { slug: 'classe-de-bonus-seguro-auto', rotulo: 'Veja o que acontece com o seu bônus' },
    ],
  },
  {
    slug: 'manutencao-em-dia',
    titulo: 'Guia da manutenção do carro em dia',
    descricao:
      'Os cuidados que evitam quebra e gasto grande: revisão, óleo, pneus, alinhamento, freio e bateria, com os sinais de que está na hora de cada um.',
    intro: [
      'Quase todo conserto caro começa com um sinal pequeno que foi deixado para depois. Saber o que olhar, e quando, mantém o carro seguro e mais barato de manter.',
      'As etapas abaixo seguem a ordem de uma revisão. Cada uma tem um guia próprio, com os sinais de desgaste e o que diz o manual.',
    ],
    etapas: [
      { slug: 'o-que-e-feito-na-revisao-do-carro', rotulo: 'Saiba o que entra na revisão' },
      { slug: 'quando-trocar-oleo-do-carro', rotulo: 'Troque o óleo no prazo' },
      { slug: 'calibragem-pneu-pressao-correta', rotulo: 'Calibre os pneus' },
      { slug: 'quando-trocar-pneu-do-carro', rotulo: 'Confira o desgaste dos pneus' },
      { slug: 'alinhamento-e-balanceamento-quando-fazer', rotulo: 'Faça alinhamento e balanceamento' },
      { slug: 'quando-trocar-pastilha-de-freio', rotulo: 'Revise os freios' },
      { slug: 'bateria-do-carro-quanto-tempo-dura', rotulo: 'Cuide da bateria' },
      { slug: 'luzes-do-painel-do-carro', rotulo: 'Entenda as luzes do painel' },
    ],
  },
];
