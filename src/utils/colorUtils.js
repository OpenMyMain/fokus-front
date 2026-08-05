/**
 * Le backend ne stocke qu'une couleur de fond par ressource (`bgColor` d'un créneau,
 * `color` d'une habitude) : la couleur du texte et celle de la bordure doivent donc être
 * dérivées, jamais lues dans un autre champ. Utiliser `iconBgColor` comme couleur de
 * texte rendait les libellés invisibles, les deux champs valant la même couleur.
 */

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * @returns {{r: number, g: number, b: number}|null} null si la valeur n'est pas un hex exploitable
 */
export function parseHexColor(value) {
  if (typeof value !== 'string') return null

  const match = value.trim().match(HEX_PATTERN)
  if (!match) return null

  const hex = match[1].length === 3
    ? match[1].split('').map(char => char + char).join('')
    : match[1]

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

// Luminance relative WCAG 2.1, base du choix « texte clair ou texte foncé ».
export function relativeLuminance({ r, g, b }) {
  const channel = value => {
    const ratio = value / 255
    return ratio <= 0.04045 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/**
 * Couleur de texte lisible sur `background`. Seuil à 0.45 plutôt que 0.5 : les fonds
 * saturés (le violet par défaut des créneaux, par exemple) restent plus lisibles en texte clair.
 */
export function readableTextColor(background, { light = '#ffffff', dark = '#192d40' } = {}) {
  const color = parseHexColor(background)
  if (!color) return dark

  return relativeLuminance(color) > 0.45 ? dark : light
}

/**
 * Assombrit (`ratio` négatif) ou éclaircit (`ratio` positif) une couleur, en proportion
 * de la distance au noir ou au blanc. Renvoie la valeur d'origine si elle n'est pas parsable.
 */
export function shadeColor(value, ratio) {
  const color = parseHexColor(value)
  if (!color) return value

  const target = ratio < 0 ? 0 : 255
  const amount = Math.min(Math.abs(ratio), 1)
  const mix = channel => Math.round(channel + (target - channel) * amount)

  return '#' + [mix(color.r), mix(color.g), mix(color.b)]
    .map(channel => channel.toString(16).padStart(2, '0'))
    .join('')
}
