# About

"About this app" building blocks: `AboutPanel` composes the whole page (logo,
tagline, version, license, links, creator, tech, sponsor, family badge,
footer) from data props; the companions (`AboutCard`, `AboutLinkList`,
`AboutNote`, `AboutFooterLine`, `FamilyBadge`, `TechChips`, `SponsorCard`)
are usable standalone.

## import

```ts
import {
  AboutPanel,
  AboutCard,
  AboutLinkList,
  AboutNote,
  AboutFooterLine,
  FamilyBadge,
  TechChips,
  SponsorCard,
  type AboutLinkItem,
  type FamilyMember,
  type SponsorChannel,
} from '@neuronection/assistant-ui/about'
```

## props — AboutPanel

Extends `React.ComponentProps<'div'>`.

| prop | type | default | notes |
|---|---|---|---|
| `appName` | `string` | — | h1 (required) |
| `familyCurrent` | `FamilyApp` (`'health' \| 'career' \| 'study'`) | — | picks the default mark + renders the family badge |
| `logo` | `ReactNode` | — | overrides the default app mark |
| `tagline` / `description` | `ReactNode` | — | hero copy |
| `version` | `string` | — | outline badge + footer line |
| `license` | `AboutLicense` | — | `{ name, href? }` |
| `licenseTitle` / `licenseLinkLabel` | `string` | `'License & open source'` / `'Read license'` | |
| `links` | `AboutLinkItem[]` | — | `{ href?, label, subtitle?, icon?, external?, group?, copyValue?, copyLabel?, copiedLabel? }` |
| `linksTitle` | `string` | `'Links'` | |
| `creator` | `AboutCreator` | — | `{ name, role?, href?, links? }`; hidden when `familyCurrent` is set |
| `creatorTitle` | `string` | `'Created by'` | |
| `tech` | `ReadonlyArray<string>` | — | rendered via `TechChips` |
| `techTitle` | `string` | `'Built with'` | |
| `note` | `AboutNoteContent` | — | `{ tone?: 'info' \| 'warning', title?, children }` |
| `sponsor` | `AboutSponsorContent` | — | `{ channels, title?, description?, footnote?, channelsLabel? }` |
| `familyMembers` | `FamilyMember[]` | — | `{ app, name, tagline?, href?, github?, website? }` |
| `hubUrl` | `string` | — | family hub link |
| `familyLabel` / `familyBlurb` / `familyCtaLabel` / `familyCurrentLabel` | `string` | — | family badge strings |
| `theme` | `LogoTheme` | `'light'` | mark art variant |
| `copyright` | `ReactNode` | — | footer line |

## companions

| component | distinctive props |
|---|---|
| `AboutCard` | `{ title (required), icon?, description?, heading? ('h2'\|'h3'\|'h4') }` — Card wrapper with icon tile |
| `AboutLinkList` | `{ links: AboutLinkItem[] }` — link rows; `copyValue` turns a row into a copy-to-clipboard button (`copyLabel`/`copiedLabel` name it) |
| `AboutNote` | `{ tone?: 'info' \| 'warning', title? }` — tinted callout |
| `AboutFooterLine` | `{ version?, copyright? }` — centered muted line |
| `FamilyBadge` | `{ current, members?, creator?, hubUrl?, label?, blurb?, ctaLabel?, currentLabel?, githubLabel?, websiteLabel?, theme? }` — every member with an `href` links to it, including the current app (ring + `currentLabel` badge mark it) |
| `TechChips` | `{ items: ReadonlyArray<string \| null \| undefined> }` — chip row, falsy entries dropped |
| `SponsorCard` | `{ channels (required), title?, description?, footnote?, channelsLabel?, columns? ('auto' \| 1 \| 2 — responsive two-column channel grid above the `sm` breakpoint by default; force `1` inside modals), icon?, heading? }` — `SponsorChannel = { id, name, href, description?, icon?, external?, highlight? }` |

## controlled contract

None — presentational composition. `AboutLinkList` copy rows own only their
transient "Copied!" state. Navigation is plain `<a>` (apps can pass custom
icons/components via `icon`).

## labels & i18n

Section titles (`linksTitle`, `creatorTitle`, `techTitle`, license strings,
family strings) are props with English defaults; app copy (tagline,
descriptions, note) is app content. Translate all title props at the call
site.

## examples

minimal:

```tsx
<AboutPanel appName="Study Assistant" version="1.4.0" tagline="Study workspace" />
```

realistic (trimmed from the library's own gallery page shape):

```tsx
<AboutPanel
  appName="Health Assistant"
  familyCurrent="health"
  version={version}
  tagline={t('about.tagline')}
  description={t('about.description')}
  license={{ name: 'Apache-2.0', href: 'https://www.apache.org/licenses/LICENSE-2.0' }}
  links={[{ label: t('about.docs'), href: 'https://health-assistant.io/docs', icon: BookOpen }]}
  tech={['React', 'FastAPI', 'PostgreSQL']}
  familyMembers={[{ app: 'career', name: 'Career Assistant', href: 'https://neuronection.com' }]}
  hubUrl="https://neuronection.com"
  licenseTitle={t('about.licenseTitle')}
  linksTitle={t('about.linksTitle')}
/>
```

## accessibility

See [accessibility.md](../accessibility.md#utilities-no-aria-contract):
presentational composition (headings via `AboutCard`'s `heading` prop;
copy rows are real buttons with accessible names).

## related

[`Logo`](./logo.md) (the marks), [`Badge`](./badge.md), [`TechChips`](./about.md).
