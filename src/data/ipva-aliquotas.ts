// Alíquotas de IPVA 2026 para automóvel de passeio particular a gasolina ou flex.
// Mesma base do artigo /ipva-licenciamento/aliquota-ipva-por-estado/ — ao atualizar uma, atualize a outra.
// `faixas: null` = sem confirmação oficial do percentual de 2026; a calculadora manda consultar a Sefaz.

export interface Faixa {
  label: string;
  aliquota: number; // em %
  ateValor?: number; // faixa definida pelo valor do carro (a calculadora escolhe sozinha)
}

export interface UfIpva {
  uf: string;
  nome: string;
  faixas: Faixa[] | null;
  fonte: string;
  obs?: string;
}

const unica = (aliquota: number): Faixa[] => [{ label: 'Alíquota única', aliquota }];

export const IPVA_ANO = 2026;

export const IPVA_UFS: UfIpva[] = [
  { uf: 'AC', nome: 'Acre', faixas: unica(2), fonte: 'https://sefaz.ac.gov.br/2021/?page_id=16937' },
  { uf: 'AL', nome: 'Alagoas', faixas: null, fonte: 'https://www.sefaz.al.gov.br/nise/faq/ipva/473-3-calculo-e-aliquotas', obs: 'Cobra por potência.' },
  { uf: 'AP', nome: 'Amapá', faixas: null, fonte: 'https://www.sefaz.ap.gov.br/' },
  { uf: 'AM', nome: 'Amazonas', faixas: [{ label: 'Até 1.000 cc', aliquota: 1.5 }, { label: 'Acima de 1.000 cc', aliquota: 2 }], fonte: 'https://www.sefaz.am.gov.br/noticias/32393' },
  { uf: 'BA', nome: 'Bahia', faixas: unica(2.5), fonte: 'https://www.sefaz.ba.gov.br/inspetoria-eletronica/ipva/informacoes/', obs: 'Diesel: 3%.' },
  { uf: 'CE', nome: 'Ceará', faixas: [{ label: 'Até 100 cv', aliquota: 2.5 }, { label: 'De 100 a 180 cv', aliquota: 3 }, { label: 'Acima de 180 cv', aliquota: 3.5 }], fonte: 'https://www.sefaz.ce.gov.br/2025/12/20/calendario-de-pagamento-do-ipva-2026-e-divulgado-condutores-poderao-ter-ate-10-de-desconto/' },
  { uf: 'DF', nome: 'Distrito Federal', faixas: unica(3), fonte: 'https://www.economia.df.gov.br/w/variacao-do-ipva-2026-sera-em-media-de-172-do-iptu-51-' },
  { uf: 'ES', nome: 'Espírito Santo', faixas: unica(2), fonte: 'https://sefaz.es.gov.br/Noticia/pagamento-do-ipva-2026-comeca-em-abril-e-pode-ser-feito-em-seis-cotas' },
  { uf: 'GO', nome: 'Goiás', faixas: [{ label: 'Até 100 cv', aliquota: 3 }, { label: 'Acima de 100 cv', aliquota: 3.75 }], fonte: 'https://agenciacoradenoticias.go.gov.br/governo-mantem-calendario-do-ipva-2026-e-concede-8-para-pagamento-a-vista/' },
  { uf: 'MA', nome: 'Maranhão', faixas: null, fonte: 'https://portal.sefaz.ma.gov.br/portalsefaz/jsp/pagina/pagina.jsf?codigo=6526' },
  { uf: 'MT', nome: 'Mato Grosso', faixas: [{ label: 'Até 1.000 cc', aliquota: 2 }, { label: 'Acima de 1.000 cc', aliquota: 3 }], fonte: 'http://app1.sefaz.mt.gov.br/sistema/legislacao/legislacaotribut.nsf/173e6c0d2202fdcb03258b1700659f1e/d8fcadea198ff27603258d6f00518320?OpenDocument=' },
  { uf: 'MS', nome: 'Mato Grosso do Sul', faixas: unica(3), fonte: 'https://www.sefaz.ms.gov.br/ipva/', obs: 'Diesel até 8 lugares: 4,5%.' },
  { uf: 'MG', nome: 'Minas Gerais', faixas: unica(4), fonte: 'https://www.fazenda.mg.gov.br/empresas/impostos/ipva/calculo.html' },
  { uf: 'PA', nome: 'Pará', faixas: unica(2.5), fonte: 'https://agenciapara.com.br/noticia/73454/sefa-divulga-calendario-e-regras-do-ipva-2026-com-ate-15-de-desconto-para-bons-motoristas' },
  { uf: 'PB', nome: 'Paraíba', faixas: null, fonte: 'https://www.sefaz.pb.gov.br/legislacao/65-leis/ipva/5032-lei-n-11-007-de-06-de-novembro-de-2017' },
  { uf: 'PR', nome: 'Paraná', faixas: unica(1.9), fonte: 'https://www.parana.pr.gov.br/Audio/Com-aliquota-de-19-e-desconto-vista-Fazenda-divulga-datas-do-IPVA-2026' },
  { uf: 'PE', nome: 'Pernambuco', faixas: unica(2.4), fonte: 'https://www.sefaz.pe.gov.br/Noticias-Destaque/Paginas/Governo-de-Pernambuco-divulga-calend%C3%A1rio-do-IPVA-2026-com-al%C3%ADquota-mantida-em-2,4,-a-menor-do-Nordeste.aspx' },
  { uf: 'PI', nome: 'Piauí', faixas: null, fonte: 'https://portal.sefaz.pi.gov.br/' },
  { uf: 'RJ', nome: 'Rio de Janeiro', faixas: unica(4), fonte: 'https://portal.fazenda.rj.gov.br/noticias/governo-do-estado-divulga-calendario-de-pagamento-do-ipva-2026/', obs: 'GNV: 1,5%.' },
  { uf: 'RN', nome: 'Rio Grande do Norte', faixas: unica(3), fonte: 'https://www.diariooficial.rn.gov.br/dei/dorn3/documentos/00000001/20151030/515333.htm' },
  { uf: 'RS', nome: 'Rio Grande do Sul', faixas: unica(3), fonte: 'https://estado.rs.gov.br/upload/arquivos/202512/apresentacao-ipva-2026.pdf' },
  { uf: 'RO', nome: 'Rondônia', faixas: null, fonte: 'https://ipva.sefin.ro.gov.br/' },
  { uf: 'RR', nome: 'Roraima', faixas: null, fonte: 'https://www.sefaz.rr.gov.br/downloads/category/1133-14-ipva' },
  { uf: 'SC', nome: 'Santa Catarina', faixas: unica(2), fonte: 'https://www.sef.sc.gov.br/noticias/secretaria-de-estado-da-fazenda-divulga-calendario-do-ipva-para-2026' },
  { uf: 'SP', nome: 'São Paulo', faixas: unica(4), fonte: 'https://www.agenciasp.sp.gov.br/ipva-2026-confira-a-tabela-de-valores-base-para-veiculos-de-sao-paulo/' },
  { uf: 'SE', nome: 'Sergipe', faixas: [{ label: 'Valor até R$ 120 mil', aliquota: 2.5, ateValor: 120000 }, { label: 'Valor acima de R$ 120 mil', aliquota: 3 }], fonte: 'https://www.se.gov.br/agencia/noticias/governo/condutores_sergipanos_ja_podem_consultar_os_valores_do_ipva_2026_' },
  { uf: 'TO', nome: 'Tocantins', faixas: [{ label: 'Até 100 hp', aliquota: 2.5 }, { label: 'Acima de 100 hp', aliquota: 3.5 }], fonte: 'https://www.to.gov.br/sefaz/noticias/ipva-2026-no-tocantins-tem-desconto-de-10-para-pagamento-a-vista-em-ate-30-de-janeiro/5j7g5aj1h47x' },
];
