/** Data em que o site foi gerado/publicado pela última vez (horário de Brasília). */
export const BUILD_DATE = new Date();

export const buildDateText = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
}).format(BUILD_DATE);

export const buildDateIso = BUILD_DATE.toISOString();
