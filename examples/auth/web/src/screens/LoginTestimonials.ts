export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'mini-q nos permitiu montar o fluxo de cadastro inteiro sem build. O bundle final ficou menor do que o setup anterior.',
    author: 'Ana Costa',
    role: 'CTO, StartupX',
  },
  {
    quote:
      'A API de signals integrada aos behaviors mudou como pensamos componentes reativos.',
    author: 'Bruno Lima',
    role: 'Lead Frontend, Firma Y',
  },
  {
    quote:
      'Finalmente um exemplo real de autenticação que não esconde os detalhes do refresh token.',
    author: 'Carla Mendes',
    role: 'Engenheira, Consultoria Z',
  },
];
