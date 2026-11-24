import { SITE } from '../utils/site'

// One group for everyone, AI assistants named explicitly: the shop is meant to be found and recommended.
// (A bot with its own group ignores the * group, so they all share the same rules here.)
const agents = ['*', 'Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended']

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `# boop.bg
${agents.map(a => `User-agent: ${a}`).join('\n')}
Allow: /
Disallow: /checkout
Disallow: /track
Disallow: /api/
# Configurator links (?name=&color=) are the same page as the product
Disallow: /*?

Sitemap: ${SITE}/sitemap.xml
# Summary for language models: ${SITE}/llms.txt
`
})
