import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_SLUGS } from './config';

const autores = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/autores' }),
  schema: ({ image }) => z.object({
    // Foto pequena (avatar), exibida sem possibilidade de ampliar
    avatar: image().optional(),
    name: z.string().min(3),
    jobTitle: z.string(),
    bio: z.string().min(40),
    sameAs: z.array(z.url()).default([]),
  }),
});

const artigos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/artigos' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(20).max(70),
        description: z.string().min(70).max(160),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date(),
        category: z.enum(CATEGORY_SLUGS),
        tags: z.array(z.string()).min(1),
        author: reference('autores'),
        image: image(),
        // Alt obrigatório e descritivo: rejeita vazio, curto demais ou genérico
        imageAlt: z
          .string()
          .min(15, 'imageAlt precisa descrever a imagem (mín. 15 caracteres)')
          .refine((s) => !/^(imagem|foto|image|capa)\b/i.test(s.trim()), {
            message: 'imageAlt não deve começar com "imagem", "foto" ou "capa"',
          }),
        // Foto opcional dentro do artigo (após o Resumo rápido), com crédito do fotógrafo
        foto: z
          .object({
            src: image(),
            alt: z.string().min(15).refine((s) => !s.includes('[REVISAR ALT]'), { message: 'Revise o alt da foto (remova [REVISAR ALT])' }),
            credito: z.string(),
            // Opcional para imagem gerada por IA ou foto própria
            creditoUrl: z.url().optional(),
            fonte: z.enum(['Pexels', 'Unsplash', 'Arquivo pessoal', 'IA']),
          })
          .optional(),
        imageCredit: z
          .object({ name: z.string(), url: z.url(), source: z.enum(['Pexels', 'Unsplash']) })
          .optional(),
        keyword: z.string().min(3),
        // "Resumo rápido": 3 a 4 pontos-chave exibidos no topo do artigo
        resumo: z.array(z.string().min(20).max(160)).min(3).max(4),
        // Padrão editorial: 3 a 5 perguntas e ao menos 1 fonte em todo artigo
        faq: z.array(z.object({ q: z.string().min(10), a: z.string().min(20) })).min(3).max(5),
        sources: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
        draft: z.boolean().default(false),
      })
      .refine((d) => d.updatedDate >= d.pubDate, {
        message: 'updatedDate não pode ser anterior a pubDate',
        path: ['updatedDate'],
      }),
});

export const collections = { artigos, autores };
