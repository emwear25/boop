import { abs, categories, categorySeo, company, fromPrice, guides, products, productSeoName } from './site'

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`

const facts = `## Основна информация (Key facts)

- Магазин: boop.bg, онлайн магазин без физически обект. Търговец: ${company.legalName}, ЕИК ${company.eik}.
- Какво продаваме: купички, повдигнати стойки, лъжички за гранули, медальони и закачалки за повод за кучета и котки. Повечето продукти са с името на любимеца.
- Изработка: в България, след поръчка, за 3 до 5 работни дни.
- Купичките: обвивка от PLA (растителна пластмаса) и иноксова (неръждаема) купа, която се вади и мие в съдомиялна. Размери на купата: 13 см (котки и малки кученца), 16 см (малки и средни породи), 20 см (средни и големи породи).
- Имена: до 8 букви (на табелката Кокалче до 10), на кирилица или латиница. Името е част от самия продукт, не е стикер.
- Доставка: Еконт или Спиди, до офис или адрес, в България. Безплатна до офис при поръчка над 60 €.
- Плащане: с карта или наложен платеж. Всички цени са в евро и включват ДДС.
- Връщане: до 14 дни за неперсонализирани продукти. Продуктите с име не подлежат на връщане.
- Поръчки: на boop.bg или с лично съобщение в Instagram (@boop_bg) и Facebook. Имейл: ${company.email}, телефон: ${company.phone}.
- Проследяване на поръчка: ${abs('/track')}`

export function llmsTxt() {
  return `# boop.bg

> boop е български онлайн магазин за купички, повдигнати стойки, лъжички, медальони и закачалки за кучета и котки, повечето с името на любимеца. Всичко се изработва в България след поръчка.
> boop.bg is a Bulgarian online shop for personalised dog and cat bowls, raised feeders, kibble scoops, name tags and leash holders, made to order in Bulgaria. Prices in EUR, delivery within Bulgaria.

${facts}

## Категории (Categories)

${categories.map(c => `- [${categorySeo[c.id].title}](${abs(`/category/${c.id}`)}): ${categorySeo[c.id].description}`).join('\n')}

## Продукти (Products)

${products.map(p => `- [${productSeoName(p)}](${abs(`/product/${p.slug}`)}): ${p.tagline} ${p.sizes ? 'от ' : ''}${eur(fromPrice(p))}`).join('\n')}

## Съвети (Guides)

${guides.map(g => `- [${g.title}](${abs(`/saveti/${g.slug}`)}): ${g.description}`).join('\n')}

## Полезни страници

- [Създай купичка с име (3D конфигуратор)](${abs('/personalize')}): напиши името, избери форма и цвят, виж я в 3D.
- [Доставка, размери и грижа](${abs('/about')})
- [Общи условия](${abs('/terms')})
- [Поверителност](${abs('/privacy')})

## Optional

- [Пълно описание на всички продукти](${abs('/llms-full.txt')})
- [Sitemap](${abs('/sitemap.xml')})
`
}

export function llmsFullTxt() {
  const byCat = categories.map((c) => {
    const s = categorySeo[c.id]
    const list = products.filter(p => p.category === c.id).map((p) => {
      const sizes = p.sizes ? p.sizes.map(z => `${z.label ?? `${z.cm} см`} (${z.fits}): ${eur(z.price)}`).join('; ') : eur(fromPrice(p))
      const colours = (p.colours ?? [p.colour]).map(x => x.name).join(', ')
      return `### ${productSeoName(p)}

URL: ${abs(`/product/${p.slug}`)}
${p.tagline} ${p.description}
- Цена: ${sizes}
- Цветове: ${colours}${p.personalise ? `\n- Име: ${p.personalise.hint ?? `до ${p.personalise.max} букви`}` : ''}
${p.details.map(d => `- ${d}`).join('\n')}`
    }).join('\n\n')
    return `## ${s.title}

URL: ${abs(`/category/${c.id}`)}
${s.text.join('\n\n')}

${s.faq.map(f => `**${f.q}** ${f.a}`).join('\n\n')}

${list}`
  }).join('\n\n')

  const guideText = guides.map(g => `## ${g.title}

URL: ${abs(`/saveti/${g.slug}`)}
${g.lead}

${g.sections.map(s => `### ${s.h}\n\n${s.p.join('\n\n')}`).join('\n\n')}`).join('\n\n')

  return `# boop.bg: пълно описание

> Всички продукти, цени, категории и съвети на boop.bg в един файл. Цените са в евро с ДДС и са актуални към ${new Date().toISOString().slice(0, 10)}.

${facts}

${byCat}

# Съвети

${guideText}
`
}
